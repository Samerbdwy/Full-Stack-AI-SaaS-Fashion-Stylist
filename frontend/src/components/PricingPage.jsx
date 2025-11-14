import React from 'react';
import { motion } from 'framer-motion';
import { PricingTable } from '@clerk/clerk-react';
import { useClerk } from '@clerk/clerk-react';

const PricingPage = ({ setCurrentView }) => {
  const { openUserProfile } = useClerk();
  const handleBackToHome = () => {
    setCurrentView('dashboard');
  };

  const handleGoToProfileSettings = () => {
    openUserProfile();
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <p className="text-lg text-gray-400 mb-6">
            Subscription management and billing are now handled within your profile settings.
          </p>
          <p className="text-md text-green-400 mb-6 font-semibold">
            After purchasing Trend Explorer, please refresh this page to gain access!
          </p>
          <button
            onClick={handleGoToProfileSettings}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold transition-all text-lg"
          >
            Go to Profile & Settings
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;
