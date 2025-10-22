import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '@/api';
import StatDetailModal from './StatDetailModal';
import ThisMonthDetail from './ThisMonthDetail';
import AllTimeDetail from './AllTimeDetail';
import ResponseTimeDetail from './ResponseTimeDetail';
import RatingDetail from './RatingDetail';

const formatCurrency = (cents, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '$';
  const amount = (cents || 0) / 100;
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const StatCard = ({ label, value, subtitle, trend, icon, stars, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md hover:border-indigo-300 transition cursor-pointer flex-shrink-0 w-[160px] sm:w-auto"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        {icon && (
          <div className="w-6 h-6 bg-indigo-50 rounded flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
      
      <div className="mb-1">
        <div className="text-xl sm:text-2xl font-black text-gray-900">{value}</div>
      </div>
      
      {subtitle && (
        <div className="text-xs text-gray-500">{subtitle}</div>
      )}
      
      {trend && (
        <div className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${
          trend.isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {trend.isPositive ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            )}
          </svg>
          {trend.value}
        </div>
      )}
      
      {stars !== undefined && stars !== null && (
        <div className="flex items-center gap-0.5 mt-1">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(stars) ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      )}
    </div>
  );
};

const StatsSection = ({ allQuestions = [], targetResponseTime = 24 }) => {
  const [ratings, setRatings] = useState([]);
  const [isLoadingRatings, setIsLoadingRatings] = useState(true);
  const [ratingsEndpointExists, setRatingsEndpointExists] = useState(true);
  const [openModal, setOpenModal] = useState(null);

  // Fetch ratings from backend (with fallback to mock data)
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await apiClient.get('/me/answers');
        
        // DEFENSIVE: Ensure response.data is an array
        const ratingsData = response.data;
        if (Array.isArray(ratingsData)) {
          setRatings(ratingsData);
          setRatingsEndpointExists(true);
          console.log('✅ Ratings fetched from backend:', ratingsData);
        } else {
          console.warn('⚠️ /me/answers returned non-array data:', ratingsData);
          setRatings([]);
          setRatingsEndpointExists(false);
        }
      } catch (err) {
        // If endpoint doesn't exist (404) or any error, use mock data
        console.warn('⚠️ /me/answers endpoint not available, using mock data:', err.message);
        setRatingsEndpointExists(false);
        
        // Mock ratings data (will be replaced when backend is ready)
        const mockRatings = [
          { question_id: 1, rating: 5, feedback_text: 'Excellent!', feedback_at: Date.now() },
          { question_id: 2, rating: 4, feedback_text: 'Very helpful', feedback_at: Date.now() },
          { question_id: 3, rating: 5, feedback_text: 'Great response', feedback_at: Date.now() },
          { question_id: 4, rating: 4, feedback_text: 'Good answer', feedback_at: Date.now() },
          { question_id: 5, rating: 5, feedback_text: 'Perfect!', feedback_at: Date.now() }
        ];
        setRatings(mockRatings);
      } finally {
        setIsLoadingRatings(false);
      }
    };

    fetchRatings();
  }, []);

  // Calculate all stats from questions and ratings data
  const stats = useMemo(() => {
    // DEFENSIVE: Ensure we have arrays to work with
    const questions = Array.isArray(allQuestions) ? allQuestions : [];
    const ratingsArray = Array.isArray(ratings) ? ratings : [];
    
    console.log('📊 Stats calculation - questions:', questions.length, 'ratings:', ratingsArray.length);
    
    // Filter answered questions (status: 'answered' or 'closed')
    const answeredQuestions = questions.filter(q => 
      q.status === 'answered' || q.status === 'closed'
    );

    // ==========================================
    // 1. ALL TIME REVENUE
    // ==========================================
    const allTimeEarnings = answeredQuestions.reduce((sum, q) => 
      sum + (q.price_cents || 0), 0
    );

    // ==========================================
    // 2. THIS MONTH REVENUE
    // ==========================================
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const thisMonthEarnings = answeredQuestions
      .filter(q => {
        if (!q.created_at) return false;
        // Handle both millisecond and second timestamps
        const timestamp = q.created_at > 4102444800 
          ? q.created_at 
          : q.created_at * 1000;
        const date = new Date(timestamp);
        return date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
      })
      .reduce((sum, q) => sum + (q.price_cents || 0), 0);

    // ==========================================
    // 3. MONTHLY GROWTH (compare to previous month)
    // ==========================================
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const previousMonthEarnings = answeredQuestions
      .filter(q => {
        if (!q.created_at) return false;
        const timestamp = q.created_at > 4102444800 
          ? q.created_at 
          : q.created_at * 1000;
        const date = new Date(timestamp);
        return date.getMonth() === previousMonth && 
               date.getFullYear() === previousYear;
      })
      .reduce((sum, q) => sum + (q.price_cents || 0), 0);
    
    const monthlyGrowth = previousMonthEarnings > 0
      ? Math.round(((thisMonthEarnings - previousMonthEarnings) / previousMonthEarnings) * 100)
      : (thisMonthEarnings > 0 ? 100 : 0);

    // ==========================================
    // 4. AVERAGE RESPONSE TIME (in hours)
    // ==========================================
    const questionsWithResponseTime = answeredQuestions.filter(q => 
      q.answered_at && 
      q.answered_at > 0 && 
      q.created_at && 
      q.created_at > 0
    );
    
    let avgResponseTime = 0;
    if (questionsWithResponseTime.length > 0) {
      const totalResponseTime = questionsWithResponseTime.reduce((sum, q) => {
        // Handle both millisecond and second timestamps
        const createdAt = q.created_at > 4102444800 
          ? q.created_at 
          : q.created_at * 1000;
        const answeredAt = q.answered_at > 4102444800 
          ? q.answered_at 
          : q.answered_at * 1000;
        
        // Calculate hours
        const responseHours = (answeredAt - createdAt) / (1000 * 60 * 60);
        return sum + responseHours;
      }, 0);
      
      avgResponseTime = totalResponseTime / questionsWithResponseTime.length;
    }

    // ==========================================
    // 5. AVERAGE RATING (from ratings data)
    // ==========================================
    const ratedAnswers = ratingsArray.filter(r => r && r.rating && r.rating > 0);
    const avgRating = ratedAnswers.length > 0
      ? ratedAnswers.reduce((sum, r) => sum + r.rating, 0) / ratedAnswers.length
      : 0;

    return {
      thisMonthEarnings,
      allTimeEarnings,
      totalAnswered: answeredQuestions.length,
      avgResponseTime,
      avgRating,
      totalRatings: ratedAnswers.length,
      monthlyGrowth
    };
  }, [allQuestions, ratings]); // Recalculate when questions or ratings change

  // ==========================================
  // STATS DATA CONFIGURATION
  // ==========================================
  const statsData = [
    {
      label: "This Month",
      value: formatCurrency(stats.thisMonthEarnings),
      trend: stats.monthlyGrowth !== 0 ? {
        value: `${stats.monthlyGrowth > 0 ? '+' : ''}${stats.monthlyGrowth}%`,
        isPositive: stats.monthlyGrowth > 0
      } : null,
      icon: (
        <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      modalType: 'thisMonth'
    },
    {
      label: "All Time",
      value: formatCurrency(stats.allTimeEarnings),
      subtitle: `${stats.totalAnswered} answered`,
      icon: (
        <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      modalType: 'allTime'
    },
    {
      label: "Avg Response",
      value: stats.avgResponseTime > 0 
        ? `${stats.avgResponseTime.toFixed(1)}h` 
        : '—',
      subtitle: `Target: ${targetResponseTime}h`,
      icon: (
        <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      modalType: 'responseTime'
    },
    {
      label: "Avg Rating",
      value: isLoadingRatings 
        ? '...' 
        : stats.avgRating > 0 
          ? stats.avgRating.toFixed(1) 
          : '—',
      subtitle: isLoadingRatings 
        ? 'Loading...' 
        : !ratingsEndpointExists
          ? '📊 Mock data'
          : stats.totalRatings > 0 
            ? `${stats.totalRatings} ${stats.totalRatings === 1 ? 'rating' : 'ratings'}`
            : 'No ratings yet',
      stars: stats.avgRating > 0 ? stats.avgRating : undefined,
      icon: (
        <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      modalType: 'rating'
    }
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-2xl font-bold text-gray-900">Performance</h3>
      
      {/* Mobile: Horizontal scroll */}
      <div 
        className="lg:hidden flex gap-3 overflow-x-auto pb-2 -mx-4 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} onClick={() => setOpenModal(stat.modalType)} />
        ))}
      </div>

      {/* Desktop: 2x2 grid */}
      <div className="hidden lg:grid grid-cols-2 gap-3">
        {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} onClick={() => setOpenModal(stat.modalType)} />
        ))}
      </div>

      {/* Modals */}
      <StatDetailModal
        isOpen={openModal === 'thisMonth'}
        onClose={() => setOpenModal(null)}
        title="This Month Revenue"
        icon={
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      >
        <ThisMonthDetail allQuestions={allQuestions} />
      </StatDetailModal>

      <StatDetailModal
        isOpen={openModal === 'allTime'}
        onClose={() => setOpenModal(null)}
        title="All Time Performance"
        icon={
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        }
      >
        <AllTimeDetail allQuestions={allQuestions} />
      </StatDetailModal>

      <StatDetailModal
        isOpen={openModal === 'responseTime'}
        onClose={() => setOpenModal(null)}
        title="Response Time Analysis"
        icon={
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      >
        <ResponseTimeDetail allQuestions={allQuestions} targetResponseTime={targetResponseTime} />
      </StatDetailModal>

      <StatDetailModal
        isOpen={openModal === 'rating'}
        onClose={() => setOpenModal(null)}
        title="Rating Details"
        icon={
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        }
      >
        <RatingDetail ratings={ratings} />
      </StatDetailModal>
    </div>
  );
};

export default StatsSection;