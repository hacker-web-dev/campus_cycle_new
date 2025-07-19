import React, { useState, useEffect } from 'react';
import { FaTrophy, FaStar, FaGift, FaCoins, FaHistory, FaInfoCircle } from 'react-icons/fa';
import ApiService from '../services/api';

const LoyaltyProgram = ({ user, compact = false }) => {
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user) {
      loadLoyaltyData();
    }
  }, [user]);

  const loadLoyaltyData = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getLoyaltyPoints();
      setLoyaltyData(data.loyaltyPoints);
      setTransactions(data.recentTransactions);
    } catch (error) {
      console.error('Error loading loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelInfo = (level) => {
    const levels = {
      Bronze: { color: 'bg-amber-600', nextLevel: 'Silver', nextPoints: 100, icon: '🥉' },
      Silver: { color: 'bg-gray-400', nextLevel: 'Gold', nextPoints: 500, icon: '🥈' },
      Gold: { color: 'bg-yellow-500', nextLevel: 'Platinum', nextPoints: 1000, icon: '🥇' },
      Platinum: { color: 'bg-purple-600', nextLevel: null, nextPoints: null, icon: '💎' }
    };
    return levels[level] || levels.Bronze;
  };

  const getProgressPercentage = () => {
    if (!loyaltyData) return 0;
    
    const levelInfo = getLevelInfo(loyaltyData.level);
    if (!levelInfo.nextPoints) return 100; // Platinum level
    
    const currentLevelPoints = {
      Bronze: 0,
      Silver: 100,
      Gold: 500,
      Platinum: 1000
    };
    
    const currentMin = currentLevelPoints[loyaltyData.level] || 0;
    const progress = ((loyaltyData.totalPoints - currentMin) / (levelInfo.nextPoints - currentMin)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`${compact ? 'p-2' : 'p-6'} bg-white rounded-lg shadow-sm`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (!loyaltyData) return null;

  const levelInfo = getLevelInfo(loyaltyData.level);

  // Compact version for navbar
  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <FaCoins className="text-yellow-500" />
        <span className="font-medium">{loyaltyData.availablePoints}</span>
        <span className="text-xs text-gray-500">pts</span>
        <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${levelInfo.color}`}>
          {levelInfo.icon} {loyaltyData.level}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Loyalty Program</h2>
            <p className="text-blue-100">Earn points with every transaction!</p>
          </div>
          <FaTrophy className="text-4xl text-yellow-300" />
        </div>
      </div>

      <div className="p-6">
        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-white text-2xl mb-2 ${levelInfo.color}`}>
              {levelInfo.icon}
            </div>
            <div className="text-lg font-semibold">{loyaltyData.level} Member</div>
            <div className="text-sm text-gray-500">Current Level</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {loyaltyData.availablePoints}
            </div>
            <div className="text-lg font-semibold">Available Points</div>
            <div className="text-sm text-gray-500">Ready to use</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {loyaltyData.lifetimeEarned}
            </div>
            <div className="text-lg font-semibold">Total Earned</div>
            <div className="text-sm text-gray-500">All time</div>
          </div>
        </div>

        {/* Progress to Next Level */}
        {levelInfo.nextLevel && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress to {levelInfo.nextLevel}
              </span>
              <span className="text-sm text-gray-500">
                {loyaltyData.totalPoints} / {levelInfo.nextPoints} points
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {levelInfo.nextPoints - loyaltyData.totalPoints} points until {levelInfo.nextLevel}
            </div>
          </div>
        )}

        {/* How to Earn Points */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <FaInfoCircle className="mr-2 text-blue-500" />
            How to Earn Points
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <FaGift className="text-green-500" />
              <span>10 points per successful sale</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaCoins className="text-blue-500" />
              <span>5 points per purchase</span>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showHistory ? 'Hide' : 'Show'} History
          </button>
        </div>

        {showHistory && (
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <FaHistory className="mx-auto text-2xl mb-2" />
                <p>No transactions yet</p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'earned' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'earned' ? <FaCoins /> : <FaGift />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{transaction.reason}</div>
                      <div className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</div>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'earned' ? '+' : '-'}{transaction.amount} pts
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Level Benefits */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3">Level Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-800">Bronze (0+ points)</div>
              <div className="text-blue-700">• Basic rewards</div>
            </div>
            <div>
              <div className="font-medium text-blue-800">Silver (100+ points)</div>
              <div className="text-blue-700">• 5% bonus points</div>
            </div>
            <div>
              <div className="font-medium text-blue-800">Gold (500+ points)</div>
              <div className="text-blue-700">• 10% bonus points • Priority support</div>
            </div>
            <div>
              <div className="font-medium text-blue-800">Platinum (1000+ points)</div>
              <div className="text-blue-700">• 15% bonus points • Exclusive offers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyProgram;