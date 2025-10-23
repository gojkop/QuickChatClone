import React, { useState } from 'react';
import TitleInput from './TitleInput';
import RecordingOptions from './RecordingOptions';
import PriceOfferInput from './PriceOfferInput';
import ExpertMessageInput from './ExpertMessageInput';
import MindPilotPanel from './MindPilotPanel';
import { TargetIcon } from '../shared/SVGIcons';
import { useRecordingSegmentUpload } from '@/hooks/useRecordingSegmentUpload';
import { useAttachmentUpload } from '@/hooks/useAttachmentUpload';
import MobileStickyFooter from '../shared/MobileStickyFooter';


function DeepDiveComposer({ expert, tierConfig, data, onUpdate, onContinue }) {
  const [title, setTitle] = useState(data.title || '');
  const [text, setText] = useState(data.text || '');
  const [proposedPrice, setProposedPrice] = useState(data.tierSpecific?.price || '');
  const [askerMessage, setAskerMessage] = useState(data.tierSpecific?.message || '');
  
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

  const handlePriceChange = (value) => {
    setProposedPrice(value);
    onUpdate({ 
      tierSpecific: { 
        ...data.tierSpecific, 
        price: value 
      } 
    });
  };

  const handleMessageChange = (value) => {
    setAskerMessage(value);
    onUpdate({ 
      tierSpecific: { 
        ...data.tierSpecific, 
        message: value 
      } 
    });
  };

  const handleContinue = () => {
    // Validate title
    if (!title.trim() || title.length < 5) {
      alert('Please enter a question title (at least 5 characters)');
      return;
    }

    // Validate price
    const priceValue = parseFloat(proposedPrice);
    if (!priceValue || priceValue <= 0) {
      alert('Please enter a valid offer amount');
      return;
    }

    const minPrice = (tierConfig?.min_price_cents || 0) / 100;
    const maxPrice = (tierConfig?.max_price_cents || 0) / 100;
    
    if (priceValue < minPrice || priceValue > maxPrice) {
      alert(`Offer must be between $${minPrice} and $${maxPrice}`);
      return;
    }

    // Check uploads
    if (segmentUpload.hasUploading || attachmentUpload.uploads.some(u => u.uploading)) {
      alert('Please wait for uploads to complete');
      return;
    }

    const questionData = {
      title,
      text,
      recordings: segmentUpload.getSuccessfulSegments(),
      attachments: attachmentUpload.uploads.filter(u => u.result).map(u => u.result),
      tierSpecific: {
        price: proposedPrice,
        message: askerMessage
      }
    };

    onUpdate(questionData);
    onContinue();
  };

  const canContinue = 
    title.trim().length >= 5 && 
    proposedPrice && 
    parseFloat(proposedPrice) > 0 &&
    !segmentUpload.hasUploading && 
    !attachmentUpload.uploads.some(u => u.uploading);

  return (
    <div className="space-y-6">
      {/* Deep Dive Badge */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <TargetIcon className="w-6 h-6 text-purple-600" />
          <h3 className="font-bold text-gray-900">Deep Dive Question</h3>
        </div>
        <p className="text-sm text-gray-700">
          Complex questions with detailed context. Expert will review your offer before accepting.
        </p>
      </div>

      {/* Title Input */}
      <TitleInput value={title} onChange={handleTitleChange} />

      {/* Recording Options (All Visible) */}
      <RecordingOptions
        segmentUpload={segmentUpload}
        attachmentUpload={attachmentUpload}
      />

      {/* Written Details (Always Visible) */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Written Details
          <span className="text-gray-500 font-normal ml-2">(Recommended for Deep Dive)</span>
        </label>
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-500 focus:outline-none transition text-base resize-none"
          rows="5"
          maxLength="5000"
          placeholder="Provide detailed context, background, specific constraints, or any other information that will help the expert give you the best answer..."
        />
        <div className="text-right text-xs text-gray-500 mt-1">{text.length} / 5000</div>
      </div>

      {/* Price Offer */}
      <PriceOfferInput
        value={proposedPrice}
        onChange={handlePriceChange}
        minPrice={tierConfig?.min_price_cents || 0}
        maxPrice={tierConfig?.max_price_cents || 0}
        currency={expert.currency || 'USD'}
      />

      {/* Message to Expert */}
      <ExpertMessageInput
        value={askerMessage}
        onChange={handleMessageChange}
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
      <div className="pt-4 border-t border-gray-200">
        <MobileStickyFooter>
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {!title.trim()
              ? 'Enter a title to continue'
              : title.length < 5
              ? 'Title too short (min 5 characters)'
              : !proposedPrice || parseFloat(proposedPrice) <= 0
              ? 'Enter your offer amount'
              : segmentUpload.hasUploading || attachmentUpload.uploads.some(u => u.uploading)
              ? 'Uploading...'
              : 'Continue to Review →'}
          </button>
        </MobileStickyFooter>
      </div>
    </div>
  );
}

export default DeepDiveComposer;