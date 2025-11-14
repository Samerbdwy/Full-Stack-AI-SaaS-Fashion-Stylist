import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, useClerk, useAuth } from '@clerk/clerk-react';

const UserDropdown = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { has, isLoaded: isAuthLoaded } = useAuth();

  // Diagnostic log
  if (isAuthLoaded) {
    console.log('Auth loaded. User object:', clerkUser);
    console.log('Checking for trend_explorer plan. Result:', has({ plan: 'trend_explorer' }));
  }

  const hasTrendExplorer = has({ plan: 'trend_explorer' });

  let planStatus = 'Free Plan';
  if (hasTrendExplorer) {
    planStatus = 'Trend Explorer';
  }

  const getUserName = () => {
    if (!isLoaded || !clerkUser) return 'User';
    return clerkUser.fullName || clerkUser.firstName || clerkUser.username || 'User';
  };

  const getUserEmail = () => {
    if (!isLoaded || !clerkUser) return 'user@fashionai.com';
    return clerkUser.primaryEmailAddress?.emailAddress || 'user@fashionai.com';
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsOpen(false);
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    openUserProfile();
  };



  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center space-x-4 bg-gray-800 hover:bg-gray-700 rounded-2xl px-5 py-3 transition-all border border-gray-700"
      >
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-base">
            {clerkUser ? (clerkUser.firstName?.charAt(0) || clerkUser.username?.charAt(0) || 'U') : 'U'}
          </span>
        </div>
        
        <div className="text-left hidden sm:block">
          <div className="text-white font-semibold text-sm">
            {getUserName()}
          </div>
          <div className="text-gray-400 text-xs">
            {getUserEmail()}
          </div>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-gray-400 ml-2"
        >
          ▼
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-3 w-64 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {clerkUser ? (clerkUser.firstName?.charAt(0) || clerkUser.username?.charAt(0) || 'U') : 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm">
                      {getUserName()}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {getUserEmail()}
                    </div>
                  </div>
                </div>
                {isLoaded && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${hasTrendExplorer ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                    {planStatus}
                  </span>
                )}
              </div>

              <div className="p-2 space-y-1">
                <motion.button
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-left transition-all text-gray-300 hover:bg-gray-800"
                  onClick={handleProfileClick}
                >
                  <span className="text-xl">👤</span>
                  <span className="font-medium text-base">Profile & Settings</span>
                </motion.button>

              </div>

              <div className="p-3 border-t border-gray-800">
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-left transition-all text-red-400 hover:bg-red-500/20"
                >
                  <span className="text-xl">🚪</span>
                  <span className="font-medium text-base">Logout</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDropdown;