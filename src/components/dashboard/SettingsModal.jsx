// client/src/components/dashboard/SettingsModal.jsx
import React, { useState, useEffect, useRef } from 'react';
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
      socials: { ...prev.socials, [platform]: value }
    }));
  };

  const handleAddExpertise = (e) => {
    if (e.key === 'Enter' && expertiseInput.trim()) {
      e.preventDefault();
      const newTag = expertiseInput.trim();
      const currentExpertise = formData.expertise || [];
      if (!currentExpertise.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          expertise: [...currentExpertise, newTag]
        }));
      }
      setExpertiseInput('');
    }
  };

  const handleRemoveExpertise = (tag) => {
    setFormData(prev => ({
      ...prev,
      expertise: (prev.expertise || []).filter(t => t !== tag)
    }));
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
        expertise: formData.expertise || [],
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Profile Settings</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {/* Avatar Upload */}
          <section>
            <label className="block text-sm font-semibold text-gray-900 mb-4">Profile Photo</label>
            <AvatarUpload 
              currentAvatar={formData.avatar_url}
              onChange={handleAvatarChange}
            />
          </section>

          {/* Basic Information */}
          <section className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Basic Information</h4>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">
                  Handle <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-600">/u/</span>
                  <input 
                    id="handle" 
                    type="text" 
                    value={formData.handle || ''} 
                    onChange={handleChange} 
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                    placeholder="your-handle"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Professional Title</label>
                <input 
                  id="professional_title" 
                  type="text" 
                  value={formData.professional_title || ''} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1.5">Tagline</label>
              <input 
                id="tagline" 
                type="text" 
                value={formData.tagline || ''} 
                onChange={handleChange} 
                maxLength="100"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                placeholder="A catchy one-liner about what you do"
              />
              <div className="text-xs text-gray-500 text-right mt-1">{(formData.tagline || '').length}/100</div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1.5">Bio / Expertise</label>
              <textarea 
                id="bio" 
                rows="4" 
                value={formData.bio || ''} 
                onChange={handleChange} 
                maxLength="600" 
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Tell people about your expertise and background..."
              />
              <div className="text-xs text-gray-500 mt-1 text-right">{(formData.bio || '').length} / 600</div>
            </div>
          </section>

          {/* Expertise Tags */}
          <section>
            <h4 className="text-sm font-semibold text-gray-900 mb-1.5">Areas of Expertise</h4>
            <p className="text-xs text-gray-600 mb-3">Add tags to help people find you (press Enter to add)</p>
            <input 
              type="text"
              value={expertiseInput}
              onChange={(e) => setExpertiseInput(e.target.value)}
              onKeyDown={handleAddExpertise}
              placeholder="e.g., React, Marketing, Sales Strategy"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-3"
            />
            {formData.expertise && formData.expertise.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.expertise.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveExpertise(tag)}
                      className="hover:bg-indigo-100 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Social Links */}
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Social Links</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { key: 'twitter', label: 'Twitter', placeholder: '@username', icon: '𝕏' },
                { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/username', icon: 'in' },
                { key: 'github', label: 'GitHub', placeholder: 'github.com/username', icon: '<>' },
                { key: 'website', label: 'Website', placeholder: 'yoursite.com', icon: '🌐' }
              ].map(({ key, label, placeholder, icon }) => (
                <div key={key}>
                  <label className="block text-sm text-gray-700 mb-1.5">{label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{icon}</span>
                    <input 
                      type="text" 
                      value={(formData.socials && formData.socials[key]) || ''} 
                      onChange={(e) => handleSocialChange(key, e.target.value)}
                      placeholder={placeholder}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing & Availability */}
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Pricing & Response Time</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                  <input 
                    id="priceUsd" 
                    type="number" 
                    value={formData.priceUsd || ''} 
                    onChange={handleChange} 
                    min="1" 
                    step="1" 
                    placeholder="50"
                    className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Response Time (hours)</label>
                <input 
                  id="slaHours" 
                  type="number" 
                  value={formData.slaHours || ''} 
                  onChange={handleChange} 
                  min="1" 
                  step="1" 
                  placeholder="24"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                />
              </div>
            </div>
          </section>

          {/* Charity Settings */}
          <section className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Give Back</h4>
            <CharityDonationSelector 
              value={formData.charity_percentage || 0}
              onChange={handleCharityPercentageChange}
            />
            
            {formData.charity_percentage > 0 && (
              <div>
                <label className="block text-sm text-gray-700 mb-3">Select Charity</label>
                <CharitySelector 
                  value={formData.selected_charity}
                  onChange={handleCharityChange}
                  donationPercentage={formData.charity_percentage}
                />
              </div>
            )}
          </section>

          {/* Public Profile Toggle */}
          <section>
            <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <input 
                id="isPublic" 
                type="checkbox" 
                checked={formData.isPublic || false} 
                onChange={handleChange} 
                className="mt-1 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
              />
              <div>
                <span className="text-sm font-semibold text-gray-900 block">Make Profile Public</span>
                <span className="text-xs text-gray-600">Allow people to discover and book consultations with you</span>
              </div>
            </label>
          </section>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-800">{error}</span>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            onClick={handleSave}
            disabled={isLoading} 
            className="px-6 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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