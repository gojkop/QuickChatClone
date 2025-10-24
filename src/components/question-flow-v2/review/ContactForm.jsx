import React, { useState } from 'react';

function ContactForm({ data, onChange }) {
  const [showEmailTooltip, setShowEmailTooltip] = useState(false);

  if (!data) {
    return null;
  }

  const handleChange = (field, value) => {
    if (onChange) {
      onChange({ ...data, [field]: value });
    }
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>

      {/* Email - Required */}
      <div className="mb-4">
        {/* ✅ ADDED: Flex wrapper for label + icon */}
        <div className="flex items-center gap-2 mb-2">
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 flex-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          
          {/* ✅ ADDED: Privacy Icon with Tooltip */}
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowEmailTooltip(true)}
              onMouseLeave={() => setShowEmailTooltip(false)}
              onClick={() => setShowEmailTooltip(!showEmailTooltip)}
              className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-all focus:outline-none focus:ring-2 focus:ring-green-300"
              aria-label="Privacy information"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </button>
            
            {showEmailTooltip && (
              <div 
                className="absolute right-0 top-8 z-50 w-72 bg-white rounded-xl shadow-lg border border-gray-200 p-4 animate-fadeIn"
                style={{
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.08)'
                }}
              >
                <div className="text-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="font-bold text-gray-900">Your privacy is protected</p>
                  </div>
                  
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>We'll send your answer to this email</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Your email stays private between you and the expert</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>We never share your email or send spam</span>
                    </li>
                  </ul>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      Read our <a href="/privacy" className="text-indigo-600 hover:text-indigo-700 font-semibold underline">Privacy Policy</a>
                    </p>
                  </div>
                </div>
                <div 
                  className="absolute -top-2 right-3 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"
                ></div>
              </div>
            )}
          </div>
        </div>
        
        {/* ✅ ORIGINAL INPUT - UNCHANGED */}
        <input
          type="email"
          id="email"
          name="email"
          value={data.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="your.email@example.com"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition text-base"
          required
          inputMode="email"
        />
        <p className="text-xs text-gray-500 mt-1">We'll send your answer and updates here</p>
      </div>

      {/* First Name - Optional */}
      <div className="mb-4">
        <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
          First Name <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={data.firstName || ''}
          onChange={(e) => handleChange('firstName', e.target.value)}
          placeholder="John"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition text-base"
          inputMode="text"
        />
      </div>

      {/* Last Name - Optional */}
      <div>
        <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
          Last Name <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={data.lastName || ''}
          onChange={(e) => handleChange('lastName', e.target.value)}
          placeholder="Doe"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition text-base"
          inputMode="text"
        />
      </div>
    </div>
  );
}

export default ContactForm;