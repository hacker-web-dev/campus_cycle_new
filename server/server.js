const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  }
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_cycle';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    console.log(`MongoDB connection string: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
  })
  .catch((error) => {
    console.error('MongoDB CONNECTION ERROR:', error);
    process.exit(1); // Exit if MongoDB connection fails
  });
  // Update your CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  university: { type: String, required: true },
  phone: String,
  bio: String,
  profileImage: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80' },
  joinDate: { type: Date, default: Date.now }
});

// Item Schema
const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  condition: { type: String, required: true },
  location: { type: String, required: true },
  images: [String],
  features: [String],
  additionalInfo: String,
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'sold', 'pending'], default: 'active' },
  views: { type: Number, default: 0 },
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


// Cart Schema
const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true, default: 1 },
    addedAt: { type: Date, default: Date.now }
  }],
  updatedAt: { type: Date, default: Date.now }
});

// Order Schema
const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, default: 1 },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  paymentMethod: { type: String, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'], 
    default: 'pending' 
  },
  shippingAddress: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: String,
    zipCode: { type: String, required: true },
    phone: { type: String, required: true }
  },
  billingAddress: {
    name: String,
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  paymentDetails: {
    cardLast4: String,
    cardType: String,
    transactionId: String
  },
  orderNumber: { type: String, unique: true },
  estimatedDelivery: Date,
  trackingNumber: String,
  notes: String,
  verificationPin: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-generate order number
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    this.orderNumber = 'CC' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

// Review Schema
const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  type: { type: String, enum: ['buyer', 'seller'], required: true },
  createdAt: { type: Date, default: Date.now }
});

// Message Schema
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  encrypted: { type: Boolean, default: false },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Conversation Schema
const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  lastMessageAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Loyalty Points Schema
const loyaltyPointsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  totalPoints: { type: Number, default: 0 },
  availablePoints: { type: Number, default: 0 },
  lifetimeEarned: { type: Number, default: 0 },
  lifetimeSpent: { type: Number, default: 0 },
  level: { type: String, default: 'Bronze' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Point Transaction Schema
const pointTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['earned', 'spent', 'bonus'], required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  createdAt: { type: Date, default: Date.now }
});

// Chatbot Query Schema
const chatbotQuerySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  query: { type: String, required: true },
  response: { type: String, required: true },
  queryType: { type: String, enum: ['search', 'stats', 'help', 'general'], default: 'general' },
  createdAt: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', userSchema);
