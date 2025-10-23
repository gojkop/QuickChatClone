import React, { useState, useRef, useEffect } from 'react';

function RecordingModal({ mode, onComplete, onClose }) {
  const [state, setState] = useState('preview'); // preview, recording, review
  const [countdown, setCountdown] = useState(null);
  const [timer, setTimer] = useState(90);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [reviewBlobUrl, setReviewBlobUrl] = useState(null);

  const videoRef = useRef(null);
  const reviewVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(0);

  // Initialize preview
  useEffect(() => {
    initializePreview();
    return () => cleanup();
  }, [mode]);

  // Keep video element connected to stream during preview AND recording
  useEffect(() => {
    if (videoRef.current && streamRef.current && (state === 'preview' || state === 'recording')) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(e => console.warn('Video play failed:', e));
      }
    }
  }, [state]);

  // Set review video source when blob is ready
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
  }, [state, recordedBlob, mode]);

  const initializePreview = async () => {
    try {
      let stream;
      
      if (mode === 'screen') {
        // Screen capture with audio
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Also get microphone audio
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          
          // Mix both audio tracks
          const audioContext = new AudioContext();
          const dest = audioContext.createMediaStreamDestination();
          
          // Add display audio
          if (displayStream.getAudioTracks().length > 0) {
            const displaySource = audioContext.createMediaStreamSource(
              new MediaStream(displayStream.getAudioTracks())
            );
            displaySource.connect(dest);
          }
          
          // Add microphone audio
          const micSource = audioContext.createMediaStreamSource(audioStream);
          micSource.connect(dest);
          
          // Combine video + mixed audio
          stream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...dest.stream.getAudioTracks()
          ]);
        } catch {
          // If mic fails, just use display stream
          stream = displayStream;
        }
      } else if (mode === 'video') {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode: 'user' }
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

    // Timer
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              {state === 'preview' && `Record ${mode === 'video' ? 'Video' : mode === 'screen' ? 'Screen' : 'Audio'}`}
              {state === 'recording' && 'Recording...'}
              {state === 'review' && 'Review Recording'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content - FIXED HEIGHT to prevent layout shift */}
          <div className="relative" style={{ minHeight: '400px' }}>
            {/* Preview State */}
            {state === 'preview' && (
              <>
                {(mode === 'video' || mode === 'screen') ? (
                  <video
                    ref={videoRef}
                    className="w-full bg-gray-900 aspect-video"
                    autoPlay
                    muted
                    playsInline
                  />
                ) : (
                  <div className="w-full bg-gray-900 aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <MicIcon className="w-16 h-16 text-white mx-auto mb-3" />
                      <p className="text-white font-semibold">Audio Ready</p>
                    </div>
                  </div>
                )}
                <div className="p-6 flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={startCountdown}
                    disabled={countdown !== null}
                    className="flex-1 bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
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
                    className="w-full bg-gray-900 aspect-video"
                    autoPlay
                    muted
                    playsInline
                  />
                ) : (
                  <div className="w-full bg-gray-900 aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-red-600 mx-auto mb-4 animate-pulse" />
                      <p className="text-white font-semibold">Recording {mode === 'screen' ? 'Screen' : 'Audio'}...</p>
                    </div>
                  </div>
                )}
                <div className="p-6 text-center">
                  <div className="text-4xl font-black text-red-600 mb-4">
                    {formatTime(timer)}
                  </div>
                  <button
                    onClick={stopRecording}
                    className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700"
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
                    className="w-full bg-black aspect-video"
                    controls
                    playsInline
                  />
                ) : (
                  <div className="w-full bg-gray-900 aspect-video flex items-center justify-center">
                    <audio
                      src={reviewBlobUrl || ''}
                      controls
                      className="w-full max-w-md px-4"
                    />
                  </div>
                )}
                <div className="p-6 bg-green-50">
                  <p className="text-sm text-green-800 mb-4 text-center">
                    Duration: {formatTime(recordedDuration)}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDiscard}
                      className="px-6 py-3 text-gray-700 font-semibold hover:bg-white rounded-lg transition"
                    >
                      🗑️ Delete
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700"
                    >
                      ✅ Save Recording
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="text-8xl font-black text-white mb-4 animate-bounce">
                    {countdown}
                  </div>
                  <div className="text-white text-xl font-semibold">Get ready...</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Icon components (inline for modal)
function MicIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );
}

export default RecordingModal;