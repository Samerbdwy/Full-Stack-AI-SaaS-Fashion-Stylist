// components/ClerkAuthModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignIn } from '@clerk/clerk-react';

const ClerkAuthModal = ({ onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-3xl p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">F</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to FashionAI</h2>
            <p className="text-gray-400">Sign in to continue your style journey</p>
          </div>

          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none",
                headerTitle: "text-white",
                headerSubtitle: "text-gray-400",
                socialButtonsBlockButton: "bg-gray-800 border-gray-700 text-white hover:bg-gray-700",
                formButtonPrimary: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
                footerActionLink: "text-purple-400 hover:text-purple-300",
                formFieldInput: "bg-gray-800 border-gray-700 text-white focus:border-purple-500",
                identityPreviewEditButton: "text-purple-400 hover:text-purple-300"
              }
            }}
          />

          <button
            onClick={onClose}
            className="w-full mt-4 text-gray-400 hover:text-white transition-colors text-sm"
          >
            Cancel
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ClerkAuthModal;