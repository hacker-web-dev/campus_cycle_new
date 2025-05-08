import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSearch, FaUser, FaPlus, FaEnvelope, FaBars, FaTimes, FaBell, FaShoppingCart } from 'react-icons/fa';

const Navbar = ({ isAuthenticated, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const location = useLocation();

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Reset mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'border-b-2 border-white' : '';
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-400 ease-smooth ${
      scrolled 
        ? 'bg-primary-700 shadow-elevation-2 py-2' 
        : 'bg-primary-600 py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center group">
              <div className="flex items-center transition-all duration-300 hover:scale-105">
                <svg 
                  className="h-8 w-8 text-white transition-transform duration-300 group-hover:rotate-12" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
                </svg>
                <span className="ml-2 text-xl font-bold text-white">
                  Campus<span className="text-secondary-300">Cycle</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:ml-6 md:flex md:items-center">
            <div className="flex space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-primary-700 transition-all duration-300 hover:scale-105 ${isActive('/')}`}
              >
                Home
              </Link>
              <Link
                to="/browse"
                className={`px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-primary-700 transition-all duration-300 hover:scale-105 ${isActive('/browse')}`}
              >
                Browse Items
              </Link>
              <Link
                to="/about"
                className={`px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-primary-700 transition-all duration-300 hover:scale-105 ${isActive('/about')}`}
              >
                About
              </Link>
            </div>
          </div>

          {/* Search Icon/Bar */}
          <div className="flex-1 flex items-center justify-center px-2 lg:px-6 lg:ml-6 lg:justify-end">
            {showSearchBar ? (
              <div className="max-w-lg w-full animate-fade-in">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="search"
                    className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-primary-700 text-white placeholder-gray-300 focus:outline-none focus:bg-white focus:border-white focus:text-gray-800 sm:text-sm transition-all duration-300"
                    placeholder="Search for items..."
                    autoFocus
                  />
                  <button
                    onClick={toggleSearchBar}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={toggleSearchBar}
                className="hidden md:flex items-center justify-center p-2 rounded-full text-white hover:bg-primary-700 transition-all duration-300"
              >
                <FaSearch className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* User actions */}
          <div className="hidden md:ml-6 md:flex md:items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/messages"
                  className="text-white hover:bg-primary-700 p-2 rounded-full transition-all duration-300 hover:scale-110 relative group"
                >
                  <FaEnvelope className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    3
                  </span>
                  <span className="absolute top-10 right-0 w-auto p-2 min-w-max rounded-md shadow-md text-xs bg-gray-900 text-white 
                    transition-all duration-300 scale-0 group-hover:scale-100 origin-top z-10">
                    Messages
                  </span>
                </Link>
                <Link
                  to="/notifications"
                  className="text-white hover:bg-primary-700 p-2 rounded-full transition-all duration-300 hover:scale-110 relative group"
                >
                  <FaBell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    2
                  </span>
                  <span className="absolute top-10 right-0 w-auto p-2 min-w-max rounded-md shadow-md text-xs bg-gray-900 text-white 
                    transition-all duration-300 scale-0 group-hover:scale-100 origin-top z-10">
                    Notifications
                  </span>
                </Link>
                <Link
                  to="/new-listing"
                  className="text-white hover:bg-primary-700 p-2 rounded-full transition-all duration-300 hover:scale-110 relative group"
                >
                  <FaPlus className="h-5 w-5" />
                  <span className="absolute top-10 right-0 w-auto p-2 min-w-max rounded-md shadow-md text-xs bg-gray-900 text-white 
                    transition-all duration-300 scale-0 group-hover:scale-100 origin-top z-10">
                    Add Listing
                  </span>
                </Link>
                <div className="relative group">
                  <div>
                    <Link
                      to="/profile"
                      className="bg-primary-700 flex text-sm rounded-full focus:outline-none ring-2 ring-white transition-all duration-300 hover:scale-110"
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-primary-800 flex items-center justify-center overflow-hidden hover:bg-primary-700">
                        <img 
                          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80" 
                          alt="User" 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onError = null;
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    </Link>
                  </div>
                  <div className="absolute top-10 right-0 w-48 bg-white rounded-md shadow-elevation-3 py-1 z-10 transform opacity-0 scale-95 pointer-events-none 
                    group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-300 origin-top">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150">
                      Your Profile
                    </Link>
                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150">
                      Dashboard
                    </Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150">
                      Settings
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex px-4 py-2 border border-white text-sm font-medium rounded-md text-white hover:bg-primary-700 transition-all duration-300 hover:shadow-glow"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-white text-sm font-medium rounded-md text-primary-600 hover:bg-gray-100 hover:text-primary-700 transition-all duration-300 hover:shadow-elevation-2 transform hover:-translate-y-1"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            {!showSearchBar && (
              <button
                onClick={toggleSearchBar}
                className="p-2 mr-2 rounded-md text-white hover:bg-primary-700 focus:outline-none transition-colors duration-300"
              >
                <FaSearch className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-primary-700 focus:outline-none transition-all duration-300"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <FaTimes className="block h-6 w-6 animate-fade-in" aria-hidden="true" />
              ) : (
                <FaBars className="block h-6 w-6 animate-fade-in" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700 transition-all duration-300 animate-fade-in-up"
          >
            Home
          </Link>
          <Link
            to="/browse"
            className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: '50ms' }}
          >
            Browse Items
          </Link>
          <Link
            to="/about"
            className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            About
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-primary-700">
          <div className="px-2 space-y-1">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80" 
                      alt="User profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">Alex Johnson</div>
                    <div className="text-sm font-medium text-primary-200">alex@university.edu</div>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700 transition-all duration-300"
                >
                  Your Profile
                </Link>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700 transition-all duration-300"
                >
                  Dashboard
                </Link>
                <Link
                  to="/messages"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700 transition-all duration-300"
                >
                  Messages
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
                    3
                  </span>
                </Link>
                <Link
                  to="/new-listing"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700 transition-all duration-300"
                >
                  Add New Listing
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700 transition-all duration-300"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="space-y-2 animate-fade-in-up">
                <Link
                  to="/login"
                  className="block w-full px-3 py-2 rounded-md text-base font-medium text-center text-white bg-primary-700 hover:bg-primary-800 transition-all duration-300"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="block w-full px-3 py-2 rounded-md text-base font-medium text-center text-primary-700 bg-white hover:bg-gray-100 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;