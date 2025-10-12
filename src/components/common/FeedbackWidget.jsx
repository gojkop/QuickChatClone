// src/components/common/FeedbackWidget.jsx
// Enhanced feedback widget with progressive disclosure and journey tracking
// FIXED: Navigation issues - back button, state reset on close

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// ============================================================================
// CONSTANTS
// ============================================================================

const FEEDBACK_TYPES = [
  { id: 'bug', label: 'Report a bug', icon: '🐛', color: 'red' },
  { id: 'feature', label: 'Suggest a feature', icon: '💡', color: 'green' },
  { id: 'feedback', label: 'Share feedback', icon: '😊', color: 'blue' },
  { id: 'question', label: 'Ask a question', icon: '❓', color: 'purple' },
];

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || 'https://admin.mindpick.me/api';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Detect journey stage from URL
function detectJourneyStage(pathname, isAuthenticated) {
  if (['/', '/pricing', '/social-impact', '/faq'].includes(pathname)) {
    return 'awareness';
  }
  if (pathname.startsWith('/u/') || pathname === '/experts') {
    return 'consideration';
  }
  if (['/ask', '/signin', '/payment'].some(p => pathname.includes(p))) {
    return 'conversion';
  }
  if (isAuthenticated && ['/expert', '/dashboard'].some(p => pathname.includes(p))) {
    return 'retention';
  }
  return null;
}

// Detect device type
function detectDeviceType() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

