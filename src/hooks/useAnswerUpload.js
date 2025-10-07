// src/hooks/useAnswerUpload.js
// Hook for uploading answer recordings and attachments
import { useState, useCallback } from 'react';

export function useAnswerUpload() {
  const [uploadState, setUploadState] = useState({
    uploading: false,
    progress: 0,
    stage: '', // 'media', 'attachments', 'submitting'
    error: null,
    mediaResult: null,
    attachmentResults: [],
  });

  /**
   * Upload answer recording (video/audio)
   * @param {Blob} blob - The concatenated media blob
   * @param {string} mode - 'video' or 'audio'
   * @param {number} duration - Duration in seconds
   */
  const uploadMedia = useCallback(async (blob, mode, duration) => {
    console.log('📤 Starting answer media upload:', { mode, duration, size: blob.size });
    
    setUploadState(prev => ({
      ...prev,
      uploading: true,
      stage: 'media',
      error: null,
    }));

    try {
      // Route based on mode (same logic as questions)
      if (mode === 'audio') {
        return await uploadAudioToR2(blob, duration);
      } else {
        return await uploadVideoToStream(blob, mode, duration);
      }
    } catch (error) {
      console.error('❌ Media upload failed:', error);
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        error: error.message,
      }));
      throw error;
    }
  }, []);

  /**
   * Upload video to Cloudflare Stream
   */
  const uploadVideoToStream = async (blob, mode, duration) => {
    console.log('🎥 Uploading video to Stream...');
    
    // Step 1: Get Direct Upload URL
    const urlResponse = await fetch('/api/media/get-upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxDurationSeconds: 900 }), // 15 minutes for answers
    });

    if (!urlResponse.ok) {
      throw new Error('Failed to get upload URL');
    }

    const { data: uploadData } = await urlResponse.json();
    const { uploadURL, uid } = uploadData;

    // Step 2: Upload using FormData
    const formData = new FormData();
    formData.append('file', blob, `answer-${Date.now()}.webm`);

    const uploadResponse = await fetch(uploadURL, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload video to Stream');
    }

    const accountId = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID;
    const result = {
      uid,
      playbackUrl: `https://customer-${accountId}.cloudflarestream.com/${uid}/manifest/video.m3u8`,
      duration,
      mode,
      size: blob.size,
    };

    console.log('✅ Video uploaded to Stream:', result);
    
    setUploadState(prev => ({
      ...prev,
      mediaResult: result,
    }));

    return result;
  };

  /**
   * Upload audio to Cloudflare R2
   */
  const uploadAudioToR2 = async (blob, duration) => {
    console.log('🎤 Uploading audio to R2...');
    
    const response = await fetch('/api/media/upload-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'audio/webm',
      },
      body: blob,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload audio');
    }

    const result = await response.json();
    
    const finalResult = {
      uid: result.data.uid,
      playbackUrl: result.data.playbackUrl,
      duration,
      mode: 'audio',
      size: blob.size,
    };

    console.log('✅ Audio uploaded to R2:', finalResult);
    
    setUploadState(prev => ({
      ...prev,
      mediaResult: finalResult,
    }));

    return finalResult;
  };

  /**
   * Upload answer attachments
   * @param {File[]} files - Array of files to upload
   */
  const uploadAttachments = useCallback(async (files) => {
    if (!files || files.length === 0) {
      return [];
    }

    console.log('📎 Starting attachment uploads:', files.map(f => f.name));
    
    setUploadState(prev => ({
      ...prev,
      stage: 'attachments',
    }));

    const results = [];

    for (const file of files) {
      try {
        const base64 = await fileToBase64(file);

        const response = await fetch('/api/media/upload-attachment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: {
              name: file.name,
              type: file.type || 'application/octet-stream',
              data: base64.split(',')[1],
            },
          }),
        });

        if (!response.ok) {
          console.error(`Failed to upload ${file.name}`);
          continue;
        }

        const result = await response.json();
        results.push(result.data);
        
        console.log(`✅ Uploaded: ${file.name}`);
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
      }
    }

    console.log('✅ All attachments uploaded:', results);
    
    setUploadState(prev => ({
      ...prev,
      attachmentResults: results,
    }));

    return results;
  }, []);

  /**
   * Create media_asset record in database after upload
   * @param {Object} mediaResult - Result from uploadMedia
   */
  const createMediaAsset = async (mediaResult) => {
    console.log('💾 Creating media_asset record...');
    
    const response = await fetch('/api/media/create-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        asset_id: mediaResult.uid,              // Cloudflare UID
        url: mediaResult.playbackUrl,           // Full URL
        duration: mediaResult.duration,         // Seconds
        type: mediaResult.mode,                 // 'video' or 'audio'
        size: mediaResult.size,                 // Bytes
        mime_type: mediaResult.mode === 'video' ? 'video/webm' : 'audio/webm',
        storage: mediaResult.mode === 'video' ? 'stream' : 'r2',
        owner_type: 'answer',                   // Always 'answer' for this flow
        owner_id: null,                         // Will be updated after answer creation
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create media asset record');
    }

    const result = await response.json();
    console.log('✅ Media asset record created:', result.data.media_asset_id);
    
    return result.data;
  };

  /**
   * Submit complete answer
   * @param {Object} answerData - Complete answer data from AnswerRecorder
   * @param {number} questionId - The question ID being answered
   * @param {number} userId - The expert's user ID
   */
  const submitAnswer = useCallback(async (answerData, questionId, userId) => {
    console.log('🚀 Starting answer submission for question:', questionId);
    
    if (!userId) {
      throw new Error('userId is required for answer submission');
    }
    
    setUploadState({
      uploading: true,
      progress: 0,
      stage: 'media',
      error: null,
      mediaResult: null,
      attachmentResults: [],
    });

    try {
      let mediaAssetId = null;
      let mediaResult = null;
      let attachmentResults = [];

      // Step 1: Upload media if exists
      if (answerData.mediaBlob && answerData.recordingMode) {
        console.log('📤 Uploading answer media...');
        mediaResult = await uploadMedia(
          answerData.mediaBlob,
          answerData.recordingMode,
          answerData.recordingDuration || 0
        );

        // Create media_asset record in database
        const mediaAsset = await createMediaAsset(mediaResult);
        mediaAssetId = mediaAsset.media_asset_id;
      }

      // Step 2: Upload attachments if exist
      if (answerData.files && answerData.files.length > 0) {
        console.log('📎 Uploading answer attachments...');
        attachmentResults = await uploadAttachments(answerData.files);
      }

      // Step 3: Create answer record
      setUploadState(prev => ({
        ...prev,
        stage: 'submitting',
      }));

      console.log('💾 Creating answer record...');

      const payload = {
        question_id: questionId,
        user_id: userId,
        text_response: answerData.text || '',
      };

      // Add media_asset_id if we have media
      if (mediaAssetId) {
        payload.media_asset_id = mediaAssetId;
      }

      // Add attachments as JSON string if uploaded
      if (attachmentResults.length > 0) {
        payload.attachments = JSON.stringify(attachmentResults);
      }

      const response = await fetch('/api/answer/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create answer');
      }

      const result = await response.json();
      
      console.log('✅ Answer submitted successfully:', result);

      setUploadState({
        uploading: false,
        progress: 100,
        stage: 'complete',
        error: null,
        mediaResult,
        attachmentResults,
      });

      return result.data;

    } catch (error) {
      console.error('❌ Answer submission failed:', error);
      
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        error: error.message,
      }));
      
      throw error;
    }
  }, [uploadMedia, uploadAttachments]);

  const reset = useCallback(() => {
    setUploadState({
      uploading: false,
      progress: 0,
      stage: '',
      error: null,
      mediaResult: null,
      attachmentResults: [],
    });
  }, []);

  return {
    ...uploadState,
    uploadMedia,
    uploadAttachments,
    submitAnswer,
    reset,
  };
}

// Helper function
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}