import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

function RecordingModal({ mode, onComplete, onClose }) {
  const [state, setState] = useState('preview'); // preview, recording, review
  const [countdown, setCountdown] = useState(null);
  const [timer, setTimer] = useState(90);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [reviewBlobUrl, setReviewBlobUrl] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // ✅ NEW: 'user' = front, 'environment' = rear

  const videoRef = useRef(null);
  const reviewVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(0);

  // ✅ IMPROVED: Lock body scroll when modal is open with better mobile handling
  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;
    
    const originalBodyOverflow = body.style.overflow;
    const originalBodyPosition = body.style.position;
    const originalBodyTop = body.style.top;
    const originalBodyWidth = body.style.width;
    const originalHtmlOverflow = html.style.overflow;
    
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.left = '0';
    body.style.right = '0';
    html.style.overflow = 'hidden';

    return () => {
      body.style.overflow = originalBodyOverflow;
      body.style.position = originalBodyPosition;
      body.style.top = originalBodyTop;
      body.style.width = originalBodyWidth;
      body.style.left = '';
      body.style.right = '';
      html.style.overflow = originalHtmlOverflow;
      
      window.scrollTo(0, scrollY);
    };
  }, []);

  // ✅ NEW: Re-initialize preview when facingMode changes
  useEffect(() => {
    if (state === 'preview') {
      initializePreview();
    }
    return () => cleanup();
  }, [mode, facingMode]);

  // Keep video element connected to stream during preview AND recording
  useEffect(() => {
    if (videoRef.current && streamRef.current && (state === 'preview' || state === 'recording')) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(e => console.warn('Video play failed:', e));
      }
    }
  }, [state]);

  // Set review video/audio source when blob is ready
  useEffect(() => {
    if (state === 'review' && recordedBlob && reviewVideoRef.current && (mode === 'video' || mode === 'screen')) {
      const blobUrl = URL.createObjectURL(recordedBlob);
      setReviewBlobUrl(blobUrl);
      reviewVideoRef.current.src = blobUrl;
      reviewVideoRef.current.load();
      
      return () => {
        if (blobUrl) URL.revokeObjectURL(blobUrl);
      };
    }
    
    if (state === 'review' && recordedBlob && mode === 'audio') {
      const blobUrl = URL.createObjectURL(recordedBlob);
      setReviewBlobUrl(blobUrl);
      
      return () => {
        if (blobUrl) URL.revokeObjectURL(blobUrl);
      };
    }
  }, [state, recordedBlob, mode]);

  const initializePreview = async () => {
    try {
      // Clean up existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      let stream;
      
      if (mode === 'screen') {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          
          const audioContext = new AudioContext();
          const dest = audioContext.createMediaStreamDestination();
          
          if (displayStream.getAudioTracks().length > 0) {
            const displaySource = audioContext.createMediaStreamSource(
              new MediaStream(displayStream.getAudioTracks())
            );
            displaySource.connect(dest);
          }
          
          const micSource = audioContext.createMediaStreamSource(audioStream);
          micSource.connect(dest);
          
          stream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...dest.stream.getAudioTracks()
          ]);
        } catch {
          stream = displayStream;
        }
      } else if (mode === 'video') {
        // ✅ NEW: Use facingMode state for camera selection
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode: facingMode }
        });
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        });
      }

      streamRef.current = stream;

      if ((mode === 'video' || mode === 'screen') && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Video play failed:', e));
      }
    } catch (error) {
      console.error('Media permission error:', error);
      alert('Permission denied or device not available');
      onClose();
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  // ✅ NEW: Toggle camera function
  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const startCountdown = () => {
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
    setState('recording');
    startTimeRef.current = Date.now();

    const mimeType = mode === 'audio' ? 'audio/webm' : 'video/webm;codecs=vp8,opus';
    mediaRecorderRef.current = new MediaRecorder(streamRef.current, { mimeType });
    const chunks = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      setRecordedBlob(blob);
      setRecordedDuration(duration);
      setState('review');
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
    cleanup();
  };

  const handleSave = () => {
    onComplete(recordedBlob, recordedDuration, mode);
  };

  const handleDiscard = () => {
    if (reviewBlobUrl) {
      URL.revokeObjectURL(reviewBlobUrl);
    }
    onClose();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      style={{ 
        zIndex: 99999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          padding: isMobile ? '0' : '1rem'
        }}
      >
        <div 
          className={`bg-white shadow-2xl ${
            isMobile 
              ? 'w-full h-full flex flex-col' 
              : 'rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col'
          }`}
          style={{
            maxHeight: isMobile ? '100vh' : '90vh'
          }}
        >
          {/* Header */}
          <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between flex-shrink-0">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              {state === 'preview' && `Record ${mode === 'video' ? 'Video' : mode === 'screen' ? 'Screen' : 'Audio'}`}
              {state === 'recording' && 'Recording...'}
              {state === 'review' && 'Review Recording'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition touch-manipulation"
              style={{ minWidth: '44px', minHeight: '44px' }}
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="relative flex-1 flex flex-col overflow-hidden" style={{ minHeight: '300px' }}>
            {/* Preview State */}
            {state === 'preview' && (
              <>
                {(mode === 'video' || mode === 'screen') ? (
                  <div className="relative flex-1 bg-gray-900">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      playsInline
                      style={{ 
                        maxHeight: isMobile ? 'calc(100vh - 200px)' : 'none',
                        transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
                      }}
                    />
                    
                    {/* ✅ NEW: Camera flip button (only for video mode) */}
                    {mode === 'video' && (
                      <button
                        onClick={toggleCamera}
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition touch-manipulation backdrop-blur-sm"
                        style={{ minWidth: '48px', minHeight: '48px' }}
                        aria-label="Switch camera"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-full flex-1 bg-gray-900 flex items-center justify-center">
                    <div className="text-center p-8">
                      <MicIcon className="w-16 h-16 text-white mx-auto mb-3" />
                      <p className="text-white font-semibold">Audio Ready</p>
                    </div>
                  </div>
                )}
                <div className="p-4 sm:p-6 flex gap-3 flex-shrink-0 bg-white border-t">
                  <button
                    onClick={onClose}
                    className="px-4 sm:px-6 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition touch-manipulation"
                    style={{ minHeight: '48px' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={startCountdown}
                    disabled={countdown !== null}
                    className="flex-1 bg-red-600 text-white font-bold py-3 px-4 sm:px-6 rounded-lg hover:bg-red-700 transition disabled:opacity-50 touch-manipulation"
                    style={{ minHeight: '48px', fontSize: '16px' }}
                  >
                    Start Recording
                  </button>
                </div>
              </>
            )}

            {/* Recording State */}
            {state === 'recording' && (
              <>
                {(mode === 'video' || mode === 'screen') ? (
                  <video
                    ref={videoRef}
                    className="w-full flex-1 bg-gray-900 object-cover"
                    autoPlay
                    muted
                    playsInline
                    style={{ 
                      maxHeight: isMobile ? 'calc(100vh - 200px)' : 'none',
                      transform: facingMode === 'user' && mode === 'video' ? 'scaleX(-1)' : 'none'
                    }}
                  />
                ) : (
                  <div className="w-full flex-1 bg-gray-900 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-16 h-16 rounded-full bg-red-600 mx-auto mb-4 animate-pulse" />
                      <p className="text-white font-semibold">Recording {mode === 'screen' ? 'Screen' : 'Audio'}...</p>
                    </div>
                  </div>
                )}
                <div className="p-4 sm:p-6 text-center flex-shrink-0 bg-white border-t">
                  <div className="text-3xl sm:text-4xl font-black text-red-600 mb-4">
                    {formatTime(timer)}
                  </div>
                  <button
                    onClick={stopRecording}
                    className="px-6 sm:px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 touch-manipulation"
                    style={{ minHeight: '48px', fontSize: '16px' }}
                  >
                    Stop Recording
                  </button>
                </div>
              </>
            )}

            {/* Review State */}
            {state === 'review' && (
              <>
                {(mode === 'video' || mode === 'screen') ? (
                  <video
                    ref={reviewVideoRef}
                    className="w-full flex-1 bg-black object-contain"
                    controls
                    playsInline
                    style={{ maxHeight: isMobile ? 'calc(100vh - 200px)' : 'none' }}
                  />
                ) : (
                  <div className="w-full flex-1 bg-gray-900 flex items-center justify-center">
                    <audio
                      src={reviewBlobUrl || ''}
                      controls
                      className="w-full max-w-md px-4"
                      style={{ minHeight: '54px' }}
                    />
                  </div>
                )}
                <div className="p-4 sm:p-6 bg-green-50 flex-shrink-0 border-t">
                  <p className="text-sm text-green-800 mb-4 text-center font-semibold">
                    Duration: {formatTime(recordedDuration)}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDiscard}
                      className="px-4 sm:px-6 py-3 text-gray-700 font-semibold hover:bg-white rounded-lg transition border-2 border-gray-300 touch-manipulation"
                      style={{ minHeight: '48px' }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-green-600 text-white font-bold py-3 px-4 sm:px-6 rounded-lg hover:bg-green-700 shadow-lg touch-manipulation"
                      style={{ minHeight: '48px', fontSize: '16px' }}
                    >
                      Save Recording
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="text-6xl sm:text-8xl font-black text-white mb-4 animate-bounce">
                    {countdown}
                  </div>
                  <div className="text-white text-lg sm:text-xl font-semibold">Get ready...</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
}

function MicIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );
}

export default RecordingModal;