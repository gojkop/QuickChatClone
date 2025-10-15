import React, { useState } from 'react';
import apiClient from '@/api'; // ✅ ADDED

const AccountModal = ({ isOpen, onClose, profile, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: profile?.user?.fname || '',
    lastName: profile?.user?.lname || '',
    email: profile?.user?.email || '',
    address: profile?.user?.address || '',
    city: profile?.user?.city || '',
    country: profile?.user?.country || '',
    postalCode: profile?.user?.zip || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ UPDATED: Use apiClient instead of fetch
  const handleSave = async () => {
    setIsSaving(true);
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
      await apiClient.put('/me/profile', updateData);
      
      onSave(updateData);
      alert('Account updated successfully!');
      onClose();
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
        // Call backend endpoint to delete account
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
        alert('Failed to delete account: ' + error.message + '\n\nPlease try again or contact support.');
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Personal Information */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h3>
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>
            </section>

            {/* Address */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Address</h3>
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="United States"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Payment Settings */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Settings</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
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
                    <div>
                      <div className="font-semibold text-gray-900">Stripe Account</div>
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
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
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
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Subscription</h3>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 text-lg">{subscriptionPlan}</span>
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
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-sm text-gray-700 hover:bg-gray-50 transition shadow-sm"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </section>

            {/* Danger Zone */}
            <section>
              <h3 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h3>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">Delete Account</div>
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
                    className={`min-w-[140px] px-4 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${
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
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountModal;