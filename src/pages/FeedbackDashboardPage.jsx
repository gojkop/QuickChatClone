import React, { useState, useEffect, useMemo } from 'react';

function FeedbackDashboardPage() {
  // Password protection
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const ADMIN_PASSWORD = import.meta.env.VITE_FEEDBACK_PASSWORD || 'quickchat2025';
  
  const [feedback, setFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [pageFilter, setPageFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  
  // Sorting
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Fetch feedback only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchFeedback();
    }
  }, [isAuthenticated]);

  const fetchFeedback = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:BQW1GS7L/feedback');
      
      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }
      
      const data = await response.json();
      setFeedback(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort data - ✅ Updated to use 'message' instead of 'feedback'
  const filteredData = useMemo(() => {
    let result = [...feedback];
    
    if (pageFilter) {
      result = result.filter(item => 
        item.page?.toLowerCase().includes(pageFilter.toLowerCase())
      );
    }
    
    if (ratingFilter) {
      result = result.filter(item => 
        item.rating === parseInt(ratingFilter)
      );
    }
    
    if (emailFilter) {
      result = result.filter(item => 
        item.email?.toLowerCase().includes(emailFilter.toLowerCase())
      );
    }
    
    if (searchFilter) {
      result = result.filter(item => 
        item.message?.toLowerCase().includes(searchFilter.toLowerCase())  // ✅ Changed from 'feedback' to 'message'
      );
    }
    
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      
      if (sortField === 'created_at' || sortField === 'submitted_at') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return result;
  }, [feedback, pageFilter, ratingFilter, emailFilter, searchFilter, sortField, sortDirection]);

  const stats = useMemo(() => {
    const total = feedback.length;
    const withRating = feedback.filter(f => f.rating).length;
    const avgRating = withRating > 0
      ? (feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / withRating).toFixed(1)
      : 0;
    const withEmail = feedback.filter(f => f.email).length;
    
    return { total, avgRating, withEmail, withRating };
  }, [feedback]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // ✅ Updated CSV export to use 'message' and 'user_agent'
  const handleExport = () => {
    const csv = [
      ['Date', 'Page', 'Rating', 'Message', 'Email', 'User Agent'],
      ...filteredData.map(item => [
        new Date(item.created_at).toLocaleString(),
        item.page || '',
        item.rating || '',
        `"${(item.message || '').replace(/"/g, '""')}"`,  // ✅ Changed from 'feedback' to 'message'
        item.email || '',
        item.user_agent || ''  // ✅ Changed from 'userAgent' to 'user_agent'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setPageFilter('');
    setRatingFilter('');
    setEmailFilter('');
    setSearchFilter('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StarRating = ({ rating }) => {
    if (!rating) return <span className="text-gray-400 text-xs">No rating</span>;
    
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  // Password protection screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Feedback Dashboard</h2>
            <p className="text-sm text-gray-600">Enter password to access admin panel</p>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            if (password === ADMIN_PASSWORD) {
              setIsAuthenticated(true);
              setPassword('');
            } else {
              alert('❌ Incorrect password. Please try again.');
              setPassword('');
            }
          }}>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition"
                required
                autoFocus
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Access Dashboard
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              🔒 This is a protected admin area for testing purposes
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Error Loading Feedback</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={fetchFeedback}
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Logout */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              Feedback Dashboard
            </h1>
            <p className="text-gray-600">Review and analyze user feedback during testing phase</p>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-500 mb-1">Total Feedback</div>
            <div className="text-3xl font-black text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-500 mb-1">Avg Rating</div>
            <div className="text-3xl font-black text-yellow-500">{stats.avgRating}★</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-500 mb-1">With Rating</div>
            <div className="text-3xl font-black text-gray-900">{stats.withRating}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-500 mb-1">With Email</div>
            <div className="text-3xl font-black text-gray-900">{stats.withEmail}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={fetchFeedback}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                onClick={handleExport}
                disabled={filteredData.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibo