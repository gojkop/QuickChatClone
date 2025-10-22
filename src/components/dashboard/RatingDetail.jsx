import React, { useMemo } from 'react';

const RatingDetail = ({ ratings = [] }) => {
  const data = useMemo(() => {
    // Ensure ratings is an array
    const ratingsArray = Array.isArray(ratings) ? ratings : [];

    // Filter valid ratings (1-5)
    const validRatings = ratingsArray.filter(r => r.rating && r.rating >= 1 && r.rating <= 5);

    if (validRatings.length === 0) {
      return {
        avgRating: 0,
        totalRatings: 0,
        distribution: Array(5).fill(0).map((_, i) => ({ stars: 5 - i, count: 0, percentage: 0 })),
        recentFeedback: []
      };
    }

    // Calculate average
    const totalStars = validRatings.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalStars / validRatings.length;

    // Calculate distribution
    const starCounts = Array(5).fill(0);
    validRatings.forEach(r => {
      starCounts[r.rating - 1] += 1;
    });

    const distribution = starCounts
      .map((count, index) => ({
        stars: 5 - index, // 5 stars to 1 star
        count: starCounts[4 - index], // Reverse the array
        percentage: (starCounts[4 - index] / validRatings.length) * 100
      }));

    // Get recent feedback with text
    const recentFeedback = validRatings
      .filter(r => r.feedback_text && r.feedback_text.trim().length > 0)
      .sort((a, b) => {
        const aTime = a.feedback_at || a.created_at || 0;
        const bTime = b.feedback_at || b.created_at || 0;
        return bTime - aTime;
      })
      .slice(0, 5);

    return {
      avgRating,
      totalRatings: validRatings.length,
      distribution,
      recentFeedback
    };
  }, [ratings]);

  const maxCount = Math.max(...data.distribution.map(d => d.count), 1);

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 flex-shrink-0 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-medium text-gray-600 truncate">Average Rating</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900">
            {data.avgRating > 0 ? data.avgRating.toFixed(1) : '—'}
          </div>
          {data.avgRating > 0 && (
            <div className="flex items-center gap-0.5 mt-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${i < Math.floor(data.avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 flex-shrink-0 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span className="text-xs font-medium text-gray-600 truncate">Total Ratings</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900">{data.totalRatings}</div>
        </div>
      </div>

      {/* Rating Distribution */}
      {data.totalRatings > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="truncate">Rating Distribution</span>
          </h4>
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
            {data.distribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 w-12 sm:w-16 flex-shrink-0">
                  <span className="text-sm font-bold text-gray-900">{item.stars}</span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-5 sm:h-6 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm font-bold text-gray-900 w-8 sm:w-12 text-right flex-shrink-0">
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Feedback */}
      {data.recentFeedback.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="truncate">Recent Feedback</span>
          </h4>
          <div className="space-y-3">
            {data.recentFeedback.map((feedback, index) => {
              const timestamp = feedback.feedback_at || feedback.created_at || 0;
              const date = new Date(timestamp > 4102444800 ? timestamp : timestamp * 1000);
              return (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4"
                >
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 flex-shrink-0 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {date.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed break-words">
                    {feedback.feedback_text}
                  </p>
                  {feedback.question_text && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500 truncate">
                        Re: {feedback.question_text}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data.totalRatings === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <p className="text-sm font-medium">No ratings received yet</p>
        </div>
      )}
    </div>
  );
};

export default RatingDetail;