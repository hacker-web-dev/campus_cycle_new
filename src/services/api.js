const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://campuscyclenew-production.up.railway.app/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('campus_cycle_token');
  }

  setAuthToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('campus_cycle_token', token);
    } else {
      localStorage.removeItem('campus_cycle_token');
    }
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    // Don't set Content-Type for FormData uploads
    if (!(options.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    try {
      console.log(`Making request to: ${url}`, config);
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getUserProfile() {
    return this.makeRequest('/users/profile');
  }

  async updateUserProfile(userData) {
    return this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Items endpoints
  async getItems(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.makeRequest(`/items${queryParams ? `?${queryParams}` : ''}`);
  }

  async getItemById(id) {
    return this.makeRequest(`/items/${id}`);
  }

  async createItem(itemData) {
    // Handle FormData for file uploads
    if (itemData instanceof FormData) {
      return this.makeRequest('/items', {
        method: 'POST',
        body: itemData,
      });
    }
    
    return this.makeRequest('/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async updateItem(id, itemData) {
    return this.makeRequest(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  }

  async deleteItem(id) {
    return this.makeRequest(`/items/${id}`, {
      method: 'DELETE',
    });
  }
  async getUserItems() {
    return this.makeRequest('/items/user');
  }

  // Favorites endpoints
  async toggleFavorite(itemId) {
    return this.makeRequest(`/items/${itemId}/favorite`, {
      method: 'POST',
    });
  }

  async getUserFavorites() {
    return this.makeRequest('/users/favorites');
  }

  // Orders endpoints
  async createOrder(orderData) {
    return this.makeRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getUserPurchases() {
    return this.makeRequest('/orders/my-purchases');
  }

  async getUserSales() {
    return this.makeRequest('/orders/my-sales');
  }

  // Additional utility methods
  async searchItems(searchTerm) {
    return this.makeRequest(`/items/search?q=${encodeURIComponent(searchTerm)}`);
  }

  async getCategories(withCounts = false) {
    return this.makeRequest(`/categories${withCounts ? '?withCounts=true' : ''}`);
  }

  // Upload images for items
  async uploadImages(files) {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('images', file);
    });

    return this.makeRequest('/upload/images', {
      method: 'POST',
      body: formData,
    });
  }

  // Get user statistics
  async getUserStats() {
    return this.makeRequest('/users/stats');
  }

  // Get recent activity
  async getRecentActivity(limit = 10) {
    return this.makeRequest(`/users/recent-activity?limit=${limit}`);
  }

  // Get search suggestions
  async getSearchSuggestions(query) {
    return this.makeRequest(`/search/suggestions?q=${encodeURIComponent(query)}`);
  }

  // Get trending items
  async getTrendingItems(limit = 12) {
    return this.makeRequest(`/items/trending?limit=${limit}`);
  }

  // Get similar items
  async getSimilarItems(itemId, limit = 6) {
    return this.makeRequest(`/items/${itemId}/similar?limit=${limit}`);
  }

  // Check if item is favorited
  async getFavoriteStatus(itemId) {
    return this.makeRequest(`/items/${itemId}/favorite-status`);
  }

  // Cart endpoints
  async getCart() {
    return this.makeRequest('/cart');
  }

  async addToCart(itemId, quantity = 1) {
    return this.makeRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ itemId, quantity }),
    });
  }

  async updateCartItem(itemId, quantity) {
    return this.makeRequest(`/cart/update/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId) {
    return this.makeRequest(`/cart/remove/${itemId}`, {
      method: 'DELETE',
    });
  }

  async clearCart() {
    return this.makeRequest('/cart/clear', {
      method: 'DELETE',
    });
  }

  // Enhanced order creation
  async createOrderFromCart(orderData) {
    return this.makeRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // Reviews endpoints
  async getUserReviews(userId) {
    return this.makeRequest(`/reviews/user/${userId}`);
  }

  async createReview(reviewData) {
    return this.makeRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Messaging endpoints
  async getConversations() {
    return this.makeRequest('/conversations');
  }

  async getMessages(userId) {
    return this.makeRequest(`/conversations/${userId}/messages`);
  }

  async sendMessage(receiverId, content, encrypted = false) {
    return this.makeRequest('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content, encrypted }),
    });
  }

  // Report message endpoint
  async reportMessage(messageId, reason, senderId) {
    return this.makeRequest('/messages/report', {
      method: 'POST',
      body: JSON.stringify({ messageId, reason, senderId }),
    });
  }

  // Get pending transactions for reminders
  async getPendingTransactions() {
    return this.makeRequest('/orders/pending');
  }

  // Loyalty Points endpoints
  async getLoyaltyPoints() {
    return this.makeRequest('/loyalty/points');
  }

  // Chatbot endpoints
  async queryChatbot(query) {
    return this.makeRequest('/chatbot/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  async getChatbotHistory() {
    return this.makeRequest('/chatbot/history');
  }

}

export default new ApiService();
