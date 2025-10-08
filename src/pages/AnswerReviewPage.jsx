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
  const [allowTestimonial, setAllowTestimonial] = useState(false);

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
      console.log('Submitting feedback:', { rating, feedback, allowTestimonial, questionId: data.id });
      setHasSubmittedFeedback(true);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('Failed to submit feedback. Please try again.');
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

  const handleShare = () => {
    const shareText = `Just got an amazing answer from ${data.expert_profile?.user?.name || 'an expert'} via @QuickChat! 🎯`;
    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(shareUrl, '_blank', 'width=550,height=420');
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

  const hasAnswer = data.answer?.media_url;
  const expertName = data.expert_profile?.user?.name || 'Expert';
  const expertHandle = data.expert_profile?.handle || '';
  const expertAvatar = data.expert_profile?.avatar_url;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-lg bg-white/95">
        <div className="container mx-auto px-4 sm:px-6 py-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900 hidden sm:block">QuickChat</span>
            </a>
            
            <span className="text-xs sm:text-sm text-gray-500 font-medium">
              {hasAnswer ? `Delivered ${getTimeAgo(data.answer.created_at)}` : `Asked ${getTimeAgo(data.created_at)}`}
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl pb-24">
        
        {/* Enhanced Expert Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6 transform hover:shadow-xl transition-shadow">
          <div className="relative h-28 sm:h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
          </div>
          
          <div className="px-5 sm:px-6 pb-6 -mt-16 sm:-mt-12 relative">
            <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
              <div className="relative">
                {expertAvatar ? (
                  <img 
                    src={expertAvatar} 
                    alt={expertName}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-white shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center ring-4 ring-white shadow-xl">
                    <span className="text-3xl sm:text-4xl font-bold text-white">
                      {expertName.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <div className="flex gap-2">
                <div className="px-3 py-1.5 bg-indigo-50 rounded-full">
                  <span className="text-xs font-bold text-indigo-700">4.9★</span>
                </div>
                <div className="px-3 py-1.5 bg-green-50 rounded-full">
                  <span className="text-xs font-bold text-green-700">Fast</span>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{expertName}</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-2">{data.expert_profile?.professional_title || 'Expert'}</p>
              {expertHandle && (
                <a 
                  href={`https://x.com/${expertHandle}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-semibold group"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  @{expertHandle}
                  <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Avg 18h response</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                <span className="font-medium">240+ answers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Answer Section */}
        {hasAnswer ? (
          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl border border-indigo-100 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base sm:text-lg">Your Expert Answer</h3>
                    <p className="text-indigo-100 text-xs sm:text-sm">
                      {getDeliveryTime() && `Delivered in ${getDeliveryTime()}`}
                      {data.answer.media_duration && ` • ${formatDuration(data.answer.media_duration)}`}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleShare}
                  className="text-white/90 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
                  title="Share on X"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>
              </div>
            </div>

            {data.answer.media_url && (
              <div className="relative bg-black">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 to-transparent z-10"></div>
                <div className="w-full aspect-video">
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
              <div className="p-5 sm:p-6 bg-white">
                <div className="prose prose-sm sm:prose max-w-none">
                  <p className="text-gray-800 leading-relaxed text-sm sm:text-base whitespace-pre-wrap m-0">
                    {data.answer.text}
                  </p>
                </div>
              </div>
            )}

            <div className="px-5 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6 sm:p-8 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Answer In Progress</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-3">
                {expertName} is working on your answer.
              </p>
              {data.sla_hours_snapshot && (
                <p className="text-sm text-gray-500">
                  Expected within <span className="font-bold text-indigo-600">{data.sla_hours_snapshot}h</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Question Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <button
            onClick={() => setShowQuestion(!showQuestion)}
            className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              {data.media_assets?.[0] && (
                <div className="w-14 h-14 rounded-xl bg-gray-900 overflow-hidden flex-shrink-0 hidden sm:flex items-center justify-center">
                  <svg className="w-7 h-7 text-white/70" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              
              <div className="text-left">
                <span className="text-sm sm:text-base font-bold text-gray-900">Your Question</span>
                {!showQuestion && data.title && (
                  <p className="text-xs sm:text-sm text-gray-500 line-clamp-1 mt-0.5">{data.title}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!showQuestion && data.media_assets?.length > 0 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium hidden sm:inline">
                  {data.media_assets.length} {data.media_assets.length === 1 ? 'part' : 'parts'}
                </span>
              )}
              <svg 
                className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${showQuestion ? 'rotate-180' : ''} group-hover:text-indigo-600`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          <div className={`transition-all duration-300 ease-in-out ${showQuestion ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="p-5 border-t border-gray-200 space-y-4">
              {data.title && (
                <div>
                  <p className="text-sm sm:text-base font-bold text-gray-900">{data.title}</p>
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
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm hover:bg-indigo-50 hover:border-indigo-200 border border-transparent transition-all group"
                    >
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="flex-1 text-gray-700 text-xs sm:text-sm truncate font-medium">{file.name}</span>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Feedback Section */}
        {hasAnswer && !hasSubmittedFeedback && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border border-amber-200 p-5 sm:p-6 mb-6">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">How was your answer?</h3>
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
                  className="focus:outline-none transition-all hover:scale-125 active:scale-95 p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <svg
                    className={`w-9 h-9 sm:w-10 sm:h-10 transition-all ${
                      star <= (hoverRating || rating)
                        ? 'text-amber-400 fill-current drop-shadow-lg'
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
                <p className="text-sm font-bold text-gray-700 mb-3">
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
              className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-base sm:text-lg font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-amber-500 disabled:hover:to-orange-500 disabled:active:scale-100 min-h-[44px]"
            >
              {rating === 0 ? 'Select a rating to continue' : 'Submit Feedback'}
            </button>
          </div>
        )}

        {hasSubmittedFeedback && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 sm:p-6 text-center mb-6 animate-fadeIn">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-base sm:text-lg font-bold text-gray-900 mb-1">Thank you!</p>
            <p className="text-sm text-gray-600">Your feedback has been shared with {expertName}.</p>
          </div>
        )}

        {/* Powerful Conversion CTA */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl overflow-hidden mb-6">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20 animate-pulse"></div>
          
          <div className="relative px-5 sm:px-8 py-8 sm:py-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur border-2 border-white"></div>
                ))}
              </div>
              <span className="text-white/90 text-xs sm:text-sm font-semibold">1,240+ experts earning</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
              Turn <span className="underline decoration-wavy decoration-white/50 decoration-2">your</span> expertise into income
            </h3>
            <p className="text-white/90 text-sm sm:text-base mb-2">
              Just like {expertName}, start monetizing your knowledge
            </p>
            <p className="text-white/80 text-xs sm:text-sm mb-6 sm:mb-8">
              • Set your price • Answer when convenient • Get paid instantly
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <a 
                href="/?ref=answer_page"
                className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-indigo-50 active:scale-[0.98] transition-all shadow-xl group min-h-[44px]"
              >
                Get Your QuickChat Link
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              
              <button 
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur text-white border-2 border-white/30 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-white/20 active:scale-[0.98] transition-all min-h-[44px]"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Share on X
              </button>
            </div>

            <div className="pt-6 border-t border-white/20">
              <p className="text-white/80 text-xs sm:text-sm">
                ✨ <span className="font-bold">No platform fee</span> for first 6 months • 
                <span className="font-bold"> €342 avg.</span> first month earnings
              </p>
            </div>
          </div>
        </div>

        {/* Powered by QuickChat */}
        <div className="text-center py-6">
          <a href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors group">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Powered by <span className="font-bold">QuickChat</span></span>
            <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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