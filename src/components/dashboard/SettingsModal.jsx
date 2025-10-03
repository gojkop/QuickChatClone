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
    const payload = {
      price_cents: Number(formData.priceUsd) * 100,
      sla_hours: Number(formData.slaHours),
      bio: formData.bio,
      public: formData.isPublic,
      handle: formData.handle,
      currency: 'USD',
      avatar_url: formData.avatar_url,       // NEW
      avatar_key: formData.avatar_key,       // NEW
      charity_percentage: formData.charity_percentage || 0,
      selected_charity: formData.selected_charity || null
    };
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
        currency: 'USD', // Assuming USD for now
        // New fields - these will be saved to localStorage for now
        // Later they will be sent to database
        avatar_url: formData.avatar_url,
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

      // Using the App Group API endpoint from expert.html
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
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-xl font-bold text-gray-900">Settings</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="pb-6 border-b border-gray-200">
            <label className="block text-sm font-bold text-gray-900 mb-4">Profile Photo</label>
            <AvatarUpload 
              currentAvatar={formData.avatar_url}
              onChange={handleAvatarChange}
            />
          </div>

          {/* Existing Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Price (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                <input 
                  id="priceUsd" 
                  type="number" 
                  value={formData.priceUsd || ''} 
                  onChange={handleChange} 
                  min="1" 
                  step="1" 
                  className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Response Time (hours)</label>
              <input 
                id="slaHours" 
                type="number" 
                value={formData.slaHours || ''} 
                onChange={handleChange} 
                min="1" 
                step="1" 
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Bio / Expertise</label>
            <textarea 
              id="bio" 
              rows="4" 
              value={formData.bio || ''} 
              onChange={handleChange} 
              maxLength="600" 
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Tell people about your expertise..."
            />
            <div className="text-xs text-gray-500 mt-1 text-right">{(formData.bio || '').length} / 600</div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Public Handle</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium">/u/</span>
              <input 
                id="handle" 
                type="text" 
                value={formData.handle || ''} 
                onChange={handleChange} 
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                placeholder="your-handle" 
              />
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
            <input 
              id="isPublic" 
              type="checkbox" 
              checked={formData.isPublic || false} 
              onChange={handleChange} 
              className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
            />
            <div>
              <span className="text-sm font-bold text-gray-900 block">Public Profile</span>
              <span className="text-xs text-gray-600">Allow people to find and ask you questions</span>
            </div>
          </label>

          {/* Charity Settings */}
          <div className="pt-6 border-t border-gray-200 space-y-6">
            <CharityDonationSelector 
              value={formData.charity_percentage || 0}
              onChange={handleCharityPercentageChange}
            />
            
            {formData.charity_percentage > 0 && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Select Charity</label>
                <CharitySelector 
                  value={formData.selected_charity}
                  onChange={handleCharityChange}
                  donationPercentage={formData.charity_percentage}
                />
              </div>
            )}
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
          
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingsModal;