import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaDollarSign, FaCalendarAlt, FaUser, FaCreditCard, FaTruck, FaEye, FaChartLine, FaCopy } from 'react-icons/fa';
import ApiService from '../services/api';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getUserSales();
      setSales(data);
      
      // Calculate stats
      const totalEarnings = data.reduce((sum, order) => sum + order.totalAmount, 0);
      const totalOrders = data.length;
      const totalItems = data.reduce((sum, order) => sum + order.items.length, 0);
      
      setStats({
        totalEarnings,
        totalOrders,
        totalItems,
        averageOrderValue: totalOrders > 0 ? totalEarnings / totalOrders : 0
      });
    } catch (error) {
      console.error('Error fetching sales:', error);
      setError('Failed to load your sales');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const copyPinToClipboard = (pin) => {
    navigator.clipboard.writeText(pin).then(() => {
      // Could add toast notification here
      console.log('PIN copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy PIN: ', err);
    });
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FaDollarSign className="mr-3 text-primary-600" />
            My Sales
          </h1>
          <p className="mt-2 text-gray-600">
            Track your earnings and sales performance
          </p>
        </div>

        {/* Stats Cards */}
        {sales.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-100">
                  <FaDollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-100">
                  <FaChartLine className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-purple-100">
                  <FaEye className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Items Sold</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-orange-100">
                  <FaDollarSign className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.averageOrderValue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {sales.length === 0 ? (
          <div className="text-center py-12">
            <FaDollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No sales yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start selling to see your earnings here!
            </p>
            <div className="mt-6">
              <Link
                to="/sell"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <FaDollarSign className="mr-2" />
                List Your First Item
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {sales.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Sale #{order.orderNumber}
                      </h3>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <FaCalendarAlt className="mr-1" />
                        <span>Sold on {new Date(order.createdAt).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <FaUser className="mr-1" />
                        <span>Buyer: {order.buyer?.name}</span>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        +${order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4">
                    {order.items.map((orderItem, index) => (
                      <div key={index} className="flex items-center space-x-4 border-t border-gray-100 pt-4">
                        <div className="flex-shrink-0">
                          <img
                            src={orderItem.item?.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                            alt={orderItem.item?.title}
                            className="h-16 w-16 rounded-lg object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/product/${orderItem.item?._id}`}
                            className="text-lg font-medium text-gray-900 hover:text-primary-600"
                          >
                            {orderItem.item?.title}
                          </Link>
                          <p className="text-sm text-gray-500">
                            Category: {orderItem.item?.category}
                          </p>
                          <p className="text-sm text-gray-500">
                            Quantity sold: {orderItem.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            +${(orderItem.price * orderItem.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${orderItem.price} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Buyer Contact */}
                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <FaUser className="mr-2" />
                          Buyer Contact
                        </h4>
                        <p className="text-gray-600 mt-1">
                          {order.buyer?.name}
                        </p>
                        <p className="text-gray-600">
                          {order.buyer?.email}
                        </p>
                        <p className="text-gray-600">
                          {order.buyer?.university}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <FaTruck className="mr-2" />
                          Delivery Address
                        </h4>
                        <p className="text-gray-600 mt-1">
                          {order.shippingAddress?.name}
                        </p>
                        <p className="text-gray-600">
                          {order.shippingAddress?.address}
                        </p>
                        <p className="text-gray-600">
                          {order.shippingAddress?.city}, {order.shippingAddress?.zipCode}
                        </p>
                        <p className="text-gray-600">
                          Phone: {order.shippingAddress?.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="mt-4 p-3 bg-green-50 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-green-900 flex items-center">
                          <FaCreditCard className="mr-2" />
                          {order.paymentMethod === 'cash' ? 'Cash Payment Expected' : 'Payment Received'}
                        </h4>
                        <p className="text-green-700 text-sm mt-1">
                          Payment Method: {order.paymentMethod === 'card' ? 'CARD PAYMENT' : order.paymentMethod === 'cash' ? 'CASH ON DELIVERY' : order.paymentMethod.replace('_', ' ').toUpperCase()}
                        </p>
                        {order.paymentMethod === 'card' && order.paymentDetails?.transactionId && (
                          <p className="text-green-700 text-sm">
                            Transaction ID: {order.paymentDetails?.transactionId}
                          </p>
                        )}
                        {order.paymentMethod === 'cash' && (
                          <p className="text-green-700 text-sm">
                            Collect ${order.totalAmount.toFixed(2)} on delivery
                          </p>
                        )}
                        <div className="mt-2 p-2 bg-green-100 rounded border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-green-600">Verification PIN (Share with buyer):</p>
                              <p className="font-mono font-bold text-green-800">
                                {order.verificationPin || '****'}
                              </p>
                              {!order.verificationPin && (
                                <p className="text-xs text-green-500">PIN not available for older orders</p>
                              )}
                            </div>
                            {order.verificationPin && (
                              <button
                                onClick={() => copyPinToClipboard(order.verificationPin)}
                                className="p-1 text-green-600 hover:text-green-800 transition-colors"
                                title="Copy PIN"
                              >
                                <FaCopy className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        +${order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <h4 className="font-medium text-gray-900">Buyer Notes</h4>
                      <p className="text-gray-600 text-sm mt-1">{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;