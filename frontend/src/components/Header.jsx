import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useUser, useClerk } from '@clerk/clerk-react';
import UserDropdown from './UserDropdown';

const Header = ({ currentView, setCurrentView, onLogout }) => {
  const [showPricing, setShowPricing] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { has, isLoaded, userId } = useAuth();
  const { user: clerkUser, isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  // Simplified navigation - removed premium locks and checkout button
  const navItems = [
    { id: 'dashboard', label: 'Home' },
    { id: 'chat', label: 'AI Stylist' },
    { id: 'wardrobe', label: 'Wardrobe' },
    { id: 'analyzer', label: 'Style Analysis' },
    { id: 'styleboard', label: 'StyleBoard' },
    { id: 'ootd', label: 'Outfit of the Day' },
    { id: 'trends', label: 'Trend Explorer' }, // Removed premium flag
  ];

  const handleNavClick = (item) => {
    if (item.id === 'trends') {
      // Correctly check for 'trend_exploler' plan
      if (has && has({ plan: 'trend_explorer' })) {
        setCurrentView('trends');
      } else {
        // Redirect to pricing page if user doesn't have the plan
        setCurrentView('pricing');
      }
    } else {
      setCurrentView(item.id);
    }
    setMobileMenuOpen(false); // Close mobile menu on navigation
  };

  const getActiveView = () => {
    return currentView === 'home' ? 'dashboard' : currentView;
  };

  const activeView = getActiveView();

  return (
    <>
      <motion.header
        initial={{ y: -120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 80 }}
        className="border-b border-gray-800 bg-black/90 backdrop-blur-xl sticky top-0 z-50 shadow-lg"
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-4 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => setCurrentView('dashboard')}
          >
            <motion.div
              className="relative w-14 h-14 flex items-center justify-center"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <div className="w-full h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-black"
                animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            </motion.div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-wide">FashionAI</h1>
              <p className="text-gradient bg-gradient-to-r from-purple-400 to-pink-400 text-xs font-semibold bg-clip-text text-transparent">
                AI Stylist
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation - Only show when signed in */}
          {isSignedIn && (
            <nav className="hidden md:flex space-x-2 bg-gray-900/80 rounded-3xl p-1 backdrop-blur-sm shadow-inner">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`px-6 py-3 rounded-xl font-semibold relative overflow-hidden ${
                    activeView === item.id
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {activeView === item.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-xl shadow-lg"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center space-x-2">
                    <span>{item.label}</span>
                  </span>
                </motion.button>
              ))}
            </nav>
          )}

          {/* User Dropdown / Auth Button */}
          <div className="hidden md:block">
            {isSignedIn ? (
              <UserDropdown 
                user={clerkUser}
                onProfileClick={() => setCurrentView('profile')}
                onLogout={onLogout}
              />
            ) : (
              <motion.button
                onClick={() => openSignIn()}
                whileHover={{ scale: 1.07, boxShadow: "0 15px 50px rgba(192,132,252,0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white px-10 py-3 rounded-3xl font-bold shadow-2xl hover:shadow-3xl transition-all relative overflow-hidden"
              >
                <motion.span
                  className="absolute inset-0 bg-white/10 rounded-3xl"
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                Get Started
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Button */}
          {isSignedIn && (
            <div className="md:hidden">
              <motion.button
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white p-2 rounded-md"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </motion.button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && isSignedIn && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/90"
            >
              <nav className="flex flex-col items-center space-y-2 py-4">
                {navItems.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className={`w-full text-center py-3 font-semibold ${
                      activeView === item.id ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    {item.label}
                  </motion.button>
                ))}
                <div className="pt-4">
                  <UserDropdown 
                    user={clerkUser}
                    onProfileClick={() => setCurrentView('profile')}
                    onLogout={onLogout}
                  />
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Show pricing modal when showPricing is true */}
      {showPricing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">Upgrade to Premium</h2>
            <p className="text-gray-300 mb-6">
              Access Trend Explorer and all premium features for $10/month
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setCurrentView('checkout');
                  setShowPricing(false);
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold flex-1"
              >
                Upgrade Now
              </button>
              <button
                onClick={() => setShowPricing(false)}
                className="bg-gray-700 text-white px-6 py-3 rounded-xl font-bold flex-1"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;