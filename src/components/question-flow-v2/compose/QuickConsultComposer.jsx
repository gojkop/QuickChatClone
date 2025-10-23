import React, { useState } from 'react';
import TitleInput from './TitleInput';
import RecordingOptions from './RecordingOptions';
import AdvancedOptions from './AdvancedOptions';
import MindPilotPanel from './MindPilotPanel';
import { useRecordingSegmentUpload } from '@/hooks/useRecordingSegmentUpload';
import { useAttachmentUpload } from '@/hooks/useAttachmentUpload';
import MobileStickyFooter from '../shared/MobileStickyFooter';


function QuickConsultComposer({ expert, tierConfig, data, onUpdate, onContinue }) {
  const [title, setTitle] = useState(data.title || '');
  const [text, setText] = useState(data.text || '');
  
  const segmentUpload = useRecordingSegmentUpload();
  const attachmentUpload = useAttachmentUpload();

  const handleTitleChange = (value) => {
    setTitle(value);
    onUpdate({ title: value });
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

  const canContinue = title.trim().length >= 5 && !segmentUpload.hasUploading && !attachmentUpload.uploads.some(u => u.uploading);

  return (
    <div className="space-y-6">
      {/* Title Input */}
      <TitleInput value={title} onChange={handleTitleChange} />

      {/* Recording Options - WITHOUT Screen Recording */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Record Your Question
        </label>
        <RecordingOptions
          segmentUpload={segmentUpload}
          attachmentUpload={attachmentUpload}
          showScreenRecording={false}
        />
      </div>

      {/* Advanced Options (Includes Screen Recording AND Attach Files) */}
      <AdvancedOptions
        text={text}
        onTextChange={handleTextChange}
        attachmentUpload={attachmentUpload}
        segmentUpload={segmentUpload}
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