import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaFilter, FaTimes, FaSearch, FaSort, FaList, FaThLarge, FaHeart, FaRegHeart, FaPlus, FaShoppingCart } from 'react-icons/fa';
import ApiService from '../services/api';

const Browse = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || '';

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [condition, setCondition] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('campus_cycle_token');
    setIsAuthenticated(!!token);
  }, []);

  // Fetch user favorites if authenticated
  useEffect(() => {
    const fetchUserFavorites = async () => {
      if (isAuthenticated) {
        try {
          const favorites = await ApiService.getUserFavorites();
          setUserFavorites(favorites.map(item => item._id));
        } catch (error) {
          console.error('Error fetching user favorites:', error);
        }
      }
    };

    fetchUserFavorites();
  }, [isAuthenticated]);

  // Fetch categories and items from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const categoriesData = await ApiService.getCategories();
        setCategories(categoriesData);

        // Build query parameters
        const queryParams = new URLSearchParams();
        if (selectedCategory && selectedCategory !== 'All Categories') {
          queryParams.append('category', selectedCategory);
        }
        if (searchTerm) {
          queryParams.append('search', searchTerm);
        }
        if (priceRange.min) {
          queryParams.append('minPrice', priceRange.min);
        }
        if (priceRange.max) {
          queryParams.append('maxPrice', priceRange.max);
        }
        if (condition) {
          queryParams.append('condition', condition);
        }
        if (selectedLocation) {
          queryParams.append('location', selectedLocation);
        }
        queryParams.append('sortBy', sortBy);

        // Fetch items with filters
        const itemsData = await ApiService.getItems(Object.fromEntries(queryParams));
        setItems(Array.isArray(itemsData) ? itemsData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setItems([]);
        if (categories.length === 0) {
          setCategories([
            "All Categories",
            "Textbooks", 
            "Electronics",
            "Furniture",
            "Clothing",
            "Appliances",
            "Sports Equipment",
            "Course Materials",
            "Musical Instruments",
            "Bikes & Scooters"
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, searchTerm, priceRange, condition, selectedLocation, sortBy]);

  // Mock conditions and locations
  const conditions = ["New", "Like New", "Good", "Fair", "Poor"];
  const locations = ["All Locations", "Preston Campus", "Burnley Campus"];

  // Handle favorite toggle
  const handleFavoriteToggle = async (itemId) => {
    if (!isAuthenticated) {
      alert('Please log in to add favorites');
      return;
    }

    try {
      await ApiService.toggleFavorite(itemId);
      // Update local favorites state
      setUserFavorites(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Error updating favorite status');
    }
  };

  // Handle add to cart
  const handleAddToCart = async (itemId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert('Please log in to add items to cart');
      return;
    }

    try {
      await ApiService.addToCart(itemId, 1);
      alert('Item added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.message || 'Error adding item to cart');
    }
  };

  // Use items directly from API instead of filtering locally
  const filteredItems = items;

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setCondition('');
    setSelectedLocation('');
    setSortBy('newest');
    setIsFilterOpen(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Items</h1>
          <p className="mt-1 text-sm text-gray-500">
            Find what you need from our collection of campus items
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters (Mobile) */}
          <div className="md:hidden flex justify-between items-center mb-4">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="bg-white p-3 rounded-md shadow-sm border flex items-center gap-2"
            >
              <FaFilter className="text-gray-500" />
              <span className="text-gray-700 font-medium">Filters</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-500'}`}
              >
                <FaThLarge />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-500'}`}
              >
                <FaList />
              </button>
            </div>
          </div>

          {/* Filter Sidebar (Mobile) */}
          {isFilterOpen && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 md:hidden">
              <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Mobile Filter Content */}
                <div className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <h3 className="font-medium text-gray-900">Category</h3>
                    <div className="mt-2 space-y-2">
                      {categories.map((cat, index) => (
                        <div key={index} className="flex items-center">
                          <input
                            id={`mobile-category-${index}`}
                            name="category"
                            type="radio"
                            checked={selectedCategory === cat}
                            onChange={() => setSelectedCategory(cat)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`mobile-category-${index}`} className="ml-3 text-sm text-gray-700">
                            {cat}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <h3 className="font-medium text-gray-900">Price Range</h3>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="mobile-min-price" className="sr-only">
                          Minimum Price
                        </label>
                        <input
                          type="number"
                          id="mobile-min-price"
                          placeholder="Min"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="mobile-max-price" className="sr-only">
                          Maximum Price
                        </label>
                        <input
                          type="number"
                          id="mobile-max-price"
                          placeholder="Max"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Condition Filter */}
                  <div>
                    <h3 className="font-medium text-gray-900">Condition</h3>
                    <div className="mt-2 space-y-2">
                      {conditions.map((cond, index) => (
                        <div key={index} className="flex items-center">
                          <input
                            id={`mobile-condition-${index}`}
                            name="condition"
                            type="radio"
                            checked={condition === cond}
                            onChange={() => setCondition(cond)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`mobile-condition-${index}`} className="ml-3 text-sm text-gray-700">
                            {cond}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <h3 className="font-medium text-gray-900">Location</h3>
                    <div className="mt-2 space-y-2">
                      {locations.map((loc, index) => (
                        <div key={index} className="flex items-center">
                          <input
                            id={`mobile-location-${index}`}
                            name="location"
                            type="radio"
                            checked={selectedLocation === loc || (loc === 'All Locations' && !selectedLocation)}
                            onChange={() => setSelectedLocation(loc === 'All Locations' ? '' : loc)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`mobile-location-${index}`} className="ml-3 text-sm text-gray-700">
                            {loc}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="flex-1 bg-blue-600 py-2 px-4 rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Apply
                    </button>
                    <button
                      onClick={resetFilters}
                      className="flex-1 bg-gray-200 py-2 px-4 rounded-md text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Sidebar (Desktop) */}
          <div className="hidden md:block w-64 bg-white rounded-lg shadow-sm p-6 h-fit sticky top-20">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
            
            {/* Desktop Filter Content */}
            <div className="space-y-6">
              {/* Category Filter */}
              <div>
                <h3 className="font-medium text-gray-900">Category</h3>
                <div className="mt-2 space-y-2">
                  {categories.map((cat, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        id={`category-${index}`}
                        name="category"
                        type="radio"
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`category-${index}`} className="ml-3 text-sm text-gray-700">
                        {cat}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <h3 className="font-medium text-gray-900">Price Range</h3>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="min-price" className="sr-only">
                      Minimum Price
                    </label>
                    <input
                      type="number"
                      id="min-price"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="max-price" className="sr-only">
                      Maximum Price
                    </label>
                    <input
                      type="number"
                      id="max-price"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Condition Filter */}
              <div>
                <h3 className="font-medium text-gray-900">Condition</h3>
                <div className="mt-2 space-y-2">
                  {conditions.map((cond, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        id={`condition-${index}`}
                        name="condition"
                        type="radio"
                        checked={condition === cond}
                        onChange={() => setCondition(cond)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`condition-${index}`} className="ml-3 text-sm text-gray-700">
                        {cond}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <h3 className="font-medium text-gray-900">Location</h3>
                <div className="mt-2 space-y-2">
                  {locations.map((loc, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        id={`location-${index}`}
                        name="location"
                        type="radio"
                        checked={selectedLocation === loc || (loc === 'All Locations' && !selectedLocation)}
                        onChange={() => setSelectedLocation(loc === 'All Locations' ? '' : loc)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`location-${index}`} className="ml-3 text-sm text-gray-700">
                        {loc}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset Filters */}
              <button
                onClick={resetFilters}
                className="w-full bg-gray-200 py-2 px-4 rounded-md text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Sort Controls */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                {/* Sort Dropdown */}
                <div className="sm:w-48">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSort className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="a-z">Title: A to Z</option>
                      <option value="z-a">Title: Z to A</option>
                    </select>
                  </div>
                </div>

                {/* View Mode (Desktop) */}
                <div className="hidden sm:flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}
                  >
                    <FaThLarge />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}
                  >
                    <FaList />
                  </button>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategory || priceRange.min || priceRange.max || condition || selectedLocation) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedCategory && selectedCategory !== "All Categories" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                      Category: {selectedCategory}
                      <button
                        type="button"
                        onClick={() => setSelectedCategory('')}
                        className="ml-1 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                      >
                        <span className="sr-only">Remove filter</span>
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}
                  {(priceRange.min || priceRange.max) && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                      Price: {priceRange.min ? `$${priceRange.min}` : '$0'} - {priceRange.max ? `$${priceRange.max}` : 'Any'}
                      <button
                        type="button"
                        onClick={() => setPriceRange({ min: '', max: '' })}
                        className="ml-1 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                      >
                        <span className="sr-only">Remove filter</span>
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}
                  {condition && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                      Condition: {condition}
                      <button
                        type="button"
                        onClick={() => setCondition('')}
                        className="ml-1 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                      >
                        <span className="sr-only">Remove filter</span>
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}
                  {selectedLocation && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                      Location: {selectedLocation}
                      <button
                        type="button"
                        onClick={() => setSelectedLocation('')}
                        className="ml-1 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                      >
                        <span className="sr-only">Remove filter</span>
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Showing {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'}
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredItems.length === 0 && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <FaSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || selectedCategory || condition ? 
                      'Try adjusting your filters to see more results.' :
                      'Be the first to list an item!'
                    }
                  </p>
                  {isAuthenticated && (
                    <div className="mt-6">
                      <Link
                        to="/sell"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <FaPlus className="mr-2" />
                        List Your First Item
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Grid View */}
            {!loading && filteredItems.length > 0 && viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <div key={item._id} className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
                    <div className="relative">
                      <Link to={`/product/${item._id}`} className="block">
                        <div className="relative h-48">
                          <img
                            src={item.images && item.images.length > 0 ? 
                              (item.images[0].startsWith('http') ? item.images[0] : `https://campuscyclenew-production.up.railway.app${item.images[0]}`) : 
                              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                            }}
                          />
                          <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 rounded text-xs font-bold text-white">
                            {item.condition}
                          </div>
                        </div>
                      </Link>
                      
                      {/* Favorite Button */}
                      {isAuthenticated && (
                        <button
                          onClick={() => handleFavoriteToggle(item._id)}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                        >
                          {userFavorites.includes(item._id) ? (
                            <FaHeart className="text-red-500" />
                          ) : (
                            <FaRegHeart className="text-gray-400" />
                          )}
                        </button>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <Link to={`/product/${item._id}`} className="block">
                        <h3 className="text-lg font-semibold text-gray-900 truncate hover:text-primary-600">{item.title}</h3>
                        <p className="mt-1 text-xl font-bold text-blue-600">${item.price}</p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span>{item.location}</span>
                          <span className="mx-1">•</span>
                          <span>{item.category}</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          Seller: {item.seller?.name || 'Unknown'}
                        </div>
                        {item.features && item.features.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {item.features.slice(0, 2).map((feature, index) => (
                                <span key={index} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                  {feature}
                                </span>
                              ))}
                              {item.features.length > 2 && (
                                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                  +{item.features.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </Link>
                      
                      {/* Add to Cart Button */}
                      {isAuthenticated && (
                        <div className="mt-3">
                          <button
                            onClick={(e) => handleAddToCart(item._id, e)}
                            className="w-full bg-primary-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center"
                          >
                            <FaShoppingCart className="mr-2" />
                            Add to Cart
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {!loading && filteredItems.length > 0 && viewMode === 'list' && (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div key={item._id} className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative w-full sm:w-48 h-48">
                        <Link to={`/product/${item._id}`}>
                          <img
                            src={item.images && item.images.length > 0 ? 
                              (item.images[0].startsWith('http') ? item.images[0] : `https://campuscyclenew-production.up.railway.app${item.images[0]}`) :
                              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc>'}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                            }}
                          />
                        </Link>
                        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 rounded text-xs font-bold text-white">
                          {item.condition}
                        </div>
                        {isAuthenticated && (
                          <button
                            onClick={() => handleFavoriteToggle(item._id)}
                            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                          >
                            {userFavorites.includes(item._id) ? (
                              <FaHeart className="text-red-500" />
                            ) : (
                              <FaRegHeart className="text-gray-400" />
                            )}
                          </button>
                        )}
                      </div>
                      
                      <div className="flex-1 p-4">
                        <Link to={`/product/${item._id}`}>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-primary-600">{item.title}</h3>
                          <p className="text-2xl font-bold text-blue-600 mb-2">${item.price}</p>
                          <p className="text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                          
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <span>{item.location}</span>
                            <span className="mx-1">•</span>
                            <span>{item.category}</span>
                            <span className="mx-1">•</span>
                            <span>Seller: {item.seller?.name || 'Unknown'}</span>
                          </div>
                          
                          {item.features && item.features.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {item.features.slice(0, 3).map((feature, index) => (
                                <span key={index} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                  {feature}
                                </span>
                              ))}
                              {item.features.length > 3 && (
                                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                  +{item.features.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </Link>
                        
                        {/* Add to Cart Button for List View */}
                        {isAuthenticated && (
                          <div className="mt-3">
                            <button
                              onClick={(e) => handleAddToCart(item._id, e)}
                              className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors duration-200 flex items-center"
                            >
                              <FaShoppingCart className="mr-2" />
                              Add to Cart
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Browse;
