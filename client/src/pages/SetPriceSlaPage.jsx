import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/api';

function SetPriceSlaPage() {
  const [formData, setFormData] = useState({
    price: 75,
    currency: 'USD',
    sla_hours: 48,
    bio: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  // Auth Guard: Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // The original app used a generic /expert/settings endpoint.
      // We'll assume a similar endpoint exists for setting up the profile initially.
      // Based on expert.html, the endpoint for updating is PUT /me/profile.
      // We will use that for consistency.
      const payload = {
        price_cents: Number(formData.price) * 100,
        currency: formData.currency,
        sla_hours: Number(formData.sla_hours),
        bio: formData.bio,
      };
      
      // Let's assume the App Group API is used for this as in expert.html
      await apiClient.put('/3B14WLbJ/me/profile', payload);

      // On success, redirect to the expert dashboard
      navigate('/expert');

    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(err.response?.data?.message || 'Failed to save settings. Please try again.');
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    // Render nothing while redirecting
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <svg className="mx-auto h-12 w-auto text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995a6.427 6.427 0 010 .255c0 .382.145.755.438.995l1.003.827c.446.367.622.996.26 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.075.124a6.57 6.57 0 01-.22.127c-.332.182-.582.495-.645.87l-.213 1.281c-.09.542-.56.94-1.11-.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.437-.995a6.427 6.427 0 010-.255c0-.382-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.075-.124.073-.044.146-.087.22-.127.332-.182.582-.495.645-.87l.213-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Set Your Price & Terms
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Define the price for a single question and your response time.
          </p>
        </div>
        {error && <div className="text-red-500 text-sm p-3 bg-red-100 rounded-md">{error}</div>}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 text-left">Price per Question</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 p-3" placeholder="75" min="1" required />
              <select id="currency" name="currency" value={formData.currency} onChange={handleChange} className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="sla_hours" className="block text-sm font-medium text-gray-700 text-left">Response Time (SLA) in Hours</label>
            <input type="number" name="sla_hours" id="sla_hours" value={formData.sla_hours} onChange={handleChange} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-3" placeholder="48" min="1" required />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 text-left">Short Bio / Expertise</label>
            <textarea id="bio" name="bio" rows="3" value={formData.bio} onChange={handleChange} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-3" placeholder="e.g., Webflow & Notion Expert" maxLength="600" required></textarea>
          </div>
          <div>
            <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
              {isLoading ? 'Saving...' : 'Save and Continue'}
            </button>
          </div>
        </form>
      </div>
      <button onClick={logout} className="absolute top-4 right-4 text-sm text-gray-600 hover:text-gray-900">Logout</button>
    </div>
  );
}

export default SetPriceSlaPage;