const Item = mongoose.model('Item', itemSchema);
const Cart = mongoose.model('Cart', cartSchema);
const Order = mongoose.model('Order', orderSchema);
const Review = mongoose.model('Review', reviewSchema);
const Message = mongoose.model('Message', messageSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);
const LoyaltyPoints = mongoose.model('LoyaltyPoints', loyaltyPointsSchema);
const PointTransaction = mongoose.model('PointTransaction', pointTransactionSchema);
const ChatbotQuery = mongoose.model('ChatbotQuery', chatbotQuerySchema);

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, university } = req.body;

    // Check if email is from uclan.ac.uk domain
    if (!email || !email.endsWith('@uclan.ac.uk')) {
      return res.status(400).json({ 
        message: 'Registration is only allowed for UCLan students. Please use your @uclan.ac.uk email address.' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      university: university || 'University of Central Lancashire' // Default to UCLan
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email }); // Don't log password
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if email is from uclan.ac.uk domain
    if (!email.endsWith('@uclan.ac.uk')) {
      return res.status(400).json({ 
        message: 'Login is only allowed for UCLan students. Please use your @uclan.ac.uk email address.' 
      });
    }

    console.log('Looking for user with email:', email);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found, checking password');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('Password invalid');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Password valid, generating token');
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    console.log('Login successful for user:', user.email);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university
      }
    });
  } catch (error) {
    console.error('Login error details:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Add this route after your other routes for testing
app.get('/api/test/db', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.json({ 
      message: 'Database connection working', 
      userCount,
      mongoUri: MONGODB_URI.replace(/\/\/.*@/, '//***:***@') // Hide credentials in response
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
});

// User Routes
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, university, bio } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email !== user.email) {
      // Check if new email is from uclan.ac.uk domain
      if (!email.endsWith('@uclan.ac.uk')) {
        return res.status(400).json({ 
          message: 'Email updates are only allowed for UCLan students. Please use your @uclan.ac.uk email address.' 
        });
      }
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.university = university || user.university;
    user.bio = bio || user.bio;

    await user.save();

    // Generate new token with updated email if it changed
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Profile updated successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        university: user.university,
        bio: user.bio,
        profileImage: user.profileImage,
        joinDate: user.joinDate
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Get user statistics
app.get('/api/users/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Count user's active items
    const activeItems = await Item.countDocuments({ seller: userId, status: 'active' });
    
    // Count user's sold items
    const soldItems = await Item.countDocuments({ seller: userId, status: 'sold' });
    
    // Count user's purchases
    const purchases = await Order.countDocuments({ buyer: userId });
    
    // Count user's sales
    const sales = await Order.countDocuments({ seller: userId });
    
    // Count user's favorites
    const favorites = await Item.countDocuments({ savedBy: userId });

    // Get total views on user's items
    const userItems = await Item.find({ seller: userId });
    const totalViews = userItems.reduce((sum, item) => sum + (item.views || 0), 0);

    // Calculate total earnings from actual orders
    const salesOrders = await Order.find({ seller: userId, paymentStatus: 'completed' });
    const totalEarnings = salesOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({
      activeItems,
      soldItems,
      totalItems: activeItems + soldItems,
      purchases,
      sales,
      favorites,
      totalViews,
      totalEarnings,
      averagePrice: userItems.length > 0 ? userItems.reduce((sum, item) => sum + item.price, 0) / userItems.length : 0
    });
  } catch (error) {
    console.error('User stats fetch error:', error);
    res.status(500).json({ message: 'Server error fetching user statistics' });
  }
});

// Get recent activity for dashboard
app.get('/api/users/recent-activity', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;

    // Get recent items posted by user
    const recentItems = await Item.find({ seller: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title price status createdAt views');

    // Get recent orders as buyer
    const recentPurchases = await Order.find({ buyer: userId })
      .populate({
        path: 'items.item',
        select: 'title price images'
      })
      .populate('seller', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Get recent orders as seller
    const recentSales = await Order.find({ seller: userId })
      .populate({
        path: 'items.item',
        select: 'title price images'
      })
      .populate('buyer', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      recentItems,
      recentPurchases,
      recentSales
    });
  } catch (error) {
    console.error('Recent activity fetch error:', error);
    res.status(500).json({ message: 'Server error fetching recent activity' });
  }
});

// Search suggestions endpoint
app.get('/api/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    // Get suggestions from item titles and categories
    const titleSuggestions = await Item.distinct('title', {
      title: { $regex: q, $options: 'i' },
      status: 'active'
    });

    const categorySuggestions = await Item.distinct('category', {
      category: { $regex: q, $options: 'i' },
      status: 'active'
    });

    // Combine and limit suggestions
    const suggestions = [...new Set([...titleSuggestions, ...categorySuggestions])]
      .slice(0, 10);

    res.json(suggestions);
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ message: 'Server error fetching suggestions' });
  }
});

// Items Routes
app.get('/api/items', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, condition, location, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    let query = { status: 'active' };
    
    if (category && category !== 'All Categories') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    if (condition) {
      query.condition = condition;
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortField = sortBy === 'price-low' ? 'price' : sortBy === 'price-high' ? 'price' : sortBy;
    const sortDirection = sortBy === 'price-high' ? -1 : sortBy === 'price-low' ? 1 : sortOrder;

    const items = await Item.find(query)
      .populate('seller', 'name email university')
      .sort({ [sortField]: sortDirection })
      .limit(50);

    res.json(items);
  } catch (error) {
    console.error('Items fetch error:', error);
    res.status(500).json({ message: 'Server error fetching items' });
  }
});

