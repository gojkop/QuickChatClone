// src/components/dashboard/AnswerRecorder.jsx
import React, { useState, useRef, useEffect } from 'react';

const MAX_RECORDING_SECONDS = 900; // 15 minutes for answers

function AnswerRecorder({ question, onReady, onCancel }) {
  const [text, setText] = useState('');
  const [recordingState, setRecordingState] = useState('initial');
  const [recordingMode, setRecordingMode] = useState('video');
  const [mediaBlob, setMediaBlob] = useState(null);
  const [mediaBlobUrl, setMediaBlobUrl] = useState(null);
  const [timer, setTimer] = useState(MAX_RECORDING_SECONDS);
  const [files, setFiles] = useState([]);

  const videoRef = useRef(null);
  const reviewVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const liveStreamRef = useRef(null);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (liveStreamRef.current) {
        liveStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (mediaBlobUrl) {
        URL.revokeObjectURL(mediaBlobUrl);
      }
    };
  }, [mediaBlobUrl]);

  // Ensure review video loads when blob URL is ready
  useEffect(() => {
    if (reviewVideoRef.current && mediaBlobUrl && recordingState === 'review' && recordingMode === 'video') {
      console.log('Loading video with URL:', mediaBlobUrl);
      const videoEl = reviewVideoRef.current;
      
      videoEl.onloadedmetadata = () => {
        console.log('Video metadata loaded. Duration:', videoEl.duration);
      };
      
      videoEl.onerror = (e) => {
        console.error('Video error:', e, videoEl.error);
      };
      
      videoEl.load();
    }
  }, [mediaBlobUrl, recordingState, recordingMode]);

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

  const initiatePreview = async () => {
    setRecordingState('asking');
    try {
      const constraints = recordingMode === 'video' 
        ? { audio: true, video: { facingMode: 'user' } }
        : { audio: true, video: false };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      liveStreamRef.current = stream;
      setRecordingState('preview');
      
      if (videoRef.current && recordingMode === 'video') {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Permission Error:", error);
      setRecordingState('denied');
    }
  };

  const toggleRecordingMode = () => {
    if (recordingState === 'preview') {
      cleanupStream();
      const newMode = recordingMode === 'video' ? 'audio' : 'video';
      setRecordingMode(newMode);
      setRecordingState('initial');
    } else {
      setRecordingMode(recordingMode === 'video' ? 'audio' : 'video');
    }
  };

  const startRecording = () => {
    setRecordingState('recording');
    setTimer(MAX_RECORDING_SECONDS);
    
    const streamToRecord = liveStreamRef.current;
    const mimeType = recordingMode === 'video' ? 'video/webm;codecs=vp8,opus' : 'audio/webm';
    
    if (recordingMode === 'video' && videoRef.current) {
      videoRef.current.srcObject = streamToRecord;
    }
    
    mediaRecorderRef.current = new MediaRecorder(streamToRecord, { mimeType });
    const chunks = [];
    
    mediaRecorderRef.current.ondataavailable = e => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };
    
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      console.log('Recording stopped. Blob size:', blob.size, 'type:', blob.type);
      setMediaBlob(blob);
      const url = URL.createObjectURL(blob);
      console.log('Created blob URL:', url);
      setMediaBlobUrl(url);
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

  const handleRerecord = () => {
    cleanupStream();
    if (mediaBlobUrl) {
      URL.revokeObjectURL(mediaBlobUrl);
    }
    setMediaBlob(null);
    setMediaBlobUrl(null);
    setRecordingState('initial');
  };

  const handleProceedToReview = () => {
    const data = {
      text,
      mediaBlob,
      recordingMode,
      files
    };
    
    onReady(data);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const renderRecorder = () => {
    switch (recordingState) {
      case 'initial':
        return (
          <button 
            onClick={initiatePreview}
            className="w-full py-12 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition-colors">
                {recordingMode === 'video' ? (
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </div>
              <div>
                <span className="text-indigo-600 font-semibold block">Click to Record {recordingMode === 'video' ? 'Video' : 'Audio'} Answer</span>
                <span className="text-gray-500 text-sm">Maximum 15 minutes</span>
              </div>
            </div>
          </button>
        );

      case 'asking':
        return (
          <div className="text-center p-12 border-2 border-dashed border-gray-300 rounded-xl">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600">Requesting camera/microphone access...</p>
          </div>
        );

      case 'denied':
        return (
          <div className="text-center p-8 border-2 border-amber-400 rounded-xl bg-amber-50">
            <svg className="w-12 h-12 text-amber-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-semibold text-amber-800 mb-2">Camera/microphone access needed</p>
            <p className="text-sm text-amber-700 mb-4">Please allow access to record your answer</p>
            <button 
              onClick={initiatePreview}
              className="px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition"
            >
              Try Again
            </button>
          </div>
        );

      case 'preview':
        return (
          <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
            {recordingMode === 'video' && (
              <video 
                ref={videoRef}
                className="w-full bg-gray-900 aspect-video"
                autoPlay
                muted
                playsInline
              />
            )}
            {recordingMode === 'audio' && (
              <div className="w-full bg-gray-900 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-white mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <p className="text-white font-semibold">Audio Only Mode</p>
                  <p className="text-gray-400 text-sm">Your voice will be recorded</p>
                </div>
              </div>
            )}
            
            <div className="p-3 sm:p-4 bg-white">
              {/* Mobile: Stacked layout, Desktop: Row layout */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <button 
                  onClick={handleRerecord}
                  className="order-3 sm:order-1 px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition text-sm"
                >
                  Cancel
                </button>
                
                <button
                  onClick={toggleRecordingMode}
                  className="order-2 flex items-center justify-center gap-2 px-4 py-2 text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm"
                >
                  {recordingMode === 'video' ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      <span>Audio Only</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Video</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={startRecording}
                  className="order-1 sm:order-3 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow-lg"
                >
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                  <span>Start Recording</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'recording':
        return (
          <div className="border-2 border-red-500 rounded-xl overflow-hidden bg-red-50">
            {recordingMode === 'video' && (
              <video 
                ref={videoRef}
                className="w-full bg-gray-900 aspect-video"
                autoPlay
                muted
                playsInline
              />
            )}
            {recordingMode === 'audio' && (
              <div className="w-full bg-gray-900 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-red-600 mx-auto mb-4 animate-pulse"></div>
                  <p className="text-white font-semibold">Recording Audio...</p>
                </div>
              </div>
            )}
            <div className="p-4 sm:p-6 text-center">
              <div className="inline-flex items-center gap-3 mb-3 sm:mb-4">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-600 animate-pulse"></div>
                <span className="text-red-700 font-bold text-base sm:text-lg">Recording...</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-red-600 mb-3 sm:mb-4" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatTimer(timer)}
              </div>
              <button
                onClick={stopRecording}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
              >
                Stop Recording
              </button>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="border-2 border-green-500 rounded-xl overflow-hidden">
            {recordingMode === 'video' ? (
              <div className="relative">
                {!mediaBlobUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-center text-white">
                      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p>Processing video...</p>
                    </div>
                  </div>
                )}
                <video 
                  ref={reviewVideoRef}
                  src={mediaBlobUrl}
                  className="w-full aspect-video bg-black"
                  controls
                  playsInline
                  preload="auto"
                />
              </div>
            ) : (
              <div className="w-full bg-gray-900 aspect-video flex items-center justify-center">
                <audio 
                  src={mediaBlobUrl}
                  controls
                  className="w-full max-w-md px-4"
                  preload="auto"
                />
              </div>
            )}
            
            <div className="p-3 sm:p-4 bg-green-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-green-700 justify-center sm:justify-start">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Recording complete</span>
              </div>
              <button
                onClick={handleRerecord}
                className="w-full sm:w-auto px-4 py-2 text-gray-700 font-semibold hover:bg-white rounded-lg transition"
              >
                Re-record
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h3 className="font-semibold text-indigo-900 mb-1">Answering to:</h3>
        <p className="text-indigo-700">{question.title}</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Record Your Answer (max 15 minutes)
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
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300"
        >
          Review Answer
        </button>
      </div>
    </div>
  );
}

export default AnswerRecorder;