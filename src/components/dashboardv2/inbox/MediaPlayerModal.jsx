// src/components/dashboardv2/inbox/MediaPlayerModal.jsx
// Fullscreen/modal player for media segments

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

function MediaPlayerModal({
  segment,
  segments = [],
  currentIndex,
  onClose,
  onNavigate
}) {
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < segments.length - 1;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrevious) {
        onNavigate(-1);
      } else if (e.key === 'ArrowRight' && hasNext) {
        onNavigate(1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate, hasPrevious, hasNext]);

  // Lock body scroll when modal is open (desktop only to avoid mobile panel issues)
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const getModeLabel = (mode) => {
    switch (mode) {
      case 'video':
        return 'Video Recording';
      case 'screen':
        return 'Screen Recording';
      case 'screen-camera':
        return 'Screen + Camera';
      case 'audio':
        return 'Audio Recording';
      default:
        return 'Media';
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const mode = segment.metadata?.mode || 'video';
  const modeLabel = getModeLabel(mode);
  const duration = segment.duration_sec || 0;
  const isVideo = mode === 'video' || mode === 'screen' || mode === 'screen-camera';
  const isAudio = mode === 'audio';

  // Check if this is a Cloudflare Stream video (not R2)
  const isCloudflareStream = segment.provider === 'cloudflare_stream' || segment.url?.includes('cloudflarestream.com');

  // Extract video ID from Cloudflare Stream URL (same logic as original)
  const getStreamVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/cloudflarestream\.com\/([a-zA-Z0-9]+)\//);
    return match ? match[1] : null;
  };

  // Extract customer code from Cloudflare URL
  const getCustomerCode = (url) => {
    if (!url) return null;
    const match = url.match(/https:\/\/(customer-[a-zA-Z0-9]+)\.cloudflarestream\.com/);
    return match ? match[1] : null;
  };

  const CUSTOMER_CODE_OVERRIDE = 'customer-o9wvts8h9krvlboh';

  // Use segment.asset_id first, then fall back to URL extraction (same as original)
  const videoId = isVideo ? (segment.asset_id || getStreamVideoId(segment.url)) : null;
  const extractedCustomerCode = isVideo ? getCustomerCode(segment.url) : null;
  const customerCode = CUSTOMER_CODE_OVERRIDE || extractedCustomerCode;

  const useCloudflarePlayer = isVideo && videoId && customerCode && isCloudflareStream;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
        onClick={onClose}
      >
        {/* Desktop Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="hidden md:flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden"
          style={{
            width: '85vw',
            maxWidth: '1400px',
            height: '85vh',
            maxHeight: '900px'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Part {currentIndex + 1} - {modeLabel}
              </h3>
              <p className="text-sm text-gray-500">
                {formatDuration(duration)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Player */}
          <div className="flex-1 flex items-center justify-center bg-black">
            {useCloudflarePlayer ? (
              <iframe
                src={`https://${customerCode}.cloudflarestream.com/${videoId}/iframe`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen={true}
              />
            ) : isVideo ? (
              <video
                src={segment.url}
                controls
                autoPlay
                className="w-full h-full"
                style={{ maxHeight: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div className="w-full max-w-2xl px-8">
                <audio
                  src={segment.url}
                  controls
                  autoPlay
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Footer - Navigation */}
          {segments.length > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => onNavigate(-1)}
                disabled={!hasPrevious}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                  ${hasPrevious
                    ? 'text-indigo-600 hover:bg-indigo-50'
                    : 'text-gray-300 cursor-not-allowed'}
                `}
              >
                <ChevronLeft size={20} />
                <span>Previous</span>
              </button>

              <span className="text-sm text-gray-500">
                {currentIndex + 1} of {segments.length}
              </span>

              <button
                onClick={() => onNavigate(1)}
                disabled={!hasNext}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                  ${hasNext
                    ? 'text-indigo-600 hover:bg-indigo-50'
                    : 'text-gray-300 cursor-not-allowed'}
                `}
              >
                <span>Next</span>
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </motion.div>

        {/* Mobile Fullscreen */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="flex md:hidden flex-col bg-black w-full h-full"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 text-white">
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              style={{ touchAction: 'auto' }}
              aria-label="Close and go back"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate">
                Part {currentIndex + 1} - {modeLabel}
              </h3>
              <p className="text-xs text-gray-400">
                {formatDuration(duration)}
              </p>
            </div>
          </div>

          {/* Player */}
          <div className="flex-1 flex items-center justify-center bg-black">
            {useCloudflarePlayer ? (
              <iframe
                src={`https://${customerCode}.cloudflarestream.com/${videoId}/iframe`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen={true}
              />
            ) : isVideo ? (
              <video
                src={segment.url}
                controls
                autoPlay
                playsInline
                className="w-full h-full"
                style={{ maxHeight: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div className="w-full px-4">
                <audio
                  src={segment.url}
                  controls
                  autoPlay
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Footer - Navigation */}
          {segments.length > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white">
              <button
                onClick={() => onNavigate(-1)}
                disabled={!hasPrevious}
                className={`
                  flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${hasPrevious
                    ? 'text-white bg-gray-800 active:bg-gray-700'
                    : 'text-gray-600 cursor-not-allowed'}
                `}
                style={{ touchAction: 'auto' }}
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              <span className="text-xs text-gray-400">
                {currentIndex + 1} / {segments.length}
              </span>

              <button
                onClick={() => onNavigate(1)}
                disabled={!hasNext}
                className={`
                  flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${hasNext
                    ? 'text-white bg-gray-800 active:bg-gray-700'
                    : 'text-gray-600 cursor-not-allowed'}
                `}
                style={{ touchAction: 'auto' }}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default MediaPlayerModal;