// User-specific item routes (must come before generic :id route)
app.get('/api/items/user', authenticateToken, async (req, res) => {
  try {
    const items = await Item.find({ seller: req.user.userId })
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error('User items fetch error:', error);
    res.status(500).json({ message: 'Server error fetching user items' });
  }
});

// Get items by seller ID (for viewing other users' listings)
app.get('/api/items/seller/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const items = await Item.find({ seller: sellerId, status: 'active' })
      .populate('seller', 'name email university')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error('Seller items fetch error:', error);
    res.status(500).json({ message: 'Server error fetching seller items' });
  }
});

// Trending items endpoint (must come before :id route)
app.get('/api/items/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    
    // Get items with high views/recent activity
    const trendingItems = await Item.find({ status: 'active' })
      .populate('seller', 'name email university')
      .sort({ views: -1, createdAt: -1 })
      .limit(limit);

    res.json(trendingItems);
  } catch (error) {
    console.error('Trending items fetch error:', error);
    res.status(500).json({ message: 'Server error fetching trending items' });
  }
});

// Similar items endpoint (must come before :id route)
app.get('/api/items/:id/similar', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 6;
    
    const currentItem = await Item.findById(id);
    if (!currentItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Find similar items by category and price range
    const priceRange = {
      min: currentItem.price * 0.5,
      max: currentItem.price * 1.5
    };

    const similarItems = await Item.find({
      _id: { $ne: id },
      status: 'active',
      category: currentItem.category,
      price: { $gte: priceRange.min, $lte: priceRange.max }
    })
    .populate('seller', 'name email university')
    .limit(limit);

    // If not enough similar items, add items from same category
    if (similarItems.length < limit) {
      const additionalItems = await Item.find({
        _id: { $ne: id, $nin: similarItems.map(item => item._id) },
        status: 'active',
        category: currentItem.category
      })
      .populate('seller', 'name email university')
      .limit(limit - similarItems.length);

      similarItems.push(...additionalItems);
    }

    res.json(similarItems);
  } catch (error) {
    console.error('Similar items fetch error:', error);
    res.status(500).json({ message: 'Server error fetching similar items' });
  }
});

app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('seller', 'name email university joinDate');
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Increment view count
    item.views += 1;
    await item.save();

    res.json(item);
  } catch (error) {
    console.error('Item fetch error:', error);
    res.status(500).json({ message: 'Server error fetching item' });
  }
});

// Check if item is favorited by current user
app.get('/api/items/:id/favorite-status', authenticateToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const isFavorited = item.savedBy.includes(req.user.userId);
    res.json({ isFavorited });
  } catch (error) {
    console.error('Favorite status check error:', error);
    res.status(500).json({ message: 'Server error checking favorite status' });
  }
});

app.post('/api/items', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, price, category, condition, location, additionalInfo } = req.body;
    
    // Handle features array
    let features = [];
    if (req.body.features) {
      try {
        // Try to parse as JSON first (from frontend FormData)
        if (typeof req.body.features === 'string') {
          features = JSON.parse(req.body.features);
        } else if (Array.isArray(req.body.features)) {
          features = req.body.features;
        } else {
          features = [req.body.features];
        }
      } catch (error) {
        // If JSON parse fails, treat as comma-separated string
        features = req.body.features.split(',').map(f => f.trim()).filter(f => f);
      }
    }

    // Handle uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      const baseUrl = process.env.SERVER_BASE_URL || `http://localhost:${PORT}`;
      images = req.files.map(file => `${baseUrl}/uploads/${file.filename}`);
    }
    
    const item = new Item({
      title,
      description,
      price: parseFloat(price),
      category,
      condition,
      location,
      images,
      features,
      additionalInfo,
      seller: req.user.userId
    });

    await item.save();
    await item.populate('seller', 'name email university');

    res.status(201).json({
      message: 'Item created successfully',
      item
    });
  } catch (error) {
    console.error('Item creation error:', error);
    res.status(500).json({ message: 'Server error creating item' });
  }
});

