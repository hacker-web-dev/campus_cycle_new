import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaFilter, FaTimes, FaSearch, FaSort, FaList, FaThLarge } from 'react-icons/fa';

const Browse = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || '';

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [condition, setCondition] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Mock data (would be fetched from API in a real app)
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock categories
  const categories = [
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
  ];

  // Mock conditions
  const conditions = ["New", "Like New", "Good", "Fair", "Poor"];

  // Fetch mock data
  useEffect(() => {
    // Simulate API fetch
    const fetchItems = async () => {
      setLoading(true);
      // In a real app, this would be an API call
      setTimeout(() => {
        const mockItems = Array(20).fill().map((_, index) => ({
          id: index + 1,
          title: ["Engineering Textbook", "MacBook Pro", "Desk Lamp", "Dorm Chair", "Coffee Maker", "Calculator", "Lab Coat"][Math.floor(Math.random() * 7)] + ` ${index + 1}`,
          price: Math.floor(Math.random() * 300) + 10,
          image: `https://source.unsplash.com/random/300x200?${Math.random()}`,
          condition: conditions[Math.floor(Math.random() * conditions.length)],
          category: categories[Math.floor(Math.random() * (categories.length - 1)) + 1],
          location: ["North Campus", "South Campus", "Engineering Building", "Science Center", "Library"][Math.floor(Math.random() * 5)],
          seller: ["Alex", "Jordan", "Taylor", "Sam", "Jamie"][Math.floor(Math.random() * 5)] + " " + ["S.", "M.", "T.", "L.", "J."][Math.floor(Math.random() * 5)],
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
        }));
        setItems(mockItems);
        setLoading(false);
      }, 800);
    };

    fetchItems();
  }, []);

  // Filter and sort items
  const filteredItems = items.filter(item => {
    // Filter by search term
    if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by category
    if (selectedCategory && selectedCategory !== "All Categories" && item.category !== selectedCategory) {
      return false;
    }
    
    // Filter by price range
    if (priceRange.min && item.price < parseInt(priceRange.min)) {
      return false;
    }
    if (priceRange.max && item.price > parseInt(priceRange.max)) {
      return false;
    }
    
    // Filter by condition
    if (condition && item.condition !== condition) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Sort items
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'a-z':
        return a.title.localeCompare(b.title);
      case 'z-a':
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setCondition('');
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
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'bg-white text-gray-500'}`}
              >
                <FaThLarge />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'bg-white text-gray-500'}`}
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
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500"
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
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
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
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
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
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                          />
                          <label htmlFor={`mobile-condition-${index}`} className="ml-3 text-sm text-gray-700">
                            {cond}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="flex-1 bg-primary-600 py-2 px-4 rounded-md text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500"
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
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
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
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
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
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor={`condition-${index}`} className="ml-3 text-sm text-gray-700">
                        {cond}
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
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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
                    className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}
                  >
                    <FaThLarge />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}
                  >
                    <FaList />
                  </button>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategory || priceRange.min || priceRange.max || condition) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedCategory && selectedCategory !== "All Categories" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                      Category: {selectedCategory}
                      <button
                        type="button"
                        onClick={() => setSelectedCategory('')}
                        className="ml-1 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-primary-400 hover:bg-primary-200 hover:text-primary-500 focus:outline-none"
                      >
                        <span className="sr-only">Remove filter</span>
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}
                  {(priceRange.min || priceRange.max) && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                      Price: {priceRange.min ? `$${priceRange.min}` : '$0'} - {priceRange.max ? `$${priceRange.max}` : 'Any'}
                      <button
                        type="button"
                        onClick={() => setPriceRange({ min: '', max: '' })}
                        className="ml-1 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-primary-400 hover:bg-primary-200 hover:text-primary-500 focus:outline-none"
                      >
                        <span className="sr-only">Remove filter</span>
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}
                  {condition && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                      Condition: {condition}
                      <button
                        type="button"
                        onClick={() => setCondition('')}
                        className="ml-1 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-primary-400 hover:bg-primary-200 hover:text-primary-500 focus:outline-none"
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredItems.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <h3 className="mt-2 text-lg font-medium text-gray-900">No items found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter criteria to find what you're looking for.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Grid View */}
            {!loading && filteredItems.length > 0 && viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
                    <Link to={`/product/${item.id}`} className="block">
                      <div className="relative h-48">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                          }}
                        />
                        <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-primary-500 rounded text-xs font-bold text-white">
                          {item.condition}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{item.title}</h3>
                        <p className="mt-1 text-xl font-bold text-primary-600">${item.price}</p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span>{item.location}</span>
                          <span className="mx-1">•</span>
                          <span>{item.category}</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          Seller: {item.seller}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {!loading && filteredItems.length > 0 && viewMode === 'list' && (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md">
                    <Link to={`/product/${item.id}`} className="block">
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative w-full sm:w-48 h-48">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                            }}
                          />
                          <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-primary-500 rounded text-xs font-bold text-white">
                            {item.condition}
                          </div>
                        </div>
                        <div className="p-4 flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                            <p className="text-xl font-bold text-primary-600">${item.price}</p>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {item.category}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {item.location}
                            </span>
                          </div>
                          <div className="mt-4 text-sm text-gray-600">
                            Seller: {item.seller}
                          </div>
                        </div>
                      </div>
                    </Link>
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