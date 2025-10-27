import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Clock, DollarSign, User, Mail, MessageSquare, Eye, Check, X, Loader, RefreshCw, Star } from 'lucide-react';
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

      {/* Offer Cards - Compact Table-like Layout */}
      {!isCollapsed && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <tbody className="bg-white divide-y divide-purple-100">
              {offers.map((offer) => (
                <tr
                  key={offer.question_id}
                  onClick={(e) => handleViewDetails(offer, e)}
                  className="cursor-pointer hover:bg-purple-50/50 transition-colors group"
                >
                  {/* Deep Dive Badge - Fixed width like checkbox column */}
                  <td className="w-12 px-3 py-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded bg-gradient-to-br from-purple-600 to-indigo-600 shadow-sm" title="Deep Dive Offer">
                      <Star size={12} className="text-white" fill="white" />
                    </div>
                  </td>

                  {/* Question Column - Matches table width */}
                  <td className="px-3 py-3" style={{ width: '40%' }}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-mono">Q-{offer.question_id}</span>
                        <h3 className="text-sm font-semibold text-gray-900 truncate flex-1">
                          {offer.title || 'Untitled Question'}
                        </h3>
                      </div>
                    </div>
                  </td>

                  {/* Asker Column - Matches table width */}
                  <td className="px-3 py-3" style={{ width: '25%' }}>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <User size={12} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {offer.payer_name || 'Anonymous'}
                        </span>
                      </div>
                      {offer.payer_email && (
                        <a
                          href={`mailto:${offer.payer_email}`}
                          className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline truncate ml-5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {offer.payer_email}
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Price Column - Matches table width */}
                  <td className="px-3 py-3" style={{ width: '12%' }}>
                    <div className="inline-flex px-2.5 py-1 rounded-lg font-bold text-sm bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200">
                      {formatPrice(offer.proposed_price_cents)}
                    </div>
                  </td>

                  {/* Time Left Column - Matches table width */}
                  <td className="px-3 py-3" style={{ width: '11%' }}>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${getTimeRemainingColor(offer.offer_expires_at, offer.created_at)}`}>
                      <Clock size={12} />
                      <span className="whitespace-nowrap">{formatTimeRemaining(offer.offer_expires_at)}</span>
                    </div>
                  </td>

                  {/* Actions Column - Compact buttons */}
                  <td className="px-3 py-3" style={{ width: '12%' }}>
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        onClick={(e) => handleAccept(offer, e)}
                        disabled={processingOfferId === offer.question_id}
                        className="p-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        title="Accept offer"
                      >
                        {processingOfferId === offer.question_id ? (
                          <Loader className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check size={16} />
                        )}
                      </button>

                      <button
                        onClick={(e) => handleDecline(offer, e)}
                        disabled={processingOfferId === offer.question_id}
                        className="p-1.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Decline offer"
                      >
                        <X size={16} />
                      </button>

                      <button
                        onClick={(e) => handleViewDetails(offer, e)}
                        className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-all shadow-sm"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PendingOffersBanner;
