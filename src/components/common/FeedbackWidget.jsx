// src/components/common/FeedbackWidget.jsx
// Compact, modern feedback widget with fixed email auto-fill

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const FEEDBACK_TYPES = [
  { id: 'bug', label: 'Bug', icon: '🐛' },
  { id: 'feature', label: 'Feature', icon: '💡' },
  { id: 'feedback', label: 'Feedback', icon: '😊' },
  { id: 'question', label: 'Question', icon: '❓' },
];

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || 'https://admin.mindpick.me/api';

function detectJourneyStage(pathname, isAuthenticated) {
  if (['/', '/pricing', '/social-impact', '/faq'].includes(pathname)) return 'awareness';
  if (pathname.startsWith('/u/') || pathname === '/experts') return 'consideration';
  if (['/ask', '/signin', '/payment'].some(p => pathname.includes(p))) return 'conversion';
  if (isAuthenticated && ['/expert', '/dashboard'].some(p => pathname.includes(p))) return 'retention';
  return null;
}

function detectDeviceType() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'mobile';
  return 'desktop';
}

function getSessionId() {
  let sessionId = localStorage.getItem('feedback_session_id');
  if (!sessionId) {
    sessionId = `fp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('feedback_session_id', sessionId);
  }
  return sessionId;
}

function getPreviousActions() {
  try {
    const actions = JSON.parse(sessionStorage.getItem('user_actions') || '[]');
    return actions.slice(-5);
  } catch {
    return [];
  }
}

function trackAction(action) {
  try {
    const actions = JSON.parse(sessionStorage.getItem('user_actions') || '[]');
    actions.push({ action, timestamp: Date.now(), url: window.location.pathname });
    sessionStorage.setItem('user_actions', JSON.stringify(actions.slice(-10)));
  } catch {}
}

function FeedbackWidget() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('feedback');
  const [formData, setFormData] = useState({
    message: '',
    rating: 0,
    email: '',
    wants_followup: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const fileInputRef = useRef(null);
  const startTimeRef = useRef(null);
  const scrollDepthRef = useRef(0);
  const interactionsRef = useRef(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
      scrollDepthRef.current = Math.max(scrollDepthRef.current, scrollPercentage);
    };
    const handleInteraction = () => { interactionsRef.current += 1; };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isOpen) trackAction('feedback_widget_opened');
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setSelectedType('feedback');
      setSubmitted(false);
      setFormData({
        message: '',
        rating: 0,
        email: isAuthenticated && user?.email ? user.email : '',
        wants_followup: false,
      });
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.message.trim() || formData.message.length < 10) {
      alert('Please provide at least 10 characters');
      return;
    }

    setIsSubmitting(true);
    trackAction('feedback_submit_started');

    try {
      const timeOnPage = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const payload = {
        type: selectedType,
        message: formData.message.trim(),
        rating: formData.rating || null,
        email: formData.email.trim() || null,
        wants_followup: formData.wants_followup,
        page_url: window.location.href,
        page_title: document.title,
        referrer: document.referrer || null,
        session_id: getSessionId(),
        user_agent: navigator.userAgent,
        device_type: detectDeviceType(),
        viewport: { width: window.innerWidth, height: window.innerHeight },
        user_id: user?.id || null,
        user_role: user?.role || 'guest',
        is_authenticated: isAuthenticated,
        account_age_days: user?.created_at ? 
          Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : null,
        journey_stage: detectJourneyStage(location.pathname, isAuthenticated),
        previous_actions: getPreviousActions(),
        time_on_page: timeOnPage,
        scroll_depth: scrollDepthRef.current,
        interactions_count: interactionsRef.current,
        analytics_consent: true,
        contact_consent: formData.wants_followup,
        screenshot_consent: false,
      };

      const response = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to submit feedback');

      setSubmitted(true);
      trackAction('feedback_submit_success');
      
      setTimeout(() => {
        handleClose();
      }, 3000);

    } catch (error) {
      console.error('Feedback submission failed:', error);
      alert('Failed to submit feedback. Please try again.');
      trackAction('feedback_submit_error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Compact FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
        aria-label="Send feedback"
      >
        <div className="relative group">
          {import.meta.env.VITE_APP_STAGE === 'beta' && (
            <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              β
            </div>
          )}
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all flex items-center justify-center group-hover:rotate-12">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        </div>
      </button>

      {/* Compact Panel */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[90vw] sm:w-[380px] max-w-[380px] overflow-hidden">
          {/* Compact Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <h3 className="font-bold text-white text-sm">
                {submitted ? 'Thank You!' : 'Quick Feedback'}
              </h3>
            </div>
            <button onClick={handleClose} className="text-white/80 hover:text-white transition-colors p-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Compact Type Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Type</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {FEEDBACK_TYPES.map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedType(type.id)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                          selectedType === type.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-lg">{type.icon}</span>
                        <span className="text-[10px] font-medium text-gray-700">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Rating (optional)
                  </label>
                  <div className="flex gap-1 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                        className="transition-transform hover:scale-110 active:scale-95"
                      >
                        <svg
                          className={`w-6 h-6 transition-colors ${
                            star <= formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Your feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition resize-none text-sm"
                    rows="3"
                    placeholder="Tell us what you think..."
                    maxLength="2000"
                    required
                  />
                  <p className="text-[10px] text-gray-500 mt-1">{formData.message.length}/2000 (min 10)</p>
                </div>

                {/* Email */}
                {!isAuthenticated && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition text-sm"
                      placeholder="your@email.com"
                    />
                    {formData.email && (
                      <label className="flex items-center gap-1.5 mt-1.5 text-[10px] text-gray-600">
                        <input
                          type="checkbox"
                          checked={formData.wants_followup}
                          onChange={(e) => setFormData(prev => ({ ...prev, wants_followup: e.target.checked }))}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Get updates</span>
                      </label>
                    )}
                  </div>
                )}

                {/* Authenticated user info */}
                {isAuthenticated && formData.email && (
                  <div className="bg-indigo-50 rounded-lg px-3 py-2 border border-indigo-100">
                    <p className="text-xs text-indigo-900">
                      ✓ Sending as <span className="font-semibold">{formData.email}</span>
                    </p>
                    <label className="flex items-center gap-1.5 mt-1 text-[10px] text-indigo-700">
                      <input
                        type="checkbox"
                        checked={formData.wants_followup}
                        onChange={(e) => setFormData(prev => ({ ...prev, wants_followup: e.target.checked }))}
                        className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Get updates on this feedback</span>
                    </label>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.message.trim() || formData.message.length < 10}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] text-sm"
                >
                  {isSubmitting ? 'Sending...' : 'Send Feedback'}
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-black text-gray-900 mb-1">Thank You!</h4>
                <p className="text-xs text-gray-600">
                  Your feedback helps us improve 🙏
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={handleClose}
        />
      )}
    </>
  );
}

export default FeedbackWidget;