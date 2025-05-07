import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1 - Logo and Description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center text-xl font-bold">
              Campus Cycle
            </Link>
            <p className="text-gray-300 text-sm mt-2">
              A sustainable marketplace for university students to buy, sell, and exchange goods within the campus community.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <FaFacebookF />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaTwitter />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaInstagram />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaLinkedinIn />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaGithub />
              </a>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="text-md font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <Link to="/" className="hover:text-white">Home</Link>
              </li>
              <li>
                <Link to="/browse" className="hover:text-white">Browse Items</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white">Contact</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white">Blog</Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Categories */}
          <div>
            <h3 className="text-md font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <Link to="/category/electronics" className="hover:text-white">Electronics</Link>
              </li>
              <li>
                <Link to="/category/furniture" className="hover:text-white">Furniture</Link>
              </li>
              <li>
                <Link to="/category/books" className="hover:text-white">Books & Study Materials</Link>
              </li>
              <li>
                <Link to="/category/clothing" className="hover:text-white">Clothing</Link>
              </li>
              <li>
                <Link to="/category/services" className="hover:text-white">Services</Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Contact Info */}
          <div>
            <h3 className="text-md font-semibold mb-4">Contact Us</h3>
            <address className="not-italic text-gray-300 text-sm space-y-2">
              <p>123 University Avenue</p>
              <p>College Town, CT 12345</p>
              <p>Email: info@campuscycle.com</p>
              <p>Phone: (123) 456-7890</p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            &copy; {new Date().getFullYear()} Campus Cycle. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-300 hover:text-white text-sm">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-300 hover:text-white text-sm">
              Terms of Service
            </Link>
            <Link to="/faq" className="text-gray-300 hover:text-white text-sm">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;