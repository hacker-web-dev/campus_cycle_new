import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaTrash, FaMinus, FaPlus, FaArrowRight, FaShoppingBag } from 'react-icons/fa';
import ApiService from '../services/api';

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const cartData = await ApiService.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    try {
      setUpdating(prev => ({ ...prev, [itemId]: true }));
      const updatedCart = await ApiService.updateCartItem(itemId, newQuantity);
      setCart(updatedCart.cart);
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const removeItem = async (itemId) => {
    try {
      setUpdating(prev => ({ ...prev, [itemId]: true }));
      const updatedCart = await ApiService.removeFromCart(itemId);
      setCart(updatedCart.cart);
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const clearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await ApiService.clearCart();
        setCart({ items: [] });
      } catch (error) {
        console.error('Error clearing cart:', error);
        alert('Failed to clear cart');
      }
    }
  };

  const calculateTotal = () => {
    return cart.items.reduce((total, cartItem) => {
      return total + (cartItem.item?.price || 0) * cartItem.quantity;
    }, 0).toFixed(2);
  };

  const calculateItemTotal = (item, quantity) => {
    return ((item?.price || 0) * quantity).toFixed(2);
  };

  const proceedToCheckout = () => {
    if (cart.items.length === 0) {
      alert('Your cart is empty');
      return;
    }
    navigate('/checkout');
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
            <FaShoppingCart className="mr-3 text-primary-600" />
            Shopping Cart
          </h1>
          <p className="mt-2 text-gray-600">
            {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {cart.items.length === 0 ? (
          <div className="text-center py-12">
            <FaShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start shopping to add items to your cart!
            </p>
            <div className="mt-6">
              <Link
                to="/browse"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <FaShoppingBag className="mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Cart Items</h2>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-500 text-sm font-medium"
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="divide-y divide-gray-200">
                  {cart.items.map((cartItem) => (
                    <div key={cartItem.item._id} className="p-6">
                      <div className="flex items-center space-x-4">
                        {/* Item Image */}
                        <div className="flex-shrink-0">
                          <Link to={`/product/${cartItem.item._id}`}>
                            <img
                              src={cartItem.item.images?.[0] || 'https://via.placeholder.com/150x150?text=No+Image'}
                              alt={cartItem.item.title}
                              className="h-20 w-20 rounded-lg object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/150x150?text=No+Image';
                              }}
                            />
                          </Link>
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/product/${cartItem.item._id}`}
                            className="text-lg font-medium text-gray-900 hover:text-primary-600"
                          >
                            {cartItem.item.title}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            Seller: {cartItem.item.seller?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Condition: {cartItem.item.condition}
                          </p>
                          <p className="text-lg font-bold text-primary-600 mt-2">
                            ${cartItem.item.price}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              onClick={() => updateQuantity(cartItem.item._id, cartItem.quantity - 1)}
                              disabled={updating[cartItem.item._id]}
                              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            >
                              <FaMinus className="h-3 w-3" />
                            </button>
                            <span className="px-4 py-2 text-gray-900 font-medium">
                              {cartItem.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(cartItem.item._id, cartItem.quantity + 1)}
                              disabled={updating[cartItem.item._id]}
                              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            >
                              <FaPlus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ${calculateItemTotal(cartItem.item, cartItem.quantity)}
                          </p>
                          <button
                            onClick={() => removeItem(cartItem.item._id)}
                            disabled={updating[cartItem.item._id]}
                            className="mt-2 text-red-600 hover:text-red-500 text-sm font-medium disabled:opacity-50"
                          >
                            <FaTrash className="inline mr-1" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-medium text-gray-900">Total</span>
                      <span className="text-lg font-bold text-primary-600">${calculateTotal()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={proceedToCheckout}
                  className="w-full mt-6 bg-primary-600 text-white py-3 px-4 rounded-md font-medium hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center"
                >
                  Proceed to Checkout
                  <FaArrowRight className="ml-2" />
                </button>

                <Link
                  to="/browse"
                  className="w-full mt-3 bg-gray-100 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;