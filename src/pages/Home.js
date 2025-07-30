import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaExchangeAlt, FaUserGraduate, FaRecycle, FaHandshake } from 'react-icons/fa';
import ApiService from '../services/api';
import SmartRecommendations from '../components/SmartRecommendations';

const Home = ({ isAuthenticated, user }) => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured items
        const items = await ApiService.getItems({ sortBy: 'newest' });
        setFeaturedItems(items.slice(0, 4));

        // Fetch user stats if authenticated
        if (isAuthenticated) {
          try {
            const stats = await ApiService.getUserProfile();
            setUserStats(stats);
          } catch (error) {
            console.error('Error fetching user stats:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching featured items:', error);
        // Fallback to static data
        setFeaturedItems([
          {
            _id: 1,
            title: "Engineering Textbook Bundle",
            price: 85,
            images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80"],
            condition: "Good",
            location: "Engineering Building",
            seller: { name: "John D." }
          },
          {
            _id: 2,
            title: "Desk Lamp - Adjustable",
            price: 15,
            images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80"],
            condition: "Like New",
            location: "North Campus",
            seller: { name: "Sarah M." }
          },
          {
            _id: 3,
            title: "Laptop Stand - Aluminum",
            price: 25,
            images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80"],
            condition: "New",
            location: "Computer Science Building",
            seller: { name: "Alex T." }
          },
          {
            _id: 4,
            title: "Bookshelf - 3 Tier",
            price: 40,
            images: ["https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&q=80"],
            condition: "Good",
            location: "West Dorms",
            seller: { name: "Emma L." }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const categories = [
    { name: "Textbooks", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80" },
    { name: "Electronics", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80" },
    { name: "Furniture", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80" },
    { name: "Clothing", image: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&q=80" },
    { name: "Appliances", image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80" },
    { name: "Sports Equipment", image: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&q=80" },
  ];

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-700 to-primary-800">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover mix-blend-multiply filter brightness-50"
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80"
            alt="University campus"
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          {isAuthenticated ? (
            <>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
              </h1>
              <p className="mt-6 max-w-2xl text-xl text-gray-300">
                Ready to find great deals or sell your items? Your campus marketplace awaits.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/browse"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Browse Items
                </Link>
                <Link
                  to="/sell"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-100"
                >
                  List an Item
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center px-5 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-primary-700"
                >
                  My Dashboard
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Sustainable Shopping for Students
              </h1>
              <p className="mt-6 max-w-2xl text-xl text-gray-300">
                Buy and sell used textbooks, furniture, electronics, and more within your campus community.
                Save money while reducing waste.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/browse"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Browse Items
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-100"
                >
                  Sign Up Now
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Campus Cycle</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to buy and sell on campus
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Connect with other students to find the items you need and sell what you don't.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <FaExchangeAlt className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Convenient Trading</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Meet on campus for easy, safe transactions. No shipping, no hassle.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <FaUserGraduate className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">University Verified</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  All users are verified students, faculty, or staff from your university.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <FaRecycle className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Eco-Friendly</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Help reduce waste by giving items a second life within the campus community.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <FaHandshake className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Trusted Community</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  User ratings and reviews help ensure trustworthy transactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Browse by Category</h2>
            <p className="mt-4 text-lg text-gray-500">
              Find exactly what you're looking for from our wide selection of categories
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {categories.map((category, index) => (
              <div key={index} className="overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:scale-105">
                <div className="relative h-48">
                  <img
                    className="w-full h-full object-cover"
                    src={category.image}
                    alt={category.name}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <h3 className="text-xl font-bold text-white">{category.name}</h3>
                  </div>
                </div>
                <div className="bg-white p-4 flex justify-center">
                  <Link
                    to={`/browse?category=${category.name.toLowerCase()}`}
                    className="text-primary-600 hover:text-primary-800 font-medium"
                  >
                    View All {category.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Items Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Featured Items</h2>
            <p className="mt-4 text-lg text-gray-500">
              Check out some of the hottest items currently available
            </p>
          </div>

          {loading ? (
            <div className="mt-10 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredItems.map((item) => (
                <div key={item._id} className="card transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                  <Link to={`/product/${item._id}`}>
                    <div className="relative h-56">
                      <img
                        className="w-full h-full object-cover"
                        src={item.images && item.images.length > 0 ? item.images[0].startsWith('http') ? item.images[0] : `https://campuscyclenew-production.up.railway.app${item.images[0]}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'}
                        alt={item.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
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
                        <span>Seller: {item.seller?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              to="/browse"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              View All Items
            </Link>
          </div>
        </div>
      </div>

      {/* Smart Recommendations Section */}
      {isAuthenticated && user && (
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SmartRecommendations user={user} />
          </div>
        </div>
      )}

      {/* How It Works Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-500">
              Campus Cycle makes buying and selling used items simple
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-100 text-primary-600">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Sign Up</h3>
              <p className="mt-2 text-base text-gray-500">
                Create an account using your student email. Browse items or list your own.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-100 text-primary-600">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Connect</h3>
              <p className="mt-2 text-base text-gray-500">
                Message other students about items you're interested in buying or selling.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-100 text-primary-600">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Exchange</h3>
              <p className="mt-2 text-base text-gray-500">
                Meet on campus for a safe exchange. Rate your experience to help the community.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          {isAuthenticated ? (
            <>
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                <span className="block">Ready to make your next trade?</span>
                <span className="block">Start buying or selling today.</span>
              </h2>
              <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                <div className="inline-flex rounded-md shadow">
                  <Link
                    to="/sell"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50"
                  >
                    List an Item
                  </Link>
                </div>
                <div className="ml-3 inline-flex rounded-md shadow">
                  <Link
                    to="/browse"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-500"
                  >
                    Browse Items
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                <span className="block">Ready to start?</span>
                <span className="block">Join Campus Cycle today.</span>
              </h2>
              <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                <div className="inline-flex rounded-md shadow">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50"
                  >
                    Sign Up
                  </Link>
                </div>
                <div className="ml-3 inline-flex rounded-md shadow">
                  <Link
                    to="/browse"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-500"
                  >
                    Browse Items
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;