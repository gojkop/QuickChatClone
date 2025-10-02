import React, { useState, useRef, useEffect } from 'react';

const MAX_RECORDING_SECONDS = 90;

function QuestionComposer({ onReady }) {
  // Form state
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);

  // Recording state
  const [recordingState, setRecordingState] = useState('initial'); // initial, asking, denied, preview, recording, review
  const [recordingMode, setRecordingMode] = useState('video'); // 'video' or 'audio'
  const [mediaBlob, setMediaBlob] = useState(null);
  const [timer, setTimer] = useState(MAX_RECORDING_SECONDS);

  // Refs
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const liveStreamRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (liveStreamRef.current) {
        liveStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

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

  const initiatePreview = async () => {
    setRecordingState('asking');
    try {
      const constraints = recordingMode === 'video' 
        ? { audio: true, video: true }
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
      // Stop current stream and restart with new mode
      cleanupStream();
      const newMode = recordingMode === 'video' ? 'audio' : 'video';
      setRecordingMode(newMode);
      setRecordingState('initial');
    } else {
      // Just toggle the mode
      setRecordingMode(recordingMode === 'video' ? 'audio' : 'video');
    }
  };

  const startRecording = () => {
    setRecordingState('recording');
    setTimer(MAX_RECORDING_SECONDS);
    
    const streamToRecord = liveStreamRef.current;
    const mimeType = recordingMode === 'video' ? 'video/webm' : 'audio/webm';
    
    mediaRecorderRef.current = new MediaRecorder(streamToRecord, { mimeType });
    const chunks = [];
    
    mediaRecorderRef.current.ondataavailable = e => chunks.push(e.data);
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      setMediaBlob(blob);
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

  const handleRerecord = () => {
    cleanupStream();
    setMediaBlob(null);
    setRecordingState('initial');
  };

  const handleProceedToReview = () => {
    if (!mediaBlob) {
      alert('Please record your question first.');
      return;
    }
    
    const data = {
      title,
      text,
      files,
      mediaBlob,
      recordingMode
    };
    
    onReady(data);
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
                <span className="text-indigo-600 font-semibold block">Click to Record {recordingMode === 'video' ? 'Video' : 'Audio'}</span>
                <span className="text-gray-500 text-sm">Maximum 90 seconds</span>
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
            <p className="font-semibold text-amber-800 mb-2">Camera/microphone access denied</p>
            <p className="text-sm text-amber-700 mb-4">Please allow access in your browser settings</p>
            <button 
              onClick={initiatePreview}
              className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition"
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
            
            <div className="p-4 bg-white flex items-center justify-between gap-4">
              <button 
                onClick={handleRerecord}
                className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              
              <button
                onClick={toggleRecordingMode}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg transition"
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
                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
              >
                <div className="w-3 h-3 rounded-full bg-white"></div>
                <span>Record</span>
              </button>
            </div>
          </div>
        );

      case 'recording':
        return (
          <div className="border-2 border-red-500 rounded-xl overflow-hidden bg-red-50">
            <div className="p-6 text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-4 h-4 rounded-full bg-red-600 animate-pulse"></div>
                <span className="text-red-700 font-bold text-lg">Recording...</span>
              </div>
              <div className="text-4xl font-black text-red-600 mb-4" style={{ fontVariantNumeric: 'tabular-nums' }}>
                0:{timer < 10 ? `0${timer}` : timer}
              </div>
              <button
                onClick={stopRecording}
                className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
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
              <video 
                src={URL.createObjectURL(mediaBlob)}
                className="w-full bg-gray-900 aspect-video"
                controls
                playsInline
              />
            ) : (
              <div className="w-full bg-gray-900 aspect-video flex items-center justify-center">
                <audio 
                  src={URL.createObjectURL(mediaBlob)}
                  controls
                  className="w-full max-w-md"
                />
              </div>
            )}
            
            <div className="p-4 bg-green-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Recording complete</span>
              </div>
              <button
                onClick={handleRerecord}
                className="px-4 py-2 text-gray-700 font-semibold hover:bg-white rounded-lg transition"
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
      <div className="space-y-8">
        {/* Title */}
        <div>
          <label htmlFor="question-title" className="block text-sm font-semibold text-gray-900 mb-2">
            Question Title
          </label>
          <input
            type="text"
            id="question-title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition"
            placeholder="e.g., Review my landing page copy"
          />
        </div>

        {/* Recording */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Record Your Question (max 90s)
          </label>
          {renderRecorder()}
        </div>

        {/* Text Context */}
        <div>
          <label htmlFor="question-text" className="block text-sm font-semibold text-gray-900 mb-2">
            Additional Context <span className="text-gray-500 font-normal">(Optional)</span>
          </label>
          <textarea
            id="question-text"
            value={text}
            onChange={e => setText(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition"
            rows="4"
            maxLength="5000"
            placeholder="Add any written context, links, or details..."
          />
          <div className="text-right text-xs text-gray-500 mt-1">{text.length} / 5000</div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Attach Files <span className="text-gray-500 font-normal">(Optional, max 3)</span>
          </label>
          <input
            type="file"
            id="file-upload"
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

        {/* Submit Button */}
        <button
          onClick={handleProceedToReview}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
        >
          Continue to Review
        </button>
      </div>
    </div>
  );
}

export default QuestionComposer;