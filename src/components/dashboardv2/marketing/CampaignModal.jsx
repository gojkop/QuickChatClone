import React, { useState } from 'react';
import BottomSheet from './BottomSheet';

export default function CampaignModal({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name: '',
    utm_source: 'linkedin',
    utm_campaign: '',
    utm_medium: 'social'
  });
  const [isCreating, setIsCreating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'utm_source' || name === 'utm_campaign') {
      const url = `mindpick.com/you?utm_source=${name === 'utm_source' ? value : formData.utm_source}&utm_campaign=${name === 'utm_campaign' ? value : formData.utm_campaign}`;
      setGeneratedUrl(url);
    }
  };

  const handleSubmit = async () => {
    setIsCreating(true);
    
    try {
      await onCreate(formData);
      setFormData({ name: '', utm_source: 'linkedin', utm_campaign: '', utm_medium: 'social' });
      onClose();
    } catch (err) {
      alert('Failed to create campaign');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Desktop Modal */}
      <div className="hidden sm:block">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl shadow-elev-4 max-w-lg w-full p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-ink">Create New Campaign</h3>
              <button
                onClick={onClose}
                className="text-subtext hover:text-ink transition-colors duration-fast"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., LinkedIn Launch Post"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-ink font-medium transition-all duration-base"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-ink mb-2">
                    Source
                  </label>
                  <select
                    name="utm_source"
                    value={formData.utm_source}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-ink font-medium transition-all duration-base"
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter</option>
                    <option value="email">Email</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink mb-2">
                    Campaign ID
                  </label>
                  <input
                    type="text"
                    name="utm_campaign"
                    value={formData.utm_campaign}
                    onChange={handleChange}
                    placeholder="e.g., q4_launch"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-ink font-medium transition-all duration-base"
                    required
                  />
                </div>
              </div>

              <div className="bg-canvas rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-bold text-subtext mb-2">Your tracking link:</p>
                <code className="text-sm text-primary break-all font-medium">
                  {generatedUrl || 'mindpick.com/you?utm_source=...&utm_campaign=...'}
                </code>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={isCreating}
                  className="btn btn-primary flex-1 px-4 py-2.5 disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Campaign'}
                </button>
                <button
                  onClick={onClose}
                  className="btn btn-secondary px-4 py-2.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="sm:hidden">
        <BottomSheet
          isOpen={isOpen}
          onClose={onClose}
          title="Create New Campaign"
        >
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-base font-bold text-ink mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., LinkedIn Launch Post"
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-ink font-medium transition-all duration-base"
                style={{ minHeight: '44px' }}
                required
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-base font-bold text-ink mb-2">
                  Source
                </label>
                <select
                  name="utm_source"
                  value={formData.utm_source}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary text-ink font-medium transition-all duration-base"
                  style={{ minHeight: '44px' }}
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter</option>
                  <option value="email">Email</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-base font-bold text-ink mb-2">
                  Campaign ID
                </label>
                <input
                  type="text"
                  name="utm_campaign"
                  value={formData.utm_campaign}
                  onChange={handleChange}
                  placeholder="e.g., q4_launch"
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-ink font-medium transition-all duration-base"
                  style={{ minHeight: '44px' }}
                  required
                />
              </div>
            </div>

            <div className="bg-canvas rounded-xl p-4 border border-gray-200">
              <p className="text-base font-bold text-subtext mb-2">Your tracking link:</p>
              <code className="text-sm text-primary break-all font-medium">
                {generatedUrl || 'mindpick.com/you?utm_source=...&utm_campaign=...'}
              </code>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleSubmit}
                disabled={isCreating}
                className="w-full px-6 py-3 text-base font-bold bg-primary text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 active:scale-98 transition-all shadow-elev-2"
                style={{ minHeight: '48px' }}
              >
                {isCreating ? 'Creating...' : 'Create Campaign'}
              </button>
              <button
                onClick={onClose}
                className="w-full px-6 py-3 text-base font-medium text-ink bg-canvas hover:bg-gray-200 rounded-xl transition-colors active:scale-98"
                style={{ minHeight: '48px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </BottomSheet>
      </div>
    </>
  );
}