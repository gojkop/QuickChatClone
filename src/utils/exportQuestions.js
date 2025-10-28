// src/utils/exportQuestions.js - Export questions as ZIP archives
import JSZip from 'jszip';
import apiClient from '@/api';

const CUSTOMER_CODE_OVERRIDE = 'customer-o9wvts8h9krvlboh';

/**
 * Extract video ID from Cloudflare Stream URL
 */
const getStreamVideoId = (url) => {
  if (!url) return null;
  const match = url.match(/cloudflarestream\.com\/([a-zA-Z0-9]+)\//);
  return match ? match[1] : null;
};

/**
 * Fetch and parse answer media asset to get recording segments
 */
const fetchAnswerMediaSegments = async (mediaAssetId) => {
  if (!mediaAssetId) return [];

  try {
    const response = await apiClient.get(`/media_asset/${mediaAssetId}`);
    const mediaAsset = response.data;

    if (!mediaAsset) return [];

    // Parse metadata
    let metadata = mediaAsset.metadata;
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch (e) {
        console.error(`Failed to parse answer media metadata:`, e);
        metadata = {};
      }
    }

    // Check if this is a multi-segment recording
    if (metadata?.type === 'multi-segment' && metadata?.segments) {
      return metadata.segments.map(segment => ({
        id: segment.uid,
        url: segment.playback_url,
        duration_sec: segment.duration,
        segment_index: segment.segment_index,
        metadata: {
          mode: segment.mode
        }
      }));
    }

    // Otherwise return the main asset as a single item
    return [{
      id: mediaAsset.id,
      url: mediaAsset.url,
      duration_sec: mediaAsset.duration_sec,
      segment_index: 0,
      metadata: metadata
    }];
  } catch (error) {
    console.error('Failed to fetch answer media asset:', error);
    return [];
  }
};

/**
 * Download a single question and its media as a ZIP file
 *
 * @param {Object} question - Question object with recording_segments, attachments, and optionally answer data
 * @returns {Promise<void>}
 */
