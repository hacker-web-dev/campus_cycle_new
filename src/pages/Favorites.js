import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaTrash, FaShoppingBag, FaFilter, FaSort } from 'react-icons/fa';
import ApiService from '../services/api';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('All');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchFavorites();
    fetchCategories();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getUserFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await ApiService.getCategories();
      setCategories(['All', ...data.filter(cat => cat !== 'All Categories')]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const removeFavorite = async (itemId) => {
    try {
      await ApiService.toggleFavorite(itemId);
      setFavorites(favorites.filter(item => item._id !== itemId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove from favorites');
    }
  };

  const clearAllFavorites = async () => {
    if (window.confirm('Are you sure you want to remove all items from favorites?')) {
      try {
        for (const item of favorites) {
          await ApiService.toggleFavorite(item._id);
        }
        setFavorites([]);
      } catch (error) {
        console.error('Error clearing favorites:', error);
        alert('Failed to clear favorites');
      }
    }
  };

  // Filter and sort favorites
  const filteredAndSortedFavorites = favorites
    .filter(item => filterCategory === 'All' || item.category === filterCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        default: // newest
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FaHeart className="mr-3 text-red-500" />
            My Favorites
          </h1>
          <p className="mt-2 text-gray-600">
            Items you've saved for later - {favorites.length} {favorites.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <FaHeart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No favorites yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start browsing and save items you're interested in!
            </p>
            <div className="mt-6">
              <Link
                to="/browse"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <FaShoppingBag className="mr-2" />
                Browse Items
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                {/* Category Filter */}
                <div className="flex items-center space-x-2">
                  <FaFilter className="text-gray-500" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div className="flex items-center space-x-2">
                  <FaSort className="text-gray-500" />
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
                  </select>
                </div>
              </div>

              {/* Clear All Button */}
              <button
                onClick={clearAllFavorites}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors duration-200"
              >
                <FaTrash className="mr-2" />
                Clear All
              </button>
            </div>

            {/* Favorites Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedFavorites.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="relative">
                    <Link to={`/product/${item._id}`} className="block">
                      <div className="relative h-48">
                        <img
                          src={item.images && item.images.length > 0 ? item.images[0].startsWith('http') ? item.images[0] : `https://campuscyclenew-production.up.railway.app${item.images[0]}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                          }}
                        />
                        <div className="absolute top-2 left-2 px-2 py-1 bg-primary-600 rounded text-xs font-bold text-white">
                          {item.condition}
                        </div>
                      </div>
                    </Link>
                    
                    {/* Remove from favorites button */}
                    <button
                      onClick={() => removeFavorite(item._id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors group"
                      title="Remove from favorites"
                    >
                      <FaHeart className="text-red-500 group-hover:text-red-600" />
                    </button>
                  </div>
                  
                  <Link to={`/product/${item._id}`} className="block">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{item.title}</h3>
                      <p className="mt-1 text-xl font-bold text-primary-600">${item.price}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span>{item.location}</span>
                        <span className="mx-1">•</span>
                        <span>{item.category}</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        Seller: {item.seller?.name || 'Unknown'}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Added {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {filteredAndSortedFavorites.length === 0 && filterCategory !== 'All' && (
              <div className="text-center py-12">
                <p className="text-gray-500">No favorites found in "{filterCategory}" category.</p>
                <button
                  onClick={() => setFilterCategory('All')}
                  className="mt-2 text-primary-600 hover:text-primary-500 font-medium"
                >
                  Show all favorites
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Favorites;