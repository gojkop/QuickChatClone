import React from 'react';

function ContactForm({ data, onChange }) {
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
    <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
      <h3 className="text-base font-bold text-gray-900 mb-3">Your Contact Information</h3>
      
      <div className="space-y-3">
        {/* Email (Required) */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={data.email || ''}
            onChange={(e) => handleEmailChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition text-base"
            placeholder="your.email@example.com"
            required
          />
          <p className="text-xs text-gray-600 mt-1">
            We'll send the expert's answer to this email address
          </p>
        </div>

        {/* Name (Optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-1.5">
              First Name <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              id="firstName"
              value={data.firstName || ''}
              onChange={(e) => handleFirstNameChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition text-base"
              placeholder="John"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Last Name <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              id="lastName"
              value={data.lastName || ''}
              onChange={(e) => handleLastNameChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition text-base"
              placeholder="Smith"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactForm;