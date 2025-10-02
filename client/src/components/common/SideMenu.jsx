import React from 'react';
import { Link } from 'react-router-dom';

// We will get the authentication status from a hook later
const isAuthenticated = false; // Placeholder

function SideMenu({ isOpen, onClose }) {
  return (
    <div className={`fixed inset-0 z-40 transition-all duration-500 ease-in-out ${isOpen ? '' : 'pointer-events-none'}`}>
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/20 transition-opacity duration-500 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      ></div>

      {/* Menu */}
      <div className={`relative w-80 max-w-[calc(100vw-4rem)] h-full bg-white shadow-xl p-6 flex flex-col transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-end items-center mb-8">
          <button onClick={onClose} className="p-2 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" aria-label="Close menu">
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="flex-grow">
          <ul className="space-y-2">
            <li><Link to="/pricing" onClick={onClose} className="block py-3 px-4 rounded-lg text-lg font-medium text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-colors">Pricing</Link></li>
            <li><Link to="/social-impact" onClick={onClose} className="block py-3 px-4 rounded-lg text-lg font-medium text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-colors">Social Impact</Link></li>
            <li><Link to="/invite" onClick={onClose} className="block py-3 px-4 rounded-lg text-lg font-medium text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-colors">Invite an Expert</Link></li>
            {/* We will add authentication logic here later */}
          </ul>
        </nav>
        <div className="border-t border-gray-200 pt-4">
          <ul className="space-y-1">
            <li><Link to="/terms" onClick={onClose} className="block py-2 px-4 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
            <li><Link to="/privacy" onClick={onClose} className="block py-2 px-4 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/faq" onClick={onClose} className="block py-2 px-4 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors">FAQ</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;