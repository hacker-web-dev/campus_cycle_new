import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaBoxOpen, FaHeart, FaShoppingBag, FaChartLine, FaEdit, FaTrash, FaEye, FaDollarSign, FaUsers, FaFire, FaClock, FaArrowUp, FaArrowDown, FaCopy } from 'react-icons/fa';
import ApiService from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState({});
  const [trendingItems, setTrendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Analytics data
  const [analyticsData, setAnalyticsData] = useState({
    salesOverTime: [],
    viewsOverTime: [],
    categoryPerformance: [],
    listingPerformance: [],
    engagement: null
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('month');

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('campus_cycle_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data in parallel
        const [statsData, activityData, trending] = await Promise.all([
          ApiService.getUserStats(),
          ApiService.getRecentActivity(5),
          ApiService.getTrendingItems(6)
        ]);
        
        setStats(statsData || {});
        setRecentActivity(activityData || {});
        setTrendingItems(trending || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      const token = localStorage.getItem('campus_cycle_token');
      if (!token) return;

      try {
        setAnalyticsLoading(true);
        
        const [salesData, viewsData, categoryData, listingData, engagementData] = await Promise.all([
          ApiService.getSalesOverTime(timePeriod),
          ApiService.getViewsOverTime(timePeriod),
          ApiService.getCategoryPerformance(),
          ApiService.getListingPerformance(),
          ApiService.getEngagementMetrics()
        ]);

        setAnalyticsData({
          salesOverTime: salesData || [],
          viewsOverTime: viewsData || [],
          categoryPerformance: categoryData || [],
          listingPerformance: listingData || [],
          engagement: engagementData || null
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timePeriod]);

  const copyPinToClipboard = async (pin) => {
    try {
      await navigator.clipboard.writeText(pin);
      alert('PIN copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = pin;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert('PIN copied to clipboard!');
      } catch (err) {
        alert('Failed to copy PIN');
      }
      document.body.removeChild(textArea);
    }
  };

  // Chart data preparation functions
  const prepareSalesChartData = () => {
    if (!analyticsData.salesOverTime.length) return null;
    
    const labels = analyticsData.salesOverTime.map(item => {
      if (item._id.day) {
        return `${item._id.month}/${item._id.day}`;
      } else if (item._id.week) {
        return `Week ${item._id.week}`;
      } else {
        return `${item._id.month}/${item._id.year}`;
      }
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Sales ($)',
          data: analyticsData.salesOverTime.map(item => item.totalSales),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Orders',
          data: analyticsData.salesOverTime.map(item => item.orderCount),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y1',
        }
      ]
    };
  };

  const prepareViewsChartData = () => {
    if (!analyticsData.viewsOverTime.length) return null;
    
    const labels = analyticsData.viewsOverTime.map(item => {
      if (item._id.day) {
        return `${item._id.month}/${item._id.day}`;
      } else if (item._id.week) {
        return `Week ${item._id.week}`;
      } else {
        return `${item._id.month}/${item._id.year}`;
      }
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Total Views',
          data: analyticsData.viewsOverTime.map(item => item.totalViews),
          backgroundColor: 'rgba(147, 51, 234, 0.8)',
          borderColor: 'rgb(147, 51, 234)',
          borderWidth: 1,
        }
      ]
    };
  };

  const prepareCategoryChartData = () => {
    if (!analyticsData.categoryPerformance.length) return null;
    
    const colors = [
      '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
      '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'
    ];
    
    return {
      labels: analyticsData.categoryPerformance.map(item => item._id),
      datasets: [
        {
          label: 'Revenue ($)',
          data: analyticsData.categoryPerformance.map(item => item.totalRevenue),
          backgroundColor: colors.slice(0, analyticsData.categoryPerformance.length),
          borderWidth: 1,
        }
      ]
    };
  };

  const StatCard = ({ title, value, change, icon, color, link }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm flex items-center ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
              {Math.abs(change)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
      {link && (
        <Link to={link} className="text-primary-600 hover:text-primary-500 text-sm font-medium mt-2 inline-block">
          View details →
        </Link>
      )}
    </div>
  );

  const ActivityItem = ({ type, item, date, buyer, seller, quantity, totalAmount, verificationPin }) => (
    <div className="p-3 hover:bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${
          type === 'listing' ? 'bg-blue-100' : 
          type === 'sale' ? 'bg-green-100' : 'bg-purple-100'
        }`}>
          {type === 'listing' ? <FaPlus className="text-blue-600" /> :
           type === 'sale' ? <FaDollarSign className="text-green-600" /> :
           <FaShoppingBag className="text-purple-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {type === 'listing' ? `Listed "${item?.title}"` :
             type === 'sale' ? `Sold "${item?.title}"${buyer ? ` to ${buyer}` : ''}${quantity > 1 ? ` (${quantity}x)` : ''}` :
             `Purchased "${item?.title}"${seller ? ` from ${seller}` : ''}${quantity > 1 ? ` (${quantity}x)` : ''}`}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(date).toLocaleDateString()}
          </p>
        </div>
        <div className="text-sm font-medium text-gray-900">
          ${totalAmount || (item?.price * (quantity || 1)).toFixed(2)}
        </div>
      </div>
      {type === 'purchase' && verificationPin && (
        <div className="mt-2 ml-12 p-2 bg-blue-50 rounded border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Verification PIN:</p>
              <p className="font-mono font-bold text-blue-600">{verificationPin}</p>
            </div>
            <button
              onClick={() => copyPinToClipboard(verificationPin)}
              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
              title="Copy PIN"
            >
              <FaCopy className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

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
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your Campus Cycle activity
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            to="/sell"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
          >
            <FaPlus className="mr-2" />
            List New Item
          </Link>
          <Link
            to="/browse"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            <FaEye className="mr-2" />
            Browse Items
          </Link>
          <Link
            to="/my-listings"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            <FaBoxOpen className="mr-2" />
            My Listings
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: <FaChartLine /> },
              { id: 'activity', name: 'Recent Activity', icon: <FaClock /> },
              { id: 'trending', name: 'Trending', icon: <FaFire /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Active Listings"
                value={stats.activeItems || 0}
                icon={<FaBoxOpen className="h-6 w-6 text-white" />}
                color="bg-blue-500"
                link="/my-listings"
              />
              <StatCard
                title="Items Sold"
                value={stats.soldItems || 0}
                icon={<FaShoppingBag className="h-6 w-6 text-white" />}
                color="bg-green-500"
              />
              <StatCard
                title="Total Earnings"
                value={`$${stats.totalEarnings || 0}`}
                icon={<FaDollarSign className="h-6 w-6 text-white" />}
                color="bg-purple-500"
                link="/sales"
              />
              <StatCard
                title="Profile Views"
                value={stats.totalViews || 0}
                icon={<FaEye className="h-6 w-6 text-white" />}
                color="bg-orange-500"
              />
              <StatCard
                title="Favorites"
                value={stats.favorites || 0}
                icon={<FaHeart className="h-6 w-6 text-white" />}
                color="bg-red-500"
                link="/favorites"
              />
              <StatCard
                title="Purchases"
                value={stats.purchases || 0}
                icon={<FaShoppingBag className="h-6 w-6 text-white" />}
                color="bg-indigo-500"
                link="/purchases"
              />
              <StatCard
                title="Average Price"
                value={`$${Math.round(stats.averagePrice || 0)}`}
                icon={<FaChartLine className="h-6 w-6 text-white" />}
                color="bg-yellow-500"
              />
              <StatCard
                title="Total Items"
                value={stats.totalItems || 0}
                icon={<FaUsers className="h-6 w-6 text-white" />}
                color="bg-teal-500"
              />
            </div>

            {/* Performance Analytics Dashboard */}
            <div className="space-y-6">
              {/* Time Period Selector */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Performance Analytics</h3>
                  <div className="flex space-x-2">
                    {['day', 'week', 'month'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setTimePeriod(period)}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          timePeriod === period
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {analyticsLoading ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading analytics...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sales Over Time Chart */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Sales & Orders Over Time</h4>
                    {prepareSalesChartData() ? (
                      <div className="h-64">
                        <Line
                          data={prepareSalesChartData()}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top',
                              },
                            },
                            scales: {
                              y: {
                                type: 'linear',
                                display: true,
                                position: 'left',
                                title: {
                                  display: true,
                                  text: 'Sales ($)'
                                }
                              },
                              y1: {
                                type: 'linear',
                                display: true,
                                position: 'right',
                                title: {
                                  display: true,
                                  text: 'Orders'
                                },
                                grid: {
                                  drawOnChartArea: false,
                                },
                              },
                            },
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        No sales data available
                      </div>
                    )}
                  </div>

                  {/* Views Over Time Chart */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Views Over Time</h4>
                    {prepareViewsChartData() ? (
                      <div className="h-64">
                        <Bar
                          data={prepareViewsChartData()}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top',
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                title: {
                                  display: true,
                                  text: 'Views'
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        No views data available
                      </div>
                    )}
                  </div>

                  {/* Category Performance Chart */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Revenue by Category</h4>
                    {prepareCategoryChartData() ? (
                      <div className="h-64">
                        <Doughnut
                          data={prepareCategoryChartData()}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'right',
                                labels: {
                                  boxWidth: 12,
                                  padding: 15
                                }
                              },
                            },
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        No category data available
                      </div>
                    )}
                  </div>

                  {/* Top Performing Items */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Top Performing Items</h4>
                    {analyticsData.engagement?.topItems?.length > 0 ? (
                      <div className="space-y-3">
                        {analyticsData.engagement.topItems.map((item, index) => (
                          <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="text-sm font-bold text-gray-500 mr-3">#{index + 1}</span>
                                <div>
                                  <p className="font-medium text-gray-900 truncate">{item.title}</p>
                                  <p className="text-sm text-gray-500">{item.category}</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-blue-600">{item.views} views</p>
                              <p className="text-sm text-gray-500">${item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        No performance data available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Listings */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Listings</h3>
                <div className="space-y-2">
                  {recentActivity.recentItems?.length > 0 ? (
                    recentActivity.recentItems.map((item) => (
                      <ActivityItem
                        key={`listing-${item._id}`}
                        type="listing"
                        item={item}
                        date={item.createdAt}
                      />
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent listings</p>
                  )}
                </div>
                <Link to="/my-listings" className="text-primary-600 hover:text-primary-500 text-sm font-medium mt-4 inline-block">
                  View all listings →
                </Link>
              </div>

              {/* Recent Sales */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Sales</h3>
                <div className="space-y-2">
                  {recentActivity.recentSales?.length > 0 ? (
                    recentActivity.recentSales.map((sale) => (
                      <div key={`sale-${sale._id}`} className="space-y-2">
                        {sale.items.map((orderItem, index) => (
                          <ActivityItem
                            key={`sale-${sale._id}-${index}`}
                            type="sale"
                            item={orderItem.item}
                            date={sale.createdAt}
                            buyer={sale.buyer?.name}
                            quantity={orderItem.quantity}
                            totalAmount={sale.totalAmount}
                          />
                        ))}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent sales</p>
                  )}
                </div>
              </div>

              {/* Recent Purchases */}
              <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Purchases</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentActivity.recentPurchases?.length > 0 ? (
                    recentActivity.recentPurchases.map((purchase) => (
                      <div key={`purchase-${purchase._id}`} className="space-y-2">
                        {purchase.items.map((orderItem, index) => (
                          <ActivityItem
                            key={`purchase-${purchase._id}-${index}`}
                            type="purchase"
                            item={orderItem.item}
                            date={purchase.createdAt}
                            seller={purchase.seller?.name}
                            quantity={orderItem.quantity}
                            totalAmount={purchase.totalAmount}
                            verificationPin={purchase.verificationPin}
                          />
                        ))}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4 md:col-span-2">No recent purchases</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trending' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Trending Items on Campus</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingItems.map((item) => (
                  <div key={item._id} className="group">
                    <Link to={`/product/${item._id}`} className="block">
                      <div className="relative h-48 rounded-lg overflow-hidden mb-3">
                        <img
                          src={item.images?.[0] ? 
                            (item.images[0].startsWith('http') ? item.images[0] : `https://campuscyclenew-production.up.railway.app${item.images[0]}`) : 
                            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc>'}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                          <FaFire className="mr-1" />
                          {item.views || 0}
                        </div>
                      </div>
                      <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-primary-600 font-bold">${item.price}</p>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </Link>
                  </div>
                ))}
              </div>
              {trendingItems.length === 0 && (
                <p className="text-gray-500 text-center py-8">No trending items available</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;