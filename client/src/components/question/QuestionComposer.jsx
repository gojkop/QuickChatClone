import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';

const MAX_RECORDING_SECONDS = 90;

const QuestionComposer = forwardRef(({ children }, ref) => {
  // Form state
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);

  // Recording state
  const [recordingState, setRecordingState] = useState('initial'); // initial, asking, denied, preview, recording, review
  const [recordingMode, setRecordingMode] = useState('video'); // 'video' or 'audio'
  const [mediaBlob, setMediaBlob] = useState(null);
  const [timer, setTimer] = useState(MAX_RECORDING_SECONDS);

  // Refs for direct DOM/API access without re-rendering
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const liveStreamRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Expose a function to the parent component to get all the data
  useImperativeHandle(ref, () => ({
    getQuestionData: () => ({
      title,
      text,
      attachedFiles: files,
      mediaBlob,
    }),
  }));

  // Cleanup effect: ensure camera/mic are turned off when the component unmounts
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
      alert('You can upload a maximum of 3 files.');
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      liveStreamRef.current = stream;
      setRecordingState('preview');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Permission Error:", error);
      setRecordingState('denied');
    }
  };

  const startRecording = () => {
    setRecordingState('recording');
    setTimer(MAX_RECORDING_SECONDS);
    const streamToRecord = recordingMode === 'video' ? liveStreamRef.current : new MediaStream(liveStreamRef.current.getAudioTracks());
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
    clearInterval(timerIntervalRef.current);
  };

  const handleRerecord = () => {
    cleanupStream();
    setMediaBlob(null);
    setRecordingState('initial');
  };

  // Renders the correct UI for the recorder based on its state
  const renderRecorder = () => {
    switch (recordingState) {
      case 'initial':
        return <button onClick={initiatePreview} className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition"><span className="text-indigo-600 font-semibold">Click to Record Audio/Video</span></button>;
      case 'asking':
        return <div className="text-center p-8 border-2 border-dashed rounded-lg">Asking for permissions...</div>;
      case 'denied':
        return <div className="text-center p-8 border-2 border-dashed border-amber-400 rounded-lg bg-amber-50"><p className="font-semibold text-amber-800">Camera/mic access blocked.</p><button onClick={initiatePreview} className="mt-4 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg">Try Again</button></div>;
      case 'preview':
        return (
          <div className="w-full p-4 border border-gray-300 rounded-lg">
            <video ref={videoRef} className="w-full rounded-md bg-gray-900 mb-4" autoPlay muted playsInline></video>
            <div className="flex items-center justify-between">
              <button onClick={handleRerecord} className="text-gray-500 font-semibold px-4 py-2">Cancel</button>
              <button onClick={startRecording} className="w-14 h-14 flex items-center justify-center rounded-full bg-red-600 text-white" title="Start Recording">REC</button>
              {/* Toggle Audio/Video button can be added here */}
            </div>
          </div>
        );
      case 'recording':
        return (
          <div className="w-full p-4 border-2 border-red-500 bg-red-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-red-700">Recording...</span>
              <span className="font-mono text-red-700">0:{timer < 10 ? `0${timer}` : timer}</span>
              <button onClick={stopRecording} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg">Stop</button>
            </div>
          </div>
        );
      case 'review':
        return (
          <div className="w-full p-4 border border-gray-300 bg-gray-50 rounded-lg">
            <video src={URL.createObjectURL(mediaBlob)} className="w-full rounded-md bg-gray-900 mb-4" controls playsInline></video>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800">Recording Complete</span>
              <button onClick={handleRerecord} className="text-gray-500 font-semibold">Re-record</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <div className="space-y-8">
        <div>
          <label htmlFor="question-title" className="block text-lg font-semibold text-gray-900">1. Question Title</label>
          <input type="text" id="question-title" value={title} onChange={e => setTitle(e.target.value)} className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:outline-none" placeholder="e.g., S3 Bucket Policy Review" />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-900">2. Record your Question (max 90s)</label>
          <div className="mt-2">
            {renderRecorder()}
          </div>
        </div>

        <div>
          <label htmlFor="question-text" className="block text-lg font-semibold text-gray-900">3. Add Written Context (Optional)</label>
          <textarea id="question-text" value={text} onChange={e => setText(e.target.value)} className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:outline-none" rows="4" maxLength="5000" placeholder="e.g., Here's the link to my landing page..."></textarea>
          <p className="text-right text-xs text-gray-500 mt-1">{text.length} / 5000 characters</p>
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-900">4. Attach Files (Optional)</label>
          <input type="file" id="file-upload" className="mt-2" multiple onChange={handleFileChange} />
          <ul className="mt-2 text-sm text-gray-600 space-y-1">
            {files.length > 0 ? files.map((file, index) => (
              <li key={index} className="flex items-center justify-between">
                <span>{file.name}</span>
                <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 font-semibold ml-2">Remove</button>
              </li>
            )) : <li className="text-gray-400">No files attached.</li>}
          </ul>
        </div>
        
        <div className="border-t pt-8">
          {children}
        </div>
      </div>
    </div>
  );
});

export default QuestionComposer;