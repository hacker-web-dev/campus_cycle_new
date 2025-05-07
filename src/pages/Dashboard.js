import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaBoxOpen, FaHeart, FaCommentDots, FaChartLine } from 'react-icons/fa';

const Dashboard = () => {
  // Mock user data
  const user = {
    name: 'Alex Johnson',
    email: 'alex@university.edu',
    joinDate: 'August 2022',
    profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80'
  };

  // Mock stats data
  const stats = {
    activeListings: 4,
    soldItems: 7,
    savedItems: 12,
    messagesUnread: 3
  };

  // Mock listings data
  const listings = [
    {
      id: 1,
      title: 'Computer Science Textbook',
      price: 45,
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80',
      status: 'active',
      views: 24,
      savedBy: 3,
      date: '2 days ago'
    },
    {
      id: 2,
      title: 'Desk Lamp - Adjustable',
      price: 15,
      image: 'https://images.unsplash.com/photo-1534025644911-6f8834e29c8f?auto=format&fit=crop&q=80',
      status: 'active',
      views: 18,
      savedBy: 1,
      date: '5 days ago'
    },
    {
      id: 3,
      title: 'Wireless Headphones',
      price: 50,
      image: 'https://images.unsplash.com/photo-1546435770-a3e0e7a3f35d?auto=format&fit=crop&q=80',
      status: 'active',
      views: 32,
      savedBy: 5,
      date: '1 week ago'
    },
    {
      id: 4,
      title: 'Dorm Room Bookshelf',
      price: 30,
      image: 'https://images.unsplash.com/photo-1588279102040-6a397a7a4262?auto=format&fit=crop&q=80',
      status: 'active',
      views: 11,
      savedBy: 0,
      date: '1 week ago'
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        
        {/* Stats cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaBoxOpen className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Listings</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.activeListings}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/listings" className="font-medium text-primary-600 hover:text-primary-500">View all</Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaChartLine className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Sold Items</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.soldItems}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/sales" className="font-medium text-primary-600 hover:text-primary-500">View history</Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaHeart className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Saved Items</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.savedItems}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/saved" className="font-medium text-primary-600 hover:text-primary-500">View all</Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaCommentDots className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Messages</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {stats.messagesUnread > 0 ? (
                          <span className="flex items-center">
                            {stats.messagesUnread}
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              New
                            </span>
                          </span>
                        ) : '0'}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/messages" className="font-medium text-primary-600 hover:text-primary-500">View all</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Your listings section */}
        <div className="mt-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Your Listings</h2>
            <Link 
              to="/create-listing" 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FaPlus className="-ml-1 mr-2 h-4 w-4" />
              Add New Listing
            </Link>
          </div>

          <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {listings.map((listing) => (
                <li key={listing.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={listing.image}
                          alt={listing.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-primary-600 truncate">
                            <Link to={`/product/${listing.id}`}>{listing.title}</Link>
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {listing.status === 'active' ? 'Active' : 'Pending'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-1 flex flex-col sm:flex-row sm:justify-between">
                          <div>
                            <p className="text-lg font-semibold text-gray-900">
                              ${listing.price}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Listed {listing.date}
                            </p>
                          </div>
                          <div className="mt-2 sm:mt-0 flex sm:items-end flex-col text-sm text-gray-500">
                            <p>{listing.views} views</p>
                            <p>{listing.savedBy} {listing.savedBy === 1 ? 'person' : 'people'} saved</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-3">
                      <Link 
                        to={`/edit-listing/${listing.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Mark as Sold
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;