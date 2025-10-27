// src/components/dashboard/AnswerRecorder.jsx
// COMPLETE WORKING VERSION with mobile fixes - STICKY FOOTER ON MOBILE

import React, { useState, useRef, useEffect } from 'react';
import { useRecordingSegmentUpload } from '@/hooks/useRecordingSegmentUpload';
import { useAttachmentUpload } from '@/hooks/useAttachmentUpload';
import HelpButton from '@/components/common/HelpButton';
import AnswerQualityIndicator from './AnswerQualityIndicator';
import SLACountdown from './SLACountdown';

const MAX_RECORDING_SECONDS = 900; // 15 minutes for answers

function AnswerRecorder({ question, onReady, onCancel, expert, initialText = '', existingData = null }) {
  console.log('🚀 [DEPLOYMENT TEST] AnswerRecorder loaded - Build timestamp:', Date.now());
  console.log('🎬 [ANSWER RECORDER] Component mounted/updated with props:', {
    initialText: initialText,
    initialTextType: typeof initialText,
    initialTextLength: initialText?.length || 0,
    hasInitialText: !!initialText,
    existingData: existingData,
    hasExistingData: !!existingData,
    existingDataText: existingData?.text,
    existingRecordingsCount: existingData?.recordingSegments?.length || 0,
    existingAttachmentsCount: existingData?.attachments?.length || 0
  });

  // IMPORTANT: Prioritize existingData.text over initialText for state initialization
  const initialTextValue = existingData?.text || initialText || '';
  const [text, setText] = useState(initialTextValue);

  console.log('🎬 [ANSWER RECORDER] Text state initialized to:', text, 'from:', existingData?.text ? 'existingData.text' : 'initialText');

  // For already-uploaded segments, we just track them for display
  const [existingSegments, setExistingSegments] = useState(existingData?.recordingSegments || []);
  const [existingAttachments, setExistingAttachments] = useState(existingData?.attachments || []);

  const [segments, setSegments] = useState([]);
  const [currentSegment, setCurrentSegment] = useState(null);
  const [recordingState, setRecordingState] = useState('idle');
  const [timer, setTimer] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [isFlipping, setIsFlipping] = useState(false);

  const segmentUpload = useRecordingSegmentUpload();
  const attachmentUpload = useAttachmentUpload();

  // Update text when existingData or initialText props change
  useEffect(() => {
    console.log('📝 [ANSWER RECORDER] Props changed, checking text updates:', {
      existingDataText: existingData?.text,
      initialText: initialText,
      currentTextState: text
    });

    // Priority: existingData.text > initialText > empty string
    const newTextValue = existingData?.text || initialText || '';

    if (newTextValue !== text) {
      console.log('📝 [ANSWER RECORDER] Updating text state from:', newTextValue ? 'existingData.text or initialText' : 'empty');
      console.log('📝 [ANSWER RECORDER] New value:', newTextValue);
      setText(newTextValue);
    } else {
      console.log('📝 [ANSWER RECORDER] Text unchanged, no update needed');
    }
  }, [existingData?.text, initialText]); // Watch both text sources

  // Update existing segments and attachments when existingData changes
  useEffect(() => {
    console.log('📦 [ANSWER RECORDER] existingData prop changed:', {
      hasData: !!existingData,
      text: existingData?.text,
      textLength: existingData?.text?.length || 0,
      recordings: existingData?.recordingSegments?.length || 0,
      attachments: existingData?.attachments?.length || 0,
      recordingSegmentsArray: existingData?.recordingSegments
    });

    if (existingData) {
      const recordingSegments = existingData.recordingSegments || [];
      const attachments = existingData.attachments || [];

      console.log('📦 [ANSWER RECORDER] Setting existing data:', {
        segmentsToSet: recordingSegments.length,
        attachmentsToSet: attachments.length,
        segmentsArray: recordingSegments,
        attachmentsArray: attachments
      });

      setExistingSegments(recordingSegments);
      setExistingAttachments(attachments);

      console.log('✅ [ANSWER RECORDER] State updated with existing data');
    } else {
      // If existingData becomes null, clear the existing items
      console.log('📦 [ANSWER RECORDER] Clearing existing data (prop is null)');
      setExistingSegments([]);
      setExistingAttachments([]);
    }
  }, [existingData]);

  // Calculate total duration from both existing and new segments
  const newSegmentsDuration = segments.reduce((sum, seg) => {
    const dur = (seg.duration >= 0) ? seg.duration : 0;
    return sum + dur;
  }, 0);

  const existingSegmentsDuration = existingSegments.reduce((sum, seg) => {
    const dur = (seg.duration >= 0) ? seg.duration : 0;
    return sum + dur;
  }, 0);

  const totalDuration = newSegmentsDuration + existingSegmentsDuration;

  const videoRef = useRef(null);
  const reviewVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const liveStreamRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const segmentStartTimeRef = useRef(0);
  const audioContextRef = useRef(null);

  const isScreenRecordingAvailable = typeof navigator !== 'undefined' && 
    navigator.mediaDevices && 
    navigator.mediaDevices.getDisplayMedia;

  const isMobileDevice = typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 2)
  );

  useEffect(() => {
    if (videoRef.current && liveStreamRef.current && 
        (recordingState === 'preview' || recordingState === 'recording') &&
        currentSegment?.mode !== 'audio') {
      videoRef.current.srcObject = liveStreamRef.current;
    }
  }, [recordingState, currentSegment?.mode]);

  useEffect(() => {
    if (recordingState === 'review' && 
        currentSegment?.blobUrl && 
        currentSegment?.mode !== 'audio' && 
        reviewVideoRef.current) {
      reviewVideoRef.current.src = currentSegment.blobUrl;
      reviewVideoRef.current.load();
      
      reviewVideoRef.current.onerror = (e) => {
        console.error('Video load error:', e);
        setTimeout(() => {
          if (reviewVideoRef.current) {
            reviewVideoRef.current.load();
          }
        }, 100);
      };
    }
  }, [recordingState, currentSegment?.blobUrl, currentSegment?.mode]);

  useEffect(() => {
    return () => {
      cleanupStream();
      segments.forEach(seg => {
        if (seg.blobUrl) URL.revokeObjectURL(seg.blobUrl);
      });
      if (currentSegment?.blobUrl) {
        URL.revokeObjectURL(currentSegment.blobUrl);
      }
    };
  }, []);

  const cleanupStream = () => {
    if (liveStreamRef.current) {
      liveStreamRef.current.getTracks().forEach(track => track.stop());
      liveStreamRef.current = null;
    }
    
    if (liveStreamRef.micStream) {
      liveStreamRef.micStream.getTracks().forEach(track => track.stop());
      liveStreamRef.micStream = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const handleFileChange = async (e) => {
    const newFiles = Array.from(e.target.files);
    const totalFiles = existingAttachments.length + attachmentUpload.uploads.length + newFiles.length;

    if (totalFiles > 3) {
      const currentCount = existingAttachments.length + attachmentUpload.uploads.length;
      alert(`Maximum 3 files allowed (you already have ${currentCount} file${currentCount !== 1 ? 's' : ''}).`);
      e.target.value = '';
      return;
    }

    // Files go to Cloudflare R2 which has no practical size limits
    // Set reasonable limit to prevent abuse (50MB)
    const maxFileSize = 50 * 1024 * 1024; // 50MB

    for (const file of newFiles) {
      if (file.size > maxFileSize) {
        alert(`File "${file.name}" is too large (max 50MB).`);
        e.target.value = '';
        return;
      }
    }

    for (const file of newFiles) {
      try {
        await attachmentUpload.uploadAttachment(file);
      } catch (error) {
        console.error('File upload failed:', error);
      }
    }

    e.target.value = '';
  };

  const startNewSegment = async (mode) => {
    const remainingTime = MAX_RECORDING_SECONDS - totalDuration;
    if (remainingTime <= 0) {
      alert('You have used all 15 minutes. Please remove a segment to add more.');
      return;
    }

    cleanupStream();
    
    if (mode === 'video') {
      setFacingMode('user');
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    setCurrentSegment({ mode, blob: null, blobUrl: null, duration: 0 });
    setRecordingState('asking');
    initiatePreview(mode, mode === 'video' ? 'user' : facingMode);
  };

  const initiatePreview = async (mode, desiredFacingMode = facingMode) => {
    try {
      let stream;
      
      if (mode === 'screen' || mode === 'screen-camera') {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true,
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        });
        
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            },
            video: false 
          });
          
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          audioContextRef.current = audioContext;
          
          const destination = audioContext.createMediaStreamDestination();
          
          const systemAudioTracks = displayStream.getAudioTracks();
          if (systemAudioTracks.length > 0) {
            const systemSource = audioContext.createMediaStreamSource(
              new MediaStream(systemAudioTracks)
            );
            const systemGain = audioContext.createGain();
            systemGain.gain.value = 0.7;
            systemSource.connect(systemGain);
            systemGain.connect(destination);
          }
          
          const micAudioTracks = micStream.getAudioTracks();
          if (micAudioTracks.length > 0) {
            const micSource = audioContext.createMediaStreamSource(micStream);
            const micGain = audioContext.createGain();
            micGain.gain.value = 1.0;
            micSource.connect(micGain);
            micGain.connect(destination);
          }
          
          liveStreamRef.micStream = micStream;
          
          const combinedStream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...destination.stream.getAudioTracks()
          ]);
          
          stream = combinedStream;
        } catch (micError) {
          console.warn('Microphone access failed, using screen audio only:', micError);
          stream = displayStream;
        }
      } else {
        const constraints = mode === 'video' 
          ? { audio: true, video: { facingMode: desiredFacingMode } }
          : { audio: true, video: false };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      }
      
      liveStreamRef.current = stream;
      setRecordingState('preview');
    } catch (error) {
      console.error("Permission Error:", error);
      setRecordingState('denied');
    }
  };

  const startRecordingWithCountdown = () => {
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          startRecording();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = () => {
    const remainingTime = MAX_RECORDING_SECONDS - totalDuration;
    setRecordingState('recording');
    setTimer(remainingTime);
    segmentStartTimeRef.current = Date.now();
    
    const streamToRecord = liveStreamRef.current;
    const mimeType = currentSegment.mode === 'audio' ? 'audio/webm' : 'video/webm;codecs=vp8,opus';
    
    mediaRecorderRef.current = new MediaRecorder(streamToRecord, { mimeType });
    const chunks = [];
    
    mediaRecorderRef.current.ondataavailable = e => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };
    
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const duration = Math.max(1, Math.floor((Date.now() - segmentStartTimeRef.current) / 1000));
      const url = URL.createObjectURL(blob);
      
      setCurrentSegment(prev => ({
        ...prev,
        blob,
        blobUrl: url,
        duration: Math.min(duration, remainingTime)
      }));
      setRecordingState('review');
      cleanupStream();
    };

    mediaRecorderRef.current.start();

    timerIntervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  const flipCamera = async () => {
    if (isFlipping || recordingState !== 'preview' || currentSegment?.mode !== 'video') {
      return;
    }

    setIsFlipping(true);
    
    try {
      cleanupStream();
      
      const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
      setFacingMode(newFacingMode);
      
      const constraints = {
        audio: true,
        video: { facingMode: newFacingMode }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      liveStreamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Camera flip error:", error);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode: facingMode }
        });
        liveStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (restoreError) {
        console.error("Could not restore camera:", restoreError);
        setRecordingState('denied');
      }
    } finally {
      setIsFlipping(false);
    }
  };

  const saveSegment = async () => {
    if (currentSegment && currentSegment.blob) {
      const segmentData = {
        id: Date.now(),
        ...currentSegment
      };

      setSegments(prev => [...prev, segmentData]);

      try {
        await segmentUpload.uploadSegment(
          currentSegment.blob,
          currentSegment.mode,
          segments.length,
          currentSegment.duration,
          currentSegment.blobUrl // Pass blobUrl so it can be preserved
        );
      } catch (error) {
        console.error('Segment upload failed:', error);
      }

      setCurrentSegment(null);
      setRecordingState('idle');
    }
  };

  const discardSegment = () => {
    if (currentSegment?.blobUrl) {
      URL.revokeObjectURL(currentSegment.blobUrl);
    }
    cleanupStream();
    setCurrentSegment(null);
    setRecordingState('idle');
  };

  const removeSegment = (id) => {
    const segmentIndex = segments.findIndex(s => s.id === id);
    const segment = segments[segmentIndex];
    
    if (segment) {
      if (segment.blobUrl) {
        URL.revokeObjectURL(segment.blobUrl);
      }
      setSegments(prev => prev.filter(s => s.id !== id));
      
      const uploadSegment = segmentUpload.segments[segmentIndex];
      if (uploadSegment) {
        segmentUpload.removeSegment(uploadSegment.id);
      }
    }
  };

  const moveSegmentUp = (index) => {
    if (index === 0) return;
    const newSegments = [...segments];
    [newSegments[index - 1], newSegments[index]] = [newSegments[index], newSegments[index - 1]];
    setSegments(newSegments);
  };

  const moveSegmentDown = (index) => {
    if (index === segments.length - 1) return;
    const newSegments = [...segments];
    [newSegments[index], newSegments[index + 1]] = [newSegments[index + 1], newSegments[index]];
    setSegments(newSegments);
  };

  const handleProceedToReview = async () => {
    // Get newly uploaded segments and attachments
    const newSegments = segmentUpload.getSuccessfulSegments() || [];
    const newAttachments = attachmentUpload.uploads
      .filter(u => u && u.result)
      .map(u => u.result);

    console.log('📦 [ANSWER RECORDER] Preparing data for review:', {
      existingSegmentsCount: existingSegments.length,
      newSegmentsCount: newSegments.length,
      existingAttachmentsCount: existingAttachments.length,
      newAttachmentsCount: newAttachments.length
    });

    // Combine existing and new data
    const data = {
      text: text || '',
      recordingSegments: [...existingSegments, ...newSegments],
      attachments: [...existingAttachments, ...newAttachments],
      recordingMode: (existingSegments.length > 0 || segments.length > 0) ? 'multi-segment' : null,
      recordingDuration: totalDuration || 0,
    };

    console.log('✅ [ANSWER RECORDER] Final data for review:', {
      hasText: !!data.text,
      textLength: data.text.length,
      totalSegments: data.recordingSegments.length,
      totalAttachments: data.attachments.length,
      totalDuration: data.recordingDuration
    });

    onReady(data);
  };

  const getSegmentIcon = (mode) => {
    const iconProps = "w-4 h-4 text-indigo-600";
    
    switch(mode) {
      case 'video':
        return (
          <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'audio':
        return (
          <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        );
      case 'screen':
      case 'screen-camera':
        return (
          <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getSegmentLabel = (mode) => {
    const labels = { video: 'Video', audio: 'Audio', screen: 'Screen', 'screen-camera': 'Screen + Voice' };
    return labels[mode] || 'Recording';
  };

  const formatTime = (seconds) => {
    if (seconds === undefined || seconds === null || seconds < 0 || isNaN(seconds)) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const ExistingSegmentsDisplay = () => {
    console.log('🎥 [EXISTING SEGMENTS DISPLAY] Rendering check:', {
      newSegments: segments.length,
      existingSegments: existingSegments.length,
      willRender: segments.length > 0 || existingSegments.length > 0
    });

    if (segments.length === 0 && existingSegments.length === 0) return null;

    return (
      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 sm:p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            <span className="text-sm font-bold text-indigo-900">Your Recordings</span>
          </div>
          <span className="text-xs font-semibold text-indigo-700 bg-white px-2 py-1 rounded">
            {formatTime(totalDuration)} / {formatTime(MAX_RECORDING_SECONDS)}
          </span>
        </div>

        <div className="bg-white rounded-lg p-2 sm:p-3 space-y-2 max-w-full">
          {/* Show existing segments from previous edit session */}
          {existingSegments.length > 0 && (
            <>
              <div className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">
                ✅ Previously Recorded ({existingSegments.length})
              </div>
              {existingSegments.map((segment, index) => (
                <div key={`existing-${index}`} className="flex items-center gap-2 p-2 sm:p-3 bg-green-50 rounded border border-green-200 max-w-full overflow-hidden">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs sm:text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center gap-1 truncate">
                        {getSegmentIcon(segment.mode)}
                        <span className="truncate">{getSegmentLabel(segment.mode)}</span>
                        <span className="text-gray-500 whitespace-nowrap">· {formatTime(segment.duration)}</span>
                      </div>
                      <div className="text-xs mt-0.5 text-green-700 font-semibold">
                        ✅ Already uploaded
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      console.log('🗑️ [ANSWER RECORDER] Removing existing segment:', index);
                      setExistingSegments(prev => prev.filter((_, i) => i !== index));
                    }}
                    className="p-2 sm:p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                    title="Remove this segment"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </>
          )}

          {/* Show new segments being recorded/uploaded */}
          {segments.map((segment, index) => {
            const uploadStatus = segmentUpload.segments[index];
            const isUploading = uploadStatus?.uploading;
            const hasError = uploadStatus?.error;
            const isUploaded = uploadStatus?.result;

            return (
              <div key={segment.id} className="flex items-center gap-2 p-2 sm:p-3 bg-gray-50 rounded border border-gray-200 max-w-full overflow-hidden">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs sm:text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center gap-1 truncate">
                      {getSegmentIcon(segment.mode)}
                      <span className="truncate">{getSegmentLabel(segment.mode)}</span>
                      <span className="text-gray-500 whitespace-nowrap">· {formatTime(segment.duration)}</span>
                    </div>
                    <div className="text-xs mt-0.5">
                      {isUploading && (
                        <span className="text-indigo-600 flex items-center gap-1">
                          <div className="w-2 h-2 border border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                          Uploading...
                        </span>
                      )}
                      {hasError && (
                        <span className="text-red-600 flex items-center gap-1">
                          ❌ Failed
                          <button
                            onClick={() => segmentUpload.retrySegment(uploadStatus.id)}
                            className="text-indigo-600 hover:underline font-semibold"
                          >
                            Retry
                          </button>
                        </span>
                      )}
                      {isUploaded && (
                        <span className="text-green-600 flex items-center gap-1 font-semibold">
                          ✅ Ready
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 flex-shrink-0">
                  {index > 0 && (
                    <button
                      onClick={() => moveSegmentUp(index)}
                      className="p-2 sm:p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                      title="Move up"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                  )}
                  {index < segments.length - 1 && (
                    <button
                      onClick={() => moveSegmentDown(index)}
                      className="p-2 sm:p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                      title="Move down"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const elem = segment.mode !== 'audio' 
                        ? document.createElement('video')
                        : document.createElement('audio');
                      elem.src = segment.blobUrl;
                      elem.controls = true;
                      if (segment.mode !== 'audio') {
                        elem.style.width = '100%';
                        elem.style.maxHeight = '70vh';
                        elem.style.objectFit = 'contain';
                      }
                      const modal = document.createElement('div');
                      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90';
                      modal.onclick = () => modal.remove();
                      const container = document.createElement('div');
                      container.className = 'max-w-4xl w-full';
                      container.appendChild(elem);
                      modal.appendChild(container);
                      document.body.appendChild(modal);
                      elem.play();
                    }}
                    className="p-2 sm:p-2.5 text-indigo-600 hover:bg-indigo-50 rounded transition touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                    title="Preview"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeSegment(segment.id)}
                    className="p-2 sm:p-2.5 text-red-600 hover:bg-red-50 rounded transition touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-start gap-2 text-xs text-indigo-700">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Your recordings are uploading automatically in the background</span>
        </div>
      </div>
    );
  };

  const renderRecorder = () => {
    if (recordingState === 'idle') {
      return (
        <div className="space-y-4 max-w-full">
          <ExistingSegmentsDisplay />

          {totalDuration < MAX_RECORDING_SECONDS && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 max-w-full">
              <div className="text-center mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 flex items-center justify-center gap-2">
                  {segments.length === 0 ? 'Record Your Answer' : 'Add Another Recording'}
                  <HelpButton position="bottom">
                    <strong>Recording Options:</strong>
                    <ul className="mt-2 space-y-1.5 text-left text-xs">
                      <li><strong>Video:</strong> Best for personal, face-to-face answers</li>
                      <li><strong>Audio:</strong> Perfect for quick explanations</li>
                      <li><strong>Screen + Voice:</strong> Ideal for walkthroughs & demos with your microphone audio</li>
                      <li className="pt-1 border-t border-gray-200 mt-2"><em>You can record multiple segments and arrange them in any order</em></li>
                    </ul>
                  </HelpButton>
                </h3>
                <p className="text-sm text-gray-600">
                  {formatTime(MAX_RECORDING_SECONDS - totalDuration)} remaining
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-full">
                <button
                  onClick={() => startNewSegment('video')}
                  className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition group touch-manipulation min-h-[60px]"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 mb-1">Video</div>
                    <div className="text-xs text-gray-500">
                      Show your face or demonstrate visually
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => startNewSegment('audio')}
                  className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition group touch-manipulation min-h-[60px]"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 mb-1">Audio</div>
                    <div className="text-xs text-gray-500">
                      Voice-only explanation
                    </div>
                  </div>
                </button>

                {isScreenRecordingAvailable && (
                  <button
                    onClick={() => startNewSegment('screen')}
                    className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition group sm:col-span-2 touch-manipulation min-h-[60px]"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 mb-1">Screen + Voice</div>
                      <div className="text-xs text-gray-500">
                        Record your screen with microphone narration
                      </div>
                    </div>
                  </button>
                )}
              </div>

              {!isScreenRecordingAvailable && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-full">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-blue-900 mb-1">
                      Screen recording available on desktop
                    </p>
                    <p className="text-xs text-blue-700">
                      Use our desktop site to record your screen with voice narration
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (recordingState === 'asking') {
      return (
        <div className="space-y-4 max-w-full">
          <ExistingSegmentsDisplay />
          <div className="text-center p-12 border-2 border-dashed border-gray-300 rounded-xl">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600">Requesting permissions...</p>
          </div>
        </div>
      );
    }

    if (recordingState === 'denied') {
      return (
        <div className="space-y-4 max-w-full">
          <ExistingSegmentsDisplay />
          <div className="text-center p-6 sm:p-8 border-2 border-amber-400 rounded-xl bg-amber-50">
            <svg className="w-12 h-12 text-amber-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-semibold text-amber-800 mb-2">Permission needed</p>
            <p className="text-sm text-amber-700 mb-4">Please allow camera/microphone access when prompted by your browser</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button 
                onClick={discardSegment} 
                className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition touch-manipulation min-h-[44px]"
              >
                Cancel
              </button>
              <button 
                onClick={() => initiatePreview(currentSegment.mode, facingMode)} 
                className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition touch-manipulation min-h-[44px]"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (recordingState === 'preview') {
      return (
        <div className="space-y-4 max-w-full">
          <ExistingSegmentsDisplay />
          <div className="border-2 border-gray-300 rounded-xl overflow-hidden max-w-full">
            {currentSegment.mode !== 'audio' ? (
              <div className="relative">
                <video ref={videoRef} className="w-full bg-gray-900 aspect-video object-cover max-h-[60vh]" autoPlay muted playsInline />
                
                {currentSegment.mode === 'video' && isMobileDevice && (
                  <button
                    onClick={flipCamera}
                    disabled={isFlipping}
                    className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-w-[48px] min-h-[48px] flex items-center justify-center"
                    title={`Switch to ${facingMode === 'user' ? 'back' : 'front'} camera`}
                  >
                    {isFlipping ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                  </button>
                )}
                
                {currentSegment.mode === 'video' && isMobileDevice && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                    {facingMode === 'user' ? '📷 Front' : '📷 Back'}
                  </div>
                )}

                {countdown !== null && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-7xl sm:text-8xl font-black text-white mb-4 animate-bounce">
                        {countdown}
                      </div>
                      <div className="text-white text-lg sm:text-xl font-semibold">
                        Get ready...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full bg-gray-900 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-white mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <p className="text-white font-semibold">Audio Ready</p>
                  <p className="text-gray-400 text-sm mt-1">Your microphone is active</p>
                </div>
              </div>
            )}
            
            <div className="p-4 bg-white flex flex-col sm:flex-row gap-3">
              <button 
                onClick={discardSegment} 
                className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition touch-manipulation min-h-[44px] order-2 sm:order-1"
              >
                Cancel
              </button>
              <button 
                onClick={startRecordingWithCountdown} 
                disabled={countdown !== null}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition disabled:opacity-50 touch-manipulation min-h-[44px] order-1 sm:order-2 flex-1 sm:flex-initial"
              >
                <div className="w-3 h-3 rounded-full bg-white"></div>
                <span>Start Recording</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (recordingState === 'recording') {
      return (
        <div className="space-y-4 max-w-full">
          <ExistingSegmentsDisplay />
          <div className="border-2 border-red-500 rounded-xl overflow-hidden bg-red-50 max-w-full">
            {currentSegment.mode !== 'audio' ? (
              <video ref={videoRef} className="w-full bg-gray-900 aspect-video object-cover max-h-[60vh]" autoPlay muted playsInline />
            ) : (
              <div className="w-full bg-gray-900 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-red-600 mx-auto mb-4 animate-pulse"></div>
                  <p className="text-white font-semibold text-lg">Recording Audio...</p>
                  <p className="text-gray-400 text-sm mt-1">Speak clearly into your microphone</p>
                </div>
              </div>
            )}
            
            <div className="p-4 sm:p-6 text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-4 h-4 rounded-full bg-red-600 animate-pulse"></div>
                <span className="text-red-700 font-bold text-base sm:text-lg">Recording in progress...</span>
              </div>
              <div className="text-4xl sm:text-5xl font-black text-red-600 mb-4" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatTime(timer)}
              </div>
              <button 
                onClick={stopRecording} 
                className="px-6 sm:px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition touch-manipulation min-h-[44px]"
              >
                Stop Recording
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (recordingState === 'review') {
      return (
        <div className="space-y-4 max-w-full">
          <ExistingSegmentsDisplay />
          <div className="border-2 border-green-500 rounded-xl overflow-hidden max-w-full">
            {currentSegment.mode !== 'audio' ? (
              <video 
                ref={reviewVideoRef} 
                key={currentSegment.blobUrl}
                src={currentSegment.blobUrl} 
                className="w-full aspect-video bg-black max-h-[60vh] object-contain" 
                controls 
                playsInline 
                preload="metadata"
              />
            ) : (
              <div className="w-full bg-gray-900 aspect-video flex items-center justify-center">
                <audio 
                  src={currentSegment.blobUrl}
                  key={currentSegment.blobUrl}
                  controls 
                  className="w-full max-w-md px-4" 
                  preload="metadata" 
                />
              </div>
            )}
            
            <div className="p-4 bg-green-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-green-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-sm sm:text-base flex items-center gap-1">
                    {getSegmentIcon(currentSegment.mode)}
                    <span>{getSegmentLabel(currentSegment.mode)} · {formatTime(currentSegment.duration)}</span>
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-green-800 mb-3 text-center">
                Happy with this recording? Save it to include in your answer.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={discardSegment} 
                  className="px-4 py-2 text-gray-700 font-semibold hover:bg-white rounded-lg transition touch-manipulation min-h-[44px] order-2 sm:order-1"
                >
                  🗑️ Delete & Record Again
                </button>
                <button 
                  onClick={saveSegment} 
                  className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition touch-manipulation min-h-[44px] order-1 sm:order-2 flex-1 sm:flex-initial"
                >
                  ✅ Save Recording
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const canSubmit = 
    !segmentUpload.hasUploading &&
    !attachmentUpload.uploads.some(u => u.uploading);

  return (
    <>
      <SLACountdown question={question} expert={expert} className="rounded-lg mb-4 sm:mb-6" />
      
      <div className="space-y-6 max-w-full overflow-hidden">
        <div>
          <label className="flex items-center text-sm font-semibold text-gray-900 mb-2">
            <span>Record Your Answer</span>
            <span className="text-gray-500 font-normal ml-2">(Total: max 15 minutes)</span>
            <HelpButton>
              <strong>Best Practices:</strong>
              <ul className="mt-2 space-y-1 text-left text-xs">
                <li>• Start with a brief introduction</li>
                <li>• Address the question directly</li>
                <li>• Provide examples when helpful</li>
                <li>• End with actionable next steps</li>
              </ul>
            </HelpButton>
          </label>
          {renderRecorder()}
        </div>

        <div>
          <label htmlFor="answer-text" className="flex items-center text-sm font-semibold text-gray-900 mb-2">
            <span>Written Summary or Notes</span>
            <span className="text-gray-500 font-normal ml-2">(Optional)</span>
            <HelpButton>
              Add written summaries, links, code snippets, or follow-up resources. This complements your video answer and helps askers take action.
            </HelpButton>
          </label>
          <textarea
            id="answer-text"
            value={text}
            onChange={e => setText(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition text-base"
            rows="4"
            maxLength="5000"
            placeholder="Add any written context, links, resources, or next steps..."
          />
          <div className="text-right text-xs text-gray-500 mt-1">{text.length} / 5000</div>
        </div>

        <div>
          <label className="flex items-center text-sm font-semibold text-gray-900 mb-2">
            <span>Attach Supporting Files</span>
            <span className="text-gray-500 font-normal ml-2">(Optional, max 3, 50MB each)</span>
            <HelpButton>
              Attach supporting documents, PDFs, code examples, diagrams, or reference materials that help answer the question thoroughly.
            </HelpButton>
          </label>
          <input
            type="file"
            id="answer-file-upload"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition file:touch-manipulation file:min-h-[44px]"
            multiple
            onChange={handleFileChange}
            disabled={(existingAttachments.length + attachmentUpload.uploads.length) >= 3}
          />

          {/* Show existing attachments from previous edit session */}
          {existingAttachments.length > 0 && (
            <ul className="mt-3 space-y-2">
              <div className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200 mb-2">
                ✅ Previously Attached ({existingAttachments.length})
              </div>
              {existingAttachments.map((file, index) => (
                <li key={`existing-file-${index}`} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 max-w-full overflow-hidden">
                  <span className="text-sm text-gray-700 truncate flex-1 mr-3">{file.filename || file.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-green-600 font-semibold">✅ Uploaded</span>
                    <button
                      onClick={() => {
                        console.log('🗑️ [ANSWER RECORDER] Removing existing attachment:', index);
                        setExistingAttachments(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="ml-2 text-red-500 hover:text-red-700 font-semibold text-sm touch-manipulation min-h-[32px] px-2"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Show new attachments being uploaded */}
          {attachmentUpload.uploads.length > 0 && (
            <ul className="mt-3 space-y-2">
              {attachmentUpload.uploads.map((upload) => (
                <li key={upload.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg max-w-full overflow-hidden">
                  <span className="text-sm text-gray-700 truncate flex-1 mr-3">{upload.file.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {upload.uploading && (
                      <span className="text-xs text-indigo-600 flex items-center gap-1 whitespace-nowrap">
                        <div className="w-3 h-3 border border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        Uploading...
                      </span>
                    )}
                    {upload.error && (
                      <>
                        <span className="text-xs text-red-600">Failed</span>
                        <button
                          onClick={() => attachmentUpload.retryUpload(upload.id)}
                          className="text-xs text-indigo-600 hover:underline touch-manipulation min-h-[32px] px-2"
                        >
                          Retry
                        </button>
                      </>
                    )}
                    {upload.result && (
                      <span className="text-xs text-green-600 font-semibold">✅ Ready</span>
                    )}
                    <button
                      onClick={() => attachmentUpload.removeUpload(upload.id)}
                      className="ml-2 text-red-500 hover:text-red-700 font-semibold text-sm touch-manipulation min-h-[32px] px-2"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <AnswerQualityIndicator
          answerData={{
            recordingSegments: [...existingSegments, ...segments],
            recordingDuration: totalDuration,
            text,
            attachments: [
              ...existingAttachments,
              ...attachmentUpload.uploads.filter(u => u.result).map(u => u.result)
            ]
          }}
          question={question}
        />

        {/* MOBILE: Sticky footer that's always visible */}
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:shadow-none sm:relative sm:border-t">
          <div className="flex items-center justify-between gap-3 sm:gap-4 p-3 sm:pt-4 sm:pb-4">
            <button
              onClick={onCancel}
              className="px-4 sm:px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition touch-manipulation min-h-[44px]"
            >
              Cancel
            </button>
            <button
              onClick={handleProceedToReview}
              disabled={!canSubmit}
              className="flex-1 sm:flex-initial px-4 sm:px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px]"
            >
              {!canSubmit ? 'Uploading...' : 'Review Answer →'}
            </button>
          </div>
        </div>

        {(existingSegments.length > 0 || existingAttachments.length > 0 || segmentUpload.segments.length > 0 || attachmentUpload.uploads.length > 0) && (
          <div className="text-center text-sm text-gray-600 mb-20 sm:mb-2">
            {segmentUpload.hasUploading || attachmentUpload.uploads.some(u => u.uploading) ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                Uploading in background...
              </span>
            ) : (
              <span className="text-green-600 font-semibold flex items-center justify-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                All content uploaded and ready!
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default AnswerRecorder;