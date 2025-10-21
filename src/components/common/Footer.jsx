// src/components/common/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      {/* Main Footer - More Compact */}
      <div className="container mx-auto py-8 px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {/* Column 1: Product */}
          <div>
            <h4 className="font-bold text-gray-900 mb-3 text-xs uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <Link to="/social-impact" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Social Impact
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 2: Resources */}
          <div>
            <h4 className="font-bold text-gray-900 mb-3 text-xs uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <a href="mailto:support@mindpick.me" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Company */}
          <div>
            <h4 className="font-bold text-gray-900 mb-3 text-xs uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:hello@mindpick.me" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          
          {/* Column 4: Legal */}
          <div>
            <h4 className="font-bold text-gray-900 mb-3 text-xs uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 5: Connect */}
          <div>
            <h4 className="font-bold text-gray-900 mb-3 text-xs uppercase tracking-wider">Connect</h4>
            <div className="flex gap-2">
              <a 
                href="https://twitter.com/mindpick" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 bg-white border border-gray-200 hover:border-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center justify-center transition-colors group"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4 text-gray-600 group-hover:text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a 
                href="https://linkedin.com/company/mindpick-me" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white border border-gray-200 hover:border-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center justify-center transition-colors group"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 text-gray-600 group-hover:text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Trust & Copyright Bar - Simplified */}
      <div className="border-t border-gray-200 bg-white">
        <div className="container mx-auto py-4 px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-5xl mx-auto">
            {/* Trust Badges - More Compact */}
            <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start text-xs">
              {/* Stripe Badge */}
              <div className="flex items-center gap-1.5">
                <svg className="h-4" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.9 0 1.85 6.29.97 6.29 5.88z" fill="#6772E5"/>
                </svg>
                <span className="text-gray-500">Secure payments</span>
              </div>
              
              {/* SSL Badge */}
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-gray-500">SSL Encrypted</span>
              </div>
              
              {/* GDPR Badge */}
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="text-gray-500">GDPR Compliant</span>
              </div>
            </div>
            
            {/* Copyright */}
            <p className="text-xs text-gray-500">
              &copy; 2025 mindPick. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;