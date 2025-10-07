import { useState } from 'react';
import axios from 'axios';

const vercelApi = axios.create({
  baseURL: '/api',
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
  
  // ⭐ Store the question title so we can pass it to Tier 2
  const [questionTitle, setQuestionTitle] = useState('');
  
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
      console.log('[Coach] Starting Tier 1 validation:', { title, expertId });
      
      const result = await vercelApi.post('/ai/coach/quick-validate', {
        title,
        fingerprint: getFingerprint(),
        expertId
      });
      
      console.log('[Coach] Tier 1 result:', result.data);
      
      setSessionId(result.data.sessionId);
      setTier1Result(result.data);
      setQuestionTitle(title); // ⭐ Store the title
      
      return result.data;
    } catch (err) {
      console.error('[Coach] Validation failed:', err);
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const getCoaching = async (expertProfile, additionalContext = null) => {
    if (!sessionId) {
      throw new Error('No session ID - validate question first');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('[Coach] Starting Tier 2 coaching:', { sessionId, expertProfile });
      
      // ⭐ Pass the question title in questionContext
      const result = await vercelApi.post('/ai/coach/analyze-and-guide', {
        sessionId,
        expertProfile,
        questionContext: {
          title: questionTitle, // ⭐ Include the title from Tier 1
          text: additionalContext?.text || ''
        }
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
    if (!sessionId) return;
    
    try {
      console.log('[Coach] Saving clarification responses:', responses);
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
    setQuestionTitle('');
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