app.put('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user owns this item
    if (item.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    const { title, description, price, category, condition, location, images, features, additionalInfo, status } = req.body;
    
    item.title = title || item.title;
    item.description = description || item.description;
    item.price = price || item.price;
    item.category = category || item.category;
    item.condition = condition || item.condition;
    item.location = location || item.location;
    item.images = images || item.images;
    item.features = features || item.features;
    item.additionalInfo = additionalInfo || item.additionalInfo;
    item.status = status || item.status;
    item.updatedAt = Date.now();

    await item.save();
    await item.populate('seller', 'name email university');

    res.json({
      message: 'Item updated successfully',
      item
    });
  } catch (error) {
    console.error('Item update error:', error);
    res.status(500).json({ message: 'Server error updating item' });
  }
});

app.delete('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user owns this item
    if (item.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Item deletion error:', error);
    res.status(500).json({ message: 'Server error deleting item' });
  }
});

// Favorites functionality
app.post('/api/items/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const userId = req.user.userId;
    const isFavorited = item.savedBy.includes(userId);

    if (isFavorited) {
      item.savedBy = item.savedBy.filter(id => id.toString() !== userId);
    } else {
      item.savedBy.push(userId);
    }

    await item.save();

    res.json({
      message: isFavorited ? 'Item removed from favorites' : 'Item added to favorites',
      isFavorited: !isFavorited
    });
  } catch (error) {
    console.error('Favorite toggle error:', error);
    res.status(500).json({ message: 'Server error toggling favorite' });
  }
});

app.get('/api/users/favorites', authenticateToken, async (req, res) => {
  try {
    const items = await Item.find({ savedBy: req.user.userId })
      .populate('seller', 'name email university')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error('Favorites fetch error:', error);
    res.status(500).json({ message: 'Server error fetching favorites' });
  }
});

// Cart Routes
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.userId })
      .populate({
        path: 'items.item',
        populate: { path: 'seller', select: 'name email university' }
      });

    if (!cart) {
      cart = new Cart({ user: req.user.userId, items: [] });
      await cart.save();
    }

    // Filter out items that are no longer active
    cart.items = cart.items.filter(cartItem => 
      cartItem.item && cartItem.item.status === 'active'
    );

    await cart.save();
    
    res.json(cart);
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
});

app.post('/api/cart/add', authenticateToken, async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.status !== 'active') {
      return res.status(400).json({ message: 'Item is no longer available' });
    }

    if (item.seller.toString() === req.user.userId) {
      return res.status(400).json({ message: 'Cannot add your own item to cart' });
    }

    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      cart = new Cart({ user: req.user.userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      cartItem => cartItem.item.toString() === itemId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity = quantity;
    } else {
      cart.items.push({ item: itemId, quantity });
    }

    cart.updatedAt = Date.now();
    await cart.save();
    
    await cart.populate({
      path: 'items.item',
      populate: { path: 'seller', select: 'name email university' }
    });

    res.json({
      message: 'Item added to cart',
      cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error adding to cart' });
  }
});

app.put('/api/cart/update/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      cartItem => cartItem.item.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not in cart' });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    cart.updatedAt = Date.now();
    await cart.save();
    
    await cart.populate({
      path: 'items.item',
      populate: { path: 'seller', select: 'name email university' }
    });

    res.json({
      message: 'Cart updated',
      cart
    });
  } catch (error) {
    console.error('Cart update error:', error);
    res.status(500).json({ message: 'Server error updating cart' });
  }
});

app.delete('/api/cart/remove/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      cartItem => cartItem.item.toString() !== itemId
    );

    cart.updatedAt = Date.now();
    await cart.save();

    res.json({
      message: 'Item removed from cart',
      cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error removing from cart' });
  }
});

