// src/utils/exportQuestions.js - Export questions as ZIP archives
import JSZip from 'jszip';

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
 * Download a single question and its media as a ZIP file
 *
 * @param {Object} question - Question object with recording_segments and attachments
 * @returns {Promise<void>}
 */
export const downloadQuestionAsZip = async (question) => {
  try {
    const zip = new JSZip();
    const downloads = [];

    console.log(`📦 Creating export for question ${question.id}...`);

    // Add question metadata as text file
    const questionInfo = {
      id: question.id,
      title: question.title || 'Untitled',
      question_text: question.question_text || question.text || '',
      asker_name: question.asker_name || question.user_name || 'Anonymous',
      price: question.price_cents ? `$${(question.price_cents / 100).toFixed(2)}` : 'N/A',
      created_at: question.created_at ? new Date(question.created_at * 1000).toISOString() : 'Unknown',
      status: question.status || 'N/A',
      question_tier: question.question_tier || 'N/A'
    };

    const questionText = `Question #${questionInfo.id}
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

    // Add attachments (PDFs, documents, etc.)
    if (question.attachments && question.attachments.length > 0) {
      const attachmentsArray = typeof question.attachments === 'string'
        ? JSON.parse(question.attachments)
        : question.attachments;

      attachmentsArray.forEach((file) => {
        downloads.push({
          url: file.url,
          name: file.name || file.filename || `attachment-${downloads.length + 1}`
        });
      });
    }

    if (downloads.length === 0) {
      // If no media, still create zip with text file
      console.log('⚠️ No media files found, creating text-only ZIP');
    } else {
      console.log(`📥 Downloading ${downloads.length} files...`);

      // Download all files and add to ZIP (sequentially to avoid overwhelming browser)
      for (let i = 0; i < downloads.length; i++) {
        const item = downloads[i];
        console.log(`[${i + 1}/${downloads.length}] Downloading: ${item.name}`);

        try {
          const response = await fetch(item.url);
          if (!response.ok) {
            console.error(`❌ Failed to download ${item.name}: ${response.status}`);
            continue;
          }

          const blob = await response.blob();
          zip.file(item.name, blob);
          console.log(`✅ Added to ZIP: ${item.name}`);
        } catch (error) {
          console.error(`❌ Error downloading ${item.name}:`, error);
        }
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
