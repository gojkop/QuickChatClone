import React, { useState, useEffect } from 'react';
import TitleInput from './TitleInput';
import RecordingOptions from './RecordingOptions';
import RecordingSegmentList from './RecordingSegmentList';
import AdvancedOptions from './AdvancedOptions';
import MindPilotPanel from './MindPilotPanel';
import { useRecordingSegmentUpload } from '@/components/question-flow-v2/hooks/useRecordingSegmentUpload';
import { useAttachmentUpload } from '@/components/question-flow-v2/hooks/useAttachmentUpload';


function QuickConsultComposer({ expert, tierConfig, data, onUpdate, onContinue }) {
  console.log('🎨 QuickConsultComposer rendered with data:', data);
  
  const [title, setTitle] = useState(data?.title || '');
  const [text, setText] = useState(data?.text || '');
  
  const segmentUpload = useRecordingSegmentUpload();
  const attachmentUpload = useAttachmentUpload();

  // ✅ NEW: Monitor when data prop changes
  useEffect(() => {
    console.log('📥 QuickConsultComposer - data prop changed:', data);
    if (data?.title !== undefined && data.title !== title) {
      console.log('🔄 Syncing title from prop:', data.title);
      setTitle(data.title);
    }
  }, [data]);

  // Safety check
  if (!expert) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading expert information...</p>
      </div>
    );
  }

  const handleTitleChange = (value) => {
    console.log('✏️ Title changed to:', value);
    setTitle(value);
    if (onUpdate) {
      console.log('📤 Calling onUpdate with title:', value);
      onUpdate({ title: value });
    } else {
      console.error('❌ onUpdate is not defined!');
    }
  };

  const handleTextChange = (value) => {
    setText(value);
    if (onUpdate) onUpdate({ text: value });
  };

  const hasRecordings = segmentUpload.segments.length > 0;

  console.log('🔍 QuickConsultComposer render state:', {
    localTitle: title,
    dataTitle: data?.title,
    onUpdateExists: !!onUpdate
  });

  return (
    <div className="space-y-6 pb-24 sm:pb-6">
      {/* Title Input */}
      <TitleInput value={title} onChange={handleTitleChange} />

      {/* Recording Options - WITHOUT Screen Recording and WITHOUT Attach Files */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Record Your Question
        </label>
        <RecordingOptions
          segmentUpload={segmentUpload}
          attachmentUpload={attachmentUpload}
          showScreenRecording={false}
          showAttachFiles={false}
          showRecordingList={false}
        />
      </div>

      {/* Recording Segment List - SEPARATE */}
      {hasRecordings && (
        <RecordingSegmentList
          segments={segmentUpload.segments}
          onRemove={segmentUpload.removeSegment}
          onRetry={segmentUpload.retrySegment}
          onReorder={segmentUpload.reorderSegments}
        />
      )}

      {/* Advanced Options (Includes Screen Recording AND Attach Files) */}
      <AdvancedOptions
        text={text}
        onTextChange={handleTextChange}
        attachmentUpload={attachmentUpload}
        segmentUpload={segmentUpload}
      />

      {/* mindPilot Panel - with safety check */}
      {expert && expert.id && title && title.length >= 5 && (
        <MindPilotPanel
          questionTitle={title}
          questionText={text}
          expertId={expert.id}
          expertProfile={{
            name: expert.name || expert.user?.name || expert.handle || 'Expert',
            specialty: expert.specialty || '',
            price: expert.price_cents || 0
          }}
          onApplySuggestions={(suggestions) => {
            if (suggestions && suggestions.additionalContext) {
              const newText = (text + suggestions.additionalContext).trim();
              setText(newText);
              if (onUpdate) onUpdate({ text: newText });
            }
          }}
        />
      )}

      {/* Desktop-only Continue Button */}
      <div className="hidden sm:block pt-6 border-t mt-6">
        <button
          onClick={onContinue}
          disabled={!title.trim() || title.length < 5}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Review →
        </button>
      </div>
    </div>
  );
}

export default QuickConsultComposer;