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
  const [showQuestion, setShowQuestion] = useState(false);

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
        
        const transformedData = {
          id: rawData.id,
          title: rawData.title,
          text: rawData.text,
          created_at: rawData.created_at,
          price_cents: rawData.price_cents,
          currency: rawData.currency,
          status: rawData.status,
          sla_hours_snapshot: rawData.sla_hours_snapshot,
          attachments: rawData.attachments ? JSON.parse(rawData.attachments) : [],
          media_assets: rawData.media_asset || [],
          answer: rawData.answer && rawData.answer.length > 0 ? {
            id: rawData.answer[0].id,
            created_at: rawData.answer[0].created_at,
            sent_at: rawData.answer[0].sent_at,
            text: rawData.answer[0].text_response,
            media_url: rawData.answer[0].media_url,
            media_duration: rawData.answer[0].media_duration,
            media_type: rawData.answer[0].media_type,
          } : null,
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
          <div className="w-12 h-12 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Link Not Found</h2>
          <p className="text-sm text-gray-600">{error || 'This link is invalid or has expired.'}</p>
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
      {/* Simplified Header - No duplicate */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 max-w-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-900">QuickChat</span>
            </div>
            
            <span className="text-xs text-gray-500">
              {hasAnswer ? `Delivered ${getTimeAgo(data.answer.created_at)}` : `Asked ${getTimeAgo(data.created_at)}`}
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl pb-20">
        
        {/* Expert Card - Compact */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-3">
            {expertAvatar ? (
              <img 
                src={expertAvatar} 
                alt={expertName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {expertName.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-gray-900 truncate">{expertName}</h2>
              <p className="text-xs text-gray-600 truncate">{data.expert_profile?.professional_title || `@${expertHandle}`}</p>
            </div>
          </div>
        </div>

        {/* Answer Section - PRIMARY CONTENT */}
        {hasAnswer ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Your Answer</h3>
                  {data.answer.media_duration && (
                    <p className="text-xs text-gray-500">
                      {formatDuration(data.answer.media_duration)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {data.answer.media_url && (
              <div className="bg-gray-900">
                <div className="w-full aspect-video bg-black">
                  {(() => {
                    const videoId = getStreamVideoId(data.answer.media_url);
                    const extractedCustomerCode = getCustomerCode(data.answer.media_url);
                    const customerCode = CUSTOMER_CODE_OVERRIDE || extractedCustomerCode;
                    
                    if (videoId && customerCode) {
                      return (
                        <iframe
                          src={`https://${customerCode}.cloudflarestream.com/${videoId}/iframe`}
                          style={{ border: 'none', width: '100%', height: '100%' }}
                          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                          allowFullScreen={true}
                          title="Answer video"
                        />
                      );
                    } else {
                      return (
                        <video className="w-full h-full" controls playsInline>
                          <source src={data.answer.media_url} type="video/mp4" />
                        </video>
                      );
                    }
                  })()}
                </div>
              </div>
            )}

            {data.answer.text && (
              <div className="p-4">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{data.answer.text}</p>
              </div>
            )}
          </div>
        ) : (
          /* Waiting State */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Answer In Progress</h3>
              <p className="text-sm text-gray-600 mb-2">
                {expertName} is working on your answer.
              </p>
              {data.sla_hours_snapshot && (
                <p className="text-xs text-gray-500">
                  Expected within <span className="font-semibold text-indigo-600">{data.sla_hours_snapshot}h</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Collapsible Question Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
          <button
            onClick={() => setShowQuestion(!showQuestion)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">Your Question</span>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${showQuestion ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showQuestion && (
            <div className="p-4 border-t border-gray-200 space-y-4">
              {data.title && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">{data.title}</p>
                </div>
              )}
              
              {data.text && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.text}</p>
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
                        <div key={segment.id} className="bg-gray-900 rounded-lg overflow-hidden">
                          {data.media_assets.length > 1 && (
                            <div className="px-3 py-2 bg-gray-800 flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-400">
                                Part {arrayIndex + 1}
                              </span>
                              <span className="text-xs text-gray-500">
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
                  <p className="text-xs font-semibold text-gray-500 uppercase">Attachments</p>
                  {data.attachments.map((file, index) => (
                    <a
                      key={index}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="flex-1 text-gray-700 text-xs truncate">{file.name}</span>
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Feedback Section */}
        {hasAnswer && !hasSubmittedFeedback && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <h3 className="text-base font-bold text-gray-900 mb-3">Rate this answer</h3>
            
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                >
                  <svg
                    className={`w-8 h-8 ${
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
              <p className="text-sm text-center text-gray-600 mb-3">
                {rating === 5 && '⭐ Excellent!'}
                {rating === 4 && '😊 Great!'}
                {rating === 3 && '👍 Good'}
                {rating === 2 && '😐 Okay'}
                {rating === 1 && '😞 Could be better'}
              </p>
            )}

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows="3"
              maxLength="1000"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 focus:outline-none transition mb-2"
              placeholder="Optional: Share your thoughts..."
            />
            <div className="text-right text-xs text-gray-500 mb-3">{feedback.length}/1000</div>

            <button
              onClick={handleSubmitFeedback}
              className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
            >
              Submit Feedback
            </button>
          </div>
        )}

        {hasSubmittedFeedback && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Thank you!</p>
            <p className="text-xs text-gray-600">Your feedback has been shared with {expertName}.</p>
          </div>
        )}

        {/* Softer CTA */}
        <div className="bg-gradient-to-br from-slate-50 to-gray-100 border border-gray-200 rounded-xl p-6 text-center">
          <h3 className="text-base font-bold text-gray-900 mb-1">Become an expert</h3>
          <p className="text-sm text-gray-600 mb-4">
            Share your knowledge and earn money.
          </p>
          <a 
            href="/"
            className="inline-block bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 active:bg-black transition-colors"
          >
            Get Started
          </a>
        </div>
      </main>
    </div>
  );
}

export default AnswerReviewPage;