// src/components/dashboard/AnswerRecorder.jsx
import React, { useState, useRef, useEffect } from 'react';
import { concatenateSegments } from '@/utils/videoConcatenator';

const MAX_RECORDING_SECONDS = 900; // 15 minutes for answers

function AnswerRecorder({ question, onReady, onCancel }) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);

  // Segment-based recording state
  const [segments, setSegments] = useState([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [currentSegment, setCurrentSegment] = useState(null);
  const [recordingState, setRecordingState] = useState('idle');
  const [timer, setTimer] = useState(0);

  // Camera switching state
  const [facingMode, setFacingMode] = useState('user');
  const [isFlipping, setIsFlipping] = useState(false);

  // Concatenation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(null);

  // Refs
  const videoRef = useRef(null);
  const reviewVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const liveStreamRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const segmentStartTimeRef = useRef(0);

  const isScreenRecordingAvailable = typeof navigator !== 'undefined' && 
    navigator.mediaDevices && 
    navigator.mediaDevices.getDisplayMedia;

  // Mobile detection
  const isMobileDevice = typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 2)
  );

  // Effect to properly set video source when stream is ready
  useEffect(() => {
    if (videoRef.current && liveStreamRef.current && 
        (recordingState === 'preview' || recordingState === 'recording') &&
        currentSegment?.mode !== 'audio') {
      videoRef.current.srcObject = liveStreamRef.current;
    }
  }, [recordingState, currentSegment?.mode]);

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
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length + files.length > 3) {
      alert('Maximum 3 files allowed.');
      return;
    }
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startNewSegment = async (mode) => {
    const remainingTime = MAX_RECORDING_SECONDS - totalDuration;
    if (remainingTime <= 0) {
      alert('You have used all 15 minutes. Please remove a segment to add more.');
      return;
    }

    // Clean up any existing stream first
    cleanupStream();
    
    // Reset camera to front-facing when starting new video segment
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
          audio: true 
        });
        
        if (mode === 'screen-camera') {
          try {
            const cameraStream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: desiredFacingMode },
              audio: true 
            });
            stream = displayStream;
          } catch (e) {
            console.warn('Camera failed, using screen only:', e);
            stream = displayStream;
          }
        } else {
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
      const duration = Math.floor((Date.now() - segmentStartTimeRef.current) / 1000);
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

    mediaRecorderRef.current.start(100);

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

  const saveSegment = () => {
    if (currentSegment && currentSegment.blob) {
      setSegments(prev => [...prev, {
        id: Date.now(),
        ...currentSegment
      }]);
      setTotalDuration(prev => prev + currentSegment.duration);
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
    const segment = segments.find(s => s.id === id);
    if (segment) {
      setTotalDuration(prev => prev - segment.duration);
      if (segment.blobUrl) {
        URL.revokeObjectURL(segment.blobUrl);
      }
      setSegments(prev => prev.filter(s => s.id !== id));
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
    let finalMediaBlob = null;
    let finalRecordingMode = null;

    if (segments.length > 0) {
      setIsProcessing(true);
      try {
        const result = await concatenateSegments(segments, setProcessingProgress);
        finalMediaBlob = result.blob;
        finalRecordingMode = result.mode;
      } catch (error) {
        console.error('Failed to concatenate segments:', error);
        alert('Failed to process recording. Please try again.');
        setIsProcessing(false);
        setProcessingProgress(null);
        return;
      } finally {
        setIsProcessing(false);
        setProcessingProgress(null);
      }
    }
    
    const data = {
      text,
      files,
      mediaBlob: finalMediaBlob,
      recordingMode: finalRecordingMode
    };
    
    onReady(data);
  };

  const getSegmentLabel = (mode) => {
    const labels = { video: 'Video', audio: 'Audio', screen: 'Screen', 'screen-camera': 'Screen + Cam' };
    return labels[mode] || 'Recording';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Existing segments display
  const ExistingSegmentsDisplay = () => {
    if (segments.length === 0) return null;

    return (
      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            <span className="text-sm font-bold text-indigo-900">Your Segments (will play in order)</span>
          </div>
          <span className="text-xs font-semibold text-indigo-700 bg-white px-2 py-1 rounded">
            {formatTime(totalDuration)} / {formatTime(MAX_RECORDING_SECONDS)}
          </span>
        </div>

        <div className="bg-white rounded-lg p-3 space-y-2">
          {segments.map((segment, index) => (
            <div key={segment.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-900 flex items-center gap-1">
                    {getSegmentLabel(segment.mode)}
                    <span className="text-gray-500">· {formatTime(segment.duration)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                {index > 0 && (
                  <button
                    onClick={() => moveSegmentUp(index)}
                    className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                    title="Move up"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                )}
                {index < segments.length - 1 && (
                  <button
                    onClick={() => moveSegmentDown(index)}
                    className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                    title="Move down"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      elem.style.maxHeight = '400px';
                    }
                    const modal = document.createElement('div');
                    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80';
                    modal.onclick = () => modal.remove();
                    modal.appendChild(elem);
                    document.body.appendChild(modal);
                    elem.play();
                  }}
                  className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition"
                  title="Preview"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => removeSegment(segment.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                  title="Delete"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-start gap-2 text-xs text-indigo-700">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Segments will be combined in this order into one video. Use arrows to reorder.</span>
        </div>
      </div>
    );
  };

  // Processing overlay
  if (isProcessing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Recording</h3>
            <p className="text-gray-600 mb-4">
              Combining your {segments.length} segment{segments.length > 1 ? 's' : ''} into one video...
            </p>
            {processingProgress && (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  {processingProgress.stage === 'preparing' && 'Preparing...'}
                  {processingProgress.stage === 'processing' && `Segment ${processingProgress.current} of ${processingProgress.total}`}
                  {processingProgress.stage === 'complete' && 'Finalizing...'}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(processingProgress.current / processingProgress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const renderRecorder = () => {
    if (recordingState === 'idle') {
      return (
        <div className="space-y-4">
          <ExistingSegmentsDisplay />

          {totalDuration < MAX_RECORDING_SECONDS && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {segments.length === 0 ? 'Record Your Answer' : 'Add Another Segment'}
                </h3>
                <p className="text-sm text-gray-600">
                  {formatTime(MAX_RECORDING_SECONDS - totalDuration)} remaining
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => startNewSegment('video')}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition group"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">Video</span>
                </button>

                <button
                  onClick={() => startNewSegment('audio')}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition group"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">Audio</span>
                </button>

                {isScreenRecordingAvailable && (
                  <button
                    onClick={() => startNewSegment('screen')}
                    className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition group"
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">Screen</span>
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
                      💻 Screen recording available on desktop
                    </p>
                    <p className="text-xs text-blue-700">
                      Use our desktop site to record your screen along with video and audio
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
            <p className="text-gray-600">Requesting permissions...</p>
          </div>
        </div>
      );
    }

    if (recordingState === 'denied') {
      return (
        <div className="space-y-4">
          <ExistingSegmentsDisplay />
          <div className="text-center p-8 border-2 border-amber-400 rounded-xl bg-amber-50">
            <svg className="w-12 h-12 text-amber-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-semibold text-amber-800 mb-2">Permission denied</p>
            <p className="text-sm text-amber-700 mb-4">Please allow access when prompted</p>
            <div className="flex gap-2 justify-center">
              <button onClick={discardSegment} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition">
                Cancel
              </button>
              <button onClick={() => initiatePreview(currentSegment.mode, facingMode)} className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition">
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
                <video ref={videoRef} className="w-full bg-gray-900 aspect-video" autoPlay muted playsInline />
                
                {currentSegment.mode === 'video' && isMobileDevice && (
                  <button
                    onClick={flipCamera}
                    disabled={isFlipping}
                    className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                    {facingMode === 'user' ? '📷 Front Camera' : '📷 Back Camera'}
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
            
            <div className="p-4 bg-white flex flex-col sm:flex-row gap-3 sm:justify-between">
              <button onClick={discardSegment} className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition">
                Cancel
              </button>
              <button onClick={startRecording} className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition">
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
              <video ref={videoRef} className="w-full bg-gray-900 aspect-video" autoPlay muted playsInline />
            ) : (
              <div className="w-full bg-gray-900 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-red-600 mx-auto mb-4 animate-pulse"></div>
                  <p className="text-white font-semibold">Recording Audio...</p>
                </div>
              </div>
            )}
            
            <div className="p-6 text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-4 h-4 rounded-full bg-red-600 animate-pulse"></div>
                <span className="text-red-700 font-bold text-lg">Recording Segment {segments.length + 1}...</span>
              </div>
              <div className="text-4xl font-black text-red-600 mb-4" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatTime(timer)}
              </div>
              <button onClick={stopRecording} className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition">
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
              <video ref={reviewVideoRef} src={currentSegment.blobUrl} className="w-full aspect-video bg-black" controls playsInline preload="auto" />
            ) : (
              <div className="w-full bg-gray-900 aspect-video flex items-center justify-center">
                <audio src={currentSegment.blobUrl} controls className="w-full max-w-md px-4" preload="auto" />
              </div>
            )}
            
            <div className="p-4 bg-green-50 flex flex-col sm:flex-row gap-3 sm:justify-between">
              <div className="flex items-center gap-2 text-green-700 justify-center sm:justify-start">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">{getSegmentLabel(currentSegment.mode)} · {formatTime(currentSegment.duration)}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={discardSegment} className="flex-1 sm:flex-none px-4 py-2 text-gray-700 font-semibold hover:bg-white rounded-lg transition">
                  Discard
                </button>
                <button onClick={saveSegment} className="flex-1 sm:flex-none px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition">
                  Add Segment
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h3 className="font-semibold text-indigo-900 mb-1">Answering to:</h3>
        <p className="text-indigo-700">{question.title}</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Record Your Answer
          <span className="text-gray-500 font-normal ml-2">(Total: max 15 minutes)</span>
        </label>
        {renderRecorder()}
      </div>

      <div>
        <label htmlFor="answer-text" className="block text-sm font-semibold text-gray-900 mb-2">
          Written Answer or Additional Notes <span className="text-gray-500 font-normal">(Optional)</span>
        </label>
        <textarea
          id="answer-text"
          value={text}
          onChange={e => setText(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition"
          rows="4"
          maxLength="5000"
          placeholder="Add any written response or additional notes..."
        />
        <div className="text-right text-xs text-gray-500 mt-1">{text.length} / 5000</div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Attach Files <span className="text-gray-500 font-normal">(Optional, max 3)</span>
        </label>
        <input
          type="file"
          id="answer-file-upload"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition"
          multiple
          onChange={handleFileChange}
        />
        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="ml-3 text-red-500 hover:text-red-700 font-semibold text-sm"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleProceedToReview}
          disabled={isProcessing}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Review Answer'}
        </button>
      </div>
    </div>
  );
}

export default AnswerRecorder;