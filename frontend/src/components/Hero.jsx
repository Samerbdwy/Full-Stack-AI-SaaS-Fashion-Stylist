import React from 'react'
import { motion } from 'framer-motion'

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

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
  }

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Only keep the top right gradient orb - remove the bottom left one */}
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center relative z-10 px-4 max-w-6xl mx-auto"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <motion.span
            className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl text-sm font-semibold mb-8 shadow-2xl"
            whileHover={{ scale: 1.05 }}
          >
            ✨ AI-Powered Fashion Revolution
          </motion.span>
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight"
        >
          Your AI
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

        <motion.p 
          variants={itemVariants}
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Get <span className="text-white font-semibold">personalized outfit recommendations</span> 
          {" "}based on your mood, occasion, and personal style. 
          Powered by advanced AI.
        </motion.p>

        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6"
        >
          <motion.button
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
        </motion.div>
      </motion.div>

      {/* Floating fashion elements - Moved further away from text */}
      <motion.div
        className="absolute top-10 left-5 text-3xl opacity-40"
        animate={{
          y: [0, -30, 0],
          rotate: [0, 15, 0],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        👕
      </motion.div>
      
      <motion.div
        className="absolute top-20 right-5 text-3xl opacity-40"
        animate={{
          y: [0, -40, 0],
          rotate: [0, -20, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      >
        👖
      </motion.div>
      
      <motion.div
        className="absolute bottom-10 left-10 text-3xl opacity-40"
        animate={{
          y: [0, -35, 0],
          rotate: [0, 360, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, delay: 2 }}
      >
        👟
      </motion.div>
      
      <motion.div
        className="absolute bottom-20 right-8 text-3xl opacity-40"
        animate={{
          y: [0, -25, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 4, repeat: Infinity, delay: 3 }}
      >
        🧥
      </motion.div>

      {/* Additional floating elements in corners */}
      <motion.div
        className="absolute top-5 left-1/4 text-2xl opacity-30"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
      >
        👓
      </motion.div>
      
      <motion.div
        className="absolute top-5 right-1/4 text-2xl opacity-30"
        animate={{
          y: [0, -25, 0],
          x: [0, -10, 0],
        }}
        transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
      >
        🎩
      </motion.div>
    </section>
  )
}

export default Hero