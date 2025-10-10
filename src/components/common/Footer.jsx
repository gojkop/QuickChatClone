import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-surface border-t border-gray-200">
      <div className="container mx-auto py-12 px-6 text-center">
        <p className="text-subtext">&copy; 2025 mindPick. All rights reserved.</p>
        <div className="mt-4 flex justify-center space-x-6">
          <Link to="/terms" className="text-sm text-subtext hover:text-primary">
            Terms of Service 
          </Link>
          <Link to="/privacy" className="text-sm text-subtext hover:text-primary">
            Privacy Policy
          </Link>
          <Link to="/faq" className="text-sm text-subtext hover:text-primary">
            FAQ
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
