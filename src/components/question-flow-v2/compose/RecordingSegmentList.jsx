import React, { useState } from 'react';
import { VideoIcon, MicIcon, MonitorIcon, TrashIcon, CheckCircleIcon } from '../shared/SVGIcons';

function RecordingSegmentList({ segments, onRemoveSegment, onReorderSegments, maxDuration = 90 }) {
  const [playingSegmentId, setPlayingSegmentId] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const totalDuration = segments.reduce((sum, seg) => sum + (seg.duration || 0), 0);
  const remainingTime = maxDuration - totalDuration;
  const progressPercent = (totalDuration / maxDuration) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSegmentIcon = (mode) => {
    switch (mode) {
      case 'video': return <VideoIcon className="w-5 h-5 text-blue-600" />;
      case 'audio': return <MicIcon className="w-5 h-5 text-orange-600" />;
      case 'screen': return <MonitorIcon className="w-5 h-5 text-purple-600" />;
      default: return null;
    }
  };

  const getSegmentLabel = (mode) => {
    switch (mode) {
      case 'video': return 'Video';
      case 'audio': return 'Audio';
      case 'screen': return 'Screen Recording';
      default: return 'Recording';
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newSegments = [...segments];
    const [draggedSegment] = newSegments.splice(draggedIndex, 1);
    newSegments.splice(dropIndex, 0, draggedSegment);

    onReorderSegments(newSegments);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getStatusColor = (segment) => {
    if (segment.error) return 'border-red-300 bg-red-50';
    if (segment.uploading) return 'border-indigo-300 bg-indigo-50';
    if (segment.result) return 'border-green-300 bg-green-50';
    return 'border-gray-300 bg-gray-50';
  };

  const getStatusText = (segment) => {
    if (segment.error) return 'Upload failed';
    if (segment.uploading) return `Uploading... ${segment.progress || 0}%`;
    if (segment.result) return 'Ready';
    return 'Pending';
  };

  if (segments.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Duration Progress Bar */}
      <div className="bg-white border-2 border-indigo-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-gray-900">Recording Progress</h4>
          <span className="text-sm font-bold text-indigo-600">
            {formatTime(totalDuration)} / {formatTime(maxDuration)}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${
              progressPercent >= 100 ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'
            }`}
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-600">
            {segments.length} segment{segments.length > 1 ? 's' : ''}
          </span>
          <span className={`text-xs font-semibold ${remainingTime <= 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {remainingTime > 0 ? `${formatTime(remainingTime)} remaining` : 'Limit reached'}
          </span>
        </div>
      </div>

      {/* Segments List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-900">Your Recordings</h4>
          <span className="text-xs text-gray-500">Drag to reorder</span>
        </div>

        {segments.map((segment, index) => (
          <div
            key={segment.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`border-2 rounded-lg p-3 transition-all cursor-move ${getStatusColor(segment)} ${
              draggedIndex === index ? 'opacity-50 scale-95' : 'hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Drag Handle */}
              <div className="flex flex-col gap-0.5 text-gray-400 cursor-grab active:cursor-grabbing">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="9" cy="5" r="1.5" />
                  <circle cx="9" cy="12" r="1.5" />
                  <circle cx="9" cy="19" r="1.5" />
                  <circle cx="15" cy="5" r="1.5" />
                  <circle cx="15" cy="12" r="1.5" />
                  <circle cx="15" cy="19" r="1.5" />
                </svg>
              </div>

              {/* Icon */}
              <div className="flex-shrink-0">
                {getSegmentIcon(segment.mode)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 text-sm">
                    Segment {index + 1}: {getSegmentLabel(segment.mode)}
                  </span>
                  {segment.result && (
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span>{formatTime(segment.duration || 0)}</span>
                  <span>•</span>
                  <span className="font-medium">{getStatusText(segment)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Preview Button */}
                {segment.blobUrl && (
                  <button
                    onClick={() => {
                      if (playingSegmentId === segment.id) {
                        setPlayingSegmentId(null);
                      } else {
                        setPlayingSegmentId(segment.id);
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                  >
                    {playingSegmentId === segment.id ? 'Close' : 'Preview'}
                  </button>
                )}

                {/* Delete Button */}
                <button
                  onClick={() => onRemoveSegment(segment.id)}
                  className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition"
                  aria-label="Delete segment"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Preview Player */}
            {playingSegmentId === segment.id && segment.blobUrl && (
              <div className="mt-3 pt-3 border-t border-gray-300">
                {segment.mode === 'audio' ? (
                  <audio
                    src={segment.blobUrl}
                    controls
                    className="w-full"
                    autoPlay
                  />
                ) : (
                  <video
                    src={segment.blobUrl}
                    controls
                    className="w-full rounded-lg bg-black max-h-64"
                    playsInline
                    autoPlay
                  />
                )}
              </div>
            )}

            {/* Upload Progress Bar */}
            {segment.uploading && (
              <div className="mt-3 pt-3 border-t border-indigo-200">
                <div className="relative h-1.5 bg-indigo-200 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${segment.progress || 0}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {segment.error && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-xs text-red-600 font-medium">{segment.error}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecordingSegmentList;