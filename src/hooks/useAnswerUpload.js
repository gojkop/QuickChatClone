// src/hooks/useAnswerUpload.js
// Hook for uploading answer recordings and attachments
import { useState, useCallback } from 'react';
import apiClient from '@/api';

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
    
    const provider = mediaResult.mode === 'video' ? 'cloudflare_stream' : 'cloudflare_r2';
    
    const metadata = {
      type: mediaResult.mode,
      mime_type: mediaResult.mode === 'video' ? 'video/webm' : 'audio/webm',
      size: mediaResult.size || 0,
    };
    
    const response = await apiClient.post('/media_asset', {
      owner_type: 'answer',
      owner_id: 0, // Placeholder
      provider: provider,
      asset_id: mediaResult.uid, // Cloudflare UID
      duration_sec: Math.round(mediaResult.duration || 0),
      status: 'ready',
      url: mediaResult.playbackUrl,
      metadata: JSON.stringify(metadata), // ← Stringify for Xano
      segment_index: null,
    });

    console.log('✅ Media asset record created:', response.data.id);
    
    return response.data;
  };

  /**
   * Submit complete answer
   * @param {Object} answerData - Complete answer data from AnswerRecorder
   * @param {number} questionId - The question ID being answered
   * @param {number} userId - The expert's user ID
   */
  const submitAnswer = useCallback(async (answerData, questionId, userId) => {
    console.log('🚀 Starting answer submission for question:', questionId);
    console.log('Answer data received:', answerData);
    
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

      // ✅ STEP 1: Create media_asset record if we have segments
      if (answerData.recordingSegments && answerData.recordingSegments.length > 0) {
        console.log('📤 Creating media_asset record from segments...');
        
        // Transform segments data to match Xano schema
        const firstSegment = answerData.recordingSegments[0];
        
        // Build metadata as an object first, then stringify for Xano
        const metadata = {
          type: answerData.recordingMode || 'multi-segment',
          mime_type: 'video/webm',
          segments: answerData.recordingSegments.map(seg => ({
            uid: seg.uid,
            playback_url: seg.playbackUrl,
            duration: seg.duration,
            mode: seg.mode,
            segment_index: seg.segmentIndex,
          })),
          segment_count: answerData.recordingSegments.length,
        };
        
        const response = await apiClient.post('/media_asset', {
          owner_type: 'answer',
          owner_id: 0, // Placeholder
          provider: 'cloudflare_stream',
          asset_id: firstSegment.uid, // First segment's Cloudflare UID
          duration_sec: Math.round(answerData.recordingDuration || 0),
          status: 'ready',
          url: firstSegment.playbackUrl, // First segment's URL
          metadata: JSON.stringify(metadata), // ← Stringify for Xano
          segment_index: null, // Parent record
        });

        mediaAssetId = response.data?.id;
        mediaResult = response.data;
        
        console.log('✅ Media asset created, ID:', mediaAssetId);
      }
      // Legacy: Handle single mediaBlob (if still used anywhere)
      else if (answerData.mediaBlob && answerData.recordingMode) {
        console.log('📤 Uploading single media blob...');
        
        mediaResult = await uploadMedia(
          answerData.mediaBlob,
          answerData.recordingMode,
          answerData.recordingDuration || 0
        );

        const mediaAsset = await createMediaAsset(mediaResult);
        mediaAssetId = mediaAsset.media_asset_id;
      }

      // Step 2: Process attachments
      setUploadState(prev => ({
        ...prev,
        stage: 'attachments',
      }));

      let attachmentResults = [];
      
      // Handle both files array and attachments array
      const filesToProcess = answerData.files || answerData.attachments || [];
      
      if (filesToProcess.length > 0) {
        console.log('📎 Processing attachments...');
        
        // Check if already uploaded (from progressive upload)
        const firstItem = filesToProcess[0];
        if (firstItem.uid && firstItem.url) {
          // Already uploaded - just use the metadata
          attachmentResults = filesToProcess.map(att => ({
            uid: att.uid,
            url: att.url,
            filename: att.filename || att.name,
            size: att.size,
            type: att.type,
          }));
          console.log('✅ Using pre-uploaded attachments:', attachmentResults.length);
        } else {
          // Not uploaded yet - upload now
          attachmentResults = await uploadAttachments(filesToProcess);
        }
      }

      // Step 3: Create answer record
      setUploadState(prev => ({
        ...prev,
        stage: 'submitting',
      }));

      console.log('💾 Creating answer record...');

      // ✅ FIXED: Always include all fields explicitly
      const payload = {
        question_id: questionId,
        user_id: userId,
        text_response: answerData.text?.trim() || null,
        media_asset_id: mediaAssetId || null,
        attachments: attachmentResults.length > 0 
          ? JSON.stringify(attachmentResults) 
          : null,
      };

      console.log('Sending answer to Xano:', payload);

      // TEMPORARY FIX: Call Xano directly using apiClient to bypass 404 issue
      // TODO: Debug why /api/answer/submit returns 404 on Vercel
      const response = await apiClient.post('/answer', payload);

      console.log('✅ Answer created in Xano:', response.data);

      // Trigger email notification via separate endpoint
      // Pass question data from answer response (if embedded)
      try {
        console.log('📧 Triggering answer notification email...');

        const questionData = response.data.question || response.data._question;

        await fetch('/api/send-answer-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('qc_token')}`,
          },
          body: JSON.stringify({
            question_id: questionId,
            answer_id: response.data.id,
            user_id: userId,
            question_data: questionData, // Pass embedded question data
          }),
        });
        console.log('✅ Email notification triggered');
      } catch (emailError) {
        console.warn('⚠️ Email notification failed (non-blocking):', emailError.message);
      }

      const responseData = response;

      console.log('✅ Answer submitted successfully:', responseData.data);

      setUploadState({
        uploading: false,
        progress: 100,
        stage: 'complete',
        error: null,
        mediaResult,
        attachmentResults,
      });

      return responseData.data;

    } catch (error) {
      console.error('❌ Answer submission failed:', error);
      
      // ✅ ENHANCED: Log more details about the error
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        error: error.response?.data?.message || error.message,
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