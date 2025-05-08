import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaGithub, FaHeart, FaArrowUp } from 'react-icons/fa';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="bg-gray-900 text-white relative">
      {/* Scroll to top button */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <button 
          onClick={scrollToTop} 
          className="bg-primary-600 text-white p-3 rounded-full shadow-elevation-3 hover:shadow-elevation-4 hover:bg-primary-500 transition-all duration-300 hover:scale-110"
          aria-label="Scroll to top"
        >
          <FaArrowUp className="h-5 w-5" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1 - Logo and Description */}
          <div className="space-y-4 animate-fade-in-up">
            <Link to="/" className="flex items-center group">
              <div className="flex items-center transition-all duration-300 hover:translate-x-1">
                <svg 
                  className="h-7 w-7 text-primary-400 transition-transform duration-300 group-hover:rotate-12" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
                </svg>
                <span className="ml-2 text-xl font-bold text-white">
                  Campus<span className="text-primary-400">Cycle</span>
                </span>
              </div>
            </Link>
            <p className="text-gray-300 text-sm mt-2">
              A sustainable marketplace for university students to buy, sell, and exchange goods within the campus community.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-all duration-300 hover:scale-125">
                <FaFacebookF className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-all duration-300 hover:scale-125">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-all duration-300 hover:scale-125">
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-all duration-300 hover:scale-125">
                <FaLinkedinIn className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-all duration-300 hover:scale-125">
                <FaGithub className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-md font-semibold mb-4 text-primary-300">Quick Links</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="transform hover:translate-x-2 transition-transform duration-300">
                <Link to="/" className="hover:text-primary-300 transition-colors duration-300">Home</Link>
              </li>
              <li className="transform hover:translate-x-2 transition-transform duration-300">
                <Link to="/browse" className="hover:text-primary-300 transition-colors duration-300">Browse Items</Link>
              </li>
              <li className="transform hover:translate-x-2 transition-transform duration-300">
                <Link to="/about" className="hover:text-primary-300 transition-colors duration-300">About Us</Link>
              </li>
              <li className="transform hover:translate-x-2 transition-transform duration-300">
                <Link to="/contact" className="hover:text-primary-300 transition-colors duration-300">Contact</Link>
              </li>
              <li className="transform hover:translate-x-2 transition-transform duration-300">
                <Link to="/blog" className="hover:text-primary-300 transition-colors duration-300">Blog</Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Categories */}
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h3 className="text-md font-semibold mb-4 text-primary-300">Categories</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="transform hover:translate-x-2 transition-transform duration-300">
                <Link to="/category/electronics" className="hover:text-primary-300 transition-colors duration-300">Electronics</Link>
              </li>
              <li className="transform hover:translate-x-2 transition-transform duration-300">
                <Link to="/category/furniture" className="hover:text-primary-300 transition-colors duration-300">Furniture</Link>
              </li>
              <li className="transform hover:translate-x-2 transition-transform duration-300">
                <Link to="/category/books" className="hover:text-primary-300 transition-colors duration-300">Books & Study Materials</Link>
              </li>
              <li className="transform hover:translate-x-2 transition-transform duration-300">
                <Link to="/category/clothing" className="hover:text-primary-300 transition-colors duration-300">Clothing</Link>
              </li>
              <li className="transform hover:translate-x-2 transition-transform duration-300">
                <Link to="/category/services" className="hover:text-primary-300 transition-colors duration-300">Services</Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Contact Info */}
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <h3 className="text-md font-semibold mb-4 text-primary-300">Contact Us</h3>
            <address className="not-italic text-gray-300 text-sm space-y-2">
              <p>123 University Avenue</p>
              <p>College Town, CT 12345</p>
              <p className="hover:text-primary-300 transition-colors duration-300">Email: info@campuscycle.com</p>
              <p className="hover:text-primary-300 transition-colors duration-300">Phone: (123) 456-7890</p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <p className="text-gray-400 text-sm flex items-center">
            &copy; {new Date().getFullYear()} Campus Cycle. All rights reserved. Made with 
            <FaHeart className="inline-block mx-1 text-red-500 animate-pulse" /> for students
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-primary-300 text-sm transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-primary-300 text-sm transition-colors duration-300">
              Terms of Service
            </Link>
            <Link to="/faq" className="text-gray-400 hover:text-primary-300 text-sm transition-colors duration-300">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;