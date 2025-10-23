import React, { useState } from 'react';
import TitleInput from './TitleInput';
import RecordingOptions from './RecordingOptions';
import RecordingSegmentList from './RecordingSegmentList';
import PriceOfferInput from './PriceOfferInput';
import ExpertMessageInput from './ExpertMessageInput';
import MindPilotPanel from './MindPilotPanel';
import { useRecordingSegmentUpload } from '@/components/question-flow-v2/hooks/useRecordingSegmentUpload';
import { useAttachmentUpload } from '@/components/question-flow-v2/hooks/useAttachmentUpload';


function DeepDiveComposer({ expert, tierConfig, data, onUpdate, onContinue }) {
  const [title, setTitle] = useState(data.title || '');
  const [text, setText] = useState(data.text || '');
  const [proposedPrice, setProposedPrice] = useState(data.tierSpecific?.proposedPrice || '');
  const [askerMessage, setAskerMessage] = useState(data.tierSpecific?.askerMessage || '');
  
  const segmentUpload = useRecordingSegmentUpload();
  const attachmentUpload = useAttachmentUpload();

  // Safety check
  if (!expert) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading expert information...</p>
      </div>
    );
  }

  const handleTitleChange = (value) => {
    setTitle(value);
    onUpdate({ title: value });
  };

  const handleTextChange = (value) => {
    setText(value);
    onUpdate({ text: value });
  };

  const handlePriceChange = (value) => {
    setProposedPrice(value);
    onUpdate({ 
      tierSpecific: { 
        ...data.tierSpecific, 
        proposedPrice: value 
      } 
    });
  };

  const handleMessageChange = (value) => {
    setAskerMessage(value);
    onUpdate({ 
      tierSpecific: { 
        ...data.tierSpecific, 
        askerMessage: value 
      } 
    });
  };

  const hasRecordings = segmentUpload.segments.length > 0;

  return (
    <div className="space-y-6 pb-24 sm:pb-6">
      {/* Title Input */}
      <TitleInput value={title} onChange={handleTitleChange} />

      {/* Recording Options (WITHOUT RecordingSegmentList inside) */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Add Media & Files
          <span className="text-gray-500 font-normal ml-2">(Choose all that apply)</span>
        </label>
        <RecordingOptions
          segmentUpload={segmentUpload}
          attachmentUpload={attachmentUpload}
          showScreenRecording={true}
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

      {/* Written Details (Always Visible) */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Written Details
          <span className="text-gray-500 font-normal ml-2">(Recommended for Deep Dive)</span>
        </label>
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-500 focus:outline-none transition text-base"
          rows="5"
          maxLength="5000"
          placeholder="Provide detailed context, background, specific constraints, or any other information that will help the expert give you the best answer..."
        />
        <div className="text-right text-xs text-gray-500 mt-1">{text.length} / 5000</div>
      </div>

      {/* Price & Message - Compact Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PriceOfferInput
          value={proposedPrice}
          onChange={handlePriceChange}
          minPrice={tierConfig?.min_price_cents || 0}
          maxPrice={tierConfig?.max_price_cents || 0}
          currency={expert.currency || 'USD'}
          compact={true}
        />

        <ExpertMessageInput
          value={askerMessage}
          onChange={handleMessageChange}
          compact={true}
        />
      </div>

      {/* mindPilot Panel - with safety check */}
      {expert && expert.id && (
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
              onUpdate({ text: newText });
            }
          }}
        />
      )}

      {/* Desktop-only Continue Button */}
      <div className="hidden sm:block pt-6 border-t mt-6">
        <button
          onClick={onContinue}
          disabled={!title.trim() || title.length < 5 || !proposedPrice || parseFloat(proposedPrice) <= 0}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Review →
        </button>
      </div>
    </div>
  );
}

export default DeepDiveComposer;