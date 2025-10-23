import React, { useState, useRef } from 'react';
import { TrashIcon } from '../shared/SVGIcons';

function RecordingSegmentList({ segments, onRemove, onRetry, onReorder }) {
  const [playingId, setPlayingId] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  const formatTime = (seconds) => {
    if (!seconds || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = segments
    .filter(s => s.result || s.duration)
    .reduce((sum, s) => sum + ((s.result?.duration || s.duration) || 0), 0);

  const handlePlay = async (segment) => {
    // Can play from blobUrl even if upload isn't complete
    if (!segment.blobUrl) {
      console.warn('No blobUrl available for segment:', segment.id);
      return;
    }

    if (playingId === segment.id) {
      // Pause
      if (audioRef.current) audioRef.current.pause();
      if (videoRef.current) videoRef.current.pause();
      setPlayingId(null);
    } else {
      // Play
      setPlayingId(segment.id);
      
      // Stop any currently playing media
      if (audioRef.current) audioRef.current.pause();
      if (videoRef.current) videoRef.current.pause();
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Update drop target for visual feedback
    if (draggedIndex !== null && draggedIndex !== index) {
      setDropTargetIndex(index);
    }
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDropTargetIndex(index);
    }
  };

  const handleDragLeave = (e) => {
    // Only clear if we're leaving the entire drop zone
    if (e.currentTarget === e.target) {
      setDropTargetIndex(null);
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🎯 Drop event:', { draggedIndex, dropIndex });
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDropTargetIndex(null);
      return;
    }

    // Create new array and reorder
    const newSegments = [...segments];
    const [draggedSegment] = newSegments.splice(draggedIndex, 1);
    newSegments.splice(dropIndex, 0, draggedSegment);
    
    console.log('🔄 Reordered locally, calling onReorder with', newSegments.length, 'segments');
    
    // Call parent's reorder function
    if (onReorder) {
      onReorder(newSegments);
    } else {
      console.error('❌ onReorder is not defined!');
    }
    
    // Clear drag state
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'video':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'audio':
        return (
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        );
      case 'screen':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };



  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-semibold text-indigo-900">
            {segments.length} recording{segments.length > 1 ? 's' : ''} added
          </span>
        </div>
        <span className="text-xs text-indigo-700 font-semibold">
          Total: {formatTime(totalDuration)} / 1:30
        </span>
      </div>

      {segments.length > 1 && (
        <p className="text-xs text-indigo-600 mb-2">💡 Drag to reorder</p>
      )}

      {/* Segment List */}
      <div className="space-y-2">
        {segments.map((segment, index) => {
          const isDragging = draggedIndex === index;
          const isDropTarget = dropTargetIndex === index;
          
          return (
            <div 
              key={segment.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 bg-white rounded-lg p-3 border-2 cursor-move transition-all ${
                isDragging 
                  ? 'opacity-40 scale-95 border-indigo-400' 
                  : isDropTarget
                  ? 'border-indigo-500 bg-indigo-50 scale-105'
                  : 'border-indigo-200 hover:border-indigo-300'
              }`}
            >
              {/* Drag Handle */}
              <div className="flex-shrink-0 text-gray-400 cursor-grab active:cursor-grabbing">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                </svg>
              </div>

              {/* Icon */}
              <div className="flex-shrink-0">
                {getModeIcon(segment.mode)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 capitalize">
                    {segment.mode} {index + 1}
                  </span>
                  {(segment.result || segment.duration) && (
                    <span className="text-xs text-gray-600">
                      ({formatTime(segment.result?.duration || segment.duration)})
                    </span>
                  )}
                </div>
                
                {segment.uploading && (
                  <div className="mt-1">
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 transition-all duration-300"
                        style={{ width: `${segment.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-indigo-600 mt-0.5">Uploading {segment.progress}%...</p>
                  </div>
                )}
                
                {segment.error && (
                  <p className="text-xs text-red-600 mt-1">{segment.error}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Play Button - Show immediately when blobUrl exists */}
                {segment.blobUrl ? (
                  <button
                    onClick={() => handlePlay(segment)}
                    className="p-2 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition touch-manipulation"
                    title={playingId === segment.id ? "Pause" : "Play"}
                  >
                    {playingId === segment.id ? (
                      <PauseIcon className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <PlayIcon className="w-4 h-4 text-indigo-600" />
                    )}
                  </button>
                ) : (
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}

                {/* Retry Button (only if error) */}
                {segment.error && onRetry && (
                  <button
                    onClick={() => onRetry(segment.id)}
                    className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 font-semibold"
                  >
                    Retry
                  </button>
                )}

                {/* Delete Button */}
                <button
                  onClick={() => onRemove(segment.id)}
                  className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition touch-manipulation"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audio/Video Player - USE BLOB URL */}
      {playingId && segments.find(s => s.id === playingId)?.blobUrl && (
        <div className="mt-3">
          {segments.find(s => s.id === playingId)?.mode === 'audio' ? (
            <audio
              ref={audioRef}
              src={segments.find(s => s.id === playingId)?.blobUrl}
              autoPlay
              onEnded={() => setPlayingId(null)}
              controls
              className="w-full"
            />
          ) : (
            <video
              ref={videoRef}
              src={segments.find(s => s.id === playingId)?.blobUrl}
              autoPlay
              onEnded={() => setPlayingId(null)}
              controls
              className="w-full rounded-lg"
            />
          )}
        </div>
      )}
    </div>
  );
}

// Icon components (local to this file)
function PlayIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

export default RecordingSegmentList;