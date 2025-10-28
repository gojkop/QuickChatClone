// src/components/dashboardv2/inbox/MediaSegmentCard.jsx
// Compact media segment card with play button

import React from 'react';
import { Video, Mic, Monitor, PlayCircle } from 'lucide-react';

function MediaSegmentCard({ segment, index, onPlay }) {
  const getMediaIcon = (mode) => {
    switch (mode) {
      case 'video':
        return <Video size={18} className="text-indigo-600" />;
      case 'screen':
      case 'screen-camera':
        return <Monitor size={18} className="text-blue-600" />;
      case 'audio':
        return <Mic size={18} className="text-purple-600" />;
      default:
        return <Video size={18} className="text-gray-600" />;
    }
  };

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

  const getAccentColor = (mode) => {
    switch (mode) {
      case 'video':
        return 'border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50';
      case 'screen':
      case 'screen-camera':
        return 'border-blue-200 hover:border-blue-300 hover:bg-blue-50';
      case 'audio':
        return 'border-purple-200 hover:border-purple-300 hover:bg-purple-50';
      default:
        return 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const mode = segment.metadata?.mode || 'video';
  const duration = segment.duration_sec || 0;
  const modeLabel = getModeLabel(mode);

  return (
    <div
      className={`
        relative flex items-center gap-3 px-4 py-3
        bg-gray-50 border rounded-lg transition-all cursor-pointer
        ${getAccentColor(mode)}
      `}
      onClick={onPlay}
    >
      {/* Media Icon */}
      <div className="flex-shrink-0">
        {getMediaIcon(mode)}
      </div>

      {/* Content - Desktop */}
      <div className="hidden md:flex flex-1 items-center justify-between min-w-0">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            Part {index + 1} - {modeLabel}
          </p>
          <p className="text-xs text-gray-500">
            {mode === 'audio' ? 'Audio Recording' : 'Video Recording'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Duration */}
          <span className="text-sm font-medium text-gray-600 tabular-nums">
            {formatDuration(duration)}
          </span>

          {/* Play Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <PlayCircle size={16} />
            <span>Play</span>
          </button>
        </div>
      </div>

      {/* Content - Mobile */}
      <div className="flex md:hidden flex-1 items-center justify-between min-w-0">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            Part {index + 1} - {modeLabel}
          </p>
          <p className="text-xs text-gray-500">
            {formatDuration(duration)}
          </p>
        </div>

        {/* Play Button - Icon Only on Mobile */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          className="flex-shrink-0 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
          style={{ touchAction: 'auto' }}
        >
          <PlayCircle size={20} />
        </button>
      </div>
    </div>
  );
}

export default MediaSegmentCard;
