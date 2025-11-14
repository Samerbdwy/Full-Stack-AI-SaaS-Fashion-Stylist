import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  const features = [
    {
      category: "AI Styling",
      items: ["AI Fashion Assistant", "Mood-Based Outfits", "Style Analysis", "Personalized Recommendations"]
    },
    {
      category: "Wardrobe",
      items: ["Digital Closet", "Outfit Planner", "Style Board", "Item Management"]
    },
    {
      category: "Discover",
      items: ["Trend Explorer", "Weather Integration", "Occasion Styles", "Community Looks"]
    },
    {
      category: "Support",
      items: ["Help Center", "Style Guides", "Contact Us", "Feedback"]
    }
  ];

  return (
    <footer className="bg-gray-900/80 backdrop-blur-lg border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">FashionAI</h3>
                <p className="text-gray-400 text-sm">Your AI Fashion Stylist</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Revolutionizing fashion with AI-powered styling. Get personalized outfit recommendations, 
              mood-based looks, and discover your unique style personality.
            </p>
            <div className="flex space-x-4">
              {['📱', '💻', '📧', '🐦'].map((icon, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-purple-500 transition-all"
                >
                  <span className="text-lg">{icon}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Features Links */}
          {features.map((section, index) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <h4 className="text-white font-bold mb-4 text-lg">{section.category}</h4>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <motion.li
                    key={item}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <a 
                      href="#" 
                      className="text-gray-400 hover:text-purple-400 transition-colors cursor-pointer text-sm"
                    >
                      {item}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <motion.div 
          className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 FashionAI. All rights reserved. 
            <span className="text-purple-400 ml-2">Style with Intelligence</span>
          </div>
          
          <div className="flex space-x-6 text-sm">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item, index) => (
              <motion.a
                key={item}
                href="#"
                whileHover={{ scale: 1.05, color: "#a855f7" }}
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                {item}
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {[
            { icon: '🤖', text: 'AI Powered' },
            { icon: '🎯', text: 'Personalized' },
            { icon: '⚡', text: 'Real Time' },
            { icon: '🔒', text: 'Secure' }
          ].map((feature, index) => (
            <motion.div
              key={feature.text}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gray-800/50 rounded-lg p-3 border border-gray-700"
            >
              <div className="text-2xl mb-1">{feature.icon}</div>
              <div className="text-gray-400 text-xs font-medium">{feature.text}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;