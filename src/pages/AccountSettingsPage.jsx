import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboardv2/layout/DashboardLayout';
import DashboardPageHeader from '@/components/dashboardv2/layout/DashboardPageHeader';
import DashboardPageContent from '@/components/dashboardv2/layout/DashboardPageContent';
import apiClient from '@/api';

function AccountSettingsPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/me/profile');
      setProfile(response.data);

      // Populate form with existing data
      setFormData({
        firstName: response.data?.user?.fname || '',
        lastName: response.data?.user?.lname || '',
        email: response.data?.user?.email || '',
        address: response.data?.user?.address || '',
        city: response.data?.user?.city || '',
        country: response.data?.user?.country || '',
        postalCode: response.data?.user?.zip || '',
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      // Prepare data in the format expected by the API
      const updateData = {
        fname: formData.firstName,
        lname: formData.lastName,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        zip: formData.postalCode,
      };

      // Use apiClient which handles authentication automatically
      await apiClient.put('/me/account', updateData);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Refresh profile data
      fetchProfile();
    } catch (error) {
      console.error('Failed to update account:', error);
      alert(`Failed to update account: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectStripe = () => {
    // TODO: Implement Stripe Connect flow
    alert('Stripe Connect integration coming soon!\n\nThis will redirect you to Stripe to connect your account for receiving payments.');
    console.log('Initiating Stripe Connect flow...');
  };

  const handleDeleteAccount = async () => {
    if (showDeleteConfirm) {
      setIsDeleting(true);
      try {
        // Call Vercel endpoint to delete account (handles media cleanup + email)
        const response = await fetch('/api/users/delete-account', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('qc_token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete account');
        }

        // Clear authentication and redirect to home
        localStorage.removeItem('qc_token');
        alert('Your account has been permanently deleted.\n\nWe\'re sorry to see you go. You will be redirected to the home page.');
        window.location.href = '/';
      } catch (error) {
        console.error('Failed to delete account:', error);
        alert('Failed to delete account: ' + (error.response?.data?.error || error.message) + '\n\nPlease try again or contact support.');
        setShowDeleteConfirm(false);
      } finally {
        setIsDeleting(false);
      }
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleManageSubscription = () => {
    // TODO: Implement subscription management (redirect to Stripe portal)
    alert('Subscription management coming soon!\n\nThis will redirect you to the billing portal where you can:\n- Update payment method\n- View invoices\n- Cancel subscription');
    console.log('Opening subscription management...');
  };

  // Mock data
  const isStripeConnected = profile?.user?.stripe_account_id ? true : false;
  const subscriptionPlan = 'Pro Plan'; // Mock
  const subscriptionStatus = 'Active'; // Mock

  if (loading) {
    return (
      <DashboardLayout breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Account Settings' }]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Account Settings' }]}>
      <DashboardPageContent maxWidth="4xl">
        <DashboardPageHeader
          title="Account Settings"
          subtitle="Manage your personal information, payments, and subscription"
        />

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold">Account updated successfully!</span>
            </div>
          </div>
        )}

        {/* Content Sections */}
        <div className="space-y-6 sm:space-y-8">
          {/* Personal Information */}
          <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              Personal Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
            </div>
          </section>

          {/* Address */}
          <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              Address
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="10001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Payment Settings */}
          <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              Payment Settings
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isStripeConnected ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {isStripeConnected ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">Stripe Account</div>
                    <div className="text-sm text-gray-600 mt-0.5">
                      {isStripeConnected ? (
                        <span className="text-green-600 font-medium">Connected</span>
                      ) : (
                        'Not connected'
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {isStripeConnected
                        ? 'You can receive payments from customers'
                        : 'Connect Stripe to receive payments'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleConnectStripe}
                  className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold text-sm transition flex-shrink-0 ${
                    isStripeConnected
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isStripeConnected ? 'Manage' : 'Connect'}
                </button>
              </div>
            </div>
          </section>

          {/* Subscription */}
          <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              Subscription
            </h2>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-gray-900 text-base sm:text-lg">{subscriptionPlan}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      {subscriptionStatus}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Unlimited questions • Priority support • Advanced analytics
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Next billing date: November 5, 2025
                  </p>
                </div>
                <button
                  onClick={handleManageSubscription}
                  className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-sm text-gray-700 hover:bg-gray-50 transition shadow-sm flex-shrink-0"
                >
                  Manage
                </button>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-white rounded-xl border border-red-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-red-600 mb-4">
              Danger Zone
            </h2>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">Delete Account</div>
                  <p className="text-sm text-gray-600 mt-1">
                    Permanently delete your account and all associated data
                  </p>
                  {showDeleteConfirm && (
                    <div className="mt-3 p-3 bg-red-100 rounded-lg border border-red-300">
                      <p className="text-sm font-semibold text-red-900 mb-1">
                        ⚠️ Are you absolutely sure?
                      </p>
                      <p className="text-xs text-red-700">
                        This action cannot be undone. Click "Delete Account" again to confirm.
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className={`w-full sm:w-auto min-w-[140px] px-4 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
                    showDeleteConfirm
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-white border border-red-300 text-red-600 hover:bg-red-50'
                  }`}
                >
                  {isDeleting && showDeleteConfirm ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
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
      </DashboardPageContent>
    </DashboardLayout>
  );
}

export default AccountSettingsPage;