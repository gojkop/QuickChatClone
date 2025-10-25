// ============================================
// FILE: api/services/questionService.js
// ============================================
import { uploadToStream } from '../lib/cloudflare/stream.js';
import { uploadMultipleToR2 } from '../lib/cloudflare/r2.js';
import { getExpertByHandle } from '../lib/xano/expert.js';
import { createQuestion, updateQuestion } from '../lib/xano/question.js';
import { createMediaAsset } from '../lib/xano/media.js';
import { decodeBase64, getMimeTypeFromMode, getRecordingFilename } from '../lib/utils.js';

/**
 * Complete question submission workflow
 * @param {Object} payload - Submission payload from frontend
 * @returns {Promise<Object>} Created question with all references
 */
export async function submitQuestion(payload) {
  // 1. Get expert profile
  const expert = await getExpertByHandle(payload.expertHandle);

  // 2. Upload recording to Cloudflare Stream (if present)
  let streamData = null;
  if (payload.recordingBlob && payload.recordingMode) {
    const buffer = decodeBase64(payload.recordingBlob);
    const mimeType = getMimeTypeFromMode(payload.recordingMode);
    const filename = getRecordingFilename(payload.recordingMode);
    
    streamData = await uploadToStream(buffer, filename, mimeType);
  }

  // 3. Upload attachments to R2 (if present)
  let attachmentUrls = [];
  if (payload.attachments && payload.attachments.length > 0) {
    attachmentUrls = await uploadMultipleToR2(
      payload.attachments,
      'question-attachments'
    );
  }

  // 4. Create question record (without media_asset_id initially)
  const question = await createQuestion({
    expertProfileId: expert.id,
    title: payload.title,
    text: payload.text,
    attachments: attachmentUrls.length > 0 ? attachmentUrls : null,
    payerEmail: payload.payerEmail,
    priceCents: expert.price_cents || 5000,
    currency: expert.currency || 'USD',
    status: 'pending_payment',
    slaHours: expert.sla_hours || 48,
  });

  // 5. Create media_asset record (if recording exists)
  let mediaAsset = null;
  if (streamData) {
    mediaAsset = await createMediaAsset({
      provider: 'cloudflare_stream',
      assetId: streamData.uid,
      duration: streamData.duration,
      status: 'processing',
      url: streamData.playbackUrl,
    });

    // 6. Update question with media_asset_id
    await updateQuestion(question.id, {
      mediaAssetId: mediaAsset.id,
    });
  }

  // 7. Mark as paid (dev mode only)
  if (process.env.SKIP_STRIPE === 'true') {
    await updateQuestion(question.id, {
      status: 'paid',
      paidAt: new Date().toISOString(),
    });
  }

  return {
    question: {
      ...question,
      media_asset_id: mediaAsset?.id,
    },
    mediaAsset,
    attachments: attachmentUrls,
  };
}