app.delete('/api/cart/clear', authenticateToken, async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user.userId },
      { items: [], updatedAt: Date.now() },
      { upsert: true, new: true }
    );

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error clearing cart' });
  }
});

// Order Routes (moved to bottom with loyalty points integration)

app.get('/api/orders/my-purchases', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.userId })
      .populate('seller', 'name email university')
      .populate({
        path: 'items.item',
        select: 'title price images category'
      })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Purchases fetch error:', error);
    res.status(500).json({ message: 'Server error fetching purchases' });
  }
});

app.get('/api/orders/my-sales', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user.userId })
      .populate('buyer', 'name email university')
      .populate({
        path: 'items.item',
        select: 'title price images category'
      })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Sales fetch error:', error);
    res.status(500).json({ message: 'Server error fetching sales' });
  }
});

// Categories endpoint with item counts
app.get('/api/categories', async (req, res) => {
  try {
    const baseCategories = [
      "Textbooks",
      "Electronics", 
      "Furniture",
      "Clothing",
      "Appliances",
      "Sports Equipment",
      "Course Materials",
      "Musical Instruments",
      "Bikes & Scooters"
    ];

    // Get categories with item counts
    const categoriesWithCounts = await Promise.all(
      baseCategories.map(async (category) => {
        const count = await Item.countDocuments({ category, status: 'active' });
        return { name: category, count };
      })
    );

    // Add "All Categories" at the beginning
    const allCount = await Item.countDocuments({ status: 'active' });
    const result = [
      { name: "All Categories", count: allCount },
      ...categoriesWithCounts
    ];

    // For backward compatibility, also return simple array
    const simpleCategories = ["All Categories", ...baseCategories];

    res.json(req.query.withCounts === 'true' ? result : simpleCategories);
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
});

// Get public user profile
app.get('/api/users/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password -email');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's statistics
    const activeItems = await Item.countDocuments({ seller: userId, status: 'active' });
    const soldItems = await Item.countDocuments({ seller: userId, status: 'sold' });

    res.json({
      ...user.toObject(),
      stats: {
        activeItems,
        soldItems,
        totalItems: activeItems + soldItems
      }
    });
  } catch (error) {
    console.error('Public profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

// Image upload endpoint
app.post('/api/upload/images', authenticateToken, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    
    res.json({
      message: 'Images uploaded successfully',
      images: imageUrls
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Error uploading images' });
  }
});


// ======================
// REVIEWS & RATINGS API
// ======================

// Get reviews for a user
app.get('/api/reviews/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ reviewee: userId })
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    res.json({ reviews, avgRating, totalReviews: reviews.length });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
});

// Create a review
app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { revieweeId, orderId, rating, comment, type } = req.body;

    // Check if user already reviewed this order
    const existingReview = await Review.findOne({
      reviewer: req.user.userId,
      order: orderId,
      type: type
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this transaction' });
    }

    const review = new Review({
      reviewer: req.user.userId,
      reviewee: revieweeId,
      order: orderId,
      rating,
      comment,
      type
    });

    await review.save();
    await review.populate('reviewer', 'name');

    res.status(201).json({ message: 'Review created successfully', review });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error creating review' });
  }
});

// ======================
// MESSAGING API
// ======================

// Get conversations for a user
app.get('/api/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.userId
    })
    .populate('participants', 'name profileImage')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
});

// Get messages in a conversation
app.get('/api/conversations/:userId/messages', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const messages = await Message.find({
      $or: [
        { sender: req.user.userId, receiver: userId },
        { sender: userId, receiver: req.user.userId }
      ]
    })
    .populate('sender', 'name profileImage')
    .populate('receiver', 'name profileImage')
    .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { sender: userId, receiver: req.user.userId, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

// Send a message
app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { receiverId, content, encrypted = false } = req.body;

    const message = new Message({
      sender: req.user.userId,
      receiver: receiverId,
      content,
      encrypted
    });

    await message.save();
    await message.populate('sender', 'name profileImage');
    await message.populate('receiver', 'name profileImage');

    // Create or update conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.userId, receiverId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user.userId, receiverId],
        lastMessage: message._id,
        lastMessageAt: new Date()
      });
    } else {
      conversation.lastMessage = message._id;
      conversation.lastMessageAt = new Date();
    }

    await conversation.save();

    res.status(201).json({ message: 'Message sent successfully', messageData: message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
});

