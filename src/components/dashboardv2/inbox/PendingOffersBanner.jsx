import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Clock, DollarSign, User, Mail, MessageSquare, Eye, Check, X, Loader, RefreshCw } from 'lucide-react';
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

const getTimeRemainingColor = (expiresAt, createdAt) => {
  const now = Date.now();
  const expiry = new Date(expiresAt).getTime();
  const created = createdAt ? new Date(createdAt).getTime() : expiry - (24 * 60 * 60 * 1000);

  const totalDuration = expiry - created;
  const remaining = expiry - now;

  if (remaining <= 0) {
    return 'text-red-600';
  }

  const percentRemaining = (remaining / totalDuration) * 100;

  if (percentRemaining < 20) {
    return 'text-red-600';
  }

  return 'text-orange-600';
};

function PendingOffersBanner({ onOfferUpdate, onViewDetails }) {
  const [offers, setOffers] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState('');
  const [processingOfferId, setProcessingOfferId] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const fetchPendingOffers = async () => {
    try {
      const response = await apiClient.get('/expert/pending-offers');
      setOffers(response.data.offers || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch pending offers:', err);
      setError('Failed to load pending offers');
    } finally {
      setIsInitialLoad(false);
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
    if (offers.length > 0 && !isInitialLoad) {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else if (offers.length === 0 && !isInitialLoad) {
      setIsVisible(false);
    }
  }, [offers.length, isInitialLoad]);

  const handleAccept = async (offerId) => {
    if (!window.confirm('Accept this Deep Dive offer? The SLA timer will start immediately.')) {
      return;
    }

    try {
      setProcessingOfferId(offerId);

      const token = localStorage.getItem('qc_token');

      const response = await fetch('/api/offers-accept', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: offerId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept offer');
      }

      const result = await response.json();
      console.log('✅ Offer accepted, payment captured:', result);

      setOffers(prev => prev.filter(offer => offer.question_id !== offerId));

      if (onOfferUpdate) {
        onOfferUpdate();
      }

      alert('✓ Offer accepted! Payment captured and question moved to your queue.');

    } catch (err) {
      console.error('Failed to accept offer:', err);
      alert('Failed to accept offer: ' + err.message);
    } finally {
      setProcessingOfferId(null);
    }
  };

  const handleDecline = async (offerId) => {
    const reason = window.prompt('Why are you declining this offer? (Optional)');

    if (reason === null) {
      return;
    }

    try {
      setProcessingOfferId(offerId);

      const token = localStorage.getItem('qc_token');

      const response = await fetch('/api/offers-decline', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: offerId,
          decline_reason: reason || 'Expert declined'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to decline offer');
      }

      const result = await response.json();
      console.log('🔍 Decline response:', result);

      setOffers(prev => prev.filter(offer => offer.question_id !== offerId));

      if (onOfferUpdate) {
        onOfferUpdate();
      }

      alert('✓ Offer declined. Payment authorization has been canceled.');

    } catch (err) {
      console.error('Failed to decline offer:', err);
      alert('Failed to decline offer: ' + err.message);
    } finally {
      setProcessingOfferId(null);
    }
  };

  // Hide during initial load
  if (isInitialLoad && offers.length === 0) {
    return null;
  }

  // Don't show error state if there are no offers
  if (error && offers.length === 0) {
    return null;
  }

  // Don't render if no offers
  if (offers.length === 0 && !isInitialLoad) {
    return null;
  }

  // Don't render until animation is ready
  if (!isVisible && isInitialLoad) {
    return null;
  }

  return (
    <div
      className={`
        bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50
        border-b-2 border-purple-200
        transition-all duration-500 ease-in-out
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      {/* Banner Header */}
      <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-purple-100/50 to-indigo-100/50 border-b border-purple-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 shadow-sm">
            <span className="text-white text-lg">🎯</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Pending Deep Dive Offers
            </h3>
            <p className="text-xs text-gray-600">
              {offers.length} offer{offers.length !== 1 ? 's' : ''} waiting for review
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPendingOffers}
            className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-100 transition-colors"
            title="Refresh offers"
          >
            <RefreshCw size={16} />
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-gray-600 hover:bg-white/50 transition-colors"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {/* Offer Cards */}
      {!isCollapsed && (
        <div className="px-4 py-3 space-y-3">
          {offers.map((offer) => (
            <div
              key={offer.question_id}
              className="bg-white rounded-lg border-2 border-purple-200 hover:border-purple-300 hover:shadow-md transition-all overflow-hidden"
            >
              {/* Card Header - Clickable */}
              <div
                onClick={() => onViewDetails && onViewDetails(offer.question_id)}
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {/* Top Row: Price, Badge, Time */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-sm">
                      <DollarSign size={14} />
                      <span className="text-sm font-bold">
                        {formatPrice(offer.proposed_price_cents)}
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">
                      Deep Dive
                    </span>
                    <span className="text-xs text-gray-500">
                      Q-{offer.question_id}
                    </span>
                  </div>

                  <div className={`flex items-center gap-1 text-xs font-semibold ${getTimeRemainingColor(offer.offer_expires_at, offer.created_at)}`}>
                    <Clock size={14} />
                    <span>{formatTimeRemaining(offer.offer_expires_at)}</span>
                  </div>
                </div>

                {/* Question Title */}
                <h4 className="font-bold text-base text-gray-900 mb-2 line-clamp-2">
                  {offer.title}
                </h4>

                {/* Asker Info */}
                <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <User size={12} />
                    <span>{offer.payer_name || 'Anonymous'}</span>
                  </div>
                  {offer.payer_email && (
                    <div className="flex items-center gap-1">
                      <Mail size={12} />
                      <span>{offer.payer_email}</span>
                    </div>
                  )}
                </div>

                {/* Asker Message */}
                {offer.asker_message && (
                  <div className="bg-purple-50/50 rounded-lg p-3 mb-3 border border-purple-100">
                    <div className="flex items-center gap-1 mb-1">
                      <MessageSquare size={12} className="text-purple-600" />
                      <p className="text-xs font-semibold text-purple-700">Message from asker:</p>
                    </div>
                    <p className="text-sm text-gray-700 italic line-clamp-3">"{offer.asker_message}"</p>
                  </div>
                )}

                {/* Question Preview */}
                {offer.text && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Question:</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{offer.text}</p>
                  </div>
                )}

                {/* Click hint */}
                <p className="text-xs text-center text-purple-600 mt-3 font-medium">
                  Click to view full question details
                </p>
              </div>

              {/* Action Buttons - Not Clickable Area */}
              <div
                className="px-4 pb-4 pt-2 border-t border-purple-100 bg-gradient-to-r from-purple-50/30 to-indigo-50/30"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    onClick={() => handleAccept(offer.question_id)}
                    disabled={processingOfferId === offer.question_id}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                  >
                    {processingOfferId === offer.question_id ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        <span>Accept Offer</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDecline(offer.question_id)}
                    disabled={processingOfferId === offer.question_id}
                    className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <X size={18} />
                    <span>Decline</span>
                  </button>

                  <button
                    onClick={() => onViewDetails && onViewDetails(offer.question_id)}
                    className="sm:w-auto bg-indigo-50 border-2 border-indigo-200 text-indigo-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 transition-all flex items-center justify-center gap-2"
                  >
                    <Eye size={18} />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PendingOffersBanner;
