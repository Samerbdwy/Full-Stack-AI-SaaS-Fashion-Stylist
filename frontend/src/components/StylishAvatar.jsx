import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const moodEmojis = {
  confident: '😎',
  chill: '🥶',
  soft: '😇',
  power: '💪',
  edgy: '🖤',
  idle: '💁‍♂️'
};

const moodTexts = {
  confident: 'Feeling confident! 💪',
  chill: 'Chill vibes 🥶',
  soft: 'Soft and gentle 🌸',
  power: 'Power mode activated! 🔥',
  edgy: 'Edgy aesthetic 🖤',
  idle: 'Ready to style! 👕'
};

const StylishAvatar = ({ mood }) => {
  const [currentMood, setCurrentMood] = useState('idle');

  useEffect(() => {
    setCurrentMood(mood || 'idle');
  }, [mood]);

  return (
    <motion.div
      className="bg-gray-900/80 backdrop-blur-lg rounded-3xl p-8 border border-gray-800 shadow-2xl flex flex-col items-center justify-center relative cursor-pointer overflow-hidden"
      whileHover={{ scale: 1.03 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold text-white mb-6">Current Mood</h2>

      {/* Animated Background Glow */}
      <motion.div
        className="absolute w-60 h-60 rounded-2xl bg-gradient-to-br from-purple-500/40 to-pink-500/40"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ filter: 'blur(60px)', zIndex: 0 }}
      />

      {/* Emoji Avatar */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMood}
          initial={{ scale: 0, rotate: -60, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, rotate: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="relative z-10 w-48 h-48 rounded-2xl flex items-center justify-center text-8xl shadow-2xl mb-6"
        >
          <motion.span
            animate={{
              y: [0, -20, 0],
              rotate: [0, 15, -15, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {moodEmojis[currentMood]}
          </motion.span>
        </motion.div>
      </AnimatePresence>

      {/* Mood Text */}
      <motion.p
        key={currentMood}
        className="text-white/90 text-lg font-semibold text-center px-4 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.8 }}
      >
        <motion.span
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {moodTexts[currentMood]}
        </motion.span>
      </motion.p>

      {/* Label */}
      <div className="absolute top-4 right-4 text-white/60 text-sm bg-black/30 px-3 py-1 rounded-full z-10">
        AI Recommendation
      </div>
    </motion.div>
  );
};

export default StylishAvatar;