// Report message endpoint
app.post('/api/messages/report', authenticateToken, async (req, res) => {
  try {
    const { messageId, reason, senderId } = req.body;

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Create a report record (you can create a Report schema later)
    console.log(`Message reported: ${messageId} by user ${req.user.userId} for reason: ${reason}`);
    console.log(`Sender ${senderId} flagged for inappropriate behavior`);

    // Here you would typically:
    // 1. Save report to database
    // 2. Flag the sender's account
    // 3. Notify moderators
    
    res.json({ message: 'Message reported successfully' });
  } catch (error) {
    console.error('Error reporting message:', error);
    res.status(500).json({ message: 'Server error reporting message' });
  }
});

// Get pending orders/transactions
app.get('/api/orders/pending', authenticateToken, async (req, res) => {
  try {
    const pendingOrders = await Order.find({ 
      buyer: req.user.userId,
      $or: [
        { status: 'pending' },
        { status: 'processing' },
        { paymentStatus: 'pending' },
        { paymentStatus: 'processing' }
      ]
    })
    .populate('seller', 'name email')
    .populate({
      path: 'items.item',
      select: 'title price images'
    })
    .sort({ createdAt: -1 });

    res.json(pendingOrders);
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    res.status(500).json({ message: 'Server error fetching pending orders' });
  }
});

// ======================
// LOYALTY POINTS API
// ======================

// Get user's loyalty points
app.get('/api/loyalty/points', authenticateToken, async (req, res) => {
  try {
    let loyaltyPoints = await LoyaltyPoints.findOne({ user: req.user.userId });
    
    if (!loyaltyPoints) {
      loyaltyPoints = new LoyaltyPoints({ user: req.user.userId });
      await loyaltyPoints.save();
    }

    const recentTransactions = await PointTransaction.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ loyaltyPoints, recentTransactions });
  } catch (error) {
    console.error('Error fetching loyalty points:', error);
    res.status(500).json({ message: 'Server error fetching loyalty points' });
  }
});

// Award points (internal function)
const awardPoints = async (userId, amount, reason, orderId = null) => {
  try {
    let loyaltyPoints = await LoyaltyPoints.findOne({ user: userId });
    
    if (!loyaltyPoints) {
      loyaltyPoints = new LoyaltyPoints({ user: userId });
    }

    loyaltyPoints.totalPoints += amount;
    loyaltyPoints.availablePoints += amount;
    loyaltyPoints.lifetimeEarned += amount;
    loyaltyPoints.updatedAt = new Date();

    // Update level based on total points
    if (loyaltyPoints.totalPoints >= 1000) loyaltyPoints.level = 'Platinum';
    else if (loyaltyPoints.totalPoints >= 500) loyaltyPoints.level = 'Gold';
    else if (loyaltyPoints.totalPoints >= 100) loyaltyPoints.level = 'Silver';
    else loyaltyPoints.level = 'Bronze';

    await loyaltyPoints.save();

    // Create transaction record
    const transaction = new PointTransaction({
      user: userId,
      type: 'earned',
      amount,
      reason,
      relatedOrder: orderId
    });

    await transaction.save();

    return loyaltyPoints;
  } catch (error) {
    console.error('Error awarding points:', error);
  }
};

// ======================
// CHATBOT API
// ======================

