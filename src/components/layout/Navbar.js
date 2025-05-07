import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSearch, FaUser, FaPlus, FaEnvelope, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Demo purposes - would fetch this from auth context
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-primary-700' : '';
  };

  // This would be replaced with actual auth logic
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <nav className="bg-primary-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-white">
                Campus Cycle
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:ml-6 md:flex md:items-center">
            <div className="flex space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium text-white ${isActive('/')}`}
              >
                Home
              </Link>
              <Link
                to="/browse"
                className={`px-3 py-2 rounded-md text-sm font-medium text-white ${isActive('/browse')}`}
              >
                Browse Items
              </Link>
              <Link
                to="/about"
                className={`px-3 py-2 rounded-md text-sm font-medium text-white ${isActive('/about')}`}
              >
                About
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 flex items-center justify-center px-2 lg:px-6 hidden sm:block">
            <div className="max-w-lg w-full">
              <label htmlFor="search" className="sr-only">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-primary-700 text-white placeholder-gray-300 focus:outline-none focus:bg-white focus:border-white focus:text-gray-800 sm:text-sm"
                  placeholder="Search for items..."
                  type="search"
                />
              </div>
            </div>
          </div>

          {/* User actions */}
          <div className="hidden md:ml-6 md:flex md:items-center space-x-3">
            {isLoggedIn ? (
              <>
                <Link
                  to="/messages"
                  className="text-white hover:bg-primary-700 p-2 rounded-full"
                >
                  <FaEnvelope className="h-5 w-5" />
                </Link>
                <Link
                  to="/new-listing"
                  className="text-white hover:bg-primary-700 p-2 rounded-full"
                >
                  <FaPlus className="h-5 w-5" />
                </Link>
                <div className="relative">
                  <div>
                    <button
                      type="button"
                      className="bg-primary-700 text-white flex text-sm rounded-full focus:outline-none"
                      id="user-menu-button"
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-primary-800 flex items-center justify-center">
                        <FaUser className="h-4 w-4" />
                      </div>
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 border border-white text-sm font-medium rounded-md text-white hover:bg-primary-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={handleLogin} // For demo purposes
                  className="px-3 py-1.5 border border-white text-sm font-medium rounded-md text-white hover:bg-primary-700"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 bg-white text-sm font-medium rounded-md text-primary-600 hover:bg-gray-100"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-primary-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <FaTimes className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FaBars className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium text-white ${isActive('/')}`}
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              to="/browse"
              className={`block px-3 py-2 rounded-md text-base font-medium text-white ${isActive('/browse')}`}
              onClick={toggleMenu}
            >
              Browse Items
            </Link>
            <Link
              to="/about"
              className={`block px-3 py-2 rounded-md text-base font-medium text-white ${isActive('/about')}`}
              onClick={toggleMenu}
            >
              About
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-primary-700">
            <div className="px-2 space-y-1">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white"
                    onClick={toggleMenu}
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white"
                    onClick={toggleMenu}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/messages"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white"
                    onClick={toggleMenu}
                  >
                    Messages
                  </Link>
                  <Link
                    to="/new-listing"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white"
                    onClick={toggleMenu}
                  >
                    Add New Listing
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white"
                    onClick={() => {
                      handleLogin(); // For demo purposes
                      toggleMenu();
                    }}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white"
                    onClick={toggleMenu}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;