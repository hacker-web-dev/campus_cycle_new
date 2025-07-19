import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Chatbot from './components/Chatbot';
import MessagingSystem from './components/MessagingSystem';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Browse from './pages/Browse';
import ProductDetails from './pages/ProductDetails';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Sell from './pages/Sell';
import Favorites from './pages/Favorites';
import MyListings from './pages/MyListings';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
import LoyaltyPage from './pages/LoyaltyPage';
import ApiService from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('campus_cycle_token');
    if (token) {
      ApiService.setAuthToken(token);
      // Verify token and get user data
      ApiService.getUserProfile()
        .then(userData => {
          setUser(userData);
          setIsAuthenticated(true);
        })
        .catch(() => {
          // Token is invalid, remove it
          localStorage.removeItem('campus_cycle_token');
          ApiService.setAuthToken(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('campus_cycle_token');
    ApiService.setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar isAuthenticated={isAuthenticated} user={user} logout={logout} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home isAuthenticated={isAuthenticated} user={user} />} />
            <Route path="/login" element={<Login login={login} isAuthenticated={isAuthenticated} />} />
            <Route path="/register" element={<Register login={login} isAuthenticated={isAuthenticated} />} />
            <Route path="/browse" element={<Browse />} />
            <Route 
              path="/sell" 
              element={isAuthenticated ? <Sell /> : <Navigate to="/login" />} 
            />
            <Route path="/product/:id" element={<ProductDetails user={user} />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Dashboard user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile" 
              element={isAuthenticated ? <Profile user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/favorites" 
              element={isAuthenticated ? <Favorites user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/my-listings" 
              element={isAuthenticated ? <MyListings user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/cart" 
              element={isAuthenticated ? <Cart user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/checkout" 
              element={isAuthenticated ? <Checkout user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/purchases" 
              element={isAuthenticated ? <Purchases user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/sales" 
              element={isAuthenticated ? <Sales user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/loyalty" 
              element={isAuthenticated ? <LoyaltyPage user={user} /> : <Navigate to="/login" />} 
            />
            
            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        
        {/* Global Components */}
        <Chatbot />
        <MessagingSystem user={user} />
      </div>
    </Router>
  );
}

export default App;
