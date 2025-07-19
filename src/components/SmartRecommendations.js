import React, { useState, useEffect } from 'react';
import { FaBrain, FaStar, FaHeart, FaShoppingCart, FaEye, FaRocket, FaMagic } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ApiService from '../services/api';

const SmartRecommendations = ({ user }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [aiInsights, setAiInsights] = useState('');

  useEffect(() => {
    if (user) {
      generateSmartRecommendations();
    }
  }, [user]);

  const generateSmartRecommendations = async () => {
    try {
      setLoading(true);
      
      // Get user's interaction data
      const [items, favorites, purchases, userStats] = await Promise.all([
        ApiService.getItems(),
        ApiService.getUserFavorites().catch(() => []),
        ApiService.getUserPurchases().catch(() => []),
        ApiService.getUserStats().catch(() => ({}))
      ]);

      // Build user preference profile
      const profile = buildUserProfile(favorites, purchases, userStats);
      setUserProfile(profile);

      // Generate AI-powered recommendations
      const smartRecommendations = generateRecommendations(items, profile);
      setRecommendations(smartRecommendations);

      // Generate AI insights
      const insights = generateAIInsights(profile, smartRecommendations);
      setAiInsights(insights);

    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildUserProfile = (favorites, purchases, stats) => {
    const profile = {
      favoriteCategories: {},
      priceRange: { min: 0, max: 1000 },
      preferredConditions: {},
      buyingPatterns: {},
      interests: [],
      activityLevel: 'moderate'
    };

    // Analyze favorite categories
    favorites.forEach(item => {
      profile.favoriteCategories[item.category] = 
        (profile.favoriteCategories[item.category] || 0) + 1;
    });

    // Analyze purchase history
    purchases.forEach(order => {
      order.items.forEach(orderItem => {
        if (orderItem.item) {
          const category = orderItem.item.category;
          const condition = orderItem.item.condition;
          const price = orderItem.item.price;

          profile.favoriteCategories[category] = 
            (profile.favoriteCategories[category] || 0) + 2; // Purchases weigh more

          profile.preferredConditions[condition] = 
            (profile.preferredConditions[condition] || 0) + 1;

          // Update price range
          if (price < profile.priceRange.min || profile.priceRange.min === 0) {
            profile.priceRange.min = Math.max(0, price - 20);
          }
          if (price > profile.priceRange.max || profile.priceRange.max === 1000) {
            profile.priceRange.max = price + 50;
          }
        }
      });
    });

    // Determine activity level
    const totalInteractions = favorites.length + purchases.length;
    if (totalInteractions > 10) profile.activityLevel = 'high';
    else if (totalInteractions > 5) profile.activityLevel = 'moderate';
    else profile.activityLevel = 'low';

    // Generate interest tags
    profile.interests = Object.keys(profile.favoriteCategories)
      .sort((a, b) => profile.favoriteCategories[b] - profile.favoriteCategories[a])
      .slice(0, 3);

    return profile;
  };

  const generateRecommendations = (allItems, profile) => {
    const scored = allItems
      .filter(item => item.status === 'active')
      .map(item => ({
        ...item,
        score: calculateRecommendationScore(item, profile)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    return scored;
  };

  const calculateRecommendationScore = (item, profile) => {
    let score = 0;

    // Category preference boost
    const categoryBoost = profile.favoriteCategories[item.category] || 0;
    score += categoryBoost * 3;

    // Price range compatibility
    const priceInRange = item.price >= profile.priceRange.min && 
                        item.price <= profile.priceRange.max;
    if (priceInRange) score += 5;

    // Condition preference
    const conditionBoost = profile.preferredConditions[item.condition] || 0;
    score += conditionBoost * 2;

    // Popularity boost (views)
    score += Math.min(item.views * 0.1, 3);

    // Recency boost
    const daysSincePosted = (Date.now() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24);
    if (daysSincePosted < 7) score += 2;

    // Random factor for discovery
    score += Math.random() * 2;

    return score;
  };

  const generateAIInsights = (profile, recommendations) => {
    const topCategory = Object.keys(profile.favoriteCategories)
      .sort((a, b) => profile.favoriteCategories[b] - profile.favoriteCategories[a])[0];
    
    const avgPrice = recommendations.reduce((sum, item) => sum + item.price, 0) / recommendations.length;
    
    const insights = [
      `Based on your activity, you love ${topCategory?.toLowerCase() || 'exploring various items'}!`,
      `Your sweet spot seems to be around $${Math.round(avgPrice)} per item.`,
      `I've found ${recommendations.length} items that match your unique style.`,
      profile.activityLevel === 'high' 
        ? "You're a power user! Here are some exclusive finds."
        : "I've curated these special picks just for you."
    ];

    return insights[Math.floor(Math.random() * insights.length)];
  };

  const addToCart = async (itemId) => {
    try {
      await ApiService.addToCart(itemId, 1);
      // Update the item to show it's been added
      setRecommendations(prev => 
        prev.map(item => 
          item._id === itemId 
            ? { ...item, addedToCart: true }
            : item
        )
      );
      setTimeout(() => {
        setRecommendations(prev => 
          prev.map(item => 
            item._id === itemId 
              ? { ...item, addedToCart: false }
              : item
          )
        );
      }, 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-2xl shadow-lg border border-purple-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-xl">
            <FaBrain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Smart Picks
            </h2>
            <p className="text-sm text-gray-600">Personalized just for you</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-full shadow-sm">
          <FaMagic className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium text-gray-700">
            {userProfile?.activityLevel === 'high' ? 'Power User' : 
             userProfile?.activityLevel === 'moderate' ? 'Active' : 'Explorer'}
          </span>
        </div>
      </div>

      {/* AI Insights */}
      {aiInsights && (
        <div className="bg-white p-4 rounded-xl border border-purple-200 mb-6">
          <div className="flex items-start space-x-3">
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-2 rounded-lg">
              <FaRocket className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">AI Insight</h3>
              <p className="text-sm text-gray-600">{aiInsights}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="bg-gray-200 h-40 rounded-lg mb-3"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.map((item, index) => (
            <div 
              key={item._id} 
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group transform hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative">
                <Link to={`/product/${item._id}`}>
                  <img
                    src={item.images?.[0] ? 
                      (item.images[0].startsWith('http') ? item.images[0] : `http://localhost:5000${item.images[0]}`) : 
                      'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={item.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                
                {/* Score Badge */}
                <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                  <FaStar className="h-3 w-3 mr-1" />
                  {Math.round(item.score)}
                </div>

                {/* Condition Badge */}
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                  {item.condition}
                </div>
              </div>

              <div className="p-4">
                <Link to={`/product/${item._id}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-purple-600 transition-colors">
                    {item.title}
                  </h3>
                </Link>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-purple-600">${item.price}</span>
                  <div className="flex items-center text-gray-500 text-xs">
                    <FaEye className="h-3 w-3 mr-1" />
                    {item.views}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => addToCart(item._id)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      item.addedToCart
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      {item.addedToCart ? (
                        <>
                          <FaHeart className="h-3 w-3 mr-1" />
                          Added!
                        </>
                      ) : (
                        <>
                          <FaShoppingCart className="h-3 w-3 mr-1" />
                          Add
                        </>
                      )}
                    </div>
                  </button>
                  
                  <Link
                    to={`/product/${item._id}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors duration-200"
                  >
                    <FaEye className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {recommendations.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-full p-6 inline-block mb-4">
            <FaBrain className="h-12 w-12 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Learning Your Preferences</h3>
          <p className="text-gray-600">
            Browse and interact with items to help our AI understand your style!
          </p>
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={generateSmartRecommendations}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105"
        >
          <FaMagic className="inline mr-2" />
          Refresh Recommendations
        </button>
      </div>
    </div>
  );
};

export default SmartRecommendations;