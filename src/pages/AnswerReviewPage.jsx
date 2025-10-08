// src/pages/AnswerReviewPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

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
        
        // Transform data to handle arrays and parse JSON strings
        const transformedData = {
          // Basic question info (at root level)
          id: rawData.id,
          title: rawData.title,
          text: rawData.text,
          created_at: rawData.created_at,
          price_cents: rawData.price_cents,
          currency: rawData.currency,
          status: rawData.status,
          sla_hours_snapshot: rawData.sla_hours_snapshot,
          
          // Parse attachments from JSON string
          attachments: rawData.attachments ? JSON.parse(rawData.attachments) : [],
          
          // Media assets array (multiple segments)
          media_assets: rawData.media_asset || [],
          
          // Get first answer from array (or null if empty)
          answer: rawData.answer && rawData.answer.length > 0 ? {
            id: rawData.answer[0].id,
            created_at: rawData.answer[0].created_at,
            sent_at: rawData.answer[0].sent_at,
            text: rawData.answer[0].text_response,
            // Answer media comes from direct fields
            media_url: rawData.answer[0].media_url,
            media_duration: rawData.answer[0].media_duration,
            media_type: rawData.answer[0].media_type,
          } : null,
          
          // Expert profile
          expert_profile: {
            ...rawData.expert_profile,
            user: {
              name: rawData.user || rawData.expert_profile?.professional_title || 'Expert'
            }
          }
        };
        
        console.log('✅ Transformed data:', transformedData);
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
      // TODO: Create Xano endpoint for feedback submission
      console.log('Submitting feedback:', { rating, feedback, questionId: data.id });
      setHasSubmittedFeedback(true);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  const formatDuration = (seconds) => {
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

  // Extract Cloudflare Stream video ID from URL
  const getStreamVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/cloudflarestream\.com\/([a-zA-Z0-9]+)\//);
    return match ? match[1] : null;
  };

  // Hardcoded customer subdomain - replace with your actual Cloudflare account
  const CLOUDFLARE_CUSTOMER_CODE = 'customer-31c014ec11101bfa323f8afe20a975a1';

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your answer...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Link Not Found</h2>
          <p className="text-gray-600">{error || 'This link is invalid or has expired.'}</p>
        </div>
      </div>
    );
  }

  const hasAnswer = data.answer?.media_url;
  const expertName = data.expert_profile?.user?.name || 'Expert';
  const expertHandle = data.expert_profile?.handle || '';
  const expertAvatar = data.expert_profile?.avatar_url;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {hasAnswer ? 'Your Answer' : 'Your Question'}
                </h1>
                <p className="text-xs text-gray-500">
                  {hasAnswer 
                    ? `Delivered ${getTimeAgo(data.answer.created_at)}`
                    : `Asked ${getTimeAgo(data.created_at)}`
                  }
                </p>
              </div>
            </div>
            
            <div className="hidden sm:block text-xs text-gray-500">
              Powered by <span className="font-semibold text-indigo-600">QuickChat</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Expert Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4 mb-3">
            {expertAvatar ? (
              <img 
                src={expertAvatar} 
                alt={expertName}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-white"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center ring-4 ring-white">
                <span className="text-2xl font-bold text-white">
                  {expertName.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {hasAnswer ? `Answer from ${expertName}` : `Question to ${expertName}`}
              </h2>
              {expertHandle && (
                <p className="text-sm text-indigo-700">@{expertHandle}</p>
              )}
              {data.expert_profile?.professional_title && (
                <p className="text-sm text-gray-600">{data.expert_profile.professional_title}</p>
              )}
            </div>
          </div>
          {data.expert_profile?.tagline && (
            <p className="text-sm text-gray-700 italic">{data.expert_profile.tagline}</p>
          )}
        </div>

        {/* Your Question Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">You Asked:</h3>
          
          {data.title && (
            <p className="text-lg font-semibold text-gray-900 mb-4">{data.title}</p>
          )}
          
          {data.text && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{data.text}</p>
            </div>
          )}

          {/* Question Media - Multiple Segments */}
          {data.media_assets && data.media_assets.length > 0 && (
            <div className="mb-4 space-y-4">
              {data.media_assets.length > 1 && (
                <p className="text-sm font-semibold text-gray-600">
                  Question Recording ({data.media_assets.length} segment{data.media_assets.length > 1 ? 's' : ''})
                </p>
              )}
              
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
                  
                  return (
                    <div key={segment.id} className="bg-gray-900 rounded-xl overflow-hidden">
                      {/* Header */}
                      {data.media_assets.length > 1 && (
                        <div className="p-3 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-400">
                              Segment {arrayIndex + 1}
                            </span>
                            {segment.duration_sec > 0 && (
                              <span className="text-xs text-gray-500">
                                ({Math.round(segment.duration_sec)}s)
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {isVideo ? (
                              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                              </svg>
                            )}
                            <span className="text-xs font-medium text-gray-400">
                              {isVideo ? 'Video' : 'Audio'}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Player */}
                      {isVideo && videoId ? (
                        // VIDEO: Cloudflare Stream iframe
                        <div className="w-full aspect-video bg-black">
                          <iframe
                            src={`https://${CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com/${videoId}/iframe`}
                            style={{ border: 'none', width: '100%', height: '100%' }}
                            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                            allowFullScreen={true}
                            title={`Video segment ${arrayIndex + 1}`}
                          />
                        </div>
                      ) : isAudio && segment.url ? (
                        // AUDIO: Direct R2 URL with HTML5 audio player
                        <div className="p-8 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                          <audio 
                            controls 
                            className="w-full max-w-md"
                            preload="metadata"
                            style={{
                              filter: 'invert(1) hue-rotate(180deg)',
                              height: '40px'
                            }}
                          >
                            <source src={segment.url} type="audio/webm" />
                            <source src={segment.url} type="audio/mp4" />
                            Your browser does not support audio playback.
                          </audio>
                        </div>
                      ) : (
                        // FALLBACK: Unavailable
                        <div className="p-8 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 aspect-video">
                          <svg className="w-12 h-12 text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          <p className="text-white text-sm">Media unavailable</p>
                          <p className="text-gray-500 text-xs mt-1">Video ID: {videoId || 'unknown'}</p>
                          {segment.url && (
                            <a 
                              href={segment.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 underline"
                            >
                              Try direct link
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {/* Question Attachments */}
          {data.attachments && data.attachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Attachments:</p>
              {data.attachments.map((file, index) => (
                <a
                  key={index}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-gray-700 font-medium">{file.name}</p>
                    {file.size && (
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Answer Section */}
        {hasAnswer ? (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Your Answer</h3>
                  {data.answer.media_duration && (
                    <p className="text-sm text-gray-600">
                      Video Response • {formatDuration(data.answer.media_duration)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Answer Video Player */}
            {data.answer.media_url && (
              <div className="bg-gray-900">
                <div className="w-full aspect-video bg-black">
                  {(() => {
                    const videoId = getStreamVideoId(data.answer.media_url);
                    if (videoId) {
                      // Cloudflare Stream video
                      return (
                        <iframe
                          src={`https://${CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com/${videoId}/iframe`}
                          style={{ border: 'none', width: '100%', height: '100%' }}
                          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                          allowFullScreen={true}
                          title="Answer video"
                        />
                      );
                    } else {
                      // Fallback to video tag for other sources
                      return (
                        <video 
                          className="w-full h-full"
                          controls
                          playsInline
                        >
                          <source src={data.answer.media_url} type="video/mp4" />
                          Your browser does not support video.
                        </video>
                      );
                    }
                  })()}
                </div>
              </div>
            )}

            {/* Written Response (if exists) */}
            {data.answer.text && (
              <div className="p-6 border-t border-gray-200">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Written Response:</h4>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{data.answer.text}</p>
                </div>
              </div>
            )}
          </section>
        ) : (
          /* Waiting for Answer */
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Answer In Progress</h3>
              <p className="text-gray-600 mb-4">
                {expertName} is working on your answer. You'll receive an email when it's ready.
              </p>
              {data.sla_hours_snapshot && (
                <p className="text-sm text-gray-500">
                  Expected within <span className="font-semibold text-indigo-600">{data.sla_hours_snapshot} hours</span>
                </p>
              )}
            </div>
          </section>
        )}

        {/* Feedback Section - Only show if answer exists */}
        {hasAnswer && !hasSubmittedFeedback && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">How was this answer?</h3>
            
            {/* Star Rating */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <svg
                      className={`w-10 h-10 ${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-400 fill-current'
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
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {rating === 5 && '⭐ Excellent!'}
                  {rating === 4 && '😊 Great!'}
                  {rating === 3 && '👍 Good'}
                  {rating === 2 && '😐 Okay'}
                  {rating === 1 && '😞 Needs improvement'}
                </p>
              )}
            </div>

            {/* Feedback Text */}
            <div className="mb-6">
              <label htmlFor="feedback" className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Feedback <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows="4"
                maxLength="1000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition"
                placeholder="Share your thoughts about this answer..."
              />
              <div className="text-right text-xs text-gray-500 mt-1">{feedback.length} / 1000</div>
            </div>

            <button
              onClick={handleSubmitFeedback}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300"
            >
              Submit Feedback
            </button>
          </section>
        )}

        {hasSubmittedFeedback && (
          <section className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Thank you for your feedback!</h3>
            <p className="text-gray-600">Your feedback has been shared with {expertName}.</p>
          </section>
        )}

        {/* CTA Footer */}
        <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-center text-white shadow-lg">
          <h3 className="font-bold text-xl mb-2">Want to become an expert?</h3>
          <p className="mb-4 opacity-90">
            Share your knowledge and earn money answering questions.
          </p>
          <a 
            href="/"
            className="inline-block bg-white text-indigo-600 font-semibold px-6 py-3 rounded-full hover:bg-slate-50 transition-colors"
          >
            Get Your QuickChat Link
          </a>
        </div>

        {/* Mobile: Powered by */}
        <div className="sm:hidden text-center text-xs text-gray-500 mt-8 pb-4">
          Powered by <span className="font-semibold text-indigo-600">QuickChat</span>
        </div>
      </main>
    </div>
  );
}

export default AnswerReviewPage;