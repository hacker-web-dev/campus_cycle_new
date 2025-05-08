import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSearch, FaUser, FaPlus, FaEnvelope, FaBars, FaTimes, FaBell, FaShoppingCart } from 'react-icons/fa';

const Navbar = ({ isAuthenticated, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [animateLinks, setAnimateLinks] = useState(false);
  const location = useLocation();

  // Handle scroll effects with improved threshold and transition
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 30) {
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

  // Animate nav links when component mounts
  useEffect(() => {
    setAnimateLinks(true);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
  };

  const isActive = (path) => {
    return location.pathname === path 
      ? 'text-white before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-white before:transform before:scale-x-100 before:transition-transform before:duration-300' 
      : 'before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-white before:transform before:scale-x-0 hover:before:scale-x-100 before:transition-transform before:duration-300';
  };

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-500 ease-in-out-back ${
        scrolled 
          ? 'bg-primary-700 shadow-elevation-3 py-2 backdrop-blur-sm bg-opacity-95' 
          : 'bg-primary-600 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo with enhanced animation */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center group">
              <div className="flex items-center transition-all duration-500 hover:scale-105 transform">
                <svg 
                  className="h-8 w-8 text-white transition-all duration-500 group-hover:rotate-12 group-hover:text-secondary-300" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
                </svg>
                <span className="ml-2 text-xl font-bold text-white">
                  Campus<span className="text-secondary-300 transition-all duration-300 group-hover:text-white">Cycle</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop menu with staggered animations */}
          <div className="hidden md:ml-6 md:flex md:items-center">
            <div className="flex space-x-6">
              {['/', '/browse', '/about'].map((path, index) => {
                const label = path === '/' ? 'Home' : path === '/browse' ? 'Browse Items' : 'About';
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`px-3 py-2 rounded-md text-sm font-medium text-white relative hover:text-white transition-all duration-300 transform hover:-translate-y-0.5 ${isActive(path)} ${
                      animateLinks ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Search Icon/Bar with smoother transitions */}
          <div className="flex-1 flex items-center justify-center px-2 lg:px-6 lg:ml-6 lg:justify-end">
            {showSearchBar ? (
              <div className="max-w-lg w-full animate-fade-in-down">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="search"
                    className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-primary-700 text-white placeholder-gray-300 focus:outline-none focus:bg-white focus:border-white focus:text-gray-800 sm:text-sm transition-all duration-300 focus:ring-2 focus:ring-white focus:ring-opacity-50 shadow-inner-soft"
                    placeholder="Search for items..."
                    autoFocus
                  />
                  <button
                    onClick={toggleSearchBar}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={toggleSearchBar}
                className="hidden md:flex items-center justify-center p-2 rounded-full text-white hover:bg-primary-700 transition-all duration-300 hover:scale-110 hover:shadow-glow"
              >
                <FaSearch className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* User actions with enhanced hover effects and tooltips */}
          <div className="hidden md:ml-6 md:flex md:items-center space-x-5">
            {isAuthenticated ? (
              <>
                <Link
                  to="/messages"
                  className="text-white hover:bg-primary-700 p-2 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-glow relative group"
                >
                  <FaEnvelope className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse-slow">
                    3
                  </span>
                  <span className="absolute top-12 right-0 w-auto p-2 min-w-max rounded-md shadow-elevation-3 text-xs bg-gray-900 text-white 
                    transition-all duration-300 scale-0 group-hover:scale-100 origin-top z-10 pointer-events-none">
                    Messages
                  </span>
                </Link>
                <Link
                  to="/notifications"
                  className="text-white hover:bg-primary-700 p-2 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-glow relative group"
                >
                  <FaBell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse-slow">
                    2
                  </span>
                  <span className="absolute top-12 right-0 w-auto p-2 min-w-max rounded-md shadow-elevation-3 text-xs bg-gray-900 text-white 
                    transition-all duration-300 scale-0 group-hover:scale-100 origin-top z-10 pointer-events-none">
                    Notifications
                  </span>
                </Link>
                <Link
                  to="/new-listing"
                  className="text-white hover:bg-primary-700 p-2 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-glow relative group"
                >
                  <FaPlus className="h-5 w-5" />
                  <span className="absolute top-12 right-0 w-auto p-2 min-w-max rounded-md shadow-elevation-3 text-xs bg-gray-900 text-white 
                    transition-all duration-300 scale-0 group-hover:scale-100 origin-top z-10 pointer-events-none">
                    Add Listing
                  </span>
                </Link>
                <div className="relative group">
                  <div>
                    <Link
                      to="/profile"
                      className="bg-primary-700 flex text-sm rounded-full focus:outline-none ring-2 ring-white ring-opacity-60 transition-all duration-300 hover:scale-110 hover:ring-opacity-100 hover:shadow-glow"
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-primary-800 flex items-center justify-center overflow-hidden hover:bg-primary-700">
                        <img 
                          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80" 
                          alt="User" 
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                          onError={(e) => {
                            e.target.onError = null;
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    </Link>
                  </div>
                  <div className="absolute top-12 right-0 w-48 bg-white rounded-md shadow-elevation-3 py-1 z-10 transform opacity-0 scale-95 pointer-events-none 
                    group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-300 origin-top">
                    {['Your Profile', 'Dashboard', 'Settings'].map((item, index) => (
                      <Link 
                        key={item} 
                        to={`/${item.toLowerCase().replace(' ', '-')}`} 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors duration-200"
                        style={{ transitionDelay: `${index * 50}ms` }}
                      >
                        {item}
                      </Link>
                    ))}
                    <button
                      onClick={logout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors duration-200"
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
                  className="hidden sm:inline-flex items-center px-4 py-2 border border-white text-sm font-medium rounded-md text-white hover:bg-primary-700 transition-all duration-300 hover:shadow-glow transform hover:-translate-y-0.5"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-white text-sm font-medium rounded-md text-primary-600 hover:bg-gray-100 hover:text-primary-700 transition-all duration-300 hover:shadow-elevation-2 transform hover:-translate-y-1 hover:shadow-glow"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button with cleaner animation */}
          <div className="flex items-center md:hidden">
            {!showSearchBar && (
              <button
                onClick={toggleSearchBar}
                className="p-2 mr-2 rounded-md text-white hover:bg-primary-700 focus:outline-none transition-colors duration-300 hover:shadow-glow"
                aria-label="Search"
              >
                <FaSearch className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-primary-700 focus:outline-none transition-all duration-300 hover:shadow-glow"
              aria-expanded={isOpen}
              aria-label="Main menu"
            >
              <span className="sr-only">Open main menu</span>
              <div className="relative w-6 h-6">
                <span 
                  className={`absolute h-0.5 w-full bg-white transform transition-all duration-300 ease-in-out ${
                    isOpen ? 'rotate-45 translate-y-0' : 'translate-y-[-8px]'
                  }`} 
                />
                <span 
                  className={`absolute h-0.5 bg-white transform transition-all duration-200 ease-in-out ${
                    isOpen ? 'w-0 opacity-0' : 'w-full opacity-100'
                  }`} 
                />
                <span 
                  className={`absolute h-0.5 w-full bg-white transform transition-all duration-300 ease-in-out ${
                    isOpen ? '-rotate-45 translate-y-0' : 'translate-y-[8px]'
                  }`} 
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu with smoother sliding animation */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out-back ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {['Home', 'Browse Items', 'About'].map((item, index) => {
            const path = item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`;
            return (
              <Link
                key={item}
                to={path}
                className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700 hover:shadow-glow transition-all duration-300 transform hover:-translate-y-0.5 ${
                  isOpen ? 'animate-fade-in-up' : ''
                }`}
                style={{ animationDelay: `${50 * index}ms` }}
              >
                {item}
              </Link>
            );
          })}
        </div>
        <div className="pt-4 pb-3 border-t border-primary-700">
          <div className="px-2 space-y-1">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden ring-2 ring-white ring-opacity-50">
                    <img 
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80" 
                      alt="User profile"
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">Alex Johnson</div>
                    <div className="text-sm font-medium text-primary-200">alex@university.edu</div>
                  </div>
                </div>
                {['Your Profile', 'Dashboard', 'Messages', 'Add New Listing'].map((item, index) => {
                  const path = `/${item.toLowerCase().replace(/ /g, '-')}`;
                  const hasNotification = item === 'Messages';
                  
                  return (
                    <Link
                      key={item}
                      to={path}
                      className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700 transition-all duration-300 transform hover:-translate-y-0.5 ${
                        isOpen ? 'animate-fade-in-up' : ''
                      }`}
                      style={{ animationDelay: `${100 + (50 * index)}ms` }}
                    >
                      {item}
                      {hasNotification && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white animate-pulse-slow">
                          3
                        </span>
                      )}
                    </Link>
                  );
                })}
                <button
                  onClick={logout}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700 transition-all duration-300 transform hover:-translate-y-0.5 ${
                    isOpen ? 'animate-fade-in-up' : ''
                  }`}
                  style={{ animationDelay: '300ms' }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                <Link
                  to="/login"
                  className="block w-full px-3 py-2 rounded-md text-base font-medium text-center text-white bg-primary-700 hover:bg-primary-800 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-glow"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="block w-full px-3 py-2 rounded-md text-base font-medium text-center text-primary-700 bg-white hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-elevation-2"
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