import React, { useState } from 'react';
import TitleInput from './TitleInput';
import QuickRecordButton from './QuickRecordButton';
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

      {/* Quick Record Buttons */}
      {canRecordMore && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            {hasRecordings ? 'Record Another Segment' : 'Record Your Question'}
          </label>
          {!canRecordMore && remainingTime > 0 && (
            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                Only {remainingTime} seconds remaining. Need at least 5 seconds to record.
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <QuickRecordButton
              type="video"
              onComplete={handleRecordingComplete}
              segmentUpload={segmentUpload}
              disabled={!canRecordMore}
            />
            <QuickRecordButton
              type="audio"
              onComplete={handleRecordingComplete}
              segmentUpload={segmentUpload}
              disabled={!canRecordMore}
            />
          </div>
        </div>
      )}

      {/* Limit Reached Message */}
      {!canRecordMore && remainingTime <= 0 && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Recording Limit Reached</h4>
              <p className="text-sm text-red-700">
                You've used all 90 seconds of recording time. You can delete a segment to record more.
              </p>
            </div>
          </div>
        </div>
      )}

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