// Process chatbot query
app.post('/api/chatbot/query', authenticateToken, async (req, res) => {
  try {
    const { query } = req.body;
    let response = '';
    let queryType = 'general';

    const queryLower = query.toLowerCase();

    // Search queries
    if (queryLower.includes('search') || queryLower.includes('find') || queryLower.includes('available')) {
      queryType = 'search';
      
      // Extract category or search term
      const categories = ['textbook', 'electronic', 'furniture', 'clothing', 'appliance', 'sports', 'course', 'instrument', 'bike'];
      const foundCategory = categories.find(cat => queryLower.includes(cat));
      
      if (foundCategory) {
        const items = await Item.find({ 
          category: { $regex: foundCategory, $options: 'i' }, 
          status: 'active' 
        }).limit(5);
        
        if (items.length > 0) {
          response = `I found ${items.length} ${foundCategory} items available:\n\n`;
          items.forEach((item, index) => {
            response += `${index + 1}. ${item.title} - $${item.price} (${item.condition})\n`;
          });
          response += '\nWould you like me to search for anything else?';
        } else {
          response = `Sorry, I couldn't find any ${foundCategory} items available right now. Try checking back later or post what you're looking for!`;
        }
      } else {
        const totalItems = await Item.countDocuments({ status: 'active' });
        response = `We currently have ${totalItems} items available across all categories. What specific category are you looking for? (textbooks, electronics, furniture, clothing, etc.)`;
      }
    }
    // Stats queries
    else if (queryLower.includes('stats') || queryLower.includes('how many') || queryLower.includes('total')) {
      queryType = 'stats';
      
      const totalItems = await Item.countDocuments({ status: 'active' });
      const totalUsers = await User.countDocuments();
      const totalOrders = await Order.countDocuments();
      const categories = await Item.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      response = `📊 Campus Cycle Stats:\n\n`;
      response += `🛍️ Active Items: ${totalItems}\n`;
      response += `👥 Total Users: ${totalUsers}\n`;
      response += `📦 Total Orders: ${totalOrders}\n\n`;
      response += `🏷️ Popular Categories:\n`;
      categories.slice(0, 5).forEach((cat, index) => {
        response += `${index + 1}. ${cat._id}: ${cat.count} items\n`;
      });
    }
    // Help queries
    else if (queryLower.includes('help') || queryLower.includes('how to') || queryLower.includes('?')) {
      queryType = 'help';
      
      if (queryLower.includes('sell') || queryLower.includes('list')) {
        response = `🔹 To sell an item:\n1. Click "Sell" in the navigation\n2. Fill out the item details\n3. Upload up to 5 photos\n4. Set your price and condition\n5. Click "List Item"`;
      } else if (queryLower.includes('buy') || queryLower.includes('purchase')) {
        response = `🔹 To buy an item:\n1. Browse items or search\n2. Click on an item you like\n3. Add to cart or contact seller\n4. Complete checkout process`;
      } else if (queryLower.includes('points') || queryLower.includes('loyalty')) {
        response = `🔹 Loyalty Points System:\n• Earn 10 points for each successful sale\n• Earn 5 points for each purchase\n• Use points for discounts on future purchases\n• Levels: Bronze → Silver (100pts) → Gold (500pts) → Platinum (1000pts)`;
      } else {
        response = `🔹 I can help you with:\n• Searching for items ("find textbooks")\n• Getting site statistics ("how many items")\n• Learning how to sell/buy\n• Understanding the points system\n\nWhat would you like to know?`;
      }
    }
    // General queries
    else {
      response = `I'm here to help! I can assist you with:\n\n🔍 Searching for items\n📊 Site statistics\n❓ How-to guides\n🎯 Loyalty points info\n\nTry asking "find electronics" or "how to sell an item"`;
    }

    // Save query to database
    const chatbotQuery = new ChatbotQuery({
      user: req.user.userId,
      query,
      response,
      queryType
    });

    await chatbotQuery.save();

    res.json({ response, queryType });
  } catch (error) {
    console.error('Error processing chatbot query:', error);
    res.status(500).json({ message: 'Server error processing query' });
  }
});

