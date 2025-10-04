// src/components/dashboard/avatar/AvatarEditor.jsx
import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { createImage, getCroppedImg, getRotatedImage } from './avatarUtils';

function AvatarEditor({ isOpen, onClose, imageSrc, onSave }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState({ horizontal: false, vertical: false });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('AvatarEditor - isOpen changed:', isOpen);
  }, [isOpen]);

  useEffect(() => {
    console.log('AvatarEditor - imageSrc changed:', imageSrc ? 'Image present' : 'No image');
  }, [imageSrc]);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleRotate = (degrees) => {
    setRotation((prev) => (prev + degrees) % 360);
  };

  const handleFlip = (direction) => {
    setFlip((prev) => ({
      ...prev,
      [direction]: !prev[direction]
    }));
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlip({ horizontal: false, vertical: false });
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    
    setIsProcessing(true);
    try {
      // Apply rotation first if needed
      let processedImageSrc = imageSrc;
      if (rotation !== 0) {
        processedImageSrc = await getRotatedImage(imageSrc, rotation);
      }

      // Get cropped image with flip applied
      const croppedImage = await getCroppedImg(
        processedImageSrc,
        croppedAreaPixels,
        rotation,
        flip
      );

      // Call onSave with the processed blob
      await onSave(croppedImage);
      onClose();
    } catch (error) {
      console.error('Error processing avatar:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        // Only close if clicking backdrop, not modal content
        if (e.target === e.currentTarget) {
          console.log('Backdrop clicked, closing modal');
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => {
          e.stopPropagation(); // Prevent clicks inside modal from bubbling to backdrop
        }}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white">
          <h3 className="text-xl font-bold text-gray-900">Edit Avatar</h3>
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Canvas Area */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative bg-gray-900 rounded-xl overflow-hidden" style={{ height: '400px' }}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              {/* Zoom Slider */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Zoom
                </label>
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                  </svg>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </div>
                <div className="text-xs text-gray-500 text-right mt-1">{Math.round(zoom * 100)}%</div>
              </div>
            </div>

            {/* Controls Panel */}
            <div className="space-y-4">
              {/* Transform Tools */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Transform</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleRotate(-90)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm font-semibold text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                    </svg>
                    Rotate ↶
                  </button>
                  <button
                    onClick={() => handleRotate(90)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm font-semibold text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                    </svg>
                    Rotate ↷
                  </button>
                  <button
                    onClick={() => handleFlip('horizontal')}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 border rounded-lg transition text-sm font-semibold ${
                      flip.horizontal 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Flip H
                  </button>
                  <button
                    onClick={() => handleFlip('vertical')}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 border rounded-lg transition text-sm font-semibold ${
                      flip.vertical 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    Flip V
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Preview</h4>
                <div className="flex items-center justify-around py-4">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 mx-auto mb-1"></div>
                    <span className="text-xs text-gray-500">Small</span>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 mx-auto mb-1"></div>
                    <span className="text-xs text-gray-500">Medium</span>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 mx-auto mb-1"></div>
                    <span className="text-xs text-gray-500">Large</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-blue-900 mb-1">Tips</p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Pinch to zoom on mobile</li>
                      <li>• Drag to reposition</li>
                      <li>• Use scroll wheel to zoom</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
          <button
            onClick={handleReset}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition disabled:opacity-50"
          >
            Reset
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-white transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                'Save Avatar'
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}

export default AvatarEditor;