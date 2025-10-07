import { useState } from 'react';
import axios from 'axios';

// ✅ Create a separate axios instance for Vercel serverless functions
const vercelApi = axios.create({
  baseURL: '/api', // Vercel functions are at /api/*
  headers: {
    'Content-Type': 'application/json',
  },
});

export function useQuestionCoach() {
  const [sessionId, setSessionId] = useState(null);
  const [tier1Result, setTier1Result] = useState(null);
  const [tier2Result, setTier2Result] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const getFingerprint = () => {
    const nav = navigator;
    const screen = window.screen;
    const fingerprint = `${nav.userAgent}_${screen.width}x${screen.height}_${nav.language}`;
    
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
      // ✅ Calls /api/ai/coach/quick-validate on Vercel
      const result = await vercelApi.post('/ai/coach/quick-validate', {
        title,
        fingerprint: getFingerprint(),
        expertId
      });
      
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
      // ✅ Calls /api/ai/coach/analyze-and-guide on Vercel
      const result = await vercelApi.post('/ai/coach/analyze-and-guide', {
        sessionId,
        expertProfile,
        questionContext
      });
      
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
    if (!sessionId) return;
    
    try {
      // ✅ Calls /api/ai/coach/save-responses on Vercel
      await vercelApi.post('/ai/coach/save-responses', {
        sessionId,
        responses
      });
    } catch (err) {
      console.warn('[Coach] Save responses failed:', err);
    }
  };
  
  const reset = () => {
    setSessionId(null);
    setTier1Result(null);
    setTier2Result(null);
    setError(null);
  };
  
  return {
    sessionId,
    tier1Result,
    tier2Result,
    loading,
    error,
    validateQuestion,
    getCoaching,
    submitClarificationResponses,
    reset,
    getFingerprint
  };
}