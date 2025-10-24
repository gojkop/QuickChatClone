import React, { useState, useEffect } from 'react';
import TitleInput from './TitleInput';
import RecordingOptions from './RecordingOptions';
import RecordingSegmentList from '../shared/RecordingSegmentList';
import AdvancedOptions from './AdvancedOptions';
import MindPilotPanel from './MindPilotPanel';
import { useRecordingSegmentUpload } from '@/components/question-flow-v2/hooks/useRecordingSegmentUpload';
import { useAttachmentUpload } from '@/components/question-flow-v2/hooks/useAttachmentUpload';

function QuickConsultComposer({ data, onUpdate, onContinue }) {
  const [localTitle, setLocalTitle] = useState(data?.title || '');
  const [text, setText] = useState(data?.text || '');
  
  const segmentUpload = useRecordingSegmentUpload();
  const attachmentUpload = useAttachmentUpload();

  console.log('🎨 QuickConsultComposer rendered with data:', data);
  console.log('🔍 QuickConsultComposer render state:', {
    localTitle,
    dataTitle: data?.title,
    onUpdateExists: !!onUpdate
  });

  // Sync local title with data prop when it changes
  useEffect(() => {
    console.log('📥 QuickConsultComposer - data prop changed:', data);
    if (data?.title !== undefined && data.title !== localTitle) {
      setLocalTitle(data.title);
    }
    if (data?.text !== undefined && data.text !== text) {
      setText(data.text);
    }
  }, [data]);

  // ✅ NEW: Update parent state whenever recordings change
  useEffect(() => {
    const successfulRecordings = segmentUpload.getSuccessfulSegments();
    console.log('📹 Recordings changed:', successfulRecordings.length, 'segments');
    
    if (onUpdate) {
      onUpdate({
        title: localTitle,
        recordings: successfulRecordings,
        attachments: attachmentUpload.uploads.filter(u => u.result).map(u => u.result),
        text
      });
    }
  }, [segmentUpload.segments]); // Watch segments array for changes

  // ✅ NEW: Update parent state whenever attachments change
  useEffect(() => {
    const successfulAttachments = attachmentUpload.uploads.filter(u => u.result).map(u => u.result);
    console.log('📎 Attachments changed:', successfulAttachments.length, 'files');
    
    if (onUpdate) {
      onUpdate({
        title: localTitle,
        recordings: segmentUpload.getSuccessfulSegments(),
        attachments: successfulAttachments,
        text
      });
    }
  }, [attachmentUpload.uploads]); // Watch uploads array for changes

  const handleTitleChange = (newTitle) => {
    console.log('✏️ Title changed to:', newTitle);
    setLocalTitle(newTitle);
    
    if (onUpdate) {
      console.log('📤 Calling onUpdate with title:', newTitle);
      onUpdate({
        title: newTitle,
        recordings: segmentUpload.getSuccessfulSegments(),
        attachments: attachmentUpload.uploads.filter(u => u.result).map(u => u.result),
        text
      });
    }
  };

  const handleTextChange = (newText) => {
    setText(newText);
    if (onUpdate) {
      onUpdate({
        title: localTitle,
        recordings: segmentUpload.getSuccessfulSegments(),
        attachments: attachmentUpload.uploads.filter(u => u.result).map(u => u.result),
        text: newText
      });
    }
  };

  const handleContinue = () => {
    // Validation
    if (!localTitle.trim() || localTitle.trim().length < 5) {
      alert('Please enter a title (at least 5 characters)');
      return;
    }

    if (segmentUpload.hasUploading || attachmentUpload.uploads.some(u => u.uploading)) {
      alert('Please wait for uploads to complete');
      return;
    }

    const questionData = {
      title: localTitle,
      recordings: segmentUpload.getSuccessfulSegments(),
      attachments: attachmentUpload.uploads.filter(u => u.result).map(u => u.result),
      text
    };

    console.log('📤 Quick Consult - Continue with data:', questionData);
    
    onUpdate(questionData);
    onContinue();
  };

  const hasRecordings = segmentUpload.segments.length > 0;
  const canContinue = localTitle.trim().length >= 5 && !segmentUpload.hasUploading && !attachmentUpload.uploads.some(u => u.uploading);

  return (
    <div className="space-y-6">
      {/* Title Input */}
      <TitleInput 
        value={localTitle} 
        onChange={handleTitleChange}
      />

      {/* Recording Options - Video & Audio */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Record Your Question</h3>
        <RecordingOptions
          segmentUpload={segmentUpload}
          modes={['video', 'audio']}
          showRecordingList={false}
        />
      </div>

      {/* Recording Segment List */}
      {hasRecordings && (
        <RecordingSegmentList
          segmentUpload={segmentUpload}
        />
      )}

      {/* Advanced Options - Screen Recording & Attachments */}
      <AdvancedOptions
        segmentUpload={segmentUpload}
        attachmentUpload={attachmentUpload}
        text={text}
        onTextChange={handleTextChange}
      />

      {/* MindPilot Panel */}
      <MindPilotPanel
        title={localTitle}
        text={text}
        onSuggestionApply={(suggestion) => {
          if (suggestion.title) handleTitleChange(suggestion.title);
          if (suggestion.text) handleTextChange(suggestion.text);
        }}
      />

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        disabled={!canContinue}
        className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
          canContinue
            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {segmentUpload.hasUploading || attachmentUpload.uploads.some(u => u.uploading)
          ? 'Uploading...'
          : 'Continue to Review'}
      </button>
    </div>
  );
}

export default QuickConsultComposer;