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
    console.log('Charity changed to:', charityId); // Debug log
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
        charity_percentage: Number(formData.charity_percentage) || 0,
        selected_charity: formData.selected_charity || null
      };

      console.log('Saving payload:', payload); // Debug log

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
      
      console.log('API response:', response.data); // Debug log
      
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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Profile Settings</h3>
            <p className="text-xs text-gray-500 mt-0.5">Manage your expert profile</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
          <div className="px-5 py-5 space-y-5">
            
            {/* Avatar & Handle Section */}
            <div className="bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 rounded-lg p-3 border border-indigo-100">
              <div className="space-y-3">
                {/* Avatar - Centered */}
                <div className="flex justify-center">
                  <AvatarUpload 
                    currentAvatar={formData.avatar_url}
                    onChange={handleAvatarChange}
                  />
                </div>
                
                {/* Handle & Toggle - Full Width */}
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Profile Handle
                    </label>
                    <div className="flex items-stretch">
                      <span className="inline-flex items-center px-2.5 bg-white/80 border border-r-0 border-gray-300 rounded-l-lg text-xs text-gray-600 font-semibold">
                        /u/
                      </span>
                      <input 
                        id="handle" 
                        type="text" 
                        value={formData.handle || ''} 
                        onChange={handleChange} 
                        className="flex-1 px-2.5 py-2 bg-white/80 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium" 
                        placeholder="your-handle"
                        required
                      />
                    </div>
                  </div>

                  {/* Public Toggle */}
                  <div className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2 border border-white/40">
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">Public Profile</div>
                        <div className="text-xs text-gray-600">Discoverable</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input 
                        id="isPublic" 
                        type="checkbox" 
                        checked={formData.isPublic || false} 
                        onChange={handleChange} 
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-300 peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-600 peer-checked:to-violet-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Fee</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                  <input 
                    id="priceUsd" 
                    type="number" 
                    value={formData.priceUsd || ''} 
                    onChange={handleChange} 
                    min="1" 
                    step="1" 
                    placeholder="100"
                    className="w-full pl-7 pr-2.5 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Response</label>
                <div className="relative">
                  <input 
                    id="slaHours" 
                    type="number" 
                    value={formData.slaHours || ''} 
                    onChange={handleChange} 
                    min="1" 
                    step="1" 
                    placeholder="48"
                    className="w-full pl-2.5 pr-10 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold" 
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium">hrs</span>
                </div>
              </div>
            </div>

            {/* Professional Identity */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Professional Identity</h4>
              
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                  <input 
                    id="professional_title" 
                    type="text" 
                    value={formData.professional_title || ''} 
                    onChange={handleChange} 
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                    placeholder="Sr. Engineer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tagline</label>
                  <input 
                    id="tagline" 
                    type="text" 
                    value={formData.tagline || ''} 
                    onChange={handleChange} 
                    maxLength="100"
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                    placeholder="Building products"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bio</label>
                <textarea 
                  id="bio" 
                  rows="3" 
                  value={formData.bio || ''} 
                  onChange={handleChange} 
                  maxLength="600" 
                  className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                  placeholder="Tell people about your expertise..."
                />
                <div className="text-xs text-gray-400 text-right mt-0.5">{(formData.bio || '').length}/600</div>
              </div>

              {/* Expertise Tags */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-600">Expertise Tags</label>
                  <span className={`text-xs font-semibold ${currentExpertise.length >= 6 ? 'text-red-600' : 'text-gray-500'}`}>
                    {currentExpertise.length}/6
                  </span>
                </div>
                <input 
                  type="text"
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  onKeyDown={handleAddExpertise}
                  placeholder={currentExpertise.length >= 6 ? "Max reached" : "Press Enter"}
                  disabled={currentExpertise.length >= 6}
                  className={`w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${currentExpertise.length >= 6 ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                {currentExpertise.length >= 6 && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Max 6 tags. Remove one to add another.
                  </p>
                )}
                {currentExpertise.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {currentExpertise.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-indigo-200 text-indigo-700 rounded-full text-xs font-medium"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveExpertise(tag)}
                          className="hover:bg-indigo-100 rounded-full p-0.5"
                          aria-label={`Remove ${tag}`}
                        >
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Social (Optional)</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'twitter', placeholder: '@user', icon: '𝕏' },
                  { key: 'linkedin', placeholder: 'in/user', icon: 'in' },
                  { key: 'github', placeholder: 'user', icon: '<>' },
                  { key: 'website', placeholder: 'site.com', icon: '🌐' }
                ].map(({ key, placeholder, icon }) => (
                  <div key={key} className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{icon}</span>
                    <input 
                      type="text" 
                      value={currentSocials[key] || ''} 
                      onChange={(e) => handleSocialChange(key, e.target.value)}
                      placeholder={placeholder}
                      className="w-full pl-7 pr-2 py-1.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs" 
                      aria-label={key}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Charity - Compact */}
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Give Back (Optional)</h4>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Donation Percentage</label>
                <CharityDonationSelector 
                  value={formData.charity_percentage || 0}
                  onChange={handleCharityPercentageChange}
                />
              </div>
              
              {formData.charity_percentage > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Select Charity</label>
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
              <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                <svg className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-red-800 font-medium">{error}</span>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            onClick={handleSave}
            disabled={isLoading} 
            className="px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
          >
            {isLoading && (
              <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
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