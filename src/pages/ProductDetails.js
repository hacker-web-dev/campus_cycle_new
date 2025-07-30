import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaStar, FaRegStar, FaMapMarkerAlt, FaClock, FaTag, FaHeart, FaRegHeart, FaShieldAlt, FaExchangeAlt, FaCheck, FaShoppingCart, FaComments } from 'react-icons/fa';
import ApiService from '../services/api';
import ReviewsRatings from '../components/ReviewsRatings';

const ProductDetails = ({ user }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [sellerRating] = useState(4.7);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const productData = await ApiService.getItemById(id);
        setProduct(productData);
        
        // Check if item is in user's favorites
        if (user && productData.savedBy) {
          setIsFavorite(productData.savedBy.includes(user.id));
        }
        
        // Fetch related products (same category, different item)
        const relatedData = await ApiService.getItems({ 
          category: productData.category,
          limit: 4 
        });
        const related = relatedData.filter(item => item._id !== productData._id).slice(0, 3);
        setRelatedProducts(related);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Product not found or server error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }

    window.scrollTo(0, 0);
  }, [id, user]);

  const toggleFavorite = async () => {
    if (!user) {
      alert('Please login to add items to favorites');
      return;
    }

    try {
      setFavoriteLoading(true);
      const response = await ApiService.toggleFavorite(id);
      setIsFavorite(response.isFavorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Error updating favorites. Please try again.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      alert('Please login to make a purchase');
      return;
    }

    if (product.seller._id === user.id) {
      alert('You cannot buy your own item');
      return;
    }

    try {
      setPurchaseLoading(true);
      
      // For demo purposes, we'll use dummy shipping info
      const orderData = {
        itemId: product._id,
        shippingAddress: {
          name: user.name,
          address: '123 Campus Street',
          city: 'University City',
          zipCode: '12345',
          phone: user.phone || '555-0123'
        }
      };

      await ApiService.createOrder(orderData);
      alert('Purchase successful! The item has been added to your orders.');
      
      // Refresh product details to show updated status
      const updatedProduct = await ApiService.getItemById(id);
      setProduct(updatedProduct);
    } catch (error) {
      console.error('Error making purchase:', error);
      alert(error.message || 'Error processing purchase. Please try again.');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    if (product.seller._id === user.id) {
      alert('You cannot add your own item to cart');
      return;
    }

    try {
      await ApiService.addToCart(product._id, 1);
      alert('Item added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.message || 'Error adding item to cart');
    }
  };

  const handleMessageSeller = async () => {
    if (!user) {
      alert('Please login to message the seller');
      return;
    }

    if (product.seller._id === user.id) {
      alert('You cannot message yourself');
      return;
    }

    try {
      const initialMessage = `Hi! I'm interested in your item "${product.title}". Is it still available?`;
      await ApiService.sendMessage(product.seller._id, initialMessage);
      alert('Message sent to seller! Check your messages for their reply.');
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.message || 'Error sending message to seller');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
          <p className="mt-2 text-gray-600">{error || 'This product may have been removed or sold.'}</p>
          <Link to="/browse" className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700">
            <FaArrowLeft className="mr-2" />
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            </li>
            <li className="flex items-center">
              <span className="text-gray-400 mx-2">/</span>
              <Link to="/browse" className="text-gray-500 hover:text-gray-700">Browse</Link>
            </li>
            <li className="flex items-center">
              <span className="text-gray-400 mx-2">/</span>
              <Link to={`/browse?category=${product.category.toLowerCase()}`} className="text-gray-500 hover:text-gray-700">
                {product.category}
              </Link>
            </li>
            <li className="flex items-center">
              <span className="text-gray-400 mx-2">/</span>
              <span className="text-gray-900 font-medium truncate max-w-xs">
                {product.title}
              </span>
            </li>
          </ol>
        </nav>

        <div className="mb-6">
          <Link to="/browse" className="inline-flex items-center text-primary-600 hover:text-primary-700">
            <FaArrowLeft className="mr-2" />
            Back to Browse
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-lg overflow-hidden shadow-sm mb-4">
              <div className="relative pb-[75%]">
                <img
                  src={product.images?.[activeImageIndex] ? 
                    (product.images[activeImageIndex].startsWith('http') ? product.images[activeImageIndex] : `https://campuscyclenew-production.up.railway.app${product.images[activeImageIndex]}`) :
                    product.images?.[0] ? 
                      (product.images[0].startsWith('http') ? product.images[0] : `https://campuscyclenew-production.up.railway.app${product.images[0]}`) :
                      'https://via.placeholder.com/600x400?text=No+Image'}
                  alt={product.title}
                  className="absolute h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                  }}
                />
                {/* Favorite button */}
                <button
                  onClick={toggleFavorite}
                  className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                >
                  {isFavorite ? (
                    <FaHeart className="h-5 w-5 text-red-500" />
                  ) : (
                    <FaRegHeart className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Thumbnail images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer rounded-md overflow-hidden border-2 ${
                      index === activeImageIndex ? 'border-primary-500' : 'border-transparent'
                    }`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <div className="relative pb-[75%]">
                      <img
                        src={image.startsWith('http') ? image : `https://campuscyclenew-production.up.railway.app${image}`}
                        alt={`${product.title} - view ${index + 1}`}
                        className="absolute h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150x150?text=No+Image';
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  {product.condition}
                </span>
              </div>
              
              <div className="mt-2">
                <p className="text-3xl font-bold text-primary-600">${product.price}</p>
              </div>

              <div className="mt-6 space-y-4">
                {/* Location & Posted date */}
                <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-gray-400" />
                    <span>{product.location}</span>
                  </div>
                  <div className="flex items-center mt-2 sm:mt-0">
                    <FaClock className="mr-2 text-gray-400" />
                    <span>Posted {new Date(product.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Views count */}
                <div className="text-sm text-gray-500">
                  {product.views} {product.views === 1 ? 'view' : 'views'}
                </div>

                {/* Category */}
                <div className="flex items-center text-sm text-gray-500">
                  <FaTag className="mr-2 text-gray-400" />
                  <span>Category: </span>
                  <Link 
                    to={`/browse?category=${product.category.toLowerCase()}`} 
                    className="ml-1 text-primary-600 hover:text-primary-700"
                  >
                    {product.category}
                  </Link>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <h2 className="text-lg font-medium text-gray-900">Description</h2>
                  <p className="mt-2 text-gray-600">{product.description}</p>
                </div>

                {/* Features */}
                {product.features && product.features.length > 0 && (
                  <div className="mt-4">
                    <h2 className="text-lg font-medium text-gray-900">Features</h2>
                    <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-600">
                          <FaCheck className="h-4 w-4 text-primary-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Additional Info */}
                {product.additionalInfo && (
                  <div className="mt-4">
                    <h2 className="text-lg font-medium text-gray-900">Additional Information</h2>
                    <p className="mt-2 text-gray-600">{product.additionalInfo}</p>
                  </div>
                )}

                {/* Seller Information */}
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="flex items-center">
                    <div className="bg-gray-200 rounded-full h-12 w-12 flex items-center justify-center">
                      <FaUser className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{product.seller?.name || 'Unknown Seller'}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-500">
                          Member since {product.seller?.joinDate ? new Date(product.seller.joinDate).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 space-y-3">
                    {/* Add to Cart Button */}
                    {user && product.seller._id !== user.id && product.status === 'active' && (
                      <button 
                        onClick={handleAddToCart}
                        className="w-full bg-primary-600 py-3 px-4 rounded-md text-white font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center justify-center transition-colors duration-200"
                      >
                        <FaShoppingCart className="mr-2" />
                        Add to Cart
                      </button>
                    )}
                    
                    {/* Message Seller Button */}
                    {user && product.seller._id !== user.id && (
                      <button 
                        onClick={handleMessageSeller}
                        className="w-full bg-green-600 py-3 px-4 rounded-md text-white font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 flex items-center justify-center"
                      >
                        <FaComments className="mr-2" />
                        Message Seller
                      </button>
                    )}
                    
                    {/* Contact Seller Button */}
                    <button 
                      onClick={() => setShowContactInfo(!showContactInfo)}
                      className="w-full bg-gray-100 py-3 px-4 rounded-md text-gray-700 font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                    >
                      {showContactInfo ? 'Hide Contact Info' : 'Contact Seller'}
                    </button>
                    
                    {showContactInfo && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-center text-gray-800">
                          Email: {product.seller?.email || 'Not available'}
                          <br />
                          <span className="text-sm text-gray-600">
                            Contact the seller directly via email to arrange pickup.
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Safety Tips */}
                <div className="mt-6 p-4 bg-yellow-50 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaShieldAlt className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Safety Tips</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Meet in a public, well-lit place on campus</li>
                          <li>Check the item before paying</li>
                          <li>Never share personal financial information</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Reviews Section */}
        {product.seller && (
          <div className="mt-12">
            <ReviewsRatings 
              userId={product.seller._id} 
              userType="seller"
              showAddReview={false}
            />
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
                  <Link to={`/product/${item._id}`} className="block">
                    <div className="relative h-48">
                      <img
                        src={item.images?.[0] ? 
                          (item.images[0].startsWith('http') ? item.images[0] : `https://campuscyclenew-production.up.railway.app${item.images[0]}`) : 
                          'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
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
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;