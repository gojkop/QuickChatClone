import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboardv2/layout/DashboardLayout';
import apiClient from '@/api';
import AvatarUpload from '@/components/dashboard/AvatarUpload';
import ReactMarkdown from 'react-markdown';
import { Twitter, Linkedin, Github, Globe, DollarSign, Heart } from 'lucide-react';

function ProfileSettingsPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    handle: '',
    isPublic: true,
    avatar: null,
    title: '',
    tagline: '',
    bio: '',
    expertiseTags: [],
    quickConsultPrice: '',
    deepDivePrice: '',
    twitter: '',
    linkedin: '',
    github: '',
    website: '',
    charityEnabled: false,
    charityPercentage: 5,
  });

  // UI state
  const [newTag, setNewTag] = useState('');
  const [showBioPreview, setShowBioPreview] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/me/profile');
      const profileData = response.data;
      setProfile(profileData);

      // Populate form with existing data
      setFormData({
        handle: profileData.handle || '',
        isPublic: profileData.is_public ?? true,
        avatar: profileData.avatar_url || null,
        title: profileData.title || '',
        tagline: profileData.tagline || '',
        bio: profileData.bio || '',
        expertiseTags: profileData.expertise || [],
        quickConsultPrice: profileData.quick_consult_price || '',
        deepDivePrice: profileData.deep_dive_price || '',
        twitter: profileData.social_links?.twitter || '',
        linkedin: profileData.social_links?.linkedin || '',
        github: profileData.social_links?.github || '',
        website: profileData.social_links?.website || '',
        charityEnabled: profileData.charity_enabled || false,
        charityPercentage: profileData.charity_percentage || 5,
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAvatarChange = (avatarUrl) => {
    setFormData({ ...formData, avatar: avatarUrl });
  };

  const handleAddTag = () => {
    if (newTag.trim() && formData.expertiseTags.length < 6 && !formData.expertiseTags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        expertiseTags: [...formData.expertiseTags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      expertiseTags: formData.expertiseTags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSave = async () => {
    // Validation
    if (!formData.handle) {
      alert('Profile handle is required');
      return;
    }

    if (formData.quickConsultPrice && isNaN(formData.quickConsultPrice)) {
      alert('Quick consult price must be a valid number');
      return;
    }

    if (formData.deepDivePrice && isNaN(formData.deepDivePrice)) {
      alert('Deep dive price must be a valid number');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updateData = {
        handle: formData.handle,
        is_public: formData.isPublic,
        avatar_url: formData.avatar,
        title: formData.title,
        tagline: formData.tagline,
        bio: formData.bio,
        expertise: formData.expertiseTags,
        quick_consult_price: formData.quickConsultPrice ? parseFloat(formData.quickConsultPrice) : null,
        deep_dive_price: formData.deepDivePrice ? parseFloat(formData.deepDivePrice) : null,
        social_links: {
          twitter: formData.twitter,
          linkedin: formData.linkedin,
          github: formData.github,
          website: formData.website,
        },
        charity_enabled: formData.charityEnabled,
        charity_percentage: formData.charityPercentage,
      };

      await apiClient.put('/me/profile', updateData);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Refresh profile data
      fetchProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert(`Failed to update profile: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Fixed container with max-width to prevent infinite scrolling */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
            Profile Settings
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your public profile, pricing, and professional information
          </p>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold">Profile updated successfully!</span>
            </div>
          </div>
        )}

        {/* Content Sections */}
        <div className="space-y-6 sm:space-y-8">
          {/* Avatar & Basic Info */}
          <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              Profile Picture
            </h2>
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <AvatarUpload
                currentAvatar={formData.avatar}
                onAvatarChange={handleAvatarChange}
                userName={profile?.user?.name || 'User'}
              />
              <div className="flex-1 min-w-0 w-full">
                <p className="text-sm text-gray-600 mb-4">
                  Upload a professional photo that represents you. This will be visible on your public profile.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Profile Handle
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                      <span className="inline-flex items-center px-3 sm:px-4 py-2.5 bg-gray-50 text-gray-700 font-medium text-sm whitespace-nowrap">
                        /u/
                      </span>
                      <input
                        type="text"
                        name="handle"
                        value={formData.handle}
                        onChange={handleChange}
                        className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 border-0 focus:ring-0 text-sm sm:text-base"
                        placeholder="yourhandle"
                      />
                    </div>
                    {formData.handle && (
                      <p className="text-xs text-gray-500 mt-1">
                        Your profile URL: {window.location.origin}/u/{formData.handle}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isPublic"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleChange}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="isPublic" className="text-sm text-gray-700 cursor-pointer">
                      Make my profile public
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Professional Identity */}
          <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              Professional Identity
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Professional Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="e.g., Senior Software Engineer, Marketing Consultant"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="A short, catchy description of what you do"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.tagline.length}/100 characters
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Bio
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowBioPreview(!showBioPreview)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    {showBioPreview ? 'Edit' : 'Preview'}
                  </button>
                </div>
                {showBioPreview ? (
                  <div className="w-full min-h-[120px] px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 prose prose-sm max-w-none">
                    <ReactMarkdown>{formData.bio || '*No bio yet*'}</ReactMarkdown>
                  </div>
                ) : (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base resize-none"
                    placeholder="Tell people about your experience, expertise, and what makes you unique. Markdown supported."
                  />
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Markdown supported (bold, italic, lists, links, etc.)
                </p>
              </div>
            </div>
          </section>

          {/* Expertise Tags */}
          <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              Areas of Expertise
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Add Tags (Max 6)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    disabled={formData.expertiseTags.length >= 6}
                    className="flex-1 px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base"
                    placeholder="e.g., React, Marketing, Business Strategy"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={formData.expertiseTags.length >= 6 || !newTag.trim()}
                    className="px-4 sm:px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>
              </div>
              {formData.expertiseTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.expertiseTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-indigo-900"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              Pricing Tiers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Quick Consult</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">
                  Short, focused answers (24-48 hours)
                </p>
                <div className="relative">
                  <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium text-sm sm:text-base">
                    $
                  </span>
                  <input
                    type="number"
                    name="quickConsultPrice"
                    value={formData.quickConsultPrice}
                    onChange={handleChange}
                    className="w-full pl-6 sm:pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Deep Dive</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">
                  Comprehensive, detailed responses (3-5 days)
                </p>
                <div className="relative">
                  <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium text-sm sm:text-base">
                    $
                  </span>
                  <input
                    type="number"
                    name="deepDivePrice"
                    value={formData.deepDivePrice}
                    onChange={handleChange}
                    className="w-full pl-6 sm:pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Social Links */}
          <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              Social Links
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Twitter
                </label>
                <div className="relative">
                  <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Twitter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </span>
                  <input
                    type="text"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  LinkedIn
                </label>
                <div className="relative">
                  <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Linkedin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </span>
                  <input
                    type="text"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  GitHub
                </label>
                <div className="relative">
                  <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </span>
                  <input
                    type="text"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="https://github.com/yourusername"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Website
                </label>
                <div className="relative">
                  <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </span>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Charity Donation */}
          <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Charity Donation
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Donate a percentage of your earnings to charity automatically
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="charityEnabled"
                  name="charityEnabled"
                  checked={formData.charityEnabled}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="charityEnabled" className="text-sm text-gray-700 cursor-pointer">
                  Enable automatic charity donations
                </label>
              </div>
              {formData.charityEnabled && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Donation Percentage
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      name="charityPercentage"
                      min="1"
                      max="50"
                      value={formData.charityPercentage}
                      onChange={handleChange}
                      className="flex-1"
                    />
                    <span className="text-lg font-bold text-indigo-600 w-12 text-right">
                      {formData.charityPercentage}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.charityPercentage}% of your earnings will be donated to selected charities
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Save Button - Sticky at bottom on mobile */}
          <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:relative sm:border-0 sm:p-0 -mx-4 sm:mx-0">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Changes...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ProfileSettingsPage;