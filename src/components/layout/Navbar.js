import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaUser, FaPlus, FaBars, FaTimes, FaBell, FaShoppingCart, FaHeart } from 'react-icons/fa';
import ApiService from '../../services/api';
import LoyaltyProgram from '../LoyaltyProgram';

const Navbar = ({ isAuthenticated, user, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [animateLinks, setAnimateLinks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

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

  // Fetch cart item count for authenticated users
  useEffect(() => {
    const fetchCartCount = async () => {
      if (isAuthenticated) {
        try {
          const cartData = await ApiService.getCart();
          setCartItemCount(cartData.items?.length || 0);
        } catch (error) {
          console.error('Error fetching cart count:', error);
          setCartItemCount(0);
        }
      } else {
        setCartItemCount(0);
      }
    };

    fetchCartCount();
    
    // Set up an interval to refresh cart count periodically
    const interval = setInterval(fetchCartCount, 30000); // refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [isAuthenticated, location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserDropdown(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
    if (!showSearchBar) {
      setTimeout(() => {
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput) searchInput.focus();
      }, 100);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchBar(false);
      setSearchQuery('');
    }
  };

  const handleUserDropdownClick = (e) => {
    e.stopPropagation();
    setShowUserDropdown(!showUserDropdown);
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
              {isAuthenticated ? (
                // Authenticated user menu
                ['/', '/browse', '/dashboard'].map((path, index) => {
                  const label = path === '/' ? 'Home' : path === '/browse' ? 'Browse Items' : 'Dashboard';
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
                })
              ) : (
                // Guest user menu
                ['/', '/browse', '/about'].map((path, index) => {
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
                })
              )}
            </div>
          </div>

          {/* Search Icon/Bar with smoother transitions */}
          <div className="flex-1 flex items-center justify-center px-2 lg:px-6 lg:ml-6 lg:justify-end">
            {showSearchBar ? (
              <form onSubmit={handleSearch} className="max-w-lg w-full animate-fade-in-down">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-transparent rounded-md leading-5 bg-primary-700 text-white placeholder-gray-300 focus:outline-none focus:bg-white focus:border-white focus:text-gray-800 sm:text-sm transition-all duration-300 focus:ring-2 focus:ring-white focus:ring-opacity-50 shadow-inner-soft"
                    placeholder="Search for items..."
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={toggleSearchBar}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
              </form>
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
          <div className="hidden md:ml-6 md:flex md:items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Loyalty Points Display */}
                <div className="mr-2">
                  <LoyaltyProgram user={user} compact={true} />
                </div>
                <Link
                  to="/cart"
                  className="text-white hover:bg-primary-700 p-2 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-glow relative group"
                >
                  <FaShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </span>
                  )}
                  <span className="absolute top-12 right-0 w-auto p-2 min-w-max rounded-md shadow-elevation-3 text-xs bg-gray-900 text-white 
                    transition-all duration-300 scale-0 group-hover:scale-100 origin-top z-10 pointer-events-none">
                    Cart
                  </span>
                </Link>
                <Link
                  to="/favorites"
                  className="text-white hover:bg-primary-700 p-2 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-glow relative group"
                >
                  <FaHeart className="h-5 w-5" />
                  <span className="absolute top-12 right-0 w-auto p-2 min-w-max rounded-md shadow-elevation-3 text-xs bg-gray-900 text-white 
                    transition-all duration-300 scale-0 group-hover:scale-100 origin-top z-10 pointer-events-none">
                    Favorites
                  </span>
                </Link>
                <Link
                  to="/sell"
                  className="text-white hover:bg-primary-700 p-2 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-glow relative group"
                >
                  <FaPlus className="h-5 w-5" />
                  <span className="absolute top-12 right-0 w-auto p-2 min-w-max rounded-md shadow-elevation-3 text-xs bg-gray-900 text-white 
                    transition-all duration-300 scale-0 group-hover:scale-100 origin-top z-10 pointer-events-none">
                    Add Listing
                  </span>
                </Link>
                <div className="relative">
                  <button
                    onClick={handleUserDropdownClick}
                    className="bg-primary-700 flex text-sm rounded-full focus:outline-none ring-2 ring-white ring-opacity-60 transition-all duration-300 hover:scale-110 hover:ring-opacity-100 hover:shadow-glow"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-primary-800 flex items-center justify-center overflow-hidden hover:bg-primary-700">
                      {user?.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt="User" 
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <FaUser className="h-4 w-4 text-white" style={{ display: user?.profileImage ? 'none' : 'block' }} />
                    </div>
                  </button>
                  {showUserDropdown && (
                    <div className="absolute top-12 right-0 w-48 bg-white rounded-md shadow-elevation-3 py-1 z-20 transform animate-fade-in-down">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                      </div>
                      {[
                        { label: 'Profile', path: '/profile', icon: <FaUser className="h-4 w-4" /> },
                        { label: 'Dashboard', path: '/dashboard', icon: <FaShoppingCart className="h-4 w-4" /> },
                        { label: 'Loyalty Points', path: '/loyalty', icon: <FaHeart className="h-4 w-4" /> },
                        { label: 'Cart', path: '/cart', icon: <FaShoppingCart className="h-4 w-4" /> },
                        { label: 'My Listings', path: '/my-listings', icon: <FaPlus className="h-4 w-4" /> },
                        { label: 'My Purchases', path: '/purchases', icon: <FaShoppingCart className="h-4 w-4" /> },
                        { label: 'My Sales', path: '/sales', icon: <FaUser className="h-4 w-4" /> },
                        { label: 'Favorites', path: '/favorites', icon: <FaHeart className="h-4 w-4" /> }
                      ].map((item, index) => (
                        <Link 
                          key={item.label} 
                          to={item.path} 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors duration-200"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <span className="mr-3">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100">
                        <button
                          onClick={() => {
                            logout();
                            setShowUserDropdown(false);
                          }}
                          className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors duration-200"
                        >
                          <FaTimes className="h-4 w-4 mr-3" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
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

      {/* Mobile Search Bar */}
      {showSearchBar && (
        <div className="md:hidden px-4 py-3 bg-primary-700">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-transparent rounded-md leading-5 bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 sm:text-sm"
                placeholder="Search for items..."
                autoFocus
              />
              <button
                type="button"
                onClick={toggleSearchBar}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-300"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile menu with smoother sliding animation */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out-back ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {isAuthenticated ? (
            // Authenticated user mobile menu
            ['Home', 'Browse Items', 'Dashboard'].map((item, index) => {
              const path = item === 'Home' ? '/' : item === 'Browse Items' ? '/browse' : '/dashboard';
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
            })
          ) : (
            // Guest user mobile menu
            ['Home', 'Browse Items', 'About'].map((item, index) => {
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
            })
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-primary-700">
          <div className="px-2 space-y-1">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden ring-2 ring-white ring-opacity-50">
                    <img 
                      src={user?.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80"} 
                      alt="User profile"
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user?.name || 'User'}</div>
                    <div className="text-sm font-medium text-primary-200">{user?.email || 'user@university.edu'}</div>
                  </div>
                </div>
                {['Profile', 'Dashboard', 'Cart', 'My Purchases', 'My Sales', 'Favorites', 'Sell Item'].map((item, index) => {
                  const path = item === 'Profile' ? '/profile' : 
                              item === 'Sell Item' ? '/sell' : 
                              item === 'My Purchases' ? '/purchases' :
                              item === 'My Sales' ? '/sales' :
                              `/${item.toLowerCase().replace(' ', '-')}`;
                  
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
                      {item === 'Cart' && cartItemCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {cartItemCount}
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