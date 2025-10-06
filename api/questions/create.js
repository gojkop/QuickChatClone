// ============================================
// FILE: api/questions/create.js
// Create question with pre-uploaded content
// ============================================
import { getExpertByHandle } from '../lib/xano/expert.js';
import { createQuestion, updateQuestion } from '../lib/xano/question.js';
import { createMediaAsset } from '../lib/xano/media.js';
import { validateQuestionSubmission } from '../lib/validators.js';

/**
 * Create question using already-uploaded content
 * No uploads happen here - content is already in Cloudflare
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      expertHandle,
      title,
      text,
      payerEmail,
      payerFirstName,
      payerLastName,
      // Pre-uploaded content references
      recordingUid,        // Cloudflare Stream UID
      recordingPlaybackUrl,
      recordingDuration,
      recordingMode,
      attachments,         // Array of {name, url, type, size}
    } = req.body;

    // Validate required fields
    if (!expertHandle) {
      return res.status(400).json({ error: 'expertHandle is required' });
    }
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'title is required' });
    }
    if (!payerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail)) {
      return res.status(400).json({ error: 'valid payerEmail is required' });
    }

    // 1. Get expert profile
    const expert = await getExpertByHandle(expertHandle);

    // 2. Create question record (without media_asset_id initially)
    const question = await createQuestion({
      expertProfileId: expert.id,
      title: title.trim(),
      text: text?.trim() || '',
      attachments: attachments && attachments.length > 0 ? attachments : null,
      payerEmail,
      priceCents: expert.price_cents || 5000,
      currency: expert.currency || 'USD',
      status: 'pending_payment',
      slaHours: expert.sla_hours || 48,
    });

    // 3. Create media_asset record if recording exists
    let mediaAsset = null;
    if (recordingUid && recordingPlaybackUrl) {
      mediaAsset = await createMediaAsset({
        ownerType: 'question',
        ownerId: question.id,
        provider: 'cloudflare_stream',
        assetId: recordingUid,
        duration: recordingDuration || 0,
        status: 'processing',
        url: recordingPlaybackUrl,
      });

      // 4. Update question with media_asset_id
      await updateQuestion(question.id, {
        mediaAssetId: mediaAsset.id,
      });
    }

    // 5. Mark as paid (dev mode only)
    if (process.env.SKIP_STRIPE === 'true') {
      await updateQuestion(question.id, {
        status: 'paid',
        paidAt: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        questionId: question.id,
        mediaAssetId: mediaAsset?.id,
        attachmentCount: attachments?.length || 0,
        status: process.env.SKIP_STRIPE === 'true' ? 'paid' : 'pending_payment',
      },
    });

  } catch (error) {
    console.error('Question creation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create question',
    });
  }
}