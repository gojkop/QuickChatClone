// src/hooks/dashboardv2/useURLSync.js
// URL synchronization for panel state with deep linking support

import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '@/api';

/**
 * Parse URL hash to determine panel state
 * Examples:
 *   #question-123 → { detail: 123 }
 *   #question-123/answer → { detail: 123, answer: true }
 */
const parseHash = (hash) => {
  if (!hash || hash === '#') {
    return { detail: null, answer: false };
  }

  const cleanHash = hash.replace('#', '');
  const parts = cleanHash.split('/');

  if (parts[0].startsWith('question-')) {
    const questionId = parseInt(parts[0].replace('question-', ''), 10);
    const showAnswer = parts.includes('answer');

    return {
      detail: isNaN(questionId) ? null : questionId,
      answer: showAnswer
    };
  }

  return { detail: null, answer: false };
};

/**
 * Generate URL hash from panel state
 */
const generateHash = (detailQuestionId, isAnswering) => {
  if (!detailQuestionId) return '';
  
  let hash = `#question-${detailQuestionId}`;
  if (isAnswering) {
    hash += '/answer';
  }
  
  return hash;
};

/**
 * Enrich a single question with media data
 */
const enrichQuestionWithMedia = async (question) => {
  if (!question || !question.media_asset_id || question.media_asset_id === 0) {
    return question;
  }

  try {
    const response = await apiClient.get(`/media_asset/${question.media_asset_id}`);
    const mediaAsset = response.data;

    // Parse metadata if it's a string
    let metadata = mediaAsset.metadata;
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch (e) {
        console.error(`Failed to parse metadata for media_asset ${question.media_asset_id}:`, e);
        metadata = null;
      }
    }

    // Transform media_asset into recording_segments format
    let recordingSegments = [];
    if (metadata?.type === 'multi-segment' && metadata?.segments) {
      recordingSegments = metadata.segments.map(seg => ({
        id: seg.uid,
        url: seg.playback_url,
        duration_sec: seg.duration,
        segment_index: seg.segment_index,
        metadata: { mode: seg.mode }
      }));
    } else {
      // Single media file (legacy format)
      recordingSegments = [{
        id: mediaAsset.id,
        url: mediaAsset.url,
        duration_sec: mediaAsset.duration_sec,
        segment_index: 0,
        metadata: metadata
      }];
    }

    return {
      ...question,
      recording_segments: recordingSegments
    };
  } catch (error) {
    console.warn(`Failed to fetch media_asset ${question.media_asset_id}:`, error.message);
    return question;
  }
};

/**
 * Hook for syncing URL with panel state
 */
export const useURLSync = ({
  questions,
  openPanel,
  closePanel,
  closeAllPanels,
  isPanelOpen,
  getPanelData
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialMount = useRef(true);
  const lastSyncedHash = useRef('');
  const processingHash = useRef(false);
  const fetchedQuestionIds = useRef(new Set());

  // URL → Panel State (only on mount and when hash changes externally)
  useEffect(() => {
    const currentHash = location.hash;

    // Skip if we're already processing this hash to avoid loops
    if (processingHash.current) {
      return;
    }

    // Skip if this is the same hash we just synced to avoid loops
    if (currentHash === lastSyncedHash.current && !isInitialMount.current) {
      return;
    }

    const hashState = parseHash(currentHash);

    if (hashState.detail) {
      // Try to find question in loaded questions
      const question = questions.find(q => q.id === hashState.detail);

      if (question) {
        const currentDetailId = getPanelData('detail')?.id;

        // Only open detail if it's not already open with the same question
        if (currentDetailId !== question.id) {
          processingHash.current = true;
          openPanel('detail', question);
          // Reset processing flag after a brief delay
          setTimeout(() => { processingHash.current = false; }, 100);
        }

        // Only open answer if needed and not already open
        if (hashState.answer && !isPanelOpen('answer')) {
          openPanel('answer', question);
        } else if (!hashState.answer && isPanelOpen('answer')) {
          closePanel('answer');
        }
      } else if (questions.length > 0 || isInitialMount.current) {
        // Question not found - fetch it directly if we're on initial mount or questions have loaded
        // This handles direct navigation to a question URL

        // Skip if we've already attempted to fetch this question
        if (fetchedQuestionIds.current.has(hashState.detail)) {
          return;
        }

        console.log(`Question ${hashState.detail} not in current list, fetching directly...`);
        fetchedQuestionIds.current.add(hashState.detail);

        const fetchAndOpenQuestion = async () => {
          try {
            // Fetch questions with a large limit to increase chances of finding it
            // We can't filter by ID directly, so we fetch with a broad filter
            const response = await apiClient.get(`/me/questions?filter_type=all&per_page=500&sort_by=created_at`);
            const allQuestions = response.data?.questions || response.data || [];
            const targetQuestion = allQuestions.find(q => q.id === hashState.detail);

            if (targetQuestion) {
              // Enrich the question with media data
              const enrichedQuestion = await enrichQuestionWithMedia(targetQuestion);

              processingHash.current = true;
              openPanel('detail', enrichedQuestion);

              if (hashState.answer) {
                openPanel('answer', enrichedQuestion);
              }

              setTimeout(() => { processingHash.current = false; }, 100);
            } else {
              console.warn(`Question ${hashState.detail} not found. It may be hidden, deleted, or on a different page.`);
            }
          } catch (error) {
            console.error(`Failed to fetch question ${hashState.detail}:`, error);
          }
        };

        fetchAndOpenQuestion();
      }
    } else if (!hashState.detail) {
      // No hash, close all panels
      if (isPanelOpen('detail') || isPanelOpen('answer')) {
        closeAllPanels();
      }
    }

    isInitialMount.current = false;
  }, [location.hash, questions, openPanel, closePanel, closeAllPanels, isPanelOpen, getPanelData]);

  // Panel State → URL (debounced to avoid loops)
  const syncURL = (detailQuestionId, isAnswering) => {
    const expectedHash = generateHash(detailQuestionId, isAnswering);
    
    if (location.hash !== expectedHash) {
      lastSyncedHash.current = expectedHash;
      navigate(`${location.pathname}${expectedHash}`, { replace: true });
    } else {
      // Hash already matches, just update the ref
      lastSyncedHash.current = expectedHash;
    }
  };

  return { syncURL, parseHash, generateHash };
};

export default useURLSync;