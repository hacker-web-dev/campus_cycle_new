import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome, FaSearch } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full px-4 py-8 bg-white shadow-lg rounded-lg">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto h-16 w-16 text-yellow-400" />
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Page not found</h1>
          <p className="mt-2 text-base text-gray-500">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FaHome className="mr-2 -ml-1 h-4 w-4" />
              Go to Home
            </Link>
            <Link
              to="/browse"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FaSearch className="mr-2 -ml-1 h-4 w-4" />
              Browse Items
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;