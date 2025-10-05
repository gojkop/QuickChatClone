// src/pages/AnswerReviewPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function AnswerReviewPage() {
  const { token } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);

  // Mock data - replace with actual API call
  const mockData = {
    expert: {
      name: 'Sarah Johnson',
      avatar_url: null,
      handle: 'sarahjohnson'
    },
    question: {
      title: 'Can you review my landing page copy for my SaaS product?',
      text: 'I\'m launching a project management tool and need feedback on the messaging. Is it clear? Does it resonate?',
      media_type: 'video',
      media_url: null, // Would be actual video URL
      attachments: [
        { name: 'landing-page-v1.pdf', url: '#' },
        { name: 'copy-draft.docx', url: '#' }
      ],
      created_at: Date.now() / 1000 - 86400 // 1 day ago
    },
    answer: {
      media_type: 'video',
      media_url: null, // Would be actual video URL
      media_duration: 847, // seconds
      text_response: `Great question! I've reviewed your landing page copy and have some specific suggestions.

Your headline is strong, but I'd recommend making your value proposition clearer in the first 3 seconds. Your target audience needs to immediately understand "what's in it for them."

The pricing section could benefit from clearer tier differentiation. I've outlined specific changes in the video that will help increase conversions.

Overall, you're on the right track - just needs some polish!`,
      attachments: [
        { name: 'annotated-copy-suggestions.pdf', url: '#', size: '2.4 MB' }
      ],
      created_at: Date.now() / 1000 - 3600, // 1 hour ago
      view_count: 0
    }
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 800);

    // Track view analytics
    console.log('Recording view for token:', token);
  }, [token]);

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    // TODO: API call to submit feedback
    console.log('Submitting feedback:', { rating, feedback });
    
    setHasSubmittedFeedback(true);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getTimeAgo = (timestamp) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return new Date(timestamp * 1000).toLocaleDateString();
  };

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
                <h1 className="text-lg font-bold text-gray-900">Your Answer</h1>
                <p className="text-xs text-gray-500">Delivered {getTimeAgo(mockData.answer.created_at)}</p>
              </div>
            </div>
            
            {/* Desktop: Powered by */}
            <div className="hidden sm:block text-xs text-gray-500">
              Powered by <span className="font-semibold text-indigo-600">QuestionCharge</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Expert Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4 mb-3">
            {mockData.expert.avatar_url ? (
              <img 
                src={mockData.expert.avatar_url} 
                alt={mockData.expert.name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-white"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center ring-4 ring-white">
                <span className="text-2xl font-bold text-white">
                  {mockData.expert.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Answer from {mockData.expert.name}</h2>
              <p className="text-sm text-indigo-700">@{mockData.expert.handle}</p>
            </div>
          </div>
        </div>

        {/* Your Question Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">You Asked:</h3>
          <p className="text-lg font-semibold text-gray-900 mb-4">{mockData.question.title}</p>
          
          {mockData.question.text && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-gray-700 text-sm leading-relaxed">{mockData.question.text}</p>
            </div>
          )}

          {mockData.question.attachments && mockData.question.attachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Attachments:</p>
              {mockData.question.attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="flex-1 text-gray-700">{file.name}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Answer Section */}
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
                <p className="text-sm text-gray-600">
                  {mockData.answer.media_type === 'video' ? 'Video' : 'Audio'} Response • {formatDuration(mockData.answer.media_duration)}
                </p>
              </div>
            </div>
          </div>

          {/* Video/Audio Player */}
          <div className="bg-gray-900">
            {mockData.answer.media_type === 'video' ? (
              <div className="aspect-video flex items-center justify-center">
                {/* Placeholder - replace with actual video player */}
                <div className="text-center text-white p-8">
                  <svg className="w-20 h-20 mx-auto mb-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-semibold mb-2">Video Answer</p>
                  <p className="text-sm text-gray-400">Duration: {formatDuration(mockData.answer.media_duration)}</p>
                  <div className="mt-6">
                    <button className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition">
                      ▶ Play Video
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center p-8">
                {/* Audio player placeholder */}
                <div className="w-full max-w-md">
                  <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <p className="text-white font-semibold mb-2">Audio Answer</p>
                    <p className="text-sm text-gray-400 mb-4">{formatDuration(mockData.answer.media_duration)}</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <button className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
                      ▶ Play Audio
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Written Response */}
          {mockData.answer.text_response && (
            <div className="p-6 border-t border-gray-200">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Written Response:</h4>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{mockData.answer.text_response}</p>
              </div>
            </div>
          )}

          {/* Answer Attachments */}
          {mockData.answer.attachments && mockData.answer.attachments.length > 0 && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Attachments:</h4>
              <div className="space-y-2">
                {mockData.answer.attachments.map((file, index) => (
                  <a
                    key={index}
                    href={file.url}
                    download
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Feedback Section */}
        {!hasSubmittedFeedback ? (
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
        ) : (
          <section className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Thank you for your feedback!</h3>
            <p className="text-gray-600">Your feedback has been shared with {mockData.expert.name}.</p>
          </section>
        )}

        {/* Mobile: Powered by */}
        <div className="sm:hidden text-center text-xs text-gray-500 mt-8 pb-4">
          Powered by <span className="font-semibold text-indigo-600">QuestionCharge</span>
        </div>
      </main>
    </div>
  );
}

export default AnswerReviewPage;