// Get chatbot history
app.get('/api/chatbot/history', authenticateToken, async (req, res) => {
  try {
    const history = await ChatbotQuery.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(history);
  } catch (error) {
    console.error('Error fetching chatbot history:', error);
    res.status(500).json({ message: 'Server error fetching chat history' });
  }
});

// ======================
// UPDATE ORDER CREATION TO AWARD POINTS
// ======================

// Override the original order creation to include points
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { 
      items, 
      shippingAddress, 
      billingAddress, 
      paymentMethod, 
      paymentDetails,
      notes,
      verificationPin 
    } = req.body;

    // Validate required fields
    if (!items || !items.length || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required order information' });
    }

    let totalAmount = 0;
    const orderItems = [];

    // Process each item and calculate total
    for (const orderItem of items) {
      const item = await Item.findById(orderItem.itemId).populate('seller', 'name email');
      
      if (!item) {
        return res.status(404).json({ message: `Item ${orderItem.itemId} not found` });
      }

      if (item.status !== 'active') {
        return res.status(400).json({ message: `Item "${item.title}" is no longer available` });
      }

      if (item.seller._id.toString() === req.user.userId) {
        return res.status(400).json({ message: `Cannot buy your own item "${item.title}"` });
      }

      const itemTotal = item.price * (orderItem.quantity || 1);
      totalAmount += itemTotal;

      orderItems.push({
        item: item._id,
        quantity: orderItem.quantity || 1,
        price: item.price
      });
    }

    // Group items by seller to create separate orders
    const itemsBySeller = {};
    for (const orderItem of orderItems) {
      const item = await Item.findById(orderItem.item).populate('seller', 'name email');
      const sellerId = item.seller._id.toString();
      
      if (!itemsBySeller[sellerId]) {
        itemsBySeller[sellerId] = {
          seller: item.seller,
          items: [],
          totalAmount: 0
        };
      }
      
      itemsBySeller[sellerId].items.push(orderItem);
      itemsBySeller[sellerId].totalAmount += orderItem.price * orderItem.quantity;
    }

    const createdOrders = [];

    // Create separate orders for each seller
    for (const [sellerId, sellerData] of Object.entries(itemsBySeller)) {
      const order = new Order({
        buyer: req.user.userId,
        seller: sellerId,
        items: sellerData.items,
        totalAmount: sellerData.totalAmount,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        paymentMethod,
        paymentDetails: {
          cardLast4: paymentDetails?.cardNumber?.slice(-4) || '****',
          cardType: paymentDetails?.cardType || 'Unknown',
          transactionId: 'TXN_' + Date.now() + Math.random().toString(36).substr(2, 5)
        },
        paymentStatus: 'completed',
        status: 'confirmed',
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        trackingNumber: 'CC' + Date.now().toString(),
        notes,
        verificationPin
      });

      await order.save();
      createdOrders.push(order);

      // Mark items as sold
      for (const orderItem of sellerData.items) {
        await Item.findByIdAndUpdate(orderItem.item, { status: 'sold' });
      }

      // Award points to buyer (5 points per purchase)
      await awardPoints(req.user.userId, 5, 'Purchase completed', order._id);

      // Award points to seller (10 points per sale)
      await awardPoints(sellerId, 10, 'Item sold', order._id);
    }

    // Clear cart
    await Cart.findOneAndUpdate(
      { user: req.user.userId },
      { items: [], updatedAt: Date.now() }
    );

    // Populate all created orders
    for (let order of createdOrders) {
      await order.populate([
        { path: 'buyer', select: 'name email university' },
        { path: 'seller', select: 'name email university' },
        { path: 'items.item', populate: { path: 'seller', select: 'name email' } }
      ]);
    }

    res.status(201).json({
      message: 'Orders placed successfully',
      orders: createdOrders,
      order: createdOrders[0]
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`MongoDB URI: ${MONGODB_URI}`);
});