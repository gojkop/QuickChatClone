import React, { useState, useRef, useEffect } from 'react';

function RecordingModal({ mode, onComplete, onClose }) {
  const [state, setState] = useState('preview'); // preview, recording, review
  const [countdown, setCountdown] = useState(null);
  const [timer, setTimer] = useState(90);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [facingMode, setFacingMode] = useState('user'); // 'user' (front) or 'environment' (back)
  const [isFlipping, setIsFlipping] = useState(false);

  const videoRef = useRef(null);
  const reviewVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const micStreamRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const audioContextRef = useRef(null);

  // Detect if mobile device
  const isMobileDevice = typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 2)
  );

  // Initialize preview
  useEffect(() => {
    initializePreview();
    return () => cleanup();
  }, [mode]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && state !== 'recording') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [state, onClose]);

  const initializePreview = async () => {
    try {
      let stream;

      if (mode === 'screen') {
        // Screen recording with audio mixing
        stream = await setupScreenRecording();
      } else {
        // Regular video or audio recording
        const constraints = mode === 'video'
          ? { 
              audio: true, 
              video: { 
                facingMode: facingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
              } 
            }
          : { audio: true, video: false };

        stream = await navigator.mediaDevices.getUserMedia(constraints);
      }

      streamRef.current = stream;

      if ((mode === 'video' || mode === 'screen') && videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Media permission error:', error);
      alert('Camera/microphone permission denied or screen sharing cancelled');
      onClose();
    }
  };

  const setupScreenRecording = async () => {
    try {
      // Get display stream with audio
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      // Get microphone audio
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });

      // Store mic stream reference for cleanup
      micStreamRef.current = micStream;

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

      // Combine video from display with mixed audio
      const combinedStream = new MediaStream([
        ...displayStream.getVideoTracks(),
        ...destination.stream.getAudioTracks()
      ]);

      // Handle when user stops sharing via browser UI
      displayStream.getVideoTracks()[0].addEventListener('ended', () => {
        console.log('Screen sharing stopped by user');
        if (state === 'recording') {
          stopRecording();
        } else {
          onClose();
        }
      });

      return combinedStream;
    } catch (error) {
      console.error('Screen recording setup error:', error);
      throw error;
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  const flipCamera = async () => {
    if (mode !== 'video' || state === 'recording' || isFlipping) return;

    setIsFlipping(true);
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';

    try {
      // Stop current stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Get new stream with flipped camera
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      setFacingMode(newFacingMode);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera flip error:', error);
      alert('Could not flip camera. Using current camera.');
      // Restore original stream
      await initializePreview();
    } finally {
      setIsFlipping(false);
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
      
      if (mode !== 'audio' && reviewVideoRef.current) {
        reviewVideoRef.current.src = URL.createObjectURL(blob);
      }
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
    if (recordedBlob) {
      URL.revokeObjectURL(URL.createObjectURL(recordedBlob));
    }
    onClose();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getModalTitle = () => {
    if (state === 'preview') {
      if (mode === 'video') return 'Record Video';
      if (mode === 'audio') return 'Record Audio';
      if (mode === 'screen') return 'Record Screen';
    }
    if (state === 'recording') return 'Recording...';
    if (state === 'review') return 'Review Recording';
    return '';
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        // Close modal if clicking backdrop (but not during recording)
        if (e.target === e.currentTarget && state !== 'recording') {
          onClose();
        }
      }}
    >
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div 
          className={`relative bg-white rounded-2xl shadow-2xl w-full overflow-hidden animate-slideUp ${
            isMobileDevice ? 'max-w-full h-full sm:max-w-2xl sm:h-auto' : 'max-w-2xl'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${state === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                {getModalTitle()}
              </h3>
            </div>
            <button
              onClick={onClose}
              disabled={state === 'recording'}
              className="p-2 hover:bg-gray-200 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="relative">
            {/* Preview State */}
            {state === 'preview' && (
              <>
                {mode === 'video' || mode === 'screen' ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full bg-gray-900 aspect-video object-cover"
                      autoPlay
                      muted
                      playsInline
                    />
                    {/* Camera Flip Button (Mobile Video Only) */}
                    {mode === 'video' && isMobileDevice && (
                      <button
                        onClick={flipCamera}
                        disabled={isFlipping}
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all disabled:opacity-50"
                        aria-label="Flip camera"
                      >
                        {isFlipping ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-full bg-gradient-to-br from-gray-800 to-gray-900 aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <MicIcon className="w-16 h-16 text-white mx-auto mb-3 opacity-80" />
                      <p className="text-white font-semibold text-lg">Audio Ready</p>
                      <p className="text-gray-400 text-sm mt-1">Your microphone is ready to record</p>
                    </div>
                  </div>
                )}
                <div className="p-4 sm:p-6 flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 sm:px-6 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={startCountdown}
                    disabled={countdown !== null}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 px-6 rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {countdown !== null ? 'Starting...' : 'Start Recording'}
                  </button>
                </div>
              </>
            )}

            {/* Recording State */}
            {state === 'recording' && (
              <>
                {mode === 'video' || mode === 'screen' ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full bg-gray-900 aspect-video object-cover"
                      autoPlay
                      muted
                      playsInline
                    />
                    {/* Recording Indicator Overlay */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-full shadow-lg animate-pulse">
                      <div className="w-3 h-3 rounded-full bg-white" />
                      <span className="font-bold text-sm">REC</span>
                    </div>
                    {/* Timer Overlay */}
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-mono text-lg font-bold shadow-lg">
                      {formatTime(timer)}
                    </div>
                    {/* Recording Instructions Overlay */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm">
                      Recording in progress...
                    </div>
                  </div>
                ) : (
                  <div className="w-full bg-gradient-to-br from-red-900 to-red-800 aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-red-600 mx-auto mb-4 animate-pulse shadow-2xl flex items-center justify-center">
                        <MicIcon className="w-10 h-10 text-white" />
                      </div>
                      <p className="text-white font-bold text-lg mb-2">Recording Audio...</p>
                      <p className="text-red-200 text-sm">Speak clearly into your microphone</p>
                    </div>
                  </div>
                )}
                <div className="p-4 sm:p-6 text-center bg-gray-50">
                  <div className="text-5xl font-black text-red-600 mb-4 font-mono">
                    {formatTime(timer)}
                  </div>
                  <button
                    onClick={stopRecording}
                    className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    Stop Recording
                  </button>
                </div>
              </>
            )}

            {/* Review State */}
            {state === 'review' && (
              <>
                {mode === 'video' || mode === 'screen' ? (
                  <video
                    ref={reviewVideoRef}
                    className="w-full bg-black aspect-video"
                    controls
                    playsInline
                  />
                ) : (
                  <div className="w-full bg-gradient-to-br from-gray-800 to-gray-900 aspect-video flex items-center justify-center p-8">
                    <div className="w-full max-w-md">
                      <div className="mb-4 text-center">
                        <MicIcon className="w-12 h-12 text-white mx-auto mb-2 opacity-80" />
                        <p className="text-white font-semibold">Audio Recording</p>
                      </div>
                      <audio
                        src={recordedBlob ? URL.createObjectURL(recordedBlob) : ''}
                        controls
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
                <div className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-semibold">Recording Complete</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Duration: <strong>{formatTime(recordedDuration)}</strong>
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDiscard}
                      className="px-4 sm:px-6 py-3 text-gray-700 font-semibold hover:bg-white rounded-xl transition flex items-center justify-center gap-2 border-2 border-gray-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Save Recording
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="text-9xl font-black text-white mb-4 animate-bounce drop-shadow-2xl">
                    {countdown}
                  </div>
                  <div className="text-white text-2xl font-semibold drop-shadow-lg">Get ready...</div>
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