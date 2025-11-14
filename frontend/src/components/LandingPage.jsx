import React from 'react';
import { motion } from 'framer-motion';
import Footer from './Footer';

const LandingPage = ({ onNavigate }) => {
  const features = [
    {
      icon: '🤖',
      title: 'AI Fashion Stylist',
      description: 'Get personalized outfit recommendations powered by advanced AI technology'
    },
    {
      icon: '🎭',
      title: 'Mood-Based Styling',
      description: 'Outfits that match your current mood and personality'
    },
    {
      icon: '👔',
      title: 'Digital Wardrobe',
      description: 'Upload and organize your clothing items for better styling'
    },
    {
      icon: '📊',
      title: 'Style Analysis',
      description: 'AI-powered insights into your unique fashion personality'
    },
    {
      icon: '🌤️',
      title: 'Weather-Aware',
      description: 'Outfits that consider current weather conditions'
    },
    {
      icon: '🔥',
      title: 'Trend Explorer',
      description: 'Discover the latest fashion trends worldwide'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-500 rounded-full"
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-6xl mx-auto relative z-10"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <motion.span
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl text-sm font-semibold mb-8 shadow-2xl"
              whileHover={{ scale: 1.05 }}
            >
              ✨ AI-Powered Fashion Revolution
            </motion.span>
          </motion.div>

          {/* Improved Hero Text Layout */}
          <motion.div variants={itemVariants} className="mb-6">
            <motion.h1 
              className="text-6xl md:text-8xl font-bold leading-tight"
            >
              <span className="text-white">Your AI</span>
              <br />
              <motion.span
                className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-size-200"
                animate={{
                  backgroundPosition: ['0%', '200%', '0%']
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: '200% 100%'
                }}
              >
                Fashion Stylist
              </motion.span>
            </motion.h1>
          </motion.div>

          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Discover your perfect style with <span className="text-white font-semibold">AI-powered outfit recommendations</span> 
            {" "}tailored to your mood, occasion, and personal taste.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <motion.button
              onClick={() => onNavigate('login')}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 20px 40px rgba(192, 132, 252, 0.4)" 
              }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all flex items-center space-x-3"
            >
              <span>🎨</span>
              <span>Start Styling Now</span>
            </motion.button>
            
            {/* Removed "Try AI Demo" button */}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose <span className="text-purple-400">FashionAI</span>?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Revolutionize your style with cutting-edge AI technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-2xl p-6 text-center hover:border-purple-500/50 transition-all"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* <Footer /> */}
    </div>
  );
};

export default LandingPage;