// Generate session ID (fingerprint)
function getSessionId() {
  let sessionId = localStorage.getItem('feedback_session_id');
  if (!sessionId) {
    sessionId = `fp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('feedback_session_id', sessionId);
  }
  return sessionId;
}

// Track previous actions (simple implementation)
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
    actions.push({
      action,
      timestamp: Date.now(),
      url: window.location.pathname
    });
    sessionStorage.setItem('user_actions', JSON.stringify(actions.slice(-10)));
  } catch {
    // Ignore storage errors
  }
}

// ============================================================================
// MAIN WIDGET COMPONENT
// ============================================================================

function FeedbackWidget() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: type selection, 2: form, 3: success
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    message: '',
    rating: 0,
    email: '',
    wants_followup: false,
    expected_behavior: '',
    actual_behavior: '',
    reproduction_steps: '',
    problem_statement: '',
    current_workaround: '',
  });
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Refs
  const fileInputRef = useRef(null);
  const startTimeRef = useRef(null);
  const scrollDepthRef = useRef(0);
  const interactionsRef = useRef(0);

  // ============================================================================
  // TRACKING & ANALYTICS
  // ============================================================================

  useEffect(() => {
    startTimeRef.current = Date.now();

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
      scrollDepthRef.current = Math.max(scrollDepthRef.current, scrollPercentage);
    };

    const handleInteraction = () => {
      interactionsRef.current += 1;
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Pre-fill email if authenticated
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [isAuthenticated, user]);

  // Track widget opened action
  useEffect(() => {
    if (isOpen) {
      trackAction('feedback_widget_opened');
    }
  }, [isOpen]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setStep(2);
    trackAction(`feedback_type_selected:${type}`);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedType(null);
    // Clear form data
    setFormData({
      message: '',
      rating: 0,
      email: isAuthenticated && user?.email ? user.email : '',
      wants_followup: false,
      expected_behavior: '',
      actual_behavior: '',
      reproduction_steps: '',
      problem_statement: '',
      current_workaround: '',
    });
    setAttachments([]);
    trackAction('feedback_back_to_type_selection');
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset state after animation completes
    setTimeout(() => {
      setStep(1);
      setSelectedType(null);
      setSubmitted(false);
      setFormData({
        message: '',
        rating: 0,
        email: isAuthenticated && user?.email ? user.email : '',
        wants_followup: false,
        expected_behavior: '',
        actual_behavior: '',
        reproduction_steps: '',
        problem_statement: '',
        current_workaround: '',
      });
      setAttachments([]);
    }, 300); // Wait for close animation
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File too large. Max size is 10MB.');
        continue;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setAttachments(prev => [...prev, {
          file,
          preview: reader.result,
          name: file.name,
          size: file.size,
          type: file.type.startsWith('image/') ? 'screenshot' : 
                 file.type.startsWith('video/') ? 'video' : 'document'
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      alert('Please enter your feedback');
      return;
    }

    if (formData.message.length < 10) {
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
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        user_id: user?.id || null,
        user_role: user?.role || 'guest',
        is_authenticated: isAuthenticated,
        account_age_days: user?.created_at ? 
          Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 
          null,
        journey_stage: detectJourneyStage(location.pathname, isAuthenticated),
        previous_actions: getPreviousActions(),
        time_on_page: timeOnPage,
        scroll_depth: scrollDepthRef.current,
        interactions_count: interactionsRef.current,
        ...(selectedType === 'bug' && {
          expected_behavior: formData.expected_behavior.trim() || null,
          actual_behavior: formData.actual_behavior.trim() || null,
          reproduction_steps: formData.reproduction_steps.trim() || null,
          bug_severity: inferBugSeverity(formData.message),
        }),
        ...(selectedType === 'feature' && {
          problem_statement: formData.problem_statement.trim() || null,
          current_workaround: formData.current_workaround.trim() || null,
        }),
        analytics_consent: true,
        contact_consent: formData.wants_followup,
        screenshot_consent: attachments.length > 0,
      };

      if (attachments.length > 0) {
        payload.attachments = await uploadAttachments(attachments);
      }

      const response = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      const result = await response.json();
      
      setSubmitted(true);
      setStep(3);
      trackAction('feedback_submit_success');
      
      // Reset after 5 seconds using handleClose
      setTimeout(() => {
        handleClose();
      }, 5000);

    } catch (error) {
      console.error('Feedback submission failed:', error);
      alert('Failed to submit feedback. Please try again.');
      trackAction('feedback_submit_error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadAttachments = async (files) => {
    return files.map(file => ({
      file_type: file.type,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.file.type,
      storage_key: `feedback/${Date.now()}_${file.name}`,
      storage_url: file.preview,
    }));
  };

  const inferBugSeverity = (message) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('crash') || lowerMessage.includes('data loss') || lowerMessage.includes('payment')) {
      return 'critical';
    }
    if (lowerMessage.includes('error') || lowerMessage.includes('broken') || lowerMessage.includes("can't")) {
      return 'high';
    }
    return 'medium';
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
        aria-label="Send feedback"
      >
        <div className="group relative">
          {import.meta.env.VITE_APP_STAGE === 'beta' && (
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              Beta
            </div>
          )}
          
          <div className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-75"></div>
          
          <div className="relative flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="font-semibold text-sm hidden sm:inline">Feedback</span>
          </div>
        </div>
      </button>

      {/* Feedback Panel */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[380px] sm:w-[420px] overflow-hidden max-h-[calc(100vh-100px)] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              {/* Back button for step 2 */}
              {step === 2 && (
                <button
                  onClick={handleBack}
                  className="text-white/80 hover:text-white transition-colors mr-1"
                  aria-label="Go back"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              )}
              
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <h3 className="font-bold text-white">
                {step === 1 && 'Send Feedback'}
                {step === 2 && FEEDBACK_TYPES.find(t => t.id === selectedType)?.label}
                {step === 3 && 'Thank You!'}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-5 overflow-y-auto flex-1">
            {/* Step 1: Type Selection */}
            {step === 1 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  What brings you here today?
                </p>
                {FEEDBACK_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => handleTypeSelect(type.id)}
                    className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <span className="font-semibold text-gray-900 group-hover:text-indigo-700">
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Form */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Page context */}
                <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Current page:</p>
                  <p className="text-xs text-gray-700 font-mono truncate">{location.pathname}</p>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    How's your experience? (optional)
                  </label>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                        className="transition-transform hover:scale-110 active:scale-95"
                      >
                        <svg
                          className={`w-8 h-8 transition-colors ${
                            star <= formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1"
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition resize-none text-sm"
                    rows="4"
                    placeholder="Tell us what you think..."
                    maxLength="2000"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.message.length}/2000</p>
                </div>

                {/* Bug-specific fields */}
                {selectedType === 'bug' && (
                  <div className="space-y-3 border-l-4 border-red-500 pl-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Expected behavior
                      </label>
                      <input
                        type="text"
                        value={formData.expected_behavior}
                        onChange={(e) => setFormData(prev => ({ ...prev, expected_behavior: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-500 focus:outline-none transition text-sm"
                        placeholder="What should happen?"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Actual behavior
                      </label>
                      <input
                        type="text"
                        value={formData.actual_behavior}
                        onChange={(e) => setFormData(prev => ({ ...prev, actual_behavior: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-500 focus:outline-none transition text-sm"
                        placeholder="What actually happened?"
                      />
                    </div>
                  </div>
                )}

                {/* Feature-specific fields */}
                {selectedType === 'feature' && (
                  <div className="space-y-3 border-l-4 border-green-500 pl-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        What problem does this solve?
                      </label>
                      <input
                        type="text"
                        value={formData.problem_statement}
                        onChange={(e) => setFormData(prev => ({ ...prev, problem_statement: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-500 focus:outline-none transition text-sm"
                        placeholder="I'm trying to..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Current workaround (if any)
                      </label>
                      <input
                        type="text"
                        value={formData.current_workaround}
                        onChange={(e) => setFormData(prev => ({ ...prev, current_workaround: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-500 focus:outline-none transition text-sm"
                        placeholder="Currently I..."
                      />
                    </div>
                  </div>
                )}

                {/* Attachments */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Attachments (optional)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-sm text-gray-600 hover:text-indigo-700 font-medium"
                  >
                    📎 Add screenshot or video
                  </button>
                  
                  {attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {attachments.map((att, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <span className="text-sm truncate flex-1">{att.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(i)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email {isAuthenticated ? '(auto-filled)' : '(optional)'}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition text-sm"
                    placeholder="your@email.com"
                    disabled={isAuthenticated}
                  />
                  
                  {formData.email && (
                    <label className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={formData.wants_followup}
                        onChange={(e) => setFormData(prev => ({ ...prev, wants_followup: e.target.checked }))}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>I'd like updates on this feedback</span>
                    </label>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.message.trim()}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? 'Sending...' : 'Send Feedback'}
                </button>
              </form>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <div className="text-center py-6">
                <div className="mb-4 flex justify-center">
                  <div className="relative inline-block">
                    <img 
                      src="/big.png" 
                      alt="Team" 
                      className="max-w-[200px] max-h-[160px] w-auto h-auto rounded-lg object-contain border-4 border-green-100 shadow-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-24 h-24 rounded-lg bg-green-100 border-4 border-green-200 hidden items-center justify-center shadow-lg">
                      <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <h4 className="text-xl font-black text-gray-900 mb-2">
                  Thank You! 🙏
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed mb-1">
                  <span className="font-bold text-indigo-600">Bogdan & Gojko</span> appreciate your feedback!
                </p>
                <p className="text-xs text-gray-500">
                  Your input helps us build something amazing together.
                </p>
                
                <div className="mt-4 flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                      ⭐
                    </span>
                  ))}
                </div>
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