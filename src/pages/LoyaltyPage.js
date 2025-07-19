import React from 'react';
import LoyaltyProgram from '../components/LoyaltyProgram';

const LoyaltyPage = ({ user }) => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Loyalty Program</h1>
          <p className="mt-2 text-gray-600">
            Earn points with every transaction and unlock exclusive benefits
          </p>
        </div>
        
        <LoyaltyProgram user={user} />
      </div>
    </div>
  );
};

export default LoyaltyPage;