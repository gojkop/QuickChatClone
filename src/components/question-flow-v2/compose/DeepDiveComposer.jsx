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
  const [title, setTitle] = useState(data?.title || '');
  const [text, setText] = useState(data?.text || '');
  const [proposedPrice, setProposedPrice] = useState(data?.tierSpecific?.proposedPrice || '');
  const [askerMessage, setAskerMessage] = useState(data?.tierSpecific?.askerMessage || '');
  
  const segmentUpload = useRecordingSegmentUpload();
  const attachmentUpload = useAttachmentUpload();

  // ✅ COMPREHENSIVE SAFETY CHECK
  if (!expert || !tierConfig) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-500">Loading expert information...</p>
      </div>
    );
  }

  // ✅ Create completely safe expert object
  const safeExpert = {
    id: expert.id || expert._id || null,
    name: expert.name || expert.user?.name || expert.handle || 'Expert',
    handle: expert.handle || '',
    currency: expert.currency || 'USD',
    price_cents: expert.price_cents || 0,
    sla_hours: expert.sla_hours || 48,
    specialty: expert.specialty || '',
    user: expert.user || { name: expert.name || expert.handle || 'Expert' }
  };

  const handleTitleChange = (value) => {
    setTitle(value);
    if (onUpdate) onUpdate({ title: value });
  };

  const handleTextChange = (value) => {
    setText(value);
    if (onUpdate) onUpdate({ text: value });
  };

  const handlePriceChange = (value) => {
    setProposedPrice(value);
    if (onUpdate) {
      onUpdate({ 
        tierSpecific: { 
          ...data?.tierSpecific, 
          proposedPrice: value 
        } 
      });
    }
  };

  const handleMessageChange = (value) => {
    setAskerMessage(value);
    if (onUpdate) {
      onUpdate({ 
        tierSpecific: { 
          ...data?.tierSpecific, 
          askerMessage: value 
        } 
      });
    }
  };

  const hasRecordings = segmentUpload.segments && segmentUpload.segments.length > 0;

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
          currency={safeExpert.currency}
          compact={true}
        />

        <ExpertMessageInput
          value={askerMessage}
          onChange={handleMessageChange}
          compact={true}
        />
      </div>

      {/* mindPilot Panel - with maximum safety */}
      {safeExpert.id && title && title.length >= 5 && (
        <MindPilotPanel
          questionTitle={title}
          questionText={text}
          expertId={safeExpert.id}
          expertProfile={{
            name: safeExpert.name,
            specialty: safeExpert.specialty,
            price: safeExpert.price_cents
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