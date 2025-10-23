import React, { useState } from 'react';
import TitleInput from './TitleInput';
import RecordingOptions from './RecordingOptions';
import AdvancedOptions from './AdvancedOptions';
import MindPilotPanel from './MindPilotPanel';
import RecordingSegmentList from './RecordingSegmentList';
import { useRecordingSegmentUpload } from '@/hooks/useRecordingSegmentUpload';
import { useAttachmentUpload } from '@/hooks/useAttachmentUpload';
import MobileStickyFooter from '../shared/MobileStickyFooter';


function QuickConsultComposer({ expert, tierConfig, data, onUpdate, onContinue }) {
  const [title, setTitle] = useState(data.title || '');
  const [recordings, setRecordings] = useState(data.recordings || []);
  const [text, setText] = useState(data.text || '');
  
  const segmentUpload = useRecordingSegmentUpload();
  const attachmentUpload = useAttachmentUpload();

  const MAX_RECORDING_DURATION = 90; // seconds
  const totalDuration = segmentUpload.segments.reduce((sum, seg) => sum + (seg.duration || 0), 0);
  const remainingTime = MAX_RECORDING_DURATION - totalDuration;
  const canRecordMore = remainingTime > 5; // Need at least 5 seconds

  const handleTitleChange = (value) => {
    setTitle(value);
    onUpdate({ title: value });
  };

  const handleRecordingComplete = (recordingData) => {
    const newRecordings = [...recordings, recordingData];
    setRecordings(newRecordings);
    onUpdate({ recordings: newRecordings });
  };

  const handleTextChange = (value) => {
    setText(value);
    onUpdate({ text: value });
  };

  const handleContinue = () => {
    if (!title.trim() || title.length < 5) {
      alert('Please enter a question title (at least 5 characters)');
      return;
    }

    const questionData = {
      title,
      recordings: segmentUpload.getSuccessfulSegments(),
      attachments: attachmentUpload.uploads.filter(u => u.result).map(u => u.result),
      text
    };

    onUpdate(questionData);
    onContinue();
  };

  const hasRecordings = segmentUpload.segments.length > 0;
  const hasAttachments = attachmentUpload.uploads.length > 0;
  const canContinue = title.trim().length >= 5 && !segmentUpload.hasUploading && !attachmentUpload.uploads.some(u => u.uploading);

  return (
    <div className="space-y-6">
      {/* Title Input */}
      <TitleInput value={title} onChange={handleTitleChange} />

      {/* Recording Segments List */}
      {hasRecordings && (
        <RecordingSegmentList
          segments={segmentUpload.segments}
          onRemoveSegment={segmentUpload.removeSegment}
          onReorderSegments={segmentUpload.reorderSegments}
          maxDuration={MAX_RECORDING_DURATION}
        />
      )}

      {/* Unified Recording Options (same as Deep Dive) */}
      <RecordingOptions
        segmentUpload={segmentUpload}
        attachmentUpload={attachmentUpload}
        canRecordMore={canRecordMore}
        remainingTime={remainingTime}
      />

      {/* Advanced Options (Collapsed) */}
      <AdvancedOptions
        text={text}
        onTextChange={handleTextChange}
        attachmentUpload={attachmentUpload}
        segmentUpload={segmentUpload}
        onRecordingComplete={handleRecordingComplete}
      />

      {/* mindPilot Panel */}
      <MindPilotPanel
        questionTitle={title}
        questionText={text}
        expertId={expert.id}
        expertProfile={{
          name: expert.name || expert.user?.name,
          specialty: expert.specialty,
          price: expert.price_cents
        }}
        onApplySuggestions={(suggestions) => {
          if (suggestions.additionalContext) {
            const newText = (text + '\n\n' + suggestions.additionalContext).trim();
            setText(newText);
            onUpdate({ text: newText });
          }
        }}
      />

      {/* Continue Button */}
      <div className="pt-4 border-t border-gray-200">
        <MobileStickyFooter>
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {!title.trim()
              ? 'Enter a title to continue'
              : title.length < 5
              ? 'Title too short (min 5 characters)'
              : segmentUpload.hasUploading || attachmentUpload.uploads.some(u => u.uploading)
              ? 'Uploading...'
              : 'Continue to Review →'}
          </button>
        </MobileStickyFooter>
      </div>
    </div>
  );
}

export default QuickConsultComposer;