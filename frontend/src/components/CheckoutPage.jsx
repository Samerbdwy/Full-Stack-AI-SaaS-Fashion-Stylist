import React from 'react';
import { motion } from 'framer-motion';
import { PricingTable } from '@clerk/clerk-react';

const CheckoutPage = ({ setCurrentView }) => {
  const handleBackToHome = () => {
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <button
            onClick={handleBackToHome}
            className="mb-6 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 mx-auto"
          >
            <span>←</span>
            <span>Back to Home</span>
          </button>

          <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-4xl">💎</span>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Unlock exclusive fashion insights, Trend Explorer, and advanced AI styling features.
          </p>
        </motion.div>

        {/* Pricing Table */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/80 backdrop-blur-lg rounded-3xl p-8 border-2 border-purple-500/30 relative"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Available Plans
            </h2>
            
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <PricingTable />
              <div className="mt-8 text-center">
                <p className="text-gray-300 mb-4">
                  To manage your subscriptions or make changes to your plan, please visit your user profile.
                </p>
                {/* Assuming there's a way to open the user profile, e.g., via Clerk's user button or a custom function */}
                <button
                  onClick={() => window.Clerk.openUserProfile()} // Example: using Clerk's global object
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg"
                >
                  Manage Subscription in Profile
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
