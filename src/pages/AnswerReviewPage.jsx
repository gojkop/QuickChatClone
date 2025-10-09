// src/pages/AnswerReviewPage.jsx - Complete with Feedback Submission & Display
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import logo from '@/assets/images/logo.svg';

const XANO_BASE_URL = import.meta.env.VITE_XANO_BASE_URL || 'https://x8ki-letl-twmt.n7.xano.io/api:BQW1GS7L';

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
          media_assets: rawData.media_asset || [],
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
              
              // Check if this is a multi-segment recording
              if (mainAsset.metadata?.type === 'multi-segment' && mainAsset.metadata?.segments) {
                return mainAsset.metadata.segments.map(segment => ({
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
                metadata: mainAsset.metadata
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

  const handleDownloadAll = async () => {
    if (!data?.answer) return;
    
    const downloads = [];
    
    // Add all media assets
    if (data.answer.media_assets && data.answer.media_assets.length > 0) {
      data.answer.media_assets.forEach((asset, index) => {
        if (asset.url) {
          const fileName = `answer-part-${index + 1}-${asset.metadata?.mode || 'media'}.${asset.url.includes('.webm') ? 'webm' : 'mp4'}`;
          downloads.push({ url: asset.url, name: fileName });
        }
      });
    }
    
    // Add all attachments
    if (data.answer.attachments && data.answer.attachments.length > 0) {
      data.answer.attachments.forEach((file) => {
        downloads.push({ url: file.url, name: file.name });
      });
    }
    
    if (downloads.length === 0) {
      alert('No files to download');
      return;
    }
    
    // Download each file with a small delay to avoid browser blocking
    for (let i = 0; i < downloads.length; i++) {
      const item = downloads[i];
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = item.url;
        link.download = item.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, i * 300); // 300ms delay between downloads
    }
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
                alt="QuickChat" 
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
                {expertAvatar ? (
                  <img 
                    src={expertAvatar} 
                    alt={expertName}
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
                {expertAvatar ? (
                  <img 
                    src={expertAvatar} 
                    alt={expertName}
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
            
            {/* Action Buttons */}
            {expertHandle && (
              <div className="flex flex-col gap-2 flex-shrink-0">
                <a
                  href={`/ask?expert=${expertHandle}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-indigo-200 hover:border-indigo-300 transition-all"
                  title="Ask another question"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="hidden sm:inline whitespace-nowrap">Ask Another</span>
                  <span className="sm:hidden">Ask</span>
                </a>
                <a
                  href={`/u/${expertHandle}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50 border border-gray-200 hover:border-indigo-200 transition-all"
                  title="View expert profile"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden sm:inline whitespace-nowrap">View Profile</span>
                  <span className="sm:hidden">Profile</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Answer Section */}
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
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{data.answer.text}</p>
                </div>
              )}

              {/* Media Assets */}
              {data.answer?.media_assets && data.answer.media_assets.length > 0 && (
                <div className="space-y-3">
                  {data.answer.media_assets
                    .sort((a, b) => (a.segment_index || 0) - (b.segment_index || 0))
                    .map((segment, arrayIndex) => {
                      const isVideo = segment.metadata?.mode === 'video' || 
                                      segment.metadata?.mode === 'screen' || 
                                      segment.metadata?.mode === 'screen-camera' ||
                                      segment.url?.includes('cloudflarestream.com');
                      const isAudio = segment.metadata?.mode === 'audio' || 
                                      segment.url?.includes('.webm') || 
                                      !isVideo;
                      
                      const videoId = isVideo ? getStreamVideoId(segment.url) : null;
                      const extractedCustomerCode = isVideo ? getCustomerCode(segment.url) : null;
                      const customerCode = CUSTOMER_CODE_OVERRIDE || extractedCustomerCode;
                      
                      return (
                        <div key={segment.id} className="bg-gray-900 rounded-xl overflow-hidden">
                          {data.answer.media_assets.length > 1 && (
                            <div className="px-4 py-2.5 bg-gray-800 flex items-center justify-between">
                              <span className="text-xs font-semibold text-gray-300">
                                Part {arrayIndex + 1}
                              </span>
                              <span className="text-xs text-gray-400">
                                {isVideo ? '🎥' : '🎤'} {segment.duration_sec}s
                              </span>
                            </div>
                          )}
                          
                          {isVideo && videoId && customerCode ? (
                            <div className="w-full aspect-video bg-black">
                              <iframe
                                src={`https://${customerCode}.cloudflarestream.com/${videoId}/iframe`}
                                style={{ border: 'none', width: '100%', height: '100%' }}
                                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                allowFullScreen={true}
                                title={`Answer video ${arrayIndex + 1}`}
                              />
                            </div>
                          ) : isAudio && segment.url ? (
                            <div className="p-4 flex items-center justify-center">
                              <audio controls className="w-full max-w-md" preload="metadata">
                                <source src={segment.url} type="audio/webm" />
                              </audio>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Attachments */}
              {data.answer?.attachments && data.answer.attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Attachments</p>
                  {data.answer.attachments.map((file, index) => (
                    <a
                      key={index}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all group"
                    >
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="flex-1 text-gray-700 text-xs sm:text-sm truncate font-medium">{file.name}</span>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
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
                onClick={handleDownloadAll}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium hover:bg-gray-100 px-3 py-2 rounded-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download All
                {data.answer?.media_assets?.length > 0 || data.answer?.attachments?.length > 0 ? (
                  <span className="ml-1 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                    {(data.answer.media_assets?.length || 0) + (data.answer.attachments?.length || 0)}
                  </span>
                ) : null}
              </button>
              <span className="text-xs text-gray-500">For personal use only</span>
            </div>
          </div>
        ) : (
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
        )}

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
              {!showQuestion && data.media_assets?.length > 0 && (
                <span className="text-xs text-gray-600 bg-gray-200 px-2.5 py-1 rounded-full font-medium hidden sm:inline">
                  {data.media_assets.length} {data.media_assets.length === 1 ? 'part' : 'parts'}
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

              {data.media_assets && data.media_assets.length > 0 && (
                <div className="space-y-3">
                  {data.media_assets
                    .sort((a, b) => a.segment_index - b.segment_index)
                    .map((segment, arrayIndex) => {
                      const isVideo = segment.metadata?.mode === 'video' || 
                                      segment.metadata?.mode === 'screen' || 
                                      segment.metadata?.mode === 'screen-camera' ||
                                      segment.url?.includes('cloudflarestream.com');
                      const isAudio = segment.metadata?.mode === 'audio' || 
                                      segment.url?.includes('.webm') || 
                                      !isVideo;
                      
                      const videoId = isVideo ? getStreamVideoId(segment.url) : null;
                      const extractedCustomerCode = isVideo ? getCustomerCode(segment.url) : null;
                      const customerCode = CUSTOMER_CODE_OVERRIDE || extractedCustomerCode;
                      
                      return (
                        <div key={segment.id} className="bg-gray-900 rounded-xl overflow-hidden">
                          {data.media_assets.length > 1 && (
                            <div className="px-4 py-2.5 bg-gray-800 flex items-center justify-between">
                              <span className="text-xs font-semibold text-gray-300">
                                Part {arrayIndex + 1}
                              </span>
                              <span className="text-xs text-gray-400">
                                {isVideo ? '🎥' : '🎤'} {segment.duration_sec}s
                              </span>
                            </div>
                          )}
                          
                          {isVideo && videoId && customerCode ? (
                            <div className="w-full aspect-video bg-black">
                              <iframe
                                src={`https://${customerCode}.cloudflarestream.com/${videoId}/iframe`}
                                style={{ border: 'none', width: '100%', height: '100%' }}
                                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                allowFullScreen={true}
                                title={`Video segment ${arrayIndex + 1}`}
                              />
                            </div>
                          ) : isAudio && segment.url ? (
                            <div className="p-4 flex items-center justify-center">
                              <audio controls className="w-full max-w-md" preload="metadata">
                                <source src={segment.url} type="audio/webm" />
                              </audio>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                </div>
              )}

              {data.attachments && data.attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Attachments</p>
                  {data.attachments.map((file, index) => (
                    <a
                      key={index}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all group"
                    >
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="flex-1 text-gray-700 text-xs sm:text-sm truncate font-medium">{file.name}</span>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              )}
            </div>
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
                    ? "This testimonial might appear on QuickChat (optional)" 
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
            <span>Powered by <span className="font-semibold">QuickChat</span></span>
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
    </div>
  );
}

export default AnswerReviewPage;