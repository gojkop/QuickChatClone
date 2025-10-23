import React, { useState } from 'react';
import TitleInput from './TitleInput';
import QuickRecordButton from './QuickRecordButton';
import AdvancedOptions from './AdvancedOptions';
import MindPilotPanel from './MindPilotPanel';
import { useRecordingSegmentUpload } from '@/hooks/useRecordingSegmentUpload';
import { useAttachmentUpload } from '@/hooks/useAttachmentUpload';
import MobileStickyFooter from '../shared/MobileStickyFooter';
import RecordingSegmentList from './RecordingSegmentList';


function QuickConsultComposer({ expert, tierConfig, data, onUpdate, onContinue }) {
  const [title, setTitle] = useState(data.title || '');
  const [recordings, setRecordings] = useState(data.recordings || []);
  const [text, setText] = useState(data.text || '');
  
  const segmentUpload = useRecordingSegmentUpload();
  const attachmentUpload = useAttachmentUpload();

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

      {/* Quick Record Buttons - Only Video and Audio */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Record Your Question
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <QuickRecordButton
            type="video"
            onComplete={handleRecordingComplete}
            segmentUpload={segmentUpload}
          />
          <QuickRecordButton
            type="audio"
            onComplete={handleRecordingComplete}
            segmentUpload={segmentUpload}
          />
        </div>

        {/* Recording Segment List with Play buttons */}
        {hasRecordings && (
          <RecordingSegmentList
            segments={segmentUpload.segments}
            onRemove={segmentUpload.removeSegment}
            onRetry={segmentUpload.retrySegment}
          />
        )}
      </div>

      {/* Advanced Options (Includes Screen Recording) */}
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
            const newText = (text + suggestions.additionalContext).trim();
            setText(newText);
            onUpdate({ text: newText });
          }
        }}
      />

      {/* Continue Button */}
      <div className="pt-4 border-t">
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