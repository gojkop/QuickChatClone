import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto py-12 px-6 text-center">
        <p className="text-gray-500">&copy; 2025 QuickChat. All rights reserved.</p>
        <div className="mt-4 flex justify-center space-x-6">
          <Link to="/terms" className="text-sm text-gray-500 hover:text-indigo-600">
            Terms of Service
          </Link>
          <Link to="/privacy" className="text-sm text-gray-500 hover:text-indigo-600">
            Privacy Policy
          </Link>
          <Link to="/faq" className="text-sm text-gray-500 hover:text-indigo-600">
            FAQ
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;