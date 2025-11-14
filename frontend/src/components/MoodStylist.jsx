// MoodStylist.jsx - MOBILE RESPONSIVE VERSION
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const MoodStylist = ({ onMoodSelect, currentMood, onGenerateOutfit }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutfit, setGeneratedOutfit] = useState(null);

  const moods = [
    { emoji: '😎', label: 'Confident', style: 'Bold streetwear' },
    { emoji: '🥶', label: 'Chill', style: 'Relaxed comfort' },
    { emoji: '😇', label: 'Soft', style: 'Gentle pastels' },
    { emoji: '💪', label: 'Power', style: 'Athletic luxury' },
    { emoji: '🖤', label: 'Edgy', style: 'Dark monochrome' },
  ];

  const currentMoodData = moods.find((m) => m.label.toLowerCase() === currentMood) || moods[0];

  const handleGenerateOutfit = async () => {
    setIsGenerating(true);
    setGeneratedOutfit(null); // Clear previous outfit
    
    try {
      console.log('🎨 Generating outfit for mood:', currentMood);
      const response = await onGenerateOutfit(currentMood, 'casual', 'moderate');
      
      if (response && response.outfit) {
        console.log('✅ Outfit generated:', response.outfit);
        setGeneratedOutfit(response.outfit);
      } else {
        // Fallback if API fails
        console.log('⚠️ Using fallback outfit data');
        const fallbackOutfits = {
          confident: {
            title: "Confident Street Style",
            description: "Bold and expressive outfit for confident days",
            items: [
              "Leather Jacket",
              "Graphic T-Shirt",
              "Distressed Jeans",
              "Statement Sneakers",
              "Silver Accessories"
            ],
            mood: "confident",
            occasion: "casual",
            colors: ["#000000", "#FFFFFF", "#C0C0C0"]
          },
          chill: {
            title: "Cozy Comfort",
            description: "Relaxed and comfortable for laid-back days",
            items: [
              "Oversized Hoodie",
              "Comfortable Leggings",
              "Platform Sneakers",
              "Beanie",
              "Crossbody Bag"
            ],
            mood: "chill",
            occasion: "casual",
            colors: ["#8B4513", "#000000", "#696969"]
          },
          soft: {
            title: "Gentle Elegance",
            description: "Soft and delicate with gentle pastel tones",
            items: [
              "Cashmere Sweater",
              "Wide-leg Trousers",
              "Minimalist Sneakers",
              "Delicate Jewelry",
              "Structured Tote"
            ],
            mood: "soft",
            occasion: "casual",
            colors: ["#FFB6C1", "#FFFFFF", "#E6E6FA"]
          },
          power: {
            title: "Executive Power",
            description: "Sharp and sophisticated professional look",
            items: [
              "Structured Blazer",
              "Crisp White Button-Down",
              "Tailored Trousers",
              "Leather Loafers",
              "Statement Watch"
            ],
            mood: "power",
            occasion: "work",
            colors: ["#000080", "#FFFFFF", "#2F4F4F"]
          },
          edgy: {
            title: "Dark Aesthetic",
            description: "Bold and edgy with monochrome elements",
            items: [
              "Biker Jacket",
              "Ripped Black Jeans",
              "Harness Details",
              "Combat Boots",
              "Chunky Rings"
            ],
            mood: "edgy",
            occasion: "party",
            colors: ["#000000", "#2F4F4F", "#800000"]
          }
        };
        
        setGeneratedOutfit(fallbackOutfits[currentMood] || fallbackOutfits.confident);
      }
    } catch (error) {
      console.error('Error generating outfit:', error);
      // Fallback outfit based on current mood
      const errorOutfits = {
        confident: {
          title: `${currentMoodData.label} Style`,
          items: [
            'Confident Top',
            'Bold Bottom',
            'Statement Shoes',
            'Power Accessories'
          ],
          description: `AI-generated ${currentMoodData.label.toLowerCase()} look`
        },
        chill: {
          title: `${currentMoodData.label} Comfort`,
          items: [
            'Relaxed Top',
            'Comfortable Bottom',
            'Casual Shoes',
            'Cozy Accessories'
          ],
          description: `AI-generated ${currentMoodData.label.toLowerCase()} look`
        },
        soft: {
          title: `${currentMoodData.label} Elegance`,
          items: [
            'Gentle Top',
            'Flowy Bottom',
            'Delicate Shoes',
            'Soft Accessories'
          ],
          description: `AI-generated ${currentMoodData.label.toLowerCase()} look`
        },
        power: {
          title: `${currentMoodData.label} Professional`,
          items: [
            'Structured Top',
            'Tailored Bottom',
            'Sophisticated Shoes',
            'Executive Accessories'
          ],
          description: `AI-generated ${currentMoodData.label.toLowerCase()} look`
        },
        edgy: {
          title: `${currentMoodData.label} Edge`,
          items: [
            'Bold Top',
            'Statement Bottom',
            'Edgy Shoes',
            'Dark Accessories'
          ],
          description: `AI-generated ${currentMoodData.label.toLowerCase()} look`
        }
      };
      
      setGeneratedOutfit(errorOutfits[currentMood] || errorOutfits.confident);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-4 sm:p-8 border border-gray-800 shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Mood Stylist</h2>

      {/* Mood Selection */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-6 sm:mb-8">
        {moods.map((mood) => {
          const isActive = currentMood === mood.label.toLowerCase();
          return (
            <motion.button
              key={mood.label}
              onClick={() => onMoodSelect(mood.label.toLowerCase())}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center p-2 sm:p-3 rounded-xl transition-all font-medium ${
                isActive
                  ? 'bg-white text-black shadow-md'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              <span className="text-xl sm:text-2xl">{mood.emoji}</span>
              <span className="text-xs mt-1 text-center leading-tight">{mood.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Current Mood Display */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <h3 className="text-white font-bold text-base sm:text-lg mb-2">
          {currentMoodData.emoji} {currentMoodData.label} Look
        </h3>
        <p className="text-gray-400 text-sm">
          {currentMoodData.style === 'Bold streetwear' &&
            'Black leather jacket, graphic tee, distressed jeans, statement sneakers'}
          {currentMoodData.style === 'Relaxed comfort' &&
            'Oversized hoodie, cargo pants, platform sneakers, beanie'}
          {currentMoodData.style === 'Gentle pastels' &&
            'Cashmere sweater, wide-leg trousers, minimalist sneakers, delicate jewelry'}
          {currentMoodData.style === 'Athletic luxury' &&
            'Structured blazer, tailored pants, leather loafers, statement watch'}
          {currentMoodData.style === 'Dark monochrome' &&
            'Biker jacket, ripped jeans, harness details, combat boots'}
        </p>
        <div className="mt-3 text-purple-400 text-xs">
          Current mood: <strong>{currentMood}</strong>
        </div>
      </div>

      {/* Generated Outfit */}
      {generatedOutfit && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4 mb-4"
        >
          <h4 className="text-white font-bold mb-2 text-sm sm:text-base">✨ {generatedOutfit.title}</h4>
          <p className="text-purple-200 text-sm mb-3">{generatedOutfit.description}</p>
          <div className="space-y-2">
            {generatedOutfit.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 text-purple-100 text-sm">
                <span className="text-purple-400">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          {generatedOutfit.colors && (
            <div className="mt-3 flex items-center space-x-2">
              <span className="text-purple-300 text-xs">Colors:</span>
              <div className="flex space-x-1">
                {generatedOutfit.colors.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-4 h-4 rounded-full border border-purple-400"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Generate Outfit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center"
        onClick={handleGenerateOutfit}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full mr-2"
            />
            <span className="text-sm sm:text-base">Generating {currentMoodData.label} Outfit...</span>
          </>
        ) : (
          <span className="text-sm sm:text-base">Generate {currentMoodData.label} Outfit</span>
        )}
      </motion.button>

      {/* Debug info */}
      <div className="mt-4 text-gray-500 text-xs text-center">
        Mood: {currentMood} | Status: {isGenerating ? 'Generating...' : 'Ready'}
      </div>
    </div>
  );
};

export default MoodStylist;