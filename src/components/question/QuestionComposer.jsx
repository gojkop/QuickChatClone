// src/components/question/QuestionComposer.jsx - UPDATED VERSION
import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useRecordingSegmentUpload } from '@/hooks/useRecordingSegmentUpload';
import { useAttachmentUpload } from '@/hooks/useAttachmentUpload';
import { InlineAICoach } from './InlineAICoach';
import { MindPilotQuestionCoach } from './MindPilotQuestionCoach';
import HelpButton from '@/components/common/HelpButton';

const MAX_RECORDING_SECONDS = 90;
const MAX_FILE_SIZE_MB = 5; // 25MB per file
const MAX_TOTAL_FILE_SIZE_MB = 15; // 75MB total across all files
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_TOTAL_FILE_SIZE_BYTES = MAX_TOTAL_FILE_SIZE_MB * 1024 * 1024;

const QuestionComposer = forwardRef(({ onReady, hideButton = false, expertId, expertProfile }, ref) => {
  // Form state
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [titleError, setTitleError] = useState('');

  // Segment-based recording state
  const [segments, setSegments] = useState([]);
  const [currentSegment, setCurrentSegment] = useState(null);
  const [recordingState, setRecordingState] = useState('idle');
  const [timer, setTimer] = useState(0);
  const [countdown, setCountdown] = useState(null);
  
  // Camera switching state
  const [facingMode, setFacingMode] = useState('user');
  const [isFlipping, setIsFlipping] = useState(false);

  // Calculate total duration from segments
  const totalDuration = segments.reduce((sum, seg) => {
    const dur = (seg.duration >= 0) ? seg.duration : 0;
    return sum + dur;
  }, 0);

  // Progressive upload hooks
  const segmentUpload = useRecordingSegmentUpload();
  const attachmentUpload = useAttachmentUpload();

  // Refs
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

  // Real-time validation
  useEffect(() => {
    if (title.length > 0 && title.length < 5) {
      setTitleError('Title should be at least 5 characters');
    } else {
      setTitleError('');
    }
  }, [title]);

  useEffect(() => {
    if (videoRef.current && liveStreamRef.current && 
        (recordingState === 'preview' || recordingState === 'recording') &&
        currentSegment?.mode !== 'audio') {
      videoRef.current.srcObject = liveStreamRef.current;
    }
  }, [recordingState, currentSegment?.mode]);

  // Force video to load when entering review state with proper timing
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

  useImperativeHandle(ref, () => ({
    getQuestionData: () => ({
      title,
      text,
      recordingSegments: segmentUpload.getSuccessfulSegments(),
      attachments: attachmentUpload.uploads
        .filter(u => u.result)
        .map(u => u.result),
      recordingMode: segments.length > 0 ? 'multi-segment' : null
    }),
    validateAndGetData: async () => {
      if (!title.trim()) {
        alert('Please enter a question title.');
        return null;
      }

      return {
        title,
        text,
        recordingSegments: segmentUpload.getSuccessfulSegments(),
        attachments: attachmentUpload.uploads
          .filter(u => u.result)
          .map(u => u.result),
        recordingMode: segments.length > 0 ? 'multi-segment' : null,
        recordingDuration: totalDuration
      };
    }
  }));

  const cleanupStream = () => {
    if (liveStreamRef.current) {
      liveStreamRef.current.getTracks().forEach(track => track.stop());
      liveStreamRef.current = null;
    }
    
    // Cleanup mic stream if exists
    if (liveStreamRef.micStream) {
      liveStreamRef.micStream.getTracks().forEach(track => track.stop());
      liveStreamRef.micStream = null;
    }
    
    // Cleanup audio context if exists
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
    
    // Check number of files
    if (newFiles.length + attachmentUpload.uploads.length > 3) {
      alert('Maximum 3 files allowed.');
      e.target.value = ''; // Reset input
      return;
    }

    // Check individual file sizes and calculate total
    const currentTotalSize = attachmentUpload.uploads.reduce((sum, upload) => sum + upload.file.size, 0);
    let newFilesTotalSize = 0;
    
    for (const file of newFiles) {
      // Check individual file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        alert(`File "${file.name}" is too large. Maximum file size is ${MAX_FILE_SIZE_MB}MB. This file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`);
        e.target.value = ''; // Reset input
        return;
      }
      newFilesTotalSize += file.size;
    }
    
    // Check total size across all files
    const totalSize = currentTotalSize + newFilesTotalSize;
    if (totalSize > MAX_TOTAL_FILE_SIZE_BYTES) {
      const currentSizeMB = (currentTotalSize / (1024 * 1024)).toFixed(1);
      const newSizeMB = (newFilesTotalSize / (1024 * 1024)).toFixed(1);
      const maxSizeMB = MAX_TOTAL_FILE_SIZE_MB;
      alert(`Total file size would exceed the ${maxSizeMB}MB limit. Current uploads: ${currentSizeMB}MB, New files: ${newSizeMB}MB. Please remove some files or choose smaller files.`);
      e.target.value = ''; // Reset input
      return;
    }

    // All validations passed, proceed with upload
    for (const file of newFiles) {
      try {
        await attachmentUpload.uploadAttachment(file);
      } catch (error) {
        console.error('File upload failed:', error);
      }
    }
    
    e.target.value = ''; // Reset input for next selection
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const startNewSegment = async (mode) => {
    const remainingTime = MAX_RECORDING_SECONDS - totalDuration;
    if (remainingTime <= 0) {
      alert('You have used all 90 seconds. Please remove a recording to add more.');
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
        // Get display stream with audio
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true,
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        });
        
        try {
          // Get microphone audio
          const micStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            },
            video: false 
          });
          
          // Create audio context to mix both audio sources
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          audioContextRef.current = audioContext;
          
          const destination = audioContext.createMediaStreamDestination();
          
          // Add system audio if available
          const systemAudioTracks = displayStream.getAudioTracks();
          if (systemAudioTracks.length > 0) {
            const systemSource = audioContext.createMediaStreamSource(
              new MediaStream(systemAudioTracks)
            );
            // Create a gain node to control system audio volume
            const systemGain = audioContext.createGain();
            systemGain.gain.value = 0.7; // Reduce system audio slightly
            systemSource.connect(systemGain);
            systemGain.connect(destination);
          }
          
          // Add microphone audio
          const micAudioTracks = micStream.getAudioTracks();
          if (micAudioTracks.length > 0) {
            const micSource = audioContext.createMediaStreamSource(micStream);
            // Create a gain node to control mic volume
            const micGain = audioContext.createGain();
            micGain.gain.value = 1.0; // Keep mic at full volume
            micSource.connect(micGain);
            micGain.connect(destination);
          }
          
          // Store reference to mic stream for cleanup
          liveStreamRef.micStream = micStream;
          
          // Combine video from display with mixed audio
          const combinedStream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...destination.stream.getAudioTracks()
          ]);
          
          stream = combinedStream;
          
        } catch (micError) {
          console.warn('Microphone access failed, using screen audio only:', micError);
          // Fall back to just screen audio
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
    
    // Log audio tracks for debugging
    const audioTracks = streamToRecord.getAudioTracks();
    console.log('Recording stream audio tracks:', audioTracks.length);
    audioTracks.forEach((track, index) => {
      console.log(`Audio track ${index}:`, {
        label: track.label,
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState
      });
    });
    
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
      console.log('Recording stopped. Blob size:', blob.size, 'bytes');
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
          currentSegment.duration
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

  const handleApplyAISuggestions = (suggestions) => {
    if (suggestions.additionalContext) {
      setText(prev => (prev + suggestions.additionalContext).trim());
    }
  };

  const handleProceedToReview = async () => {
    if (!title.trim()) {
      alert('Please enter a question title.');
      return;
    }
    
    const data = {
      title,
      text,
      recordingSegments: segmentUpload.getSuccessfulSegments(),
      attachments: attachmentUpload.uploads
        .filter(u => u.result)
        .map(u => u.result),
      recordingMode: segments.length > 0 ? 'multi-segment' : null,
      recordingDuration: totalDuration
    };
    
    onReady(data);
  };

  // Modern SVG Icon Components
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
        return (
          <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  const getSegmentLabel = (mode) => {
    const labels = { video: 'Video', audio: 'Audio', screen: 'Screen', 'screen-camera': 'Screen + Cam' };
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
    if (segments.length === 0) return null;

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

        <div className="bg-white rounded-lg p-2 sm:p-3 space-y-2">
          {segments.map((segment, index) => {
            const uploadStatus = segmentUpload.segments[index];
            const isUploading = uploadStatus?.uploading;
            const hasError = uploadStatus?.error;
            const isUploaded = uploadStatus?.result;

            return (
              <div key={segment.id} className="flex items-center gap-2 p-2 sm:p-3 bg-gray-50 rounded border border-gray-200">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs sm:text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center gap-1">
                      {getSegmentIcon(segment.mode)}
                      <span>{getSegmentLabel(segment.mode)}</span>
                      <span className="text-gray-500">· {formatTime(segment.duration)}</span>
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
        <div className="space-y-4">
          <ExistingSegmentsDisplay />

          {totalDuration < MAX_RECORDING_SECONDS && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6">
              <div className="text-center mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                  {segments.length === 0 ? 'Record your question' : 'Add another recording'}
                </h3>
                <p className="text-sm text-gray-600">
                  {formatTime(MAX_RECORDING_SECONDS - totalDuration)} remaining
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <div className="text-left flex-1">
                    <div className="font-semibold text-gray-900 mb-1">Record Video</div>
                    <div className="text-xs text-gray-500">
                      Show your face or what you're working on
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
                  <div className="text-left flex-1">
                    <div className="font-semibold text-gray-900 mb-1">Record Audio</div>
                    <div className="text-xs text-gray-500">
                      Voice-only recording
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
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-900 mb-1">Record Screen + Voice</div>
                      <div className="text-xs text-gray-500">
                        Capture your screen with microphone audio
                      </div>
                    </div>
                  </button>
                )}
              </div>

              {!isScreenRecordingAvailable && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-900 mb-1">
                      Screen recording available on desktop
                    </p>
                    <p className="text-xs text-blue-700">
                      Use our desktop site to record your screen
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
        <div className="space-y-4">
          <ExistingSegmentsDisplay />
          <div className="text-center p-12 border-2 border-dashed border-gray-300 rounded-xl">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600">Getting ready...</p>
          </div>
        </div>
      );
    }

    if (recordingState === 'denied') {
      return (
        <div className="space-y-4">
          <ExistingSegmentsDisplay />
          <div className="text-center p-6 sm:p-8 border-2 border-amber-400 rounded-xl bg-amber-50">
            <svg className="w-12 h-12 text-amber-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-semibold text-amber-800 mb-2">Permission needed</p>
            <p className="text-sm text-amber-700 mb-4">Please allow camera/microphone access when prompted</p>
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
        <div className="space-y-4">
          <ExistingSegmentsDisplay />
          <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
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
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-8xl font-black text-white mb-4 animate-bounce">
                        {countdown}
                      </div>
                      <div className="text-white text-xl font-semibold">
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
        <div className="space-y-4">
          <ExistingSegmentsDisplay />
          <div className="border-2 border-red-500 rounded-xl overflow-hidden bg-red-50">
            {currentSegment.mode !== 'audio' ? (
              <video ref={videoRef} className="w-full bg-gray-900 aspect-video object-cover max-h-[60vh]" autoPlay muted playsInline />
            ) : (
              <div className="w-full bg-gray-900 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-red-600 mx-auto mb-4 animate-pulse"></div>
                  <p className="text-white font-semibold">Recording Audio...</p>
                </div>
              </div>
            )}
            
            <div className="p-4 sm:p-6 text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-4 h-4 rounded-full bg-red-600 animate-pulse"></div>
                <span className="text-red-700 font-bold text-base sm:text-lg">Recording...</span>
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
        <div className="space-y-4">
          <ExistingSegmentsDisplay />
          <div className="border-2 border-green-500 rounded-xl overflow-hidden">
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
                Happy with this recording? It will be added to your question.
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
                  ✅ Save This Recording
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const canProceed = 
    title.trim().length >= 5 &&
    !segmentUpload.hasUploading &&
    !attachmentUpload.uploads.some(u => u.uploading);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <label htmlFor="question-title" className="flex items-center text-sm font-semibold text-gray-900 mb-2">
          <span>Question Title</span>
          <HelpButton>
            Keep it clear and specific. Good example: "Review my landing page copy for a SaaS product"
          </HelpButton>
        </label>
        <input
          type="text"
          id="question-title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition text-base"
          placeholder="e.g., Review my landing page copy"
        />
        {titleError && (
          <div className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {titleError}
          </div>
        )}
      </div>

      <div>
        <label className="flex items-center text-sm font-semibold text-gray-900 mb-2">
          <span>Record Your Question</span>
          <span className="text-gray-500 font-normal ml-2">(Total: max 90s)</span>
          <HelpButton>
            You can record multiple segments (video, audio, or screen). Use video to show, audio to explain, or screen to demonstrate a problem.
          </HelpButton>
        </label>
        {renderRecorder()}
      </div>

      <div>
        <label htmlFor="question-text" className="flex items-center text-sm font-semibold text-gray-900 mb-2">
          <span>Add More Detail</span>
          <span className="text-gray-500 font-normal ml-2">(Optional)</span>
          <HelpButton>
            Add written context, links, background info, or anything else that helps the expert understand your question better.
          </HelpButton>
        </label>
        <textarea
          id="question-text"
          value={text}
          onChange={e => setText(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition text-base"
          rows="4"
          maxLength="5000"
          placeholder="Add any written context, links, or details..."
        />
        <div className="text-right text-xs text-gray-500 mt-1">{text.length} / 5000</div>
      </div>

      <div>
        <label className="flex items-center text-sm font-semibold text-gray-900 mb-2">
          <span>Add Supporting Documents</span>
          <span className="text-gray-500 font-normal ml-2">(Optional, max 3 files, {MAX_FILE_SIZE_MB}MB per file, {MAX_TOTAL_FILE_SIZE_MB}MB total)</span>
          <HelpButton>
            Attach PDFs, images, documents, or any files that provide additional context for your question.
          </HelpButton>
        </label>
        <input
          type="file"
          id="file-upload"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition file:touch-manipulation file:min-h-[44px]"
          multiple
          onChange={handleFileChange}
          disabled={attachmentUpload.uploads.length >= 3}
        />
        {attachmentUpload.uploads.length > 0 && (
          <div className="mt-3">
            <ul className="space-y-2">
              {attachmentUpload.uploads.map((upload) => (
                <li key={upload.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0 mr-3">
                    <span className="text-sm text-gray-700 truncate block">{upload.file.name}</span>
                    <span className="text-xs text-gray-500">{formatFileSize(upload.file.size)}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {upload.uploading && (
                      <span className="text-xs text-indigo-600 flex items-center gap-1">
                        <div className="w-3 h-3 border border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        Uploading...
                      </span>
                    )}
                    {upload.error && (
                      <>
                        <span className="text-xs text-red-600">Failed</span>
                        <button
                          onClick={() => attachmentUpload.retryUpload(upload.id)}
                          className="text-xs text-indigo-600 hover:underline font-semibold touch-manipulation min-h-[32px] px-2"
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
            <div className="mt-2 text-xs text-gray-600 flex items-center justify-between">
              <span>
                Total: {formatFileSize(attachmentUpload.uploads.reduce((sum, u) => sum + u.file.size, 0))} / {MAX_TOTAL_FILE_SIZE_MB}MB
              </span>
              <span>
                {3 - attachmentUpload.uploads.length} file{3 - attachmentUpload.uploads.length !== 1 ? 's' : ''} remaining
              </span>
            </div>
          </div>
        )}
      </div>

{expertId && expertProfile && title.trim() && (
  <div className="pt-4 border-t-2 border-gray-200">
    <MindPilotQuestionCoach
      questionTitle={title}
      questionText={text}
      recordingSegments={segments}
      attachments={attachmentUpload.uploads.filter(u => u.result).map(u => u.result)}
      expertId={expertId}
      expertProfile={expertProfile}
      onApplySuggestions={handleApplyAISuggestions}
    />
  </div>
)}
      {!hideButton && (
        <div>
          <button
            onClick={handleProceedToReview}
            disabled={!canProceed}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none touch-manipulation min-h-[52px]"
          >
            {!title.trim() 
              ? 'Enter a title to continue' 
              : title.length < 5
              ? 'Title too short (min 5 characters)'
              : segmentUpload.hasUploading || attachmentUpload.uploads.some(u => u.uploading)
              ? 'Uploading...'
              : 'Review & Pay →'}
          </button>
          
          {(segmentUpload.segments.length > 0 || attachmentUpload.uploads.length > 0) && (
            <div className="mt-3 text-center text-sm text-gray-600">
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
      )}
    </div>
  );
});

QuestionComposer.displayName = 'QuestionComposer';

export default QuestionComposer;