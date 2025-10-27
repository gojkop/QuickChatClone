import React, { useState, useEffect, useRef } from 'react';
import { Loader, CheckCircle, AlertCircle, DollarSign, Clock } from 'lucide-react';
import apiClient from '@/api';

function EssentialSetupForm({ onComplete, onSkip, userName }) {
  const [handle, setHandle] = useState('');
  const [price, setPrice] = useState(50);
  const [sla, setSla] = useState(48);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle validation state
  const [handleValidation, setHandleValidation] = useState({
    checking: false,
    available: null,
    message: ''
  });

  const handleCheckTimeout = useRef(null);

  // Auto-populate handle from name
  useEffect(() => {
    if (userName && !handle) {
      // Convert name to handle format: lowercase, replace spaces with hyphens
      const suggestedHandle = userName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Remove duplicate hyphens
        .substring(0, 30); // Limit length
      setHandle(suggestedHandle);
    }
  }, [userName]);

  // Debounced handle validation
  useEffect(() => {
    if (!handle || handle.length < 3) {
      setHandleValidation({ checking: false, available: null, message: '' });
      return;
    }

    // Clear previous timeout
    if (handleCheckTimeout.current) {
      clearTimeout(handleCheckTimeout.current);
    }

    setHandleValidation({ checking: true, available: null, message: 'Checking...' });

    // Debounce for 500ms
    handleCheckTimeout.current = setTimeout(async () => {
      try {
        const response = await apiClient.get(`/expert/profile/check-handle/${handle}`);
        if (response.data.available) {
          setHandleValidation({
            checking: false,
            available: true,
            message: 'Available! ✓'
          });
        } else {
          setHandleValidation({
            checking: false,
            available: false,
            message: 'Already taken'
          });
        }
      } catch (err) {
        console.error('Handle check error:', err);
        // If endpoint doesn't exist yet, assume available
        setHandleValidation({
          checking: false,
          available: true,
          message: ''
        });
      }
    }, 500);

    return () => {
      if (handleCheckTimeout.current) {
        clearTimeout(handleCheckTimeout.current);
      }
    };
  }, [handle]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!handle || handle.length < 3) {
      setError('Handle must be at least 3 characters');
      return;
    }

    if (handleValidation.available === false) {
      setError('This handle is already taken. Please choose another.');
      return;
    }

    if (!price || price < 10) {
      setError('Price must be at least $10');
      return;
    }

    if (!sla) {
      setError('Please select a response time');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call API to update expert profile with essential info
      // Match ProfileSettingsPage payload format exactly
      const priceCents = Math.round(price * 100);

      const payload = {
        // Legacy fields (required by backend)
        price_cents: priceCents,
        sla_hours: sla,
        bio: '',
        public: true,
        handle,

        // Tier 1 (Quick Consult) fields
        tier1_enabled: true,
        tier1_price_cents: priceCents,
        tier1_sla_hours: sla,
        tier1_description: null,

        // Tier 2 (Deep Dive) fields - disabled
        tier2_enabled: false,
        tier2_pricing_mode: 'range',
        tier2_min_price_cents: null,
        tier2_max_price_cents: null,
        tier2_sla_hours: null,
        tier2_auto_decline_below_cents: null,
        tier2_description: null,

        // Other fields
        currency: 'USD',
        professional_title: '',
        tagline: '',
        expertise: [],
        socials: {},
        charity_percentage: 0,
        selected_charity: null,
        accepting_questions: true,
        daily_digest_enabled: true
      };

      const response = await apiClient.put('/me/profile', payload);

      // Update availability status (separate call like ProfileSettingsPage)
      try {
        await apiClient.post('/expert/profile/availability', {
          accepting_questions: true
        });
      } catch (availabilityErr) {
        console.warn('Failed to update availability status:', availabilityErr);
      }

      // Success!
      onComplete({
        handle,
        price,
        sla,
        profile: response.data
      });
    } catch (err) {
      console.error('Setup error:', err);
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
      setIsSubmitting(false);
    }
  };

  const priceSuggestions = [50, 75, 100, 150];
  const slaOptions = [
    { value: 24, label: '24 hours' },
    { value: 48, label: '48 hours' },
    { value: 72, label: '72 hours' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 my-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Let's Get You Set Up
          </h2>
          <p className="text-sm text-gray-600">
            Just 3 quick things to get your profile link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Step 1: Handle */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Step 1: Choose your handle
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Your URL: mindpick.me/u/<span className="font-medium text-indigo-600">{handle || 'your-handle'}</span>
            </p>
            <div className="relative">
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="your-handle"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                maxLength={30}
                required
              />
              {/* Validation indicator */}
              {handle && handle.length >= 3 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {handleValidation.checking && (
                    <Loader className="w-5 h-5 text-gray-400 animate-spin" />
                  )}
                  {!handleValidation.checking && handleValidation.available === true && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {!handleValidation.checking && handleValidation.available === false && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {/* Validation message */}
            {handle && handle.length >= 3 && handleValidation.message && (
              <p className={`text-xs mt-1 ${
                handleValidation.available === true ? 'text-green-600' :
                handleValidation.available === false ? 'text-red-600' :
                'text-gray-500'
              }`}>
                {handleValidation.message}
              </p>
            )}
          </div>

          {/* Step 2: Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              <DollarSign className="inline w-4 h-4 mr-1" />
              Step 2: Set your price
            </label>
            <p className="text-xs text-gray-500 mb-3">
              What's 15 minutes of your expertise worth?
            </p>

            {/* Price input */}
            <div className="relative mb-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                $
              </span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                min="10"
                max="500"
                step="5"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-lg font-semibold"
                required
              />
            </div>

            {/* Quick suggestions */}
            <div className="flex gap-2">
              {priceSuggestions.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setPrice(amount)}
                  className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                    price === amount
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-indigo-300 text-gray-700'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: SLA */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Step 3: Response time
            </label>
            <p className="text-xs text-gray-500 mb-3">
              How quickly can you respond?
            </p>

            <div className="space-y-2">
              {slaOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSla(option.value)}
                  className={`w-full px-4 py-3 rounded-lg border-2 text-left font-semibold transition-all ${
                    sla === option.value
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-indigo-300 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting || handleValidation.available === false || handleValidation.checking}
            className="w-full py-3 sm:py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Setting up...
              </>
            ) : (
              'Create My Profile Link'
            )}
          </button>

          {/* Skip button */}
          <button
            type="button"
            onClick={onSkip}
            className="w-full py-2 px-4 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Skip for now
          </button>
        </form>

        {/* Footer note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          You can complete this later from your profile settings
        </p>
      </div>
    </div>
  );
}

export default EssentialSetupForm;
