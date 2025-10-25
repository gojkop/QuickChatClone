import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/api';
import DashboardLayout from '@/components/dashboardv2/layout/DashboardLayout';
import AvatarUpload from '@/components/dashboard/AvatarUpload';
import CharityDonationSelector from '@/components/dashboard/CharityDonationSelector';
import CharitySelector from '@/components/dashboard/CharitySelector';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Twitter, Linkedin, Github, Globe, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

function ProfileSettingsPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [expertiseInput, setExpertiseInput] = useState('');
  const [showBioPreview, setShowBioPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [handleValidation, setHandleValidation] = useState({ checking: false, available: null, message: '' });
  const handleCheckTimeout = useRef(null);
  const initialFormData = useRef(null);

  // Convert profile data (cents) to form data (dollars) for initial state
  const convertProfileToFormData = (profile) => {
    return {
      ...profile,
      tier1_price_usd: profile.tier1_price_cents ? profile.tier1_price_cents / 100 : '',
      tier2_min_price_usd: profile.tier2_min_price_cents ? profile.tier2_min_price_cents / 100 : '',
      tier2_max_price_usd: profile.tier2_max_price_cents ? profile.tier2_max_price_cents / 100 : '',
      tier2_auto_decline_below_usd: profile.tier2_auto_decline_below_cents ? profile.tier2_auto_decline_below_cents / 100 : ''
    };
  };

  const [formData, setFormData] = useState({});

  // Calculate profile completeness
  const calculateCompleteness = useCallback(() => {
    if (!formData) return 0;

    const fields = [
      formData.handle,
      formData.avatar_url,
      formData.professional_title,
      formData.tagline,
      formData.bio,
      formData.expertise && formData.expertise.length > 0,
      (formData.tier1_enabled !== false && formData.tier1_price_usd) || (formData.tier2_enabled && formData.tier2_min_price_usd),
      Object.values(formData.socials || {}).some(v => v)
    ];

    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, [formData]);

  const completeness = calculateCompleteness();

  // Check if form data has changed
  useEffect(() => {
    if (initialFormData.current) {
      const hasChanged = JSON.stringify(formData) !== JSON.stringify(initialFormData.current);
      setHasUnsavedChanges(hasChanged);
    }
  }, [formData]);

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Debounced handle validation
  const checkHandleAvailability = useCallback(async (handle) => {
    if (!handle || handle === profile?.handle) {
      setHandleValidation({ checking: false, available: null, message: '' });
      return;
    }

    setHandleValidation({ checking: true, available: null, message: 'Checking availability...' });

    try {
      const response = await apiClient.get(`/expert/profile/check-handle/${handle}`);
      if (response.data.available) {
        setHandleValidation({ checking: false, available: true, message: 'Handle is available!' });
      } else {
        setHandleValidation({ checking: false, available: false, message: 'Handle is already taken' });
      }
    } catch (err) {
      setHandleValidation({ checking: false, available: null, message: '' });
    }
  }, [profile]);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiClient.get('/me/profile');
        const expertProfile = response.data.expert_profile || {};
        const processedProfile = {
          ...expertProfile,
          user: response.data.user,
          isPublic: expertProfile.public,
          avatar_url: expertProfile.avatar_url || null,
          charity_percentage: expertProfile.charity_percentage || 0,
          selected_charity: expertProfile.selected_charity || null,
          accepting_questions: expertProfile.accepting_questions ?? true,
          daily_digest_enabled: expertProfile.daily_digest_enabled !== false,
          tier1_enabled: expertProfile.tier1_enabled !== false,
          tier1_price_cents: expertProfile.tier1_price_cents,
          tier1_sla_hours: expertProfile.tier1_sla_hours || '',
          tier1_description: expertProfile.tier1_description || '',
          tier2_enabled: expertProfile.tier2_enabled || false,
          tier2_min_price_cents: expertProfile.tier2_min_price_cents,
          tier2_max_price_cents: expertProfile.tier2_max_price_cents,
          tier2_sla_hours: expertProfile.tier2_sla_hours || '',
          tier2_auto_decline_below_cents: expertProfile.tier2_auto_decline_below_cents,
          tier2_description: expertProfile.tier2_description || ''
        };
        setProfile(processedProfile);
        const converted = convertProfileToFormData(processedProfile);
        setFormData(converted);
        initialFormData.current = converted;
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Could not load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [id]: type === 'checkbox' ? checked : value }));

    // Debounced handle validation
    if (id === 'handle') {
      if (handleCheckTimeout.current) {
        clearTimeout(handleCheckTimeout.current);
      }
      handleCheckTimeout.current = setTimeout(() => {
        checkHandleAvailability(value);
      }, 500);
    }
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
        setError('');
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
    if (error && error.includes('Maximum 6 expertise tags')) {
      setError('');
    }
  };

  const handleAvatarChange = (uploadResult) => {
    setFormData(prev => ({
      ...prev,
      avatar_url: uploadResult.url,
      avatar_key: uploadResult.key
    }));
  };

  const handleCharityPercentageChange = (percentage) => {
    setFormData(prev => ({ ...prev, charity_percentage: percentage }));
  };

  const handleCharityChange = (charityId) => {
    setFormData(prev => ({ ...prev, selected_charity: charityId }));
  };

  const handleRemoveAvatar = async () => {
    try {
      await apiClient.post('/upload/profile-picture', {
        image_url: null
      });

      setFormData(prev => ({ ...prev, avatar_url: null, avatar_key: null }));
      localStorage.removeItem('qc_avatar');
    } catch (err) {
      console.error('Error removing avatar:', err);
      setError('Failed to remove avatar. Please try again.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    // Validate mandatory fields
    if (!formData.handle || formData.handle.trim() === '') {
      setError('Profile handle is required');
      setIsSaving(false);
      return;
    }

    // Tier validation
    if (!formData.tier1_enabled && !formData.tier2_enabled) {
      setError('At least one pricing tier must be enabled');
      setIsSaving(false);
      return;
    }

    // Tier 1 validation
    if (formData.tier1_enabled !== false) {
      if (!formData.tier1_price_usd || formData.tier1_price_usd <= 0) {
        setError('Quick Consult price must be greater than $0');
        setIsSaving(false);
        return;
      }
      if (!formData.tier1_sla_hours || formData.tier1_sla_hours <= 0) {
        setError('Quick Consult response time must be at least 1 hour');
        setIsSaving(false);
        return;
      }
    }

    // Tier 2 validation
    if (formData.tier2_enabled) {
      if (!formData.tier2_min_price_usd || formData.tier2_min_price_usd <= 0) {
        setError('Deep Dive minimum price must be greater than $0');
        setIsSaving(false);
        return;
      }
      if (!formData.tier2_max_price_usd || formData.tier2_max_price_usd <= 0) {
        setError('Deep Dive maximum price must be greater than $0');
        setIsSaving(false);
        return;
      }
      if (Number(formData.tier2_min_price_usd) >= Number(formData.tier2_max_price_usd)) {
        setError('Deep Dive minimum price must be less than maximum price');
        setIsSaving(false);
        return;
      }
      if (!formData.tier2_sla_hours || formData.tier2_sla_hours <= 0) {
        setError('Deep Dive response time must be at least 1 hour');
        setIsSaving(false);
        return;
      }
      if (formData.tier2_auto_decline_below_usd &&
          Number(formData.tier2_auto_decline_below_usd) > Number(formData.tier2_min_price_usd)) {
        setError('Auto-decline threshold must be less than or equal to minimum price');
        setIsSaving(false);
        return;
      }
    }

    try {
      const payload = {
        price_cents: formData.tier1_enabled !== false
          ? Number(formData.tier1_price_usd) * 100
          : Number(formData.tier2_min_price_usd) * 100,
        sla_hours: formData.tier1_enabled !== false
          ? Number(formData.tier1_sla_hours)
          : Number(formData.tier2_sla_hours),
        bio: formData.bio,
        public: formData.isPublic,
        handle: formData.handle,
        tier1_enabled: formData.tier1_enabled !== false,
        tier1_price_cents: formData.tier1_enabled !== false
          ? Number(formData.tier1_price_usd) * 100
          : (profile.tier1_price_cents || Number(formData.tier1_price_usd) * 100),
        tier1_sla_hours: formData.tier1_enabled !== false
          ? Number(formData.tier1_sla_hours)
          : (profile.tier1_sla_hours || Number(formData.tier1_sla_hours)),
        tier1_description: formData.tier1_enabled !== false
          ? (formData.tier1_description || null)
          : (profile.tier1_description || formData.tier1_description || null),
        tier2_enabled: formData.tier2_enabled || false,
        tier2_pricing_mode: 'range',
        tier2_min_price_cents: formData.tier2_enabled
          ? (formData.tier2_min_price_usd ? Number(formData.tier2_min_price_usd) * 100 : null)
          : (profile.tier2_min_price_cents || (formData.tier2_min_price_usd ? Number(formData.tier2_min_price_usd) * 100 : null)),
        tier2_max_price_cents: formData.tier2_enabled
          ? (formData.tier2_max_price_usd ? Number(formData.tier2_max_price_usd) * 100 : null)
          : (profile.tier2_max_price_cents || (formData.tier2_max_price_usd ? Number(formData.tier2_max_price_usd) * 100 : null)),
        tier2_sla_hours: formData.tier2_enabled
          ? (formData.tier2_sla_hours ? Number(formData.tier2_sla_hours) : null)
          : (profile.tier2_sla_hours || (formData.tier2_sla_hours ? Number(formData.tier2_sla_hours) : null)),
        tier2_auto_decline_below_cents: formData.tier2_enabled
          ? (formData.tier2_auto_decline_below_usd ? Number(formData.tier2_auto_decline_below_usd) * 100 : null)
          : (profile.tier2_auto_decline_below_cents || (formData.tier2_auto_decline_below_usd ? Number(formData.tier2_auto_decline_below_usd) * 100 : null)),
        tier2_description: formData.tier2_enabled
          ? (formData.tier2_description || null)
          : (profile.tier2_description || formData.tier2_description || null),
        currency: 'USD',
        professional_title: formData.professional_title || '',
        tagline: formData.tagline || '',
        expertise: Array.isArray(formData.expertise) ? formData.expertise : [],
        socials: formData.socials || {},
        charity_percentage: Number(formData.charity_percentage) || 0,
        selected_charity: formData.selected_charity || null,
        accepting_questions: formData.accepting_questions,
        daily_digest_enabled: formData.daily_digest_enabled !== false
      };

      await apiClient.put('/me/profile', payload);

      // Update availability status
      try {
        await apiClient.post('/expert/profile/availability', {
          accepting_questions: formData.accepting_questions
        });
      } catch (availabilityErr) {
        console.warn('Failed to update availability status:', availabilityErr);
      }

      setSuccessMessage('Profile settings saved successfully!');
      setHasUnsavedChanges(false);
      initialFormData.current = formData;
      setTimeout(() => setSuccessMessage(''), 3000);

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Save settings error:", err);
      if (err.response?.status === 409) {
        setError("That handle is already taken.");
      } else {
        setError(err.response?.data?.message || "Could not save settings.");
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  const currentExpertise = Array.isArray(formData.expertise) ? formData.expertise : [];
  const currentSocials = formData.socials || {};

  // Enhanced skeleton loading
  if (isLoading) {
    return (
      <DashboardLayout breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Profile Settings' }]}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Cards Skeleton */}
          <div className="space-y-8">
            {/* Avatar Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="h-32 bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 rounded-xl animate-pulse"></div>
            </div>

            {/* Two Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-96 animate-pulse"></div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-96 animate-pulse"></div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-64 animate-pulse"></div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-64 animate-pulse"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Profile Settings' }]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Completeness Badge */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">Profile Settings</h1>
              <p className="text-gray-600">Manage your expert profile and preferences</p>
            </div>

            {/* Profile Completeness Indicator */}
            <div className="hidden sm:block">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={completeness === 100 ? "#10B981" : completeness >= 70 ? "#6366F1" : "#F59E0B"}
                        strokeWidth="3"
                        strokeDasharray={`${completeness}, 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-900">{completeness}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Profile Complete</div>
                    <div className="text-xs text-gray-600">
                      {completeness === 100 ? 'All done!' : 'Keep going!'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg animate-fadeInDown">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-green-800 font-medium">{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg animate-fadeInDown">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-800 font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Avatar & Profile Visibility - Full Width */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
              <div className="space-y-4">
                {/* Avatar - centered */}
                <div className="flex flex-col items-center gap-2">
                  <AvatarUpload
                    currentAvatar={formData.avatar_url || null}
                    onChange={handleAvatarChange}
                  />

                  {formData.avatar_url && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="text-xs text-gray-600 hover:text-red-600 font-medium transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove photo
                    </button>
                  )}
                </div>

                {/* Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Profile Handle <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-stretch">
                      <span className="inline-flex items-center px-4 bg-white/80 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-600 font-semibold">
                        /u/
                      </span>
                      <input
                        id="handle"
                        type="text"
                        value={formData.handle || ''}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2.5 bg-white/80 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                        placeholder="your-handle"
                        required
                      />
                    </div>
                    {/* Handle Validation Feedback */}
                    {handleValidation.message && formData.handle !== profile?.handle && (
                      <div className={`mt-1.5 text-xs flex items-center gap-1 ${
                        handleValidation.checking ? 'text-gray-600' :
                        handleValidation.available ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {handleValidation.checking && (
                          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        {!handleValidation.checking && handleValidation.available && <CheckCircle2 className="w-3 h-3" />}
                        {!handleValidation.checking && handleValidation.available === false && <AlertCircle className="w-3 h-3" />}
                        {handleValidation.message}
                      </div>
                    )}
                  </div>

                  {/* Toggle Grid - Responsive */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Public Profile Toggle */}
                    <div className="flex items-center justify-between bg-white/70 rounded-lg px-4 py-3 border border-indigo-200/50">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-gray-900 truncate">Public Profile</div>
                          <div className="text-xs text-gray-600 truncate">Discoverable</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-2">
                        <input
                          id="isPublic"
                          type="checkbox"
                          checked={formData.isPublic || false}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-600 peer-checked:to-violet-600"></div>
                      </label>
                    </div>

                    {/* Accepting Questions Toggle */}
                    <div className="flex items-center justify-between bg-white/70 rounded-lg px-4 py-3 border border-green-200/50">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-gray-900 truncate">Accepting</div>
                          <div className="text-xs text-gray-600 truncate">Questions</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-2">
                        <input
                          id="accepting_questions"
                          type="checkbox"
                          checked={formData.accepting_questions || false}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-600 peer-checked:to-emerald-600"></div>
                      </label>
                    </div>

                    {/* Daily Digest Toggle */}
                    <div className="flex items-center justify-between bg-white/70 rounded-lg px-4 py-3 border border-blue-200/50">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-gray-900 truncate">Daily Digest</div>
                          <div className="text-xs text-gray-600 truncate">8 AM UTC</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-2">
                        <input
                          id="daily_digest_enabled"
                          type="checkbox"
                          checked={formData.daily_digest_enabled !== false}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-cyan-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Grid: Pricing + Professional Identity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Pricing Tiers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></span>
                Pricing Tiers
              </h4>

              {/* Quick Consult (Tier 1) */}
              <div className="mb-4 border-2 border-blue-200 rounded-lg p-4 bg-blue-50/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    <h5 className="font-bold text-gray-900">Quick Consult</h5>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.tier1_enabled !== false}
                      onChange={(e) => setFormData(prev => ({ ...prev, tier1_enabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-blue-700"></div>
                  </label>
                </div>

                {formData.tier1_enabled !== false && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Fixed Price <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                          <input
                            type="number"
                            value={formData.tier1_price_usd || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, tier1_price_usd: e.target.value }))}
                            min="1"
                            step="1"
                            placeholder="75"
                            required={formData.tier1_enabled !== false}
                            className="w-full pl-10 pr-3 py-2 bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Response Time <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.tier1_sla_hours || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, tier1_sla_hours: e.target.value }))}
                            min="1"
                            step="1"
                            placeholder="48"
                            required={formData.tier1_enabled !== false}
                            className="w-full pl-3 pr-16 py-2 bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium">hours</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Description (Optional)
                      </label>
                      <textarea
                        value={formData.tier1_description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, tier1_description: e.target.value }))}
                        rows={2}
                        placeholder="Best for quick, focused questions..."
                        className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs resize-none"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Deep Dive (Tier 2) */}
              <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎯</span>
                    <h5 className="font-bold text-gray-900">Deep Dive</h5>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.tier2_enabled || false}
                      onChange={(e) => setFormData(prev => ({ ...prev, tier2_enabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-purple-700"></div>
                  </label>
                </div>

                {formData.tier2_enabled && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Min Price <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                          <input
                            type="number"
                            value={formData.tier2_min_price_usd || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, tier2_min_price_usd: e.target.value }))}
                            min="1"
                            step="1"
                            placeholder="150"
                            required={formData.tier2_enabled}
                            className="w-full pl-10 pr-3 py-2 bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-semibold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Max Price <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                          <input
                            type="number"
                            value={formData.tier2_max_price_usd || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, tier2_max_price_usd: e.target.value }))}
                            min="1"
                            step="1"
                            placeholder="300"
                            required={formData.tier2_enabled}
                            className="w-full pl-10 pr-3 py-2 bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-semibold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Response Time <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.tier2_sla_hours || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, tier2_sla_hours: e.target.value }))}
                            min="1"
                            step="1"
                            placeholder="48"
                            required={formData.tier2_enabled}
                            className="w-full pl-3 pr-16 py-2 bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-semibold"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium">hrs</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Auto-Decline Below (Optional)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                        <input
                          type="number"
                          value={formData.tier2_auto_decline_below_usd || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, tier2_auto_decline_below_usd: e.target.value }))}
                          min="0"
                          step="1"
                          placeholder="100"
                          className="w-full pl-10 pr-3 py-2 bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Automatically decline offers below this amount</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Description (Optional)
                      </label>
                      <textarea
                        value={formData.tier2_description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, tier2_description: e.target.value }))}
                        rows={2}
                        placeholder="Best for complex, in-depth questions..."
                        className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs resize-none"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Validation Note */}
              {!formData.tier1_enabled && !formData.tier2_enabled && (
                <p className="text-xs text-red-600 mt-2">⚠️ At least one pricing tier must be enabled</p>
              )}
            </div>

            {/* Professional Identity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></span>
                Professional Identity
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Professional Title</label>
                  <input
                    id="professional_title"
                    type="text"
                    value={formData.professional_title || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="e.g., Senior Product Designer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                  <input
                    id="tagline"
                    type="text"
                    value={formData.tagline || ''}
                    onChange={handleChange}
                    maxLength="100"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="A brief, catchy description of what you do"
                  />
                </div>

 <div>
  <div className="flex items-center justify-between mb-2">
    <label className="block text-sm font-medium text-gray-700">
      Bio <span className="text-xs text-gray-500">(Supports Markdown)</span>
    </label>
    <button
      type="button"
      onClick={() => setShowBioPreview(!showBioPreview)}
      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
    >
      {showBioPreview ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Edit
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview
        </>
      )}
    </button>
  </div>

  {/* Editor - Full Width, Larger */}
  {!showBioPreview && (
    <textarea
      id="bio"
      rows="10"
      value={formData.bio || ''}
      onChange={handleChange}
      maxLength="600"
      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm leading-relaxed font-mono"
      placeholder="Tell people about your expertise. Use **bold**, *italic*, or [links](url) for formatting..."
    />
  )}

  {/* Preview - Full Width */}
  {showBioPreview && (
    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg min-h-[240px]">
      <div className="prose prose-sm max-w-none prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-strong:font-bold">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
        >
          {formData.bio || '*No bio yet. Start typing to see your formatted bio here.*'}
        </ReactMarkdown>
      </div>
    </div>
  )}

  <div className="flex items-center justify-between mt-1">
    <a
      href="https://www.markdownguide.org/basic-syntax/"
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-gray-500 hover:text-indigo-600 flex items-center gap-1"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Markdown guide
    </a>
    <div className="text-xs text-gray-400">{(formData.bio || '').length}/600</div>
  </div>
</div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Ask me about</label>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${currentExpertise.length >= 6 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {currentExpertise.length}/6
                    </span>
                  </div>
                  <input
                    type="text"
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    onKeyDown={handleAddExpertise}
                    placeholder={currentExpertise.length >= 6 ? "Maximum tags reached" : "Type a tag and press Enter to add"}
                    disabled={currentExpertise.length >= 6}
                    className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${currentExpertise.length >= 6 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {currentExpertise.length >= 6 && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1.5">
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-sm font-medium shadow-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveExpertise(tag)}
                            className="hover:bg-indigo-100 rounded-full p-1"
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
            </div>
          </div>

          {/* Bottom Row: Social Links + Charity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Social Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></span>
                Social Links
                <span className="text-sm font-normal text-gray-500">(Optional)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'twitter', placeholder: 'twitter.com/username', icon: Twitter, label: 'Twitter / X' },
                  { key: 'linkedin', placeholder: 'linkedin.com/in/username', icon: Linkedin, label: 'LinkedIn' },
                  { key: 'github', placeholder: 'github.com/username', icon: Github, label: 'GitHub' },
                  { key: 'website', placeholder: 'yourwebsite.com', icon: Globe, label: 'Website' }
                ].map(({ key, placeholder, icon: IconComponent, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center justify-center w-5">
                        <IconComponent className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        value={currentSocials[key] || ''}
                        onChange={(e) => handleSocialChange(key, e.target.value)}
                        placeholder={placeholder}
                        className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        aria-label={key}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></span>
                Give Back to Charity
                <span className="text-sm font-normal text-gray-500">(Optional)</span>
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Donation Percentage</label>
                  <CharityDonationSelector
                    value={formData.charity_percentage || 0}
                    onChange={handleCharityPercentageChange}
                  />
                </div>

                {formData.charity_percentage > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Charity</label>
                    <CharitySelector
                      value={formData.selected_charity}
                      onChange={handleCharityChange}
                      donationPercentage={formData.charity_percentage}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Save Button */}
          <div className="hidden sm:flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {hasUnsavedChanges && (
                <span className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  You have unsaved changes
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  if (hasUnsavedChanges) {
                    if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                      navigate('/dashboard');
                    }
                  } else {
                    navigate('/dashboard');
                  }
                }}
                className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
              >
                {isSaving && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>

        {/* Mobile Sticky Save Button */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <div className="flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
            )}
            <button
              type="submit"
              form="profile-form"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
            >
              {isSaving && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Add bottom padding for mobile sticky button */}
        <div className="sm:hidden h-20"></div>
      </div>
    </DashboardLayout>
  );
}

export default ProfileSettingsPage;