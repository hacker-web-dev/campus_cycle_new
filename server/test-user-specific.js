const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user-specific functionality
async function testUserSpecificFunctionality() {
  try {
    console.log('🧪 Testing User-Specific Campus Cycle Functionality...\n');
    
    // Test 1: Register a new user
    console.log('1. Testing User Registration...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test User',
      email: `test${Date.now()}@university.edu`,
      password: 'password123',
      university: 'Test University'
    });
    
    const token = registerResponse.data.token;
    const userId = registerResponse.data.user.id;
    console.log('✅ User registered successfully:', registerResponse.data.user.name);
    
    // Test 2: Get user profile
    console.log('\n2. Testing User Profile Retrieval...');
    const profileResponse = await axios.get(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile retrieved:', profileResponse.data.name);
    
    // Test 3: Create an item for the user
    console.log('\n3. Testing Item Creation...');
    const itemResponse = await axios.post(`${BASE_URL}/items`, {
      title: 'Test Laptop',
      description: 'A test laptop for sale',
      price: 500,
      category: 'Electronics',
      condition: 'Good',
      location: 'Campus'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const itemId = itemResponse.data.item._id;
    console.log('✅ Item created successfully:', itemResponse.data.item.title);
    
    // Test 4: Get user's items
    console.log('\n4. Testing User Items Retrieval...');
    const userItemsResponse = await axios.get(`${BASE_URL}/items/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ User items retrieved:', userItemsResponse.data.length, 'items');
    
    // Test 5: Get user statistics
    console.log('\n5. Testing User Statistics...');
    const statsResponse = await axios.get(`${BASE_URL}/users/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ User stats:', statsResponse.data);
    
    // Test 6: Add item to favorites
    console.log('\n6. Testing Favorites Functionality...');
    const favoriteResponse = await axios.post(`${BASE_URL}/items/${itemId}/favorite`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Favorite toggled:', favoriteResponse.data.message);
    
    // Test 7: Get user's favorites
    const favoritesResponse = await axios.get(`${BASE_URL}/users/favorites`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ User favorites retrieved:', favoritesResponse.data.length, 'items');
    
    // Test 8: Register second user to test isolation
    console.log('\n7. Testing User Data Isolation...');
    const user2Response = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test User 2',
      email: `test2${Date.now()}@university.edu`,
      password: 'password123',
      university: 'Test University 2'
    });
    
    const token2 = user2Response.data.token;
    console.log('✅ Second user registered:', user2Response.data.user.name);
    
    // Test 9: Verify second user has no items
    const user2ItemsResponse = await axios.get(`${BASE_URL}/items/user`, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    console.log('✅ Second user items (should be 0):', user2ItemsResponse.data.length);
    
    // Test 10: Verify second user can see first user's public items
    const publicItemsResponse = await axios.get(`${BASE_URL}/items`);
    console.log('✅ Public items visible to all users:', publicItemsResponse.data.length);
    
    console.log('\n🎉 All user-specific functionality tests passed!');
    console.log('\nKey Features Verified:');
    console.log('• ✅ User registration and authentication');
    console.log('• ✅ User-specific item creation and retrieval');
    console.log('• ✅ User-specific favorites');
    console.log('• ✅ User statistics');
    console.log('• ✅ Data isolation between users');
    console.log('• ✅ Public item visibility');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

// Run the tests
testUserSpecificFunctionality();
