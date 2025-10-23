import React from 'react';

function ContactForm({ data, onChange }) {
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
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
          Email Address <span className="text-red-500">*</span>
        </label>
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