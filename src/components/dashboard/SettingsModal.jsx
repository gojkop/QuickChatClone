// client/src/components/dashboard/SettingsModal.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '@/api';
import AvatarUpload from './AvatarUpload';
import CharityDonationSelector from './CharityDonationSelector';
import CharitySelector from './CharitySelector';

function SettingsModal({ isOpen, onClose, profile, onSave }) {
  const [formData, setFormData] = useState(profile);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [expertiseInput, setExpertiseInput] = useState('');

  useEffect(() => {
    // When the profile prop changes (e.g., modal is reopened), update the form data
    setFormData(profile);
  }, [profile]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [id]: type === 'checkbox' ? checked : value }));
  };

  const handleSocialChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socials: { ...(prev.socials || {}), [platform]: value }
    }));
  };

  const handleAddExpertise = (e) => {
    if (e.key === 'Enter' && expertiseInput.trim()) {
      e.preventDefault();
      const newTag = expertiseInput.trim();
      const currentExpertise = Array.isArray(formData.expertise) ? formData.expertise : [];
      
      // Check if limit reached
      if (currentExpertise.length >= 6) {
        setError('Maximum 6 expertise tags allowed. Remove a tag to add a new one.');
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      if (!currentExpertise.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          expertise: [...currentExpertise, newTag]
        }));
        setError(''); // Clear any previous errors
      }
      setExpertiseInput('');
    }
  };

  const handleRemoveExpertise = (tag) => {
    const currentExpertise = Array.isArray(formData.expertise) ? formData.expertise : [];
    setFormData(prev => ({
      ...prev,
      expertise: currentExpertise.filter(t => t !== tag)
    }));
    // Clear error when removing a tag (in case it was a "max tags" error)
    if (error && error.includes('Maximum 6 expertise tags')) {
      setError('');
    }
  };

  const handleAvatarChange = (uploadResult) => {
    setFormData(prev => ({ 
      ...prev, 
      avatar_url: uploadResult.url,
      avatar_key: uploadResult.key // Store the key for potential deletion later
    }));
  };

  const handleCharityPercentageChange = (percentage) => {
    setFormData(prev => ({ ...prev, charity_percentage: percentage }));
  };

  const handleCharityChange = (charityId) => {
    setFormData(prev => ({ ...prev, selected_charity: charityId }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        price_cents: Number(formData.priceUsd) * 100,
        sla_hours: Number(formData.slaHours),
        bio: formData.bio,
        public: formData.isPublic,
        handle: formData.handle,
        currency: 'USD',
        avatar_url: formData.avatar_url,
        avatar_key: formData.avatar_key,
        // NEW FIELDS
        professional_title: formData.professional_title || '',
        tagline: formData.tagline || '',
        expertise: Array.isArray(formData.expertise) ? formData.expertise : [],
        socials: formData.socials || {},
        charity_percentage: formData.charity_percentage || 0,
        selected_charity: formData.selected_charity || null
      };

      // Save to localStorage for now (avatar and charity settings)
      if (formData.avatar_url) {
        localStorage.setItem('qc_avatar', formData.avatar_url);
      }
      localStorage.setItem('qc_charity_percentage', formData.charity_percentage || 0);
      if (formData.selected_charity) {
        localStorage.setItem('qc_selected_charity', formData.selected_charity);
      }

      // Using the App Group API endpoint
      const response = await apiClient.put('/me/profile', payload);
      
      // Merge the response with local storage data
      const updatedProfile = {
        ...response.data,
        avatar_url: formData.avatar_url,
        charity_percentage: formData.charity_percentage,
        selected_charity: formData.selected_charity
      };
      
      onSave(updatedProfile); // Pass updated profile back to parent
      onClose(); // Close modal on success
    } catch (err) {
      console.error("Save settings error:", err);
      if (err.response?.status === 409) {
        setError("That handle is already taken.");
      } else {
        setError(err.response?.data?.message || "Could not save settings.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Safe access to potentially undefined fields
  const currentExpertise = Array.isArray(formData.expertise) ? formData.expertise : [];
  const currentSocials = formData.socials || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Profile Settings</h3>
            <p className="text-sm text-gray-500 mt-0.5">Manage your expert profile and preferences</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 space-y-8">
            
            {/* Profile Header Section - Hero */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <AvatarUpload 
                  currentAvatar={formData.avatar_url}
                  onChange={handleAvatarChange}
                />
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Username
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2.5 bg-white border border-r-0 border-gray-200 rounded-l-lg text-sm text-gray-500 font-medium">
                        /u/
                      </span>
                      <input 
                        id="handle" 
                        type="text" 
                        value={formData.handle || ''} 
                        onChange={handleChange} 
                        className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-medium" 
                        placeholder="your-handle"
                        required
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      id="isPublic" 
                      type="checkbox" 
                      checked={formData.isPublic || false} 
                      onChange={handleChange} 
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Make profile public and discoverable
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Most Important - Pricing & Availability */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Consultation Fee
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg">
                    $
                  </span>
                  <input 
                    id="priceUsd" 
                    type="number" 
                    value={formData.priceUsd || ''} 
                    onChange={handleChange} 
                    min="1" 
                    step="1" 
                    placeholder="50"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all text-lg font-semibold" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Response Time
                </label>
                <div className="relative">
                  <input 
                    id="slaHours" 
                    type="number" 
                    value={formData.slaHours || ''} 
                    onChange={handleChange} 
                    min="1" 
                    step="1" 
                    placeholder="24"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all text-lg font-semibold" 
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    hours
                  </span>
                </div>
              </div>
            </div>

            {/* Professional Identity */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Professional Identity
              </h4>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Professional Title
                  </label>
                  <input 
                    id="professional_title" 
                    type="text" 
                    value={formData.professional_title || ''} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all" 
                    placeholder="Senior Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Tagline
                  </label>
                  <input 
                    id="tagline" 
                    type="text" 
                    value={formData.tagline || ''} 
                    onChange={handleChange} 
                    maxLength="100"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all" 
                    placeholder="Building beautiful products"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Bio
                </label>
                <textarea 
                  id="bio" 
                  rows="3" 
                  value={formData.bio || ''} 
                  onChange={handleChange} 
                  maxLength="600" 
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all resize-none"
                  placeholder="Share your expertise and what makes you unique..."
                />
                <div className="text-xs text-gray-400 text-right mt-1">
                  {(formData.bio || '').length}/600
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-gray-600">
                    Expertise Tags
                  </label>
                  <span className={`text-xs font-semibold ${currentExpertise.length >= 6 ? 'text-red-600' : 'text-gray-500'}`}>
                    {currentExpertise.length}/6
                  </span>
                </div>
                <input 
                  type="text"
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  onKeyDown={handleAddExpertise}
                  placeholder={currentExpertise.length >= 6 ? "Maximum tags reached" : "Type and press Enter (e.g., React, Strategy)"}
                  disabled={currentExpertise.length >= 6}
                  className={`w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all ${currentExpertise.length >= 6 ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                {currentExpertise.length >= 6 && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Maximum 6 tags reached. Remove a tag to add another.
                  </p>
                )}
                {currentExpertise.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {currentExpertise.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-full text-xs font-medium shadow-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveExpertise(tag)}
                          className="hover:bg-indigo-100 rounded-full p-0.5 transition-colors"
                          aria-label={`Remove ${tag}`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Social Links - Compact */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Connect
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'twitter', placeholder: '@username', icon: '𝕏' },
                  { key: 'linkedin', placeholder: 'in/username', icon: 'in' },
                  { key: 'github', placeholder: 'username', icon: '<>' },
                  { key: 'website', placeholder: 'yoursite.com', icon: '🌐' }
                ].map(({ key, placeholder, icon }) => (
                  <div key={key} className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                      {icon}
                    </span>
                    <input 
                      type="text" 
                      value={currentSocials[key] || ''} 
                      onChange={(e) => handleSocialChange(key, e.target.value)}
                      placeholder={placeholder}
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all text-sm" 
                      aria-label={key}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Charity - Collapsible */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Give Back (Optional)
              </h4>
              <CharityDonationSelector 
                value={formData.charity_percentage || 0}
                onChange={handleCharityPercentageChange}
              />
              
              {formData.charity_percentage > 0 && (
                <div className="mt-4">
                  <CharitySelector 
                    value={formData.selected_charity}
                    onChange={handleCharityChange}
                    donationPercentage={formData.charity_percentage}
                  />
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-red-800 font-medium">{error}</span>
              </div>
            )}
          </div>
        </form>

        {/* Footer - Sticky */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            onClick={handleSave}
            disabled={isLoading} 
            className="px-8 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-500/30"
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;