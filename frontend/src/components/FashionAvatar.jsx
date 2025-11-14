import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const FashionAvatar = ({ mood }) => {
  const [currentPose, setCurrentPose] = useState('idle')

  useEffect(() => {
    setCurrentPose(mood)
    const timer = setTimeout(() => setCurrentPose('idle'), 3000)
    return () => clearTimeout(timer)
  }, [mood])

  const poses = {
    idle: '💁‍♂️',
    confident: '💪',
    chill: '😎', 
    soft: '🌸',
    power: '🔥',
    edgy: '🖤'
  }

  return (
    <motion.div 
      className="bg-gray-900/80 backdrop-blur-lg rounded-3xl p-8 border border-gray-800 shadow-2xl"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.h2 
        className="text-3xl font-bold text-white mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        Style Avatar
      </motion.h2>
      
      <div className="h-96 rounded-2xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/20 flex items-center justify-center relative overflow-hidden">
        <motion.div
          key={currentPose}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-center"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: currentPose === 'idle' ? [0, 5, -5, 0] : 0
            }}
            transition={{ 
              y: { duration: 2, repeat: Infinity },
              rotate: { duration: 4, repeat: Infinity }
            }}
            className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-2xl"
          >
            <motion.span 
              className="text-6xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {poses[currentPose] || poses.idle}
            </motion.span>
          </motion.div>
          
          <motion.p 
            className="text-white/80 text-lg font-semibold"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {currentPose === 'idle' ? 'Ready to style! 👕' : `Feeling ${currentPose}!`}
          </motion.p>
        </motion.div>

        <div className="absolute top-4 right-4 text-white/60 text-sm bg-black/30 px-3 py-1 rounded-full">
          Live Avatar
        </div>
      </div>
    </motion.div>
  )
}

export default FashionAvatar