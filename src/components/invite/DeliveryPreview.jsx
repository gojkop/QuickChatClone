import React, { useState } from 'react';

function DeliveryPreview({ expertInfo, priceProposal }) {
  const [copied, setCopied] = useState(false);

  const generateInviteLink = () => {
    return `${window.location.origin}/signup?ref=invite`;
  };

  const generateMessage = () => {
    const link = generateInviteLink();
    const priceText = priceProposal.type === 'expert-decides' 
      ? 'You can set your own price for answering.'
      : `I'm proposing €${priceProposal.amount} for your answer.`;
    
    return `Hi! I have a question for you about your expertise. I'd love to get your insights.

${priceText}

I've sent the question through mindPick, a platform where experts can monetize their knowledge by answering questions asynchronously. 

Join and see my question here: ${link}

Thanks for considering!`;
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generateMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDeliveryIcon = () => {
    switch (expertInfo.type) {
      case 'email':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        );
      case 'name':
      case 'handle':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getDeliveryMethod = () => {
    switch (expertInfo.type) {
      case 'email':
        return {
          title: 'Email Delivery',
          description: 'We\'ll send your question via email with an invitation to answer on mindPick',
          action: 'automatic'
        };
      case 'linkedin':
        return {
          title: 'LinkedIn Message',
          description: 'Copy this message and send it to them on LinkedIn',
          action: 'copy'
        };
      case 'name':
      case 'handle':
        return {
          title: 'Manual Delivery',
          description: 'Copy this message and share it with them however you prefer (DM, text, etc.)',
          action: 'copy'
        };
      default:
        return {
          title: 'Manual Delivery',
          description: 'Copy this message and share it with them however you prefer',
          action: 'copy'
        };
    }
  };

  const delivery = getDeliveryMethod();

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl p-5">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-indigo-600 flex-shrink-0">
          {getDeliveryIcon()}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">{delivery.title}</h3>
          <p className="text-sm text-gray-700">{delivery.description}</p>
        </div>
      </div>

      {delivery.action === 'copy' && (
        <div className="mt-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Your Message
              </span>
              <button
                onClick={handleCopyMessage}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {generateMessage()}
            </p>
          </div>
        </div>
      )}

      {delivery.action === 'automatic' && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-gray-700 font-medium">
            Question will be sent to: <span className="font-bold text-gray-900">{expertInfo.identifier}</span>
          </span>
        </div>
      )}
    </div>
  );
}

export default DeliveryPreview;