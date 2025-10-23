import React, { useState, useEffect } from 'react';

function ContactForm({ data, onChange }) {
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (data.email && data.email.length > 0) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }
  }, [data.email]);

  const handleEmailChange = (value) => {
    onChange({ ...data, email: value });
  };

  const handleFirstNameChange = (value) => {
    onChange({ ...data, firstName: value });
  };

  const handleLastNameChange = (value) => {
    onChange({ ...data, lastName: value });
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Your Contact Information</h3>
      
      <div className="space-y-4">
        {/* Email (Required) */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={data.email || ''}
            onChange={(e) => handleEmailChange(e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition text-base ${
              emailError ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="your.email@example.com"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            required
          />
          {emailError && (
            <div className="flex items-center gap-1 mt-2 text-xs text-red-600 font-medium animate-fadeIn">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {emailError}
            </div>
          )}
          {!emailError && (
            <p className="text-xs text-gray-600 mt-1.5">
              We'll send the expert's answer to this email address
            </p>
          )}
        </div>

        {/* Name (Optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
              First Name <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="given-name"
              value={data.firstName || ''}
              onChange={(e) => handleFirstNameChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition text-base"
              placeholder="John"
              autoComplete="given-name"
              autoCapitalize="words"
              spellCheck="false"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
              Last Name <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="family-name"
              value={data.lastName || ''}
              onChange={(e) => handleLastNameChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition text-base"
              placeholder="Smith"
              autoComplete="family-name"
              autoCapitalize="words"
              spellCheck="false"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactForm;