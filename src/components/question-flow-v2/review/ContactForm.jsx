import React, { useState } from 'react';

function ContactForm({ email, onChange }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isValidEmail = email && email.includes('@');

  return (
    <div className="spacing-md">
      <div className="flex items-center gap-2 mb-2">
        <label htmlFor="email" className="label-premium flex-1">
          <span>Your Email</span>
          <span className="required-badge">Required</span>
        </label>
        
        {/* ✅ NEW: Privacy/Lock Icon with Tooltip */}
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-all focus:outline-none focus:ring-2 focus:ring-green-300"
            aria-label="Privacy information"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </button>
          
          {showTooltip && (
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
              {/* Triangle pointer */}
              <div 
                className="absolute -top-2 right-3 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"
              ></div>
            </div>
          )}
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`input-premium w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all text-base ${
            email && !isValidEmail ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="your@email.com"
          required
          autoComplete="email"
          inputMode="email"
          style={{ letterSpacing: '0.01em' }}
        />
        
        {isFocused && (
          <div 
            className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-15 blur pointer-events-none"
            style={{ zIndex: -1 }}
          />
        )}
        
        {email && isValidEmail && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
      </div>
      
      {email && !isValidEmail && (
        <p className="text-xs text-red-600 font-semibold mt-2 flex items-center gap-1.5 animate-fadeIn">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Please enter a valid email address
        </p>
      )}
      
      <p className="text-xs text-gray-600 mt-2 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Your email is private and secure
      </p>
    </div>
  );
}

export default ContactForm;