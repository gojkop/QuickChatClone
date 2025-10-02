import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext'; // Import the useAuth hook
import SideMenu from './SideMenu';
import logo from '@/assets/images/logo-quickchat.png';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth(); // Get auth state and functions

  const handleSignOut = () => {
    logout();
    // No need to redirect here, the authService handles it.
  };

  return (
    <>
      <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-30">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="QuickChat Logo" className="h-10 sm:h-12 w-auto" />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4 sm:space-x-8">
            {isAuthenticated ? (
              <>
                <Link to="/expert" className="text-gray-600 font-semibold hover:text-indigo-600 transition duration-300">Dashboard</Link>
                <button onClick={handleSignOut} className="text-gray-600 font-semibold hover:text-indigo-600 transition duration-300">Sign Out</button>
              </>
            ) : (
              <Link to="/signin" className="text-gray-600 font-semibold hover:text-indigo-600 transition duration-300">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}

export default Navbar;