export const downloadQuestionAsZip = async (question) => {
  try {
    const zip = new JSZip();
    const downloads = [];

    console.log(`📦 Creating export for question ${question.id}...`);

    // Fetch answer media segments if answer exists
    let answerMediaSegments = [];
    if (question.answer_media_asset_id) {
      console.log(`  📥 Fetching answer media asset ${question.answer_media_asset_id}...`);
      answerMediaSegments = await fetchAnswerMediaSegments(question.answer_media_asset_id);
      console.log(`  ✅ Found ${answerMediaSegments.length} answer segment(s)`);
    }

    // Format timestamp correctly (Xano returns Unix timestamps in seconds)
    const formatTimestamp = (timestamp) => {
      if (!timestamp) return 'Unknown';
      // Handle both Unix timestamps (seconds) and milliseconds
      const date = timestamp > 10000000000
        ? new Date(timestamp)
        : new Date(timestamp * 1000);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
    };

    // Add question metadata as text file
    const questionInfo = {
      id: question.id,
      title: question.title || 'Untitled',
      question_text: question.question_text || question.text || '',
      asker_name: question.asker_name || question.user_name || 'Anonymous',
      price: question.price_cents ? `$${(question.price_cents / 100).toFixed(2)}` : 'N/A',
      created_at: formatTimestamp(question.created_at),
      status: question.status || 'N/A',
      question_tier: question.question_tier || 'N/A'
    };

    let questionText = `Question #${questionInfo.id}
=====================================

Title: ${questionInfo.title}

Question:
${questionInfo.question_text}

---
Asker: ${questionInfo.asker_name}
Price: ${questionInfo.price}
Created: ${questionInfo.created_at}
Status: ${questionInfo.status}
Tier: ${questionInfo.question_tier}
`;

    // Add answer data if it exists
    if (question.answer_text || question.answered_at) {
      questionText += `

=====================================
ANSWER
=====================================

Answer Text:
${question.answer_text || '(No text response)'}

---
Answered: ${formatTimestamp(question.answered_at)}
`;
    }

    zip.file('question-details.txt', questionText);

    // Process recording segments (videos and audio)
    if (question.recording_segments && question.recording_segments.length > 0) {
      question.recording_segments.forEach((asset, index) => {
        if (asset.url) {
          const isVideo = asset.metadata?.mode === 'video' ||
                          asset.metadata?.mode === 'screen' ||
                          asset.metadata?.mode === 'screen-camera' ||
                          asset.url?.includes('cloudflarestream.com');

          const isAudio = asset.metadata?.mode === 'audio' ||
                          (!isVideo && (asset.url?.includes('.webm') || asset.url?.includes('.mp3') || asset.url?.includes('.wav')));

          let downloadUrl = asset.url;
          let fileName;

          // For Cloudflare Stream videos, proxy through backend to avoid CORS
          if (isVideo && asset.url.includes('cloudflarestream.com')) {
            const videoId = getStreamVideoId(asset.url);
            if (videoId) {
              const streamDownloadUrl = `https://${CUSTOMER_CODE_OVERRIDE}.cloudflarestream.com/${videoId}/downloads/default.mp4`;
              downloadUrl = `/api/media/download-video?url=${encodeURIComponent(streamDownloadUrl)}`;
              fileName = `part-${index + 1}-${asset.metadata?.mode || 'video'}.mp4`;
            }
          } else if (isAudio) {
            // Audio files - proxy through backend
            downloadUrl = `/api/media/download-audio?url=${encodeURIComponent(asset.url)}`;

            let extension = 'webm';
            if (asset.url.includes('.mp3')) extension = 'mp3';
            else if (asset.url.includes('.wav')) extension = 'wav';

            fileName = `part-${index + 1}-audio.${extension}`;
          } else {
            fileName = `part-${index + 1}-${asset.metadata?.mode || 'media'}.${isVideo ? 'mp4' : 'webm'}`;
          }

          if (downloadUrl && fileName) {
            downloads.push({ url: downloadUrl, name: fileName });
          }
        }
      });
    }

    // Add question attachments (PDFs, documents, etc.) with proxy
    if (question.attachments && question.attachments.length > 0) {
      const attachmentsArray = typeof question.attachments === 'string'
        ? JSON.parse(question.attachments)
        : question.attachments;

      attachmentsArray.forEach((file) => {
        // Proxy attachments through backend to avoid CORS
        const proxyUrl = `/api/media/download-attachment?url=${encodeURIComponent(file.url)}`;
        downloads.push({
          url: proxyUrl,
          name: `question-${file.name || file.filename || `attachment-${downloads.length + 1}`}`
        });
      });
    }

    // Add answer media segments if answer exists
    if (answerMediaSegments && answerMediaSegments.length > 0) {
      answerMediaSegments.forEach((asset, index) => {
        if (asset.url) {
          const isVideo = asset.metadata?.mode === 'video' ||
                          asset.metadata?.mode === 'screen' ||
                          asset.metadata?.mode === 'screen-camera' ||
                          asset.url?.includes('cloudflarestream.com');

          const isAudio = asset.metadata?.mode === 'audio' ||
                          (!isVideo && (asset.url?.includes('.webm') || asset.url?.includes('.mp3') || asset.url?.includes('.wav')));

          let downloadUrl = asset.url;
          let fileName;

          if (isVideo && asset.url.includes('cloudflarestream.com')) {
            const videoId = getStreamVideoId(asset.url);
            if (videoId) {
              const streamDownloadUrl = `https://${CUSTOMER_CODE_OVERRIDE}.cloudflarestream.com/${videoId}/downloads/default.mp4`;
              downloadUrl = `/api/media/download-video?url=${encodeURIComponent(streamDownloadUrl)}`;
              fileName = `answer-part-${index + 1}-${asset.metadata?.mode || 'video'}.mp4`;
            }
          } else if (isAudio) {
            downloadUrl = `/api/media/download-audio?url=${encodeURIComponent(asset.url)}`;
            let extension = 'webm';
            if (asset.url.includes('.mp3')) extension = 'mp3';
            else if (asset.url.includes('.wav')) extension = 'wav';
            fileName = `answer-part-${index + 1}-audio.${extension}`;
          } else {
            fileName = `answer-part-${index + 1}-${asset.metadata?.mode || 'media'}.${isVideo ? 'mp4' : 'webm'}`;
          }

          if (downloadUrl && fileName) {
            downloads.push({ url: downloadUrl, name: fileName });
          }
        }
      });
    }

    // Add answer attachments if they exist
    if (question.answer_attachments && question.answer_attachments.length > 0) {
      const answerAttachmentsArray = typeof question.answer_attachments === 'string'
        ? JSON.parse(question.answer_attachments)
        : question.answer_attachments;

      answerAttachmentsArray.forEach((file) => {
        // Proxy attachments through backend to avoid CORS
        const proxyUrl = `/api/media/download-attachment?url=${encodeURIComponent(file.url)}`;
        downloads.push({
          url: proxyUrl,
          name: `answer-${file.name || file.filename || `attachment-${downloads.length + 1}`}`
        });
      });
    }

    if (downloads.length === 0) {
      // If no media, still create zip with text file
      console.log('⚠️ No media files found, creating text-only ZIP');
    } else {
      console.log(`📥 Downloading ${downloads.length} files...`);

      // Download all files and add to ZIP (sequentially to avoid overwhelming browser)
      const failedDownloads = [];

      for (let i = 0; i < downloads.length; i++) {
        const item = downloads[i];
        console.log(`[${i + 1}/${downloads.length}] Downloading: ${item.name}`);

        try {
          const response = await fetch(item.url);

          if (!response.ok) {
            console.error(`❌ Failed to download ${item.name}: ${response.status}`);

            // For 424 errors (videos without download enabled), add explanation note
            if (response.status === 424) {
              const errorData = await response.json().catch(() => ({}));
              failedDownloads.push({
                file: item.name,
                reason: errorData.message || 'Video downloads not available for this file. Videos can only be viewed in the browser.',
                status: 424
              });
            } else {
              failedDownloads.push({
                file: item.name,
                reason: `HTTP ${response.status} error`,
                status: response.status
              });
            }
            continue;
          }

          const blob = await response.blob();
          zip.file(item.name, blob);
          console.log(`✅ Added to ZIP: ${item.name}`);
        } catch (error) {
          console.error(`❌ Error downloading ${item.name}:`, error);
          failedDownloads.push({
            file: item.name,
            reason: error.message || 'Unknown error',
            status: 'error'
          });
        }
      }

      // Add a note about failed downloads if any
      if (failedDownloads.length > 0) {
        let failureNote = `Failed Downloads Report
=====================================

Some files could not be downloaded. See details below:

`;
        failedDownloads.forEach(failure => {
          failureNote += `
File: ${failure.file}
Reason: ${failure.reason}
Status: ${failure.status}
---
`;
        });

        failureNote += `

Note: Videos uploaded to Cloudflare Stream without download enabled
can only be viewed in the browser at mindpick.me. To download these
videos in the future, please enable downloads when uploading.
`;

        zip.file('FAILED-DOWNLOADS.txt', failureNote);
        console.warn(`⚠️ ${failedDownloads.length} file(s) failed to download - added report to ZIP`);
      }
    }

    // Generate ZIP file
    console.log('🗜️ Generating ZIP file...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // Download ZIP
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `question-${question.id}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    console.log(`✅ question-${question.id}.zip downloaded successfully!`);
  } catch (error) {
    console.error('❌ Error creating ZIP:', error);
    throw error;
  }
};

/**
 * Download multiple questions as separate ZIP files
 *
 * @param {Array} questions - Array of question objects
 * @param {Function} onProgress - Optional callback for progress updates (current, total)
 * @returns {Promise<void>}
 */
export const downloadQuestionsAsZip = async (questions, onProgress = null) => {
  if (!questions || questions.length === 0) {
    throw new Error('No questions to export');
  }

  console.log(`📦 Exporting ${questions.length} question(s)...`);

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];

    if (onProgress) {
      onProgress(i + 1, questions.length);
    }

    try {
      await downloadQuestionAsZip(question);

      // Add a small delay between downloads to avoid overwhelming the browser
      if (i < questions.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`❌ Failed to export question ${question.id}:`, error);
      // Continue with next question even if one fails
    }
  }

  console.log(`✅ Exported ${questions.length} question(s) successfully!`);
};
