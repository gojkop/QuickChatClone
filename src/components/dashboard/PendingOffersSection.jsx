// src/components/dashboard/PendingOffersSection.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '@/api';

const formatPrice = (cents, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '$';
  const amount = (cents || 0) / 100;
  return `${symbol}${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
};

const formatTimeRemaining = (expiresAt) => {
  const now = Date.now();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

function PendingOffersSection({ onOfferUpdate }) {
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingOfferId, setProcessingOfferId] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const fetchPendingOffers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/expert/pending-offers');
      console.log('🔍 Pending offers response:', response.data);
      console.log('🔍 Number of offers:', response.data.offers?.length);
      if (response.data.offers?.length > 0) {
        console.log('🔍 First offer details:', response.data.offers[0]);
      }
      setOffers(response.data.offers || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch pending offers:', err);
      setError('Failed to load pending offers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOffers();

    // Refresh every 30 seconds to update time remaining
    const interval = setInterval(fetchPendingOffers, 30000);
    return () => clearInterval(interval);
  }, []);

  // Trigger fade-in animation when offers appear
  useEffect(() => {
    if (offers.length > 0 && !isLoading) {
      // Use requestAnimationFrame to ensure DOM is ready without visible delay
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
    }
  }, [offers.length, isLoading]);

  const handleAccept = async (offerId) => {
    if (!window.confirm('Accept this Deep Dive offer? The SLA timer will start immediately.')) {
      return;
    }

    try {
      setProcessingOfferId(offerId);
      const response = await apiClient.post(`/offers/${offerId}/accept`);

      // Remove from pending offers list
      setOffers(prev => prev.filter(offer => offer.question_id !== offerId));

      // Notify parent component to refresh questions
      if (onOfferUpdate) {
        onOfferUpdate();
      }

      // Show success message
      alert('✓ Offer accepted! The question has been moved to your queue.');

    } catch (err) {
      console.error('Failed to accept offer:', err);
      alert('Failed to accept offer: ' + (err.response?.data?.error || err.message));
    } finally {
      setProcessingOfferId(null);
    }
  };

  const handleDecline = async (offerId) => {
    const reason = window.prompt('Why are you declining this offer? (Optional)');

    // User cancelled the prompt
    if (reason === null) {
      return;
    }

    try {
      setProcessingOfferId(offerId);
      console.log('🔍 Declining offer:', offerId);
      const response = await apiClient.post(`/offers/${offerId}/decline`, {
        decline_reason: reason || 'Expert declined'
      });
      console.log('🔍 Decline response:', response.data);

      // Remove from pending offers list
      setOffers(prev => prev.filter(offer => offer.question_id !== offerId));

      // Notify parent component
      if (onOfferUpdate) {
        onOfferUpdate();
      }

      alert('✓ Offer declined. Payment has been refunded to the asker.');

    } catch (err) {
      console.error('Failed to decline offer:', err);
      console.error('🔍 Error response:', err.response);
      console.error('🔍 Error data:', err.response?.data);
      console.error('🔍 Error status:', err.response?.status);
      alert('Failed to decline offer: ' + (err.response?.data?.message || err.response?.data?.error || err.message));
    } finally {
      setProcessingOfferId(null);
    }
  };

  // Hide during initial load - only show if we already have offers
  if (isLoading && offers.length === 0) {
    return null;
  }

  // Don't show error state if there are no offers - fail silently
  if (error && offers.length === 0) {
    return null;
  }

  // Don't render anything if there are no offers
  if (offers.length === 0) {
    return null;
  }

  // Don't render until animation is ready (prevents flash/blink)
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 transition-all duration-500 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
            <span className="text-white text-xl">🎯</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Pending Deep Dive Offers</h2>
            <p className="text-sm text-gray-500">{offers.length} offer{offers.length !== 1 ? 's' : ''} waiting for review</p>
          </div>
        </div>
        <button
          onClick={fetchPendingOffers}
          className="text-sm text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
          title="Refresh offers"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {offers.map((offer) => (
          <div
            key={offer.question_id}
            className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200 p-5 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-base mb-1">{offer.title}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="font-semibold text-purple-700">
                    Offered: {formatPrice(offer.proposed_price_cents)}
                  </span>
                  <span>•</span>
                  <span className={`font-medium ${
                    formatTimeRemaining(offer.offer_expires_at) === 'Expired'
                      ? 'text-red-600'
                      : 'text-orange-600'
                  }`}>
                    Expires in {formatTimeRemaining(offer.offer_expires_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Asker Message */}
            {offer.asker_message && (
              <div className="bg-white/80 rounded-lg p-3 mb-3 border border-purple-100">
                <p className="text-xs font-semibold text-gray-500 mb-1">Message from asker:</p>
                <p className="text-sm text-gray-700 italic">"{offer.asker_message}"</p>
              </div>
            )}

            {/* Question Preview */}
            {offer.text && (
              <div className="bg-white/60 rounded-lg p-3 mb-3 border border-purple-100">
                <p className="text-xs font-semibold text-gray-500 mb-1">Question:</p>
                <p className="text-sm text-gray-700 line-clamp-2">{offer.text}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleAccept(offer.question_id)}
                disabled={processingOfferId === offer.question_id}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processingOfferId === offer.question_id ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Accept Offer
                  </>
                )}
              </button>
              <button
                onClick={() => handleDecline(offer.question_id)}
                disabled={processingOfferId === offer.question_id}
                className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PendingOffersSection;
