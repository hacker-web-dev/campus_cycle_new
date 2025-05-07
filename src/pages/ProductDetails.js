import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaStar, FaRegStar, FaMapMarkerAlt, FaClock, FaTag, FaHeart, FaRegHeart, FaShieldAlt, FaExchangeAlt, FaCheck } from 'react-icons/fa';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [sellerRating] = useState(4.7);
  const [showContactInfo, setShowContactInfo] = useState(false);

  useEffect(() => {
    // Simulate API fetch
    const fetchProductDetails = async () => {
      setLoading(true);
      // In a real app, this would be an API call
      setTimeout(() => {
        // Mock product data
        const mockProduct = {
          id: parseInt(id),
          title: "MacBook Pro 13\" (2020)",
          price: 850,
          description: "2020 MacBook Pro in excellent condition. 8GB RAM, 256GB SSD, Intel Core i5 processor. Includes charger and laptop sleeve. Battery health at 92%. Perfect for students and light programming. Minor wear on the bottom case, but otherwise like new. Originally purchased in August 2020.",
          condition: "Like New",
          category: "Electronics",
          location: "Computer Science Building",
          seller: {
            name: "Alex Johnson",
            joinDate: "Aug 2022",
            responseRate: "95%",
            averageResponseTime: "Within 1 hour"
          },
          postedDate: "2 days ago",
          images: [
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1420406676079-b8491f2d07c8?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80"
          ],
          features: [
            "8GB RAM",
            "256GB SSD",
            "Intel Core i5",
            "13-inch Retina Display",
            "Two Thunderbolt 3 ports"
          ],
          additionalInfo: "This laptop was primarily used for coursework and web browsing. It's in excellent condition with no issues. I'm selling because I recently upgraded to a newer model."
        };

        // Mock related products
        const mockRelatedProducts = [
          {
            id: 10,
            title: "iPad Pro 11\" (2021)",
            price: 650,
            image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80",
            condition: "Good"
          },
          {
            id: 11,
            title: "Wireless Keyboard & Mouse",
            price: 45,
            image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80",
            condition: "New"
          },
          {
            id: 12,
            title: "Laptop Stand - Aluminum",
            price: 25,
            image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80",
            condition: "Like New"
          }
        ];

        setProduct(mockProduct);
        setRelatedProducts(mockRelatedProducts);
        setLoading(false);
      }, 800);
    };

    fetchProductDetails();

    // Reset to top of page when component loads
    window.scrollTo(0, 0);
  }, [id]);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // In a real app, this would make an API call to update the user's favorites
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
                  src={product.images[activeImageIndex]}
                  alt={product.title}
                  className="absolute h-full w-full object-cover"
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
                      src={image}
                      alt={`${product.title} - view ${index + 1}`}
                      className="absolute h-full w-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
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
                    <span>Posted {product.postedDate}</span>
                  </div>
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
                      <h3 className="text-lg font-medium text-gray-900">{product.seller.name}</h3>
                      <div className="flex items-center mt-1">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            i < Math.floor(sellerRating) ? (
                              <FaStar key={i} className="h-4 w-4" />
                            ) : i < sellerRating ? (
                              <FaStar key={i} className="h-4 w-4 text-yellow-200" />
                            ) : (
                              <FaRegStar key={i} className="h-4 w-4" />
                            )
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">{sellerRating} • Member since {product.seller.joinDate}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="font-medium">Response Rate:</span>
                      <span className="ml-2">{product.seller.responseRate}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">Typical Response:</span>
                      <span className="ml-2">{product.seller.averageResponseTime}</span>
                    </div>
                  </div>

                  {/* Contact Seller Button */}
                  <div className="mt-6">
                    <button 
                      onClick={() => setShowContactInfo(!showContactInfo)}
                      className="w-full bg-primary-600 py-3 px-4 rounded-md text-white font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {showContactInfo ? 'Hide Contact Info' : 'Contact Seller'}
                    </button>
                    
                    {showContactInfo && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-center text-gray-800">
                          For demo purposes, contact info would be shown here.
                          <br />
                          In a real app, this would display email/phone or a messaging interface.
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

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
                  <Link to={`/product/${item.id}`} className="block">
                    <div className="relative h-48">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
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