// components/StyleAnalyzer.jsx - FIXED VERSION with backend integration
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const StyleAnalyzer = ({ wardrobe, onAnalyze }) => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeWardrobe = async () => {
    setIsAnalyzing(true);
    
    try {
      console.log('📊 Starting style analysis with wardrobe:', wardrobe.length, 'items');
      const response = await onAnalyze();
      
      if (response && response.analysis) {
        setAnalysis(response.analysis);
      } else {
        // Fallback analysis based on actual wardrobe data
        const fallbackAnalysis = generateAnalysisFromWardrobe(wardrobe);
        setAnalysis(fallbackAnalysis);
      }
    } catch (error) {
      console.error('Error analyzing style:', error);
      // Generate analysis from actual wardrobe data
      const fallbackAnalysis = generateAnalysisFromWardrobe(wardrobe);
      setAnalysis(fallbackAnalysis);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateAnalysisFromWardrobe = (wardrobeItems) => {
    if (!wardrobeItems || wardrobeItems.length === 0) {
      return {
        personality: {
          name: 'Getting Started',
          description: 'Add some items to your wardrobe to get personalized style analysis!',
          strengths: ['Fresh start', 'Endless possibilities', 'Clean slate'],
          improvements: ['Add your first clothing items', 'Explore different styles', 'Build your unique wardrobe'],
          colorPalette: ['#6B7280', '#9CA3AF', '#D1D5DB'],
          icon: '🆕'
        },
        stats: {
          totalItems: 0,
          topColors: [],
          commonTags: [],
          categoryBreakdown: {}
        }
      };
    }

    // Real analysis based on wardrobe data
    const colors = wardrobeItems.reduce((acc, item) => {
      const normalizedColor = item.color ? item.color.toLowerCase() : 'unknown';
      acc[normalizedColor] = (acc[normalizedColor] || 0) + 1;
      return acc;
    }, {});

    const tags = wardrobeItems.flatMap(item => item.tags || []);
    const tagCounts = tags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

    const categories = wardrobeItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    // Determine style personality based on actual data
    const personality = determinePersonality(wardrobeItems, colors, tagCounts);

    return {
      personality,
      stats: {
        totalItems: wardrobeItems.length,
        topColors: Object.entries(colors).sort((a, b) => b[1] - a[1]).slice(0, 3),
        commonTags: Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
        categoryBreakdown: categories
      }
    };
  };

  const determinePersonality = (wardrobe, colors, tags) => {
    const colorCount = Object.keys(colors).length;
    const totalItems = wardrobe.length;
    
    // Analyze wardrobe characteristics
    const hasStreetwear = wardrobe.some(item => 
      item.tags?.includes('streetwear') || 
      item.tags?.includes('urban') ||
      item.name?.toLowerCase().includes('hoodie') ||
      item.name?.toLowerCase().includes('sneaker')
    );

    const hasMinimal = wardrobe.some(item => 
      item.tags?.includes('minimal') || 
      item.tags?.includes('basic') ||
      item.color === 'black' || 
      item.color === 'white'
    );

    const hasVintage = wardrobe.some(item => 
      item.tags?.includes('vintage') || 
      item.tags?.includes('retro')
    );

    const hasFormal = wardrobe.some(item => 
      item.occasion === 'formal' || 
      item.occasion === 'work' ||
      item.category === 'dress' ||
      item.name?.toLowerCase().includes('blazer')
    );

    const purpleItemsCount = wardrobe.filter(item => item.color?.toLowerCase() === 'purple').length;
    const purplePercentage = (purpleItemsCount / totalItems) * 100;

    // Determine personality based on analysis
    if (hasStreetwear && hasMinimal) {
      return {
        name: 'Urban Minimalist',
        description: 'You blend streetwear edge with clean, minimalist aesthetics for a modern urban look.',
        strengths: ['Versatile style', 'Modern appeal', 'Practical fashion'],
        improvements: ['Experiment with color', 'Try different textures', 'Add statement pieces'],
        colorPalette: ['#000000', '#FFFFFF', '#2F4F4F', '#696969'],
        icon: '🏙️'
      };
    } else if (hasStreetwear) {
      return {
        name: 'Street Style Star',
        description: 'You embrace urban fashion with bold statements and expressive pieces.',
        strengths: ['Confident styling', 'Trend awareness', 'Personal expression'],
        improvements: ['Balance with basics', 'Explore different silhouettes'],
        colorPalette: ['#000000', '#FF0000', '#FFFF00', '#0000FF'],
        icon: '🛹'
      };
    } else if (hasMinimal && colorCount <= 3) {
      return {
        name: 'Modern Minimalist',
        description: 'You prefer clean lines, neutral colors, and timeless pieces that never go out of style.',
        strengths: ['Versatile wardrobe', 'Easy to mix and match', 'Timeless appeal'],
        improvements: ['Add some statement accessories', 'Experiment with texture'],
        colorPalette: ['#000000', '#FFFFFF', '#808080', '#2F4F4F'],
        icon: '⚪'
      };
    } else if (hasFormal) {
      return {
        name: 'Classic Professional',
        description: 'You appreciate traditional elegance, quality fabrics, and pieces that stand the test of time.',
        strengths: ['Sophisticated taste', 'Quality over quantity', 'Elegant simplicity'],
        improvements: ['Add contemporary twists', 'Play with proportions'],
        colorPalette: ['#000000', '#FFFFFF', '#8B4513', '#2F4F4F'],
        icon: '👔'
      };
    } else if (purplePercentage >= 30) { // New condition for purple passionista
      return {
        name: 'Purple Passionista',
        description: 'You have a bold and expressive style, with a strong affinity for the color purple.',
        strengths: ['Unique style', 'Confident color use', 'Expressive fashion'],
        improvements: ['Experiment with complementary colors', 'Vary shades of purple'],
        colorPalette: ['#800080', '#EE82EE', '#BA55D3', '#DDA0DD'], // Various shades of purple
        icon: '💜'
      };
    } else {
      return {
        name: 'Versatile Explorer',
        description: 'You enjoy mixing different styles and experimenting with fashion to create unique looks.',
        strengths: ['Adaptable style', 'Creative combinations', 'Open to experimentation'],
        improvements: ['Define signature pieces', 'Focus on cohesion'],
        colorPalette: ['#800080', '#00FFFF', '#FF00FF', '#FFA500'],
        icon: '🎨'
      };
    }
  };

  useEffect(() => {
    if (wardrobe.length > 0) {
      analyzeWardrobe();
    }
  }, [wardrobe]);

  const getPopularityColor = (popularity) => {
    if (popularity >= 90) return 'text-green-400';
    if (popularity >= 80) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getPopularityBar = (popularity) => {
    return (
      <div className="w-full bg-gray-700 rounded-full h-2">
        <motion.div 
          className={`h-2 rounded-full ${
            popularity >= 90 ? 'bg-green-500' : 
            popularity >= 80 ? 'bg-yellow-500' : 'bg-orange-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${popularity}%` }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
    );
  };

  const getColorHex = (colorName) => {
    const colorMap = {
      'black': '#000000',
      'white': '#FFFFFF',
      'blue': '#0000FF',
      'purple': '#800080',
      'red': '#FF0000',
      'green': '#008000',
      'yellow': '#FFFF00',
      'orange': '#FFA500',
      'pink': '#FFC0CB',
      'grey': '#808080',
      'gray': '#808080',
      'brown': '#A52A2A',
      'navy': '#000080',
      'teal': '#008080',
      'maroon': '#800000',
      'olive': '#808000',
      'silver': '#C0C0C0',
      'gold': '#FFD700',
      'skyblue': '#87CEEB',
      'light blue': '#ADD8E6',
      'dark blue': '#00008B',
      'violet': '#EE82EE',
      'indigo': '#4B0082',
      'magenta': '#FF00FF',
      'cyan': '#00FFFF',
      // Add more common color names and their hex values
    };

    const lowerCaseColorName = colorName.toLowerCase();

    // If it's a hex code already, return it directly
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorName)) {
      return colorName;
    }

    // Check if it's a direct match in our map
    if (colorMap[lowerCaseColorName]) {
      return colorMap[lowerCaseColorName];
    }
    
    // If not found in map and not a hex, try to return the color name itself.
    // This relies on the browser's ability to interpret CSS color keywords.
    // This is what the "Top Colors" section implicitly does for non-black/white colors.
    // This is less safe if the colorName is not a valid CSS color keyword.
    // However, to match the user's expectation and the behavior of "Top Colors",
    // this seems to be the necessary step.
    return colorName; 
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-white mb-4">Style Analyzer</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Analysis of your wardrobe and personal style based on {wardrobe.length} items
        </p>
      </motion.div>

      {isAnalyzing ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"
          />
          <h3 className="text-2xl font-bold text-white mb-2">Analyzing Your Style...</h3>
          <p className="text-gray-400">Examining {wardrobe.length} items in your wardrobe</p>
        </motion.div>
      ) : analysis ? (
        <div className="space-y-8">
          {/* Personality Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-lg rounded-3xl p-8 border border-purple-500/30"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center space-x-4 mb-2">
                  <span className="text-4xl">{analysis.personality.icon}</span>
                  <h2 className="text-3xl font-bold text-white">{analysis.personality.name}</h2>
                </div>
                <p className="text-gray-300 text-lg">{analysis.personality.description}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={analyzeWardrobe}
                className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all"
              >
                Re-analyze
              </motion.button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Strengths & Improvements */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-bold text-xl mb-3">Your Style Strengths 💫</h3>
                  <div className="space-y-2">
                    {analysis.personality.strengths.map((strength, index) => (
                      <motion.div
                        key={strength}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-center space-x-3 bg-green-500/20 text-green-300 px-4 py-3 rounded-xl"
                      >
                        <span>✓</span>
                        <span>{strength}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-bold text-xl mb-3">Areas to Explore 🚀</h3>
                  <div className="space-y-2">
                    {analysis.personality.improvements.map((improvement, index) => (
                      <motion.div
                        key={improvement}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-center space-x-3 bg-blue-500/20 text-blue-300 px-4 py-3 rounded-xl"
                      >
                        <span>💡</span>
                        <span>{improvement}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Color Palette */}
              <div>
                <h3 className="text-white font-bold text-xl mb-4">Your Color Palette</h3>
                <div className="flex space-x-2 mb-6">
                  {analysis.stats.topColors.map(([colorName, count], index) => (
                    <motion.div
                      key={colorName}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="w-12 h-12 rounded-lg shadow-lg"
                      style={{ backgroundColor: getColorHex(colorName) }}
                    />
                  ))}
                </div>

                {/* Wardrobe Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white mb-1">{analysis.stats.totalItems}</div>
                    <div className="text-gray-400 text-sm">Total Items</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white mb-1">
                      {Object.keys(analysis.stats.categoryBreakdown).length}
                    </div>
                    <div className="text-gray-400 text-sm">Categories</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Detailed Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Top Colors */}
            <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-800">
              <h3 className="text-white font-bold text-xl mb-4">Top Colors</h3>
              <div className="space-y-3">
                {analysis.stats.topColors.map(([color, count], index) => (
                  <div key={color} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-600"
                        style={{ backgroundColor: color === 'black' ? '#000000' : color === 'white' ? '#FFFFFF' : color }}
                      />
                      <span className="text-white capitalize">{color}</span>
                    </div>
                    <span className="text-gray-400">{count} items</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Tags */}
            <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-800">
              <h3 className="text-white font-bold text-xl mb-4">Style Tags</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.stats.commonTags.map(([tag, count]) => (
                  <span
                    key={tag}
                    className="bg-purple-500/20 text-purple-300 px-3 py-2 rounded-lg text-sm capitalize"
                  >
                    {tag} ({count})
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-2xl text-white mb-2">No wardrobe data</h3>
          <p className="text-gray-400 mb-6">Add some items to your wardrobe to get style analysis!</p>
        </motion.div>
      )}
    </div>
  );
};

export default StyleAnalyzer;