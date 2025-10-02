import React, { useState, useEffect } from 'react';
import apiClient from '@/api';

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
        currency: 'USD' // Assuming USD for now
      };

      // Using the App Group API endpoint from expert.html
      const response = await apiClient.put('/3B14WLbJ/me/profile', payload);
      onSave(response.data); // Pass updated profile back to parent
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
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg mx-4 rounded-xl shadow-xl">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Edit Settings</h3>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Price (USD)</label>
            <input id="priceUsd" type="number" value={formData.priceUsd || ''} onChange={handleChange} min="1" step="1" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Response Time (SLA hours)</label>
            <input id="slaHours" type="number" value={formData.slaHours || ''} onChange={handleChange} min="1" step="1" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Bio / Expertise</label>
            <textarea id="bio" rows="4" value={formData.bio || ''} onChange={handleChange} maxLength="600" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"></textarea>
          </div>
          <label className="inline-flex items-center space-x-2">
            <input id="isPublic" type="checkbox" checked={formData.isPublic || false} onChange={handleChange} className="rounded border-gray-300" />
            <span className="text-sm text-gray-700">Public profile</span>
          </label>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Public Handle</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">/u/</span>
              <input id="handle" type="text" value={formData.handle || ''} onChange={handleChange} className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="your-handle" />
            </div>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:bg-indigo-400">
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingsModal;