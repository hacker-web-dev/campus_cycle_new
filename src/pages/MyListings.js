import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaHeart, FaClock, FaCheckCircle, FaPauseCircle } from 'react-icons/fa';
import ApiService from '../services/api';

const MyListings = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, sold, pending
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getUserItems();
      setItems(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      try {
        await ApiService.deleteItem(itemId);
        setItems(items.filter(item => item._id !== itemId));
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
    }
  };

  const updateItemStatus = async (itemId, newStatus) => {
    try {
      await ApiService.updateItem(itemId, { status: newStatus });
      setItems(items.map(item => 
        item._id === itemId ? { ...item, status: newStatus } : item
      ));
    } catch (error) {
      console.error('Error updating item status:', error);
      alert('Failed to update item status');
    }
  };

  // Filter and sort items
  const filteredAndSortedItems = items
    .filter(item => {
      if (filter === 'all') return true;
      return item.status === filter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'views':
          return (b.views || 0) - (a.views || 0);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        default: // newest
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FaCheckCircle className="text-green-500" />;
      case 'sold':
        return <FaCheckCircle className="text-blue-500" />;
      case 'pending':
        return <FaPauseCircle className="text-yellow-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="mt-2 text-gray-600">
              Manage your items - {items.length} {items.length === 1 ? 'listing' : 'listings'} total
            </p>
          </div>
          <Link
            to="/sell"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
          >
            <FaPlus className="mr-2" />
            Add New Listing
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-12">
            <FaPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No listings yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first listing.
            </p>
            <div className="mt-6">
              <Link
                to="/sell"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <FaPlus className="mr-2" />
                Create Your First Listing
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Listings', value: items.length, color: 'bg-blue-500' },
                { label: 'Active', value: items.filter(i => i.status === 'active').length, color: 'bg-green-500' },
                { label: 'Sold', value: items.filter(i => i.status === 'sold').length, color: 'bg-purple-500' },
                { label: 'Total Views', value: items.reduce((sum, i) => sum + (i.views || 0), 0), color: 'bg-orange-500' }
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      <div className="w-6 h-6 bg-white bg-opacity-30 rounded"></div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                {/* Status Filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="sold">Sold</option>
                  <option value="pending">Pending</option>
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="alphabetical">Alphabetical</option>
                  <option value="views">Most Viewed</option>
                </select>
              </div>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedItems.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="relative">
                    <Link to={`/product/${item._id}`} className="block">
                      <div className="relative h-48">
                        <img
                          src={item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/300x200?text=No+Image'}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                          }}
                        />
                        <div className="absolute top-2 left-2 flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                          <span className="px-2 py-1 bg-black bg-opacity-50 rounded text-xs font-bold text-white">
                            {item.condition}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                  
                  <div className="p-4">
                    <Link to={`/product/${item._id}`} className="block">
                      <h3 className="text-lg font-semibold text-gray-900 truncate hover:text-primary-600">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xl font-bold text-primary-600">${item.price}</p>
                    </Link>
                    
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <FaEye className="mr-1" />
                      <span>{item.views || 0} views</span>
                      <span className="mx-2">•</span>
                      <span>{item.category}</span>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-500">
                      Listed {new Date(item.createdAt).toLocaleDateString()}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex justify-between">
                      <div className="flex space-x-2">
                        <Link
                          to={`/product/${item._id}`}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <FaEye className="mr-1" />
                          View
                        </Link>
                        {item.status === 'active' && (
                          <button
                            onClick={() => updateItemStatus(item._id, 'sold')}
                            className="inline-flex items-center px-3 py-1 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                          >
                            Mark Sold
                          </button>
                        )}
                      </div>
                      
                      <button
                        onClick={() => deleteItem(item._id)}
                        className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                      >
                        <FaTrash className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredAndSortedItems.length === 0 && filter !== 'all' && (
              <div className="text-center py-12">
                <p className="text-gray-500">No {filter} listings found.</p>
                <button
                  onClick={() => setFilter('all')}
                  className="mt-2 text-primary-600 hover:text-primary-500 font-medium"
                >
                  Show all listings
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyListings;