import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function InviteForm() {
  const [expertIdentifier, setExpertIdentifier] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (expertIdentifier.trim()) {
      // Navigate to the invite page with the identifier as a query parameter
      navigate(`/ask-anyone?expert=${encodeURIComponent(expertIdentifier)}`);
    }
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold tracking-tight">Have a question for a specific expert?</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
          If the expert you want to ask isn't on QuickChat yet, you can send them a personal invitation along with your question. We'll handle the rest.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 max-w-lg mx-auto flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={expertIdentifier}
            onChange={(e) => setExpertIdentifier(e.target.value)}
            placeholder="Enter expert's email or @social_handle"
            className="flex-grow w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:outline-none"
            required
          />
          <button type="submit" className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition transform hover:scale-105 duration-300 shadow-lg">
            Ask & Invite
          </button>
        </form>
      </div>
    </section>
  );
}

export default InviteForm;