import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

const MAX_RECORDING_SECONDS = 90;

const QuestionComposer = forwardRef(({ onReady, hideButton = false }, ref) => {
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

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getQuestionData: () => ({
      title,
      text,
      files,
      mediaBlob,
      recordingMode
    }),
    validateAndGetData: () => {
      if (!title.trim()) {
        alert('Please enter a question title.');
        return null;
      }
      return {
        title,
        text,
        files,
        mediaBlob,
        recordingMode
      };
    }
  }));

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
    
    // Keep video element connected during recording for video mode
    if (recordingMode === 'video' && videoRef.current) {
      videoRef.current.srcObject = streamToRecord;
    }
    
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
    // Only title is mandatory
    if (!title.trim()) {
      alert('Please enter a question title.');
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