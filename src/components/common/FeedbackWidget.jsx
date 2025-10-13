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
    expected_behavior: '',
    actual_behavior: '',
    problem_statement: '',
    current_workaround: '',
  });
  const [attachments, setAttachments] = useState([]);
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
      console.log('[FeedbackWidget] Setting email from user:', user.email);
      setFormData(prev => ({ ...prev, email: user.email }));
    } else {
      console.log('[FeedbackWidget] User not authenticated or no email:', { isAuthenticated, user });
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
        expected_behavior: '',
        actual_behavior: '',
        problem_statement: '',
        current_workaround: '',
      });
      setAttachments([]);
    }, 300);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.message.trim() || formData.message.length < 10) {
      alert('Please provide at least 10 characters');
      return;
    }

    console.log('[FeedbackWidget] Submitting with email:', formData.email);
    console.log('[FeedbackWidget] User object:', user);
    console.log('[FeedbackWidget] Is authenticated:', isAuthenticated);

    setIsSubmitting(true);
    trackAction('feedback_submit_started');

    try {
      const timeOnPage = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      // Ensure email is included
      const emailToSend = formData.email.trim() || (isAuthenticated && user?.email) || null;
      console.log('[FeedbackWidget] Email to send:', emailToSend);
      
      const payload = {
        type: selectedType,
        message: formData.message.trim(),
        rating: formData.rating || null,
        email: emailToSend,
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
        ...(selectedType === 'bug' && {
          expected_behavior: formData.expected_behavior.trim() || null,
          actual_behavior: formData.actual_behavior.trim() || null,
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('[FeedbackWidget] Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[FeedbackWidget] Error response:', errorData);
        throw new Error('Failed to submit feedback');
      }

      const result = await response.json();
      console.log('[FeedbackWidget] Success response:', result);

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
                    {selectedType === 'question' ? 'Your question' : 'Your feedback'} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition resize-none text-sm"
                    rows="3"
                    placeholder={selectedType === 'question' ? 'Ask your question...' : 'Tell us what you think...'}
                    maxLength="2000"
                    required
                  />
                  <p className="text-[10px] text-gray-500 mt-1">{formData.message.length}/2000 (min 10)</p>
                </div>

                {/* Bug-specific fields */}
                {selectedType === 'bug' && (
                  <div className="space-y-2 border-l-2 border-red-500 pl-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                        Expected behavior
                      </label>
                      <input
                        type="text"
                        value={formData.expected_behavior}
                        onChange={(e) => setFormData(prev => ({ ...prev, expected_behavior: e.target.value }))}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-500 focus:outline-none transition text-xs"
                        placeholder="What should happen?"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                        Actual behavior
                      </label>
                      <input
                        type="text"
                        value={formData.actual_behavior}
                        onChange={(e) => setFormData(prev => ({ ...prev, actual_behavior: e.target.value }))}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-500 focus:outline-none transition text-xs"
                        placeholder="What actually happened?"
                      />
                    </div>
                  </div>
                )}

                {/* Feature-specific fields */}
                {selectedType === 'feature' && (
                  <div className="space-y-2 border-l-2 border-green-500 pl-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                        What problem does this solve?
                      </label>
                      <input
                        type="text"
                        value={formData.problem_statement}
                        onChange={(e) => setFormData(prev => ({ ...prev, problem_statement: e.target.value }))}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-500 focus:outline-none transition text-xs"
                        placeholder="I'm trying to..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                        Current workaround (if any)
                      </label>
                      <input
                        type="text"
                        value={formData.current_workaround}
                        onChange={(e) => setFormData(prev => ({ ...prev, current_workaround: e.target.value }))}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-500 focus:outline-none transition text-xs"
                        placeholder="Currently I..."
                      />
                    </div>
                  </div>
                )}

                {/* Attachments */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
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
                    className="w-full py-1.5 px-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-xs text-gray-600 hover:text-indigo-700 font-medium"
                  >
                    📎 Add screenshot or video
                  </button>
                  
                  {attachments.length > 0 && (
                    <div className="mt-1.5 space-y-1">
                      {attachments.map((att, i) => (
                        <div key={i} className="flex items-center gap-2 p-1.5 bg-gray-50 rounded text-xs">
                          <span className="truncate flex-1">{att.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(i)}
                            className="text-red-500 hover:text-red-700 text-[10px] font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Email - Always visible */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email {isAuthenticated ? '(auto-filled)' : '(optional)'}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition text-sm ${
                      isAuthenticated 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-medium' 
                        : 'bg-white border-gray-300'
                    }`}
                    placeholder="your@email.com"
                    readOnly={isAuthenticated}
                  />
                  {isAuthenticated && !formData.email && (
                    <p className="text-[10px] text-red-600 mt-1">
                      ⚠️ Email not found in profile. Please add one manually or contact support.
                    </p>
                  )}
                  {formData.email && (
                    <label className="flex items-center gap-1.5 mt-1.5 text-[10px] text-gray-600">
                      <input
                        type="checkbox"
                        checked={formData.wants_followup}
                        onChange={(e) => setFormData(prev => ({ ...prev, wants_followup: e.target.checked }))}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Get updates on this feedback</span>
                    </label>
                  )}
                </div>

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