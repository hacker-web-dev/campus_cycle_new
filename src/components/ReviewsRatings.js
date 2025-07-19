import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaUser, FaCalendarAlt } from 'react-icons/fa';
import ApiService from '../services/api';

const ReviewsRatings = ({ userId, userType = 'seller', showAddReview = false, orderId = null }) => {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userId) {
      loadReviews();
    }
  }, [userId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getUserReviews(userId);
      setReviews(data.reviews);
      setAvgRating(data.avgRating);
      setTotalReviews(data.totalReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!newReview.comment.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      setSubmitting(true);
      await ApiService.createReview({
        revieweeId: userId,
        orderId: orderId,
        rating: newReview.rating,
        comment: newReview.comment,
        type: userType
      });

      // Reset form and reload reviews
      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
      loadReviews();
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          onClick={() => interactive && onRatingChange && onRatingChange(i)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          disabled={!interactive}
        >
          {i <= rating ? (
            <FaStar className="text-yellow-400" />
          ) : (
            <FaRegStar className="text-gray-300" />
          )}
        </button>
      );
    }
    return <div className="flex space-x-1">{stars}</div>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Reviews & Ratings ({totalReviews})
        </h3>
        {showAddReview && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {showReviewForm ? 'Cancel' : 'Write Review'}
          </button>
        )}
      </div>

      {/* Overall Rating */}
      {totalReviews > 0 && (
        <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{avgRating.toFixed(1)}</div>
            <div className="text-sm text-gray-500">Average Rating</div>
          </div>
          <div className="flex-1">
            {renderStars(Math.round(avgRating))}
            <div className="text-sm text-gray-600 mt-1">
              Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </div>
          </div>
        </div>
      )}

      {/* Add Review Form */}
      {showReviewForm && (
        <div className="border border-gray-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-4">Write a Review</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              {renderStars(newReview.rating, true, (rating) => 
                setNewReview(prev => ({ ...prev, rating }))
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Share your experience..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={submitReview}
                disabled={submitting || !newReview.comment.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                onClick={() => setShowReviewForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <FaStar className="mx-auto text-3xl" />
          </div>
          <p className="text-gray-500">No reviews yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Be the first to leave a review!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-100 pb-4 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-200 rounded-full h-10 w-10 flex items-center justify-center">
                    <FaUser className="text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {review.reviewer?.name || 'Anonymous'}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <FaCalendarAlt className="text-xs" />
                      <span>{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>
              
              <p className="text-gray-700 ml-13">{review.comment}</p>
              
              {review.type && (
                <div className="ml-13 mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {review.type === 'buyer' ? 'As Buyer' : 'As Seller'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsRatings;