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

function PendingOffersBanner({ onOfferUpdate, onViewDetails, onAcceptOffer, onDeclineOffer }) {
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

  const handleAccept = async (offer, e) => {
    if (e) e.stopPropagation();

    if (onAcceptOffer) {
      // Use parent callback if provided
      await onAcceptOffer(offer);
      fetchPendingOffers();
    }
  };

  const handleDecline = async (offer, e) => {
    if (e) e.stopPropagation();

    if (onDeclineOffer) {
      // Use parent callback if provided
      await onDeclineOffer(offer);
      fetchPendingOffers();
    }
  };

  const handleViewDetails = (offer, e) => {
    if (e) e.stopPropagation();

    if (onViewDetails) {
      // Convert offer to question format
      const questionData = {
        id: offer.question_id,
        question_text: offer.title,
        title: offer.title,
        text: offer.text,
        price_cents: offer.proposed_price_cents,
        user_name: offer.payer_name,
        payer_name: offer.payer_name,
        user_email: offer.payer_email,
        payer_email: offer.payer_email,
        created_at: offer.created_at,
        status: 'pending_offer',
        sla_hours_snapshot: offer.sla_hours || 48,
        offer_expires_at: offer.offer_expires_at,
        asker_message: offer.asker_message,
        is_pending_offer: true,
        media_asset_id: offer.media_asset_id || 0,
        attachments: offer.attachments || []
      };
      onViewDetails(questionData);
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
        <div className="px-4 py-3 space-y-2">
          {offers.map((offer) => (
            <div
              key={offer.question_id}
              onClick={(e) => handleViewDetails(offer, e)}
              className="relative p-3 sm:p-4 border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl transition-all duration-200 cursor-pointer hover:border-purple-400 hover:shadow-lg hover:-translate-y-0.5"
            >
              {/* Main Content */}
              <div className="flex items-start justify-between gap-3">
                {/* Left: Title and Meta */}
                <div className="flex-1 min-w-0">
                  {/* Title with Deep Dive badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded shadow-sm">
                      🎯 DEEP DIVE OFFER
                    </span>
                    <span className={`flex items-center gap-1 text-xs font-bold ${getTimeRemainingColor(offer.offer_expires_at, offer.created_at)}`}>
                      <Clock size={12} />
                      {formatTimeRemaining(offer.offer_expires_at)}
                    </span>
                  </div>

                  {/* Question Title */}
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-2">
                    {offer.title || 'Untitled Question'}
                  </h3>

                  {/* Asker Message (if present) */}
                  {offer.asker_message && (
                    <div className="bg-purple-100/50 rounded px-2 py-1 mb-2 border border-purple-200">
                      <p className="text-xs text-purple-800 italic line-clamp-1">
                        <MessageSquare size={10} className="inline mr-1" />
                        "{offer.asker_message}"
                      </p>
                    </div>
                  )}

                  {/* Footer Meta */}
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      <span className="truncate">{offer.payer_name || 'Anonymous'}</span>
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 font-mono">Q-{offer.question_id}</span>
                  </div>
                </div>

                {/* Right: Price and Actions */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {/* Price */}
                  <div className="px-3 py-1.5 rounded-lg font-bold text-base bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-2 border-green-300 shadow-sm">
                    {formatPrice(offer.proposed_price_cents)}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleAccept(offer, e)}
                      disabled={processingOfferId === offer.question_id}
                      className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      title="Accept this offer"
                    >
                      {processingOfferId === offer.question_id ? (
                        <Loader className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                    </button>

                    <button
                      onClick={(e) => handleDecline(offer, e)}
                      disabled={processingOfferId === offer.question_id}
                      className="px-3 py-1.5 bg-white border-2 border-gray-300 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Decline this offer"
                    >
                      <X size={14} />
                    </button>

                    <button
                      onClick={(e) => handleViewDetails(offer, e)}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
                      title="View full details"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
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
