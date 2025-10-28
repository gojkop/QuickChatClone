// src/pages/AnswerReviewPage.jsx - Complete with Feedback Submission & Display
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import JSZip from 'jszip';
import logo from '@/assets/images/logo-mindpick.svg';
import MediaSegmentCard from '@/components/dashboardv2/inbox/MediaSegmentCard';
import MediaPlayerModal from '@/components/dashboardv2/inbox/MediaPlayerModal';

const XANO_BASE_URL = import.meta.env.VITE_XANO_BASE_URL || 'https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L';

// Helper function to format time remaining for offers
const formatOfferTimeRemaining = (expiresAt) => {
  if (!expiresAt) return null;

  const now = Date.now();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

function AnswerReviewPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [allowTestimonial, setAllowTestimonial] = useState(false);
  const [showPrivacyReminder, setShowPrivacyReminder] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [playingSegmentIndex, setPlayingSegmentIndex] = useState(null);
  const [playingAnswerSegmentIndex, setPlayingAnswerSegmentIndex] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('🔍 Fetching data for token:', token);
        const response = await fetch(`${XANO_BASE_URL}/review/${token}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('This link is invalid or has expired.');
          }
          throw new Error('Failed to load answer.');
        }

        const rawData = await response.json();
        console.log('📦 Raw API response:', rawData);
        
        // Check if rawData has the required fields
        if (!rawData || !rawData.id) {
          throw new Error('Invalid response data.');
        }
        
        const transformedData = {
          id: rawData.id,
          title: rawData.title,
          text: rawData.text,
          created_at: rawData.created_at,
          price_cents: rawData.price_cents,
          currency: rawData.currency,
          status: rawData.status,
          pricing_status: rawData.pricing_status || null,
          decline_reason: rawData.decline_reason || null,
          offer_expires_at: rawData.offer_expires_at || null,
          sla_hours_snapshot: rawData.sla_hours_snapshot,
          attachments: (() => {
            try {
              if (rawData.attachments && rawData.attachments.trim()) {
                return JSON.parse(rawData.attachments);
              }
            } catch (e) {
              console.warn('Failed to parse question attachments:', e);
            }
            return [];
          })(),
          // Extract segments from metadata for multi-segment recordings (same as answer logic)
          media_assets: (() => {
            if (!rawData.media_asset || rawData.media_asset.length === 0) {
              return [];
            }

            const mainAsset = rawData.media_asset[0];

            // Parse metadata if it's a JSON string
            let metadata = mainAsset.metadata;
            if (typeof metadata === 'string') {
              try {
                metadata = JSON.parse(metadata);
              } catch (e) {
                console.warn('Failed to parse question media metadata:', e);
                metadata = {};
              }
            }

            // Check if this is a multi-segment recording
            if (metadata?.type === 'multi-segment' && metadata?.segments) {
              return metadata.segments.map(segment => ({
                id: segment.uid,
                url: segment.playback_url,
                duration_sec: segment.duration,
                segment_index: segment.segment_index,
                metadata: {
                  mode: segment.mode
                }
              }));
            }

            // Otherwise return the main asset as a single item
            return [{
              id: mainAsset.id,
              url: mainAsset.url,
              duration_sec: mainAsset.duration_sec,
              segment_index: 0,
              metadata: metadata
            }];
          })(),
          // Answer is an object, not an array - extract segments from metadata
          // IMPORTANT: answer might be null/undefined when no answer exists yet
          answer: (rawData.answer && typeof rawData.answer === 'object' && rawData.answer.id) ? {
            id: rawData.answer.id,
            created_at: rawData.answer.created_at,
            sent_at: rawData.answer.sent_at,
            text: rawData.answer.text_response || '',
            // Extract segments from metadata.segments if they exist
            media_assets: (() => {
              if (!rawData.media_asset_answer || rawData.media_asset_answer.length === 0) {
                return [];
              }

              const mainAsset = rawData.media_asset_answer[0];

              // Parse metadata if it's a JSON string
              let metadata = mainAsset.metadata;
              if (typeof metadata === 'string') {
                try {
                  metadata = JSON.parse(metadata);
                } catch (e) {
                  console.warn('Failed to parse answer media metadata:', e);
                  metadata = {};
                }
              }

              // Check if this is a multi-segment recording
              if (metadata?.type === 'multi-segment' && metadata?.segments) {
                return metadata.segments.map(segment => ({
                  id: segment.uid,
                  url: segment.playback_url,
                  duration_sec: segment.duration,
                  segment_index: segment.segment_index,
                  metadata: {
                    mode: segment.mode
                  }
                }));
              }

              // Otherwise return the main asset as a single item
              return [{
                id: mainAsset.id,
                url: mainAsset.url,
                duration_sec: mainAsset.duration_sec,
                segment_index: 0,
                metadata: metadata
              }];
            })(),
            // Parse attachments if they exist (could be on answer object or empty)
            attachments: (() => {
              try {
                if (rawData.answer.attachments && rawData.answer.attachments.trim()) {
                  return JSON.parse(rawData.answer.attachments);
                }
              } catch (e) {
                console.warn('Failed to parse answer attachments:', e);
              }
              return [];
            })()
          } : null,
          expert_profile: {
            ...rawData.expert_profile,
            handle: rawData.expert_profile?.handle,
            user: {
              name: rawData.user || rawData.expert_profile?.professional_title || 'Expert'
            }
          }
        };
        
        // Check if feedback already exists (answer is an object, not an array)
        if (transformedData.answer && rawData.answer && rawData.answer.rating && rawData.answer.rating > 0) {
          setExistingFeedback({
            rating: rawData.answer.rating,
            feedback_text: rawData.answer.feedback_text || '',
            allow_testimonial: rawData.answer.allow_testimonial || false,
            created_at: rawData.answer.feedback_at || rawData.answer.created_at
          });
          setHasSubmittedFeedback(true);
          console.log('✅ Existing feedback found:', rawData.answer.rating);
        }
        
        console.log('✅ Transformed data:', transformedData);
        console.log('🎥 Question media details:', {
          rawMediaAsset: rawData.media_asset?.[0],
          transformedMediaAssets: transformedData.media_assets,
          mediaCount: transformedData.media_assets?.length || 0,
          isMultiSegment: rawData.media_asset?.[0]?.metadata?.type === 'multi-segment',
          segmentCount: rawData.media_asset?.[0]?.metadata?.segment_count
        });
        console.log('📎 Question attachments details:', {
          rawAttachments: rawData.attachments,
          transformedAttachments: transformedData.attachments,
          attachmentCount: transformedData.attachments?.length || 0
        });
        console.log('🎥 Answer details:', {
          hasAnswer: !!transformedData.answer,
          answerExists: !!(rawData.answer && rawData.answer.id),
          mediaAssets: transformedData.answer?.media_assets,
          mediaCount: transformedData.answer?.media_assets?.length || 0,
          attachments: transformedData.answer?.attachments,
          attachmentCount: transformedData.answer?.attachments?.length || 0,
          text: transformedData.answer?.text,
          rawMediaAssetAnswer: rawData.media_asset_answer?.[0]?.metadata?.segments
        });
        console.log('🔗 Expert handle:', transformedData.expert_profile?.handle);
        setData(transformedData);

        // Auto-expand question section if there are attachments or media
        if ((transformedData.media_assets?.length > 0) || (transformedData.attachments?.length > 0)) {
          setShowQuestion(true);
          console.log('✅ Auto-expanding question section (has media or attachments)');
        }

      } catch (err) {
        console.error('❌ Error fetching review data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (token) {
      fetchData();
    }
  }, [token]);

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      const response = await fetch(`${XANO_BASE_URL}/review/${token}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          feedback_text: feedback.trim(),
          allow_testimonial: allowTestimonial
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      // Set the newly submitted feedback
      setExistingFeedback({
        rating,
        feedback_text: feedback.trim(),
        allow_testimonial: allowTestimonial,
        created_at: new Date().toISOString()
      });
      setHasSubmittedFeedback(true);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  // Reusable function to download as ZIP
  const downloadAsZip = async (mediaAssets, attachments, zipFileName) => {
    setIsDownloading(true);

    try {
      const zip = new JSZip();
      const downloads = [];

      console.log(`📦 Creating ${zipFileName}...`);

      // Process media assets (videos and audio)
      if (mediaAssets && mediaAssets.length > 0) {
        mediaAssets.forEach((asset, index) => {
          if (asset.url) {
            const isVideo = asset.metadata?.mode === 'video' ||
                            asset.metadata?.mode === 'screen' ||
                            asset.metadata?.mode === 'screen-camera' ||
                            asset.url?.includes('cloudflarestream.com');

            const isAudio = asset.metadata?.mode === 'audio' ||
                            (!isVideo && (asset.url?.includes('.webm') || asset.url?.includes('.mp3') || asset.url?.includes('.wav')));

            let downloadUrl = asset.url;
            let fileName;

            // For Cloudflare Stream videos, proxy through backend to avoid CORS
            if (isVideo && asset.url.includes('cloudflarestream.com')) {
              const videoId = getStreamVideoId(asset.url);
              if (videoId) {
                const streamDownloadUrl = `https://${CUSTOMER_CODE_OVERRIDE}.cloudflarestream.com/${videoId}/downloads/default.mp4`;
                downloadUrl = `/api/media/download-video?url=${encodeURIComponent(streamDownloadUrl)}`;
                fileName = `part-${index + 1}-${asset.metadata?.mode || 'video'}.mp4`;
              }
            } else if (isAudio) {
              // Audio files - proxy through backend
              downloadUrl = `/api/media/download-audio?url=${encodeURIComponent(asset.url)}`;

              let extension = 'webm';
              if (asset.url.includes('.mp3')) extension = 'mp3';
              else if (asset.url.includes('.wav')) extension = 'wav';

              fileName = `part-${index + 1}-audio.${extension}`;
            } else {
              fileName = `part-${index + 1}-${asset.metadata?.mode || 'media'}.${isVideo ? 'mp4' : 'webm'}`;
            }

            if (downloadUrl && fileName) {
              downloads.push({ url: downloadUrl, name: fileName });
            }
          }
        });
      }

      // Add attachments
      if (attachments && attachments.length > 0) {
        attachments.forEach((file) => {
          downloads.push({ url: file.url, name: file.name || `attachment-${downloads.length + 1}` });
        });
      }

      if (downloads.length === 0) {
        alert('No files to download');
        setIsDownloading(false);
        return;
      }

      console.log(`📥 Downloading ${downloads.length} files...`);

      // Download all files and add to ZIP
      for (let i = 0; i < downloads.length; i++) {
        const item = downloads[i];
        console.log(`[${i + 1}/${downloads.length}] Downloading: ${item.name}`);

        try {
          const response = await fetch(item.url);
          if (!response.ok) {
            console.error(`❌ Failed to download ${item.name}: ${response.status}`);
            continue;
          }

          const blob = await response.blob();
          zip.file(item.name, blob);
          console.log(`✅ Added to ZIP: ${item.name}`);
        } catch (error) {
          console.error(`❌ Error downloading ${item.name}:`, error);
        }
      }

      // Generate ZIP file
      console.log('🗜️ Generating ZIP file...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Download ZIP
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = zipFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      console.log(`✅ ${zipFileName} downloaded successfully!`);
    } catch (error) {
      console.error('❌ Error creating ZIP:', error);
      alert('Failed to download files. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Download answer as ZIP
  const handleDownloadAnswer = async () => {
    if (!data?.answer) return;
    await downloadAsZip(
      data.answer.media_assets,
      data.answer.attachments,
      `answer-${data.id}.zip`
    );
  };

  // Download question as ZIP
  const handleDownloadQuestion = async () => {
    if (!data) return;
    await downloadAsZip(
      data.media_assets,
      data.attachments,
      `question-${data.id}.zip`
    );
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) return 'just now';
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)} minutes ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)} hours ago`;
    if (diffSecs < 604800) return `${Math.floor(diffSecs / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getDeliveryTime = () => {
    if (!data?.answer?.created_at || !data?.created_at) return '';
    const asked = new Date(data.created_at);
    const answered = new Date(data.answer.created_at);
    const diffHours = Math.floor((answered - asked) / (1000 * 60 * 60));
    if (diffHours < 1) return 'under 1h';
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  const getStreamVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/cloudflarestream\.com\/([a-zA-Z0-9]+)\//);
    return match ? match[1] : null;
  };

  const getCustomerCode = (url) => {
    if (!url) return null;
    const match = url.match(/https:\/\/(customer-[a-zA-Z0-9]+)\.cloudflarestream\.com/);
    return match ? match[1] : null;
  };

  const CUSTOMER_CODE_OVERRIDE = 'customer-o9wvts8h9krvlboh';

  // Helper to render attachment preview based on MIME type
  const renderAttachmentPreview = (file) => {
    const type = file.type || '';
    const url = file.url || '';
    const name = file.name || 'Attachment';

    // Check if this is a video file (by MIME type OR file extension)
    const isVideo = type.startsWith('video/') ||
                    name.toLowerCase().match(/\.(mp4|mov|webm|avi|mkv|m4v)$/);

    console.log('🎬 [renderAttachmentPreview] Processing attachment:', {
      name,
      type,
      url: url.substring(0, 50) + '...',
      isVideo,
      hasR2URL: url.includes('r2.dev') || url.includes('r2.cloudflarestorage.com')
    });

    // Video files - proxy through backend to handle large files and CORS
    if (isVideo) {
      // For R2-hosted videos, proxy through backend
      const proxyUrl = url.includes('r2.dev') || url.includes('r2.cloudflarestorage.com')
        ? `/api/media/download-attachment?url=${encodeURIComponent(url)}`
        : url;

      console.log('🎥 [renderAttachmentPreview] Video detected - using proxy:', {
        originalUrl: url.substring(0, 50) + '...',
        proxyUrl: proxyUrl.substring(0, 80) + '...'
      });

      // Determine proper MIME type for video tag
      let videoType = type;
      if (!videoType || videoType === 'application/octet-stream') {
        if (name.toLowerCase().endsWith('.mp4')) videoType = 'video/mp4';
        else if (name.toLowerCase().endsWith('.mov')) videoType = 'video/quicktime';
        else if (name.toLowerCase().endsWith('.webm')) videoType = 'video/webm';
        else if (name.toLowerCase().endsWith('.avi')) videoType = 'video/x-msvideo';
        else videoType = 'video/mp4'; // fallback
      }

      return (
        <div className="mt-2 rounded-lg overflow-hidden border border-gray-300 bg-black">
          <video
            controls
            className="w-full"
            src={proxyUrl}
            type={videoType}
            preload="none"
            crossOrigin="anonymous"
            style={{ maxHeight: '300px' }}
            onError={(e) => {
              console.error('❌ Video load error:', {
                error: e.target.error,
                code: e.target.error?.code,
                message: e.target.error?.message,
                src: e.target.src,
                currentSrc: e.target.currentSrc
              });
            }}
            onLoadStart={() => console.log('📹 Video load started:', proxyUrl)}
            onLoadedMetadata={() => console.log('✅ Video metadata loaded')}
            onCanPlay={() => console.log('✅ Video can play')}
          >
            Your browser does not support video playback.
          </video>
        </div>
      );
    }

    // Audio files
    if (type.startsWith('audio/')) {
      return (
        <div className="mt-2 p-3 bg-gray-900 rounded-lg">
          <audio controls className="w-full" preload="metadata">
            <source src={url} type={type} />
            Your browser does not support audio playback.
          </audio>
        </div>
      );
    }

    // Image files
    if (type.startsWith('image/')) {
      return (
        <div className="mt-2 rounded-lg overflow-hidden border border-gray-300">
          <img
            src={url}
            alt={name}
            className="w-full h-auto object-contain"
            style={{ maxHeight: '400px' }}
          />
        </div>
      );
    }

    // PDF files - embedded viewer
    if (type === 'application/pdf' || name.toLowerCase().endsWith('.pdf')) {
      return (
        <div className="mt-2 rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
          <iframe
            src={url}
            className="w-full"
            style={{ height: '500px' }}
            title={name}
          />
        </div>
      );
    }

    // Other files - no inline preview
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-gray-600">Loading your answer...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Link Not Found</h2>
          <p className="text-sm text-gray-600 mb-6">{error || 'This link is invalid or has expired.'}</p>
          <a 
            href="/"
            className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  const hasAnswer = data?.answer && (
    (data.answer.media_assets && data.answer.media_assets.length > 0) ||
    (data.answer.text && data.answer.text.trim().length > 0)
  );
  const expertName = data.expert_profile?.user?.name || 'Expert';
  const expertAvatar = data.expert_profile?.avatar_url;
  const expertHandle = data.expert_profile?.handle;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Header with Logo */}
      <header className="bg-white/95 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center group">
              <img
                src={logo}
                alt="mindPick"
                className="h-8 w-auto transition-transform duration-200 group-hover:scale-105"
              />
            </a>
            
            {hasAnswer && getDeliveryTime() && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs font-semibold text-green-700">
                  Delivered in {getDeliveryTime()}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl pb-24">
        
        {/* Expert Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 mb-6">
          <div className="flex items-start gap-4">
            {/* Clickable Avatar */}
            {expertHandle ? (
              <a
                href={`/u/${expertHandle}`}
                className="relative flex-shrink-0 group"
                title="View expert profile"
              >
                {expertAvatar && !avatarError ? (
                  <img
                    src={expertAvatar}
                    alt={expertName}
                    onError={() => setAvatarError(true)}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover ring-2 ring-indigo-100 group-hover:ring-indigo-300 transition-all cursor-pointer"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center ring-2 ring-indigo-100 group-hover:ring-indigo-300 transition-all cursor-pointer">
                    <span className="text-2xl sm:text-3xl font-bold text-white">
                      {expertName.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </a>
            ) : (
              <div className="relative flex-shrink-0">
                {expertAvatar && !avatarError ? (
                  <img
                    src={expertAvatar}
                    alt={expertName}
                    onError={() => setAvatarError(true)}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover ring-2 ring-indigo-100"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center ring-2 ring-indigo-100">
                    <span className="text-2xl sm:text-3xl font-bold text-white">
                      {expertName.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
            
            {/* Expert Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                  Answer from
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-0.5 truncate">{expertName}</h2>
              <p className="text-sm text-gray-600 truncate">{data.expert_profile?.professional_title || 'Expert'}</p>
            </div>
            
            {/* Action Button */}
            {expertHandle && (
              <a
                href={`/u/${expertHandle}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 border border-indigo-600 hover:border-indigo-700 transition-all shadow-sm hover:shadow-md flex-shrink-0"
                title="View expert profile or ask another question"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="whitespace-nowrap">View Profile</span>
              </a>
            )}
          </div>
        </div>

        {/* Declined Offer Message */}
        {data.pricing_status === 'offer_declined' && (
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-sm border-2 border-red-200 p-6 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Offer Declined</h3>
              <p className="text-gray-700 mb-4">
                {data.decline_reason || 'Your offer was below the expert\'s minimum threshold.'}
              </p>
              <div className="bg-white/60 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-gray-600">
                  The expert has set a minimum price for Deep Dive questions. Your offer did not meet this requirement, so it was automatically declined.
                </p>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={expertHandle ? `/u/${expertHandle}` : '/'}
                  className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Expert Profile
                </a>
                <a
                  href="/"
                  className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-2.5 rounded-lg font-semibold text-sm border-2 border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Go to Homepage
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Answer Section - Only show if question is not declined */}
        {hasAnswer ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-100 px-5 sm:px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900 font-bold text-base">Your Answer</h3>
                  {data.answer?.media_assets?.length > 0 && (
                    <p className="text-gray-600 text-xs sm:text-sm">
                      {data.answer.media_assets.length} {data.answer.media_assets.length === 1 ? 'media file' : 'media files'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Text Response */}
              {data.answer?.text && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <p className="text-sm sm:text-base text-gray-800 whitespace-pre-wrap">{data.answer.text}</p>
                </div>
              )}

              {/* Media Segments */}
              {data.answer?.media_assets && data.answer.media_assets.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Answer Media {data.answer.media_assets.length > 1 ? `(${data.answer.media_assets.length} segments)` : ''}
                  </p>
                  {data.answer.media_assets
                    .sort((a, b) => (a.segment_index || 0) - (b.segment_index || 0))
                    .map((segment, index) => (
                      <MediaSegmentCard
                        key={segment.id || index}
                        segment={segment}
                        index={index}
                        onPlay={() => setPlayingAnswerSegmentIndex(index)}
                      />
                    ))}
                </div>
              )}

              {/* Attachments */}
              {data.answer?.attachments && data.answer.attachments.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Attachments</p>
                  {data.answer.attachments.map((file, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 text-sm hover:bg-gray-100 transition-all group"
                      >
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="flex-1 text-gray-700 text-xs sm:text-sm truncate font-medium">{file.name}</span>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      {renderAttachmentPreview(file)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showPrivacyReminder && (
              <div className="mx-5 sm:mx-6 mb-5 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-amber-900 font-medium mb-1">
                      Content Usage Notice
                    </p>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      This answer is for your personal/internal business use. Public sharing or redistribution requires expert permission. See our{' '}
                      <a href="/terms" className="underline hover:text-amber-900 font-medium">Terms of Service</a>.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowPrivacyReminder(false)}
                    className="text-amber-600 hover:text-amber-700 flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div className="px-5 sm:px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={handleDownloadAnswer}
                disabled={isDownloading}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium hover:bg-gray-100 px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    <span>Creating ZIP...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download All (ZIP)
                    {data.answer?.media_assets?.length > 0 || data.answer?.attachments?.length > 0 ? (
                      <span className="ml-1 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                        {(data.answer.media_assets?.length || 0) + (data.answer.attachments?.length || 0)}
                      </span>
                    ) : null}
                  </>
                )}
              </button>
              <span className="text-xs text-gray-500">For personal use only</span>
            </div>
          </div>
        ) : data.pricing_status === 'offer_pending' ? (
          // Pending offer: Expert is reviewing
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Awaiting Expert Review</h3>
              <p className="text-sm text-gray-600 mb-3">
                {expertName} is reviewing your Deep Dive offer.
              </p>
              {data.offer_expires_at && formatOfferTimeRemaining(data.offer_expires_at) && (
                <p className="text-sm text-gray-500">
                  Expert will respond within <span className="font-semibold text-purple-600">{formatOfferTimeRemaining(data.offer_expires_at)}</span>
                </p>
              )}
              <div className="mt-4 bg-purple-50 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-xs text-gray-600">
                  You'll receive an email notification once the expert accepts or declines your offer.
                </p>
              </div>
            </div>
          </div>
        ) : data.pricing_status !== 'offer_declined' ? (
          // Answer in progress: Expert is working on answer
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Answer In Progress</h3>
              <p className="text-sm text-gray-600 mb-3">
                {expertName} is working on your answer.
              </p>
              {data.sla_hours_snapshot && (
                <p className="text-sm text-gray-500">
                  Expected within <span className="font-semibold text-indigo-600">{data.sla_hours_snapshot}h</span>
                </p>
              )}
            </div>
          </div>
        ) : null}

        {/* Question Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <button
            onClick={() => setShowQuestion(!showQuestion)}
            className="w-full bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200 px-5 sm:px-6 py-4 flex items-center justify-between hover:from-gray-100 hover:to-slate-100 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-200 rounded-lg flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                {data.media_assets?.[0] ? (
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              
              <div className="text-left">
                <h3 className="text-gray-900 font-bold text-base">Your Question</h3>
                {!showQuestion && data.title && (
                  <p className="text-gray-600 text-xs sm:text-sm line-clamp-1 mt-0.5">{data.title}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!showQuestion && (data.media_assets?.length > 0 || data.attachments?.length > 0) && (
                <span className="text-xs text-gray-600 bg-gray-200 px-2.5 py-1 rounded-full font-medium hidden sm:inline">
                  {(data.media_assets?.length || 0) + (data.attachments?.length || 0)} {((data.media_assets?.length || 0) + (data.attachments?.length || 0)) === 1 ? 'item' : 'items'}
                </span>
              )}
              <svg 
                className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${showQuestion ? 'rotate-180' : ''} group-hover:text-gray-700`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          <div className={`transition-all duration-300 ease-in-out ${showQuestion ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="p-5 space-y-4">
              {data.title && (
                <div>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">{data.title}</p>
                </div>
              )}
              
              {data.text && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{data.text}</p>
                </div>
              )}

              {/* Question Media and Attachments */}
              {data.media_assets && data.media_assets.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Media Segments {data.media_assets.length > 1 ? `(${data.media_assets.length} segments)` : ''}
                  </p>
                  {data.media_assets
                    .sort((a, b) => (a.segment_index || 0) - (b.segment_index || 0))
                    .map((segment, index) => (
                      <MediaSegmentCard
                        key={segment.id || index}
                        segment={segment}
                        index={index}
                        onPlay={() => setPlayingSegmentIndex(index)}
                      />
                    ))}
                </div>
              )}

              {/* File Attachments */}
              {data.attachments && data.attachments.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Question Attachments ({data.attachments.length})</p>
                  {data.attachments.map((file, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 text-sm hover:bg-gray-100 transition-all group"
                      >
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="flex-1 text-gray-700 text-xs sm:text-sm truncate font-medium">{file.name}</span>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      {renderAttachmentPreview(file)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Download button for question */}
            {(data.media_assets?.length > 0 || data.attachments?.length > 0) && (
              <div className="px-5 sm:px-6 py-3.5 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={handleDownloadQuestion}
                  disabled={isDownloading}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium hover:bg-gray-100 px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                      <span>Creating ZIP...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download All (ZIP)
                      <span className="ml-1 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                        {(data.media_assets?.length || 0) + (data.attachments?.length || 0)}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Section - Show existing feedback OR allow new submission */}
        {hasAnswer && existingFeedback ? (
          // Display existing feedback (read-only)
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-5 sm:p-6 mb-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Your Feedback</h3>
              <p className="text-sm text-gray-600">
                Submitted {existingFeedback.created_at && getTimeAgo(existingFeedback.created_at)}
              </p>
            </div>
            
            {/* Display stars (read-only) */}
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-8 h-8 ${
                    star <= existingFeedback.rating
                      ? 'text-amber-400 fill-current'
                      : 'text-gray-300'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              ))}
            </div>

            {/* Display feedback text if provided */}
            {existingFeedback.feedback_text && (
              <div className="bg-white rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {existingFeedback.feedback_text}
                </p>
                {existingFeedback.allow_testimonial && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Allowed as testimonial</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <p className="text-center text-sm text-gray-600">
              Thank you for your feedback! 🙏
            </p>
          </div>
        ) : hasAnswer && !hasSubmittedFeedback ? (
          // Show feedback submission form
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-sm border border-amber-200 p-5 sm:p-6 mb-6">
            <div className="text-center mb-5">
              <h3 className="text-lg font-bold text-gray-900 mb-1">How was your answer?</h3>
              <p className="text-sm text-gray-600">Your feedback helps {expertName} improve</p>
            </div>
            
            <div className="flex justify-center gap-2 sm:gap-3 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-all hover:scale-110 active:scale-95 p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <svg
                    className={`w-9 h-9 sm:w-10 sm:h-10 transition-all ${
                      star <= (hoverRating || rating)
                        ? 'text-amber-400 fill-current drop-shadow-md'
                        : 'text-gray-300 hover:text-amber-200'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </button>
              ))}
            </div>

            {rating > 0 && (
              <div className="bg-white rounded-xl p-4 sm:p-5 mb-4 animate-fadeIn">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  {rating === 5 && '⭐ Amazing! Mind sharing what made it great?'}
                  {rating === 4 && '😊 Great! What did you like most?'}
                  {rating === 3 && '👍 Good. How could it be better?'}
                  {rating === 2 && '😐 How can we improve?'}
                  {rating === 1 && '😞 Sorry to hear. How can we improve?'}
                </p>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows="4"
                  maxLength="500"
                  className="w-full px-4 py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-300 focus:border-amber-400 focus:outline-none transition-all resize-none"
                  placeholder={rating >= 4
                    ? "This testimonial might appear on mindPick (optional)"
                    : "Help us understand how to improve..."
                  }
                />
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-xs text-gray-500">{feedback.length}/500</span>
                  {rating >= 4 && feedback.length > 20 && (
                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={allowTestimonial}
                        onChange={(e) => setAllowTestimonial(e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                      />
                      <span className="font-medium">OK to use as testimonial</span>
                    </label>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleSubmitFeedback}
              disabled={rating === 0}
              className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-base font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-amber-500 disabled:hover:to-orange-500 disabled:active:scale-100 min-h-[44px]"
            >
              {rating === 0 ? 'Select a rating to continue' : 'Submit Feedback'}
            </button>
          </div>
        ) : null}

        {/* CTA Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-6 text-center">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-indigo-50 rounded-full mb-3">
              <div className="flex -space-x-1">
                {[1,2,3].map(i => (
                  <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-500 border-2 border-white"></div>
                ))}
              </div>
              <span className="text-xs font-semibold text-indigo-700">Join expert community</span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Become an Expert
            </h3>
            <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
              Monetize your expertise — set your price and answer on your schedule
            </p>

            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-5 text-xs">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
                <span className="text-gray-700">Free to start</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
                <span className="text-gray-700">Set your own price</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
                <span className="text-gray-700">Secure payouts</span>
              </div>
            </div>

            <a
              href="/?ref=answer_page"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold px-6 py-2.5 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <span>Get Started Free</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <a href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors group">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Powered by <span className="font-semibold">mindPick</span></span>
            <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>

      {/* Media Player Modals */}
      {playingSegmentIndex !== null && data?.media_assets && (
        <MediaPlayerModal
          segment={data.media_assets[playingSegmentIndex]}
          segments={data.media_assets}
          currentIndex={playingSegmentIndex}
          onClose={() => setPlayingSegmentIndex(null)}
          onNavigate={(direction) => {
            const newIndex = playingSegmentIndex + direction;
            if (newIndex >= 0 && newIndex < data.media_assets.length) {
              setPlayingSegmentIndex(newIndex);
            }
          }}
        />
      )}

      {playingAnswerSegmentIndex !== null && data?.answer?.media_assets && (
        <MediaPlayerModal
          segment={data.answer.media_assets[playingAnswerSegmentIndex]}
          segments={data.answer.media_assets}
          currentIndex={playingAnswerSegmentIndex}
          onClose={() => setPlayingAnswerSegmentIndex(null)}
          onNavigate={(direction) => {
            const newIndex = playingAnswerSegmentIndex + direction;
            if (newIndex >= 0 && newIndex < data.answer.media_assets.length) {
              setPlayingAnswerSegmentIndex(newIndex);
            }
          }}
        />
      )}
    </div>
  );
}

export default AnswerReviewPage;