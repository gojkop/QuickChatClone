import { useState } from 'react';
import api from '../api/apiClient';

export function useQuestionCoach() {
  const [sessionId, setSessionId] = useState(null);
  const [tier1Result, setTier1Result] = useState(null);
  const [tier2Result, setTier2Result] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Generate fingerprint for rate limiting
  const getFingerprint = () => {
    const nav = navigator;
    const screen = window.screen;
    const fingerprint = `${nav.userAgent}_${screen.width}x${screen.height}_${nav.language}`;
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `fp_${Math.abs(hash).toString(36)}`;
  };
  
  const validateQuestion = async (title, expertId) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[Coach] Starting Tier 1 validation:', { title, expertId });
      
      const result = await api.post('/ai/coach/quick-validate', {
        title,
        fingerprint: getFingerprint(),
        expertId
      });
      
      console.log('[Coach] Tier 1 result:', result.data);
      
      setSessionId(result.data.sessionId);
      setTier1Result(result.data);
      
      return result.data;
    } catch (err) {
      console.error('[Coach] Validation failed:', err);
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const getCoaching = async (expertProfile, questionContext = null) => {
    if (!sessionId) {
      throw new Error('No session ID - validate question first');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('[Coach] Starting Tier 2 coaching:', { sessionId, expertProfile });
      
      const result = await api.post('/ai/coach/analyze-and-guide', {
        sessionId,
        expertProfile,
        questionContext
      });
      
      console.log('[Coach] Tier 2 result:', result.data);
      
      setTier2Result(result.data);
      return result.data;
    } catch (err) {
      console.error('[Coach] Coaching failed:', err);
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const submitClarificationResponses = async (responses) => {
    if (!sessionId) {
      throw new Error('No session ID');
    }
    
    try {
      console.log('[Coach] Saving clarification responses:', responses);
      // This will fail without Xano, but that's OK for testing
      await api.post('/ai/coach/save-responses', {
        sessionId,
        responses
      });
    } catch (err) {
      console.warn('[Coach] Save responses failed (expected without Xano):', err);
      // Don't throw - continue with flow
    }
  };
  
  const reset = () => {
    setSessionId(null);
    setTier1Result(null);
    setTier2Result(null);
    setError(null);
  };
  
  return {
    // State
    sessionId,
    tier1Result,
    tier2Result,
    loading,
    error,
    
    // Methods
    validateQuestion,
    getCoaching,
    submitClarificationResponses,
    reset,
    getFingerprint
  };
}