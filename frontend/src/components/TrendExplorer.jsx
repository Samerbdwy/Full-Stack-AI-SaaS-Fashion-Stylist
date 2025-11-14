// components/TrendExplorer.jsx - REWRITTEN VERSION
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, Protect } from '@clerk/clerk-react';

const TrendExplorer = ({ onSaveLook, onNavigateToChat, setCurrentView, wardrobe }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [trends, setTrends] = useState([]);
  const { has, isLoaded } = useAuth();

  const trendCategories = [
    { id: 'all', label: 'All Trends', icon: '🔥' },
    { id: 'streetwear', label: 'Streetwear', icon: '🛹' },
    { id: 'minimalist', label: 'Minimalist', icon: '⚪' },
    { id: 'vintage', label: 'Vintage', icon: '📺' },
    { id: 'y2k', label: 'Y2K Revival', icon: '📼' },
    { id: 'cottagecore', label: 'Cottagecore', icon: '🌸' }
  ];

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    setIsLoading(true);
    try {
      // Mock trends data - in production this would come from your backend
      const mockTrends = [
        {
          id: 1,
          title: 'Oversized Blazers',
          category: 'streetwear',
          description: 'Structured blazers in exaggerated proportions for powerful urban style.',
          popularity: 95,
          season: 'Spring 2024',
          items: ['Oversized Black Blazer', 'Graphic Tank Top', 'Cargo Pants', 'Chunky Boots'],
          colors: ['#000000', '#2F4F4F', '#FFFFFF'],
          inspiration: 'Seen on runways and street style stars globally',
          icon: '🧥',
          aiGenerated: false
        },
        {
          id: 2,
          title: 'Pastel Leather',
          category: 'minimalist',
          description: 'Soft leather pieces in unexpected pastel shades for modern elegance.',
          popularity: 88,
          season: 'Spring 2024',
          items: ['Pastel Pink Leather Jacket', 'White Linen Dress', 'Strappy Sandals'],
          colors: ['#FFB6C1', '#FFFFFF', '#E6E6FA'],
          inspiration: 'Minimalist luxury brands embracing color',
          icon: '👜',
          aiGenerated: false
        },
        {
          id: 3,
          title: '90s Grunge Revival',
          category: 'vintage',
          description: 'Distressed denim and layered accessories with modern updates.',
          popularity: 92,
          season: 'Spring 2024',
          items: ['Distressed Denim Jacket', 'Vintage Band Tee', 'Combat Boots'],
          colors: ['#000000', '#36454F', '#8B0000'],
          inspiration: 'Nostalgic 90s fashion with contemporary fits',
          icon: '🎸',
          aiGenerated: false
        },
        {
          id: 4,
          title: 'Techwear Fusion',
          category: 'streetwear',
          description: 'Technical fabrics meet urban aesthetics with functional designs.',
          popularity: 85,
          season: 'Spring 2024',
          items: ['Waterproof Cargo Pants', 'Modular Vest', 'Tech Sneakers'],
          colors: ['#2F4F4F', '#696969', '#006400'],
          inspiration: 'Cyberpunk influences in everyday wear',
          icon: '🤖',
          aiGenerated: false
        },
        {
          id: 5,
          title: 'Sheer Layering',
          category: 'minimalist',
          description: 'Delicate sheer pieces layered for depth and elegant texture.',
          popularity: 78,
          season: 'Spring 2024',
          items: ['Sheer Black Top', 'Silk Slip Dress', 'Tailored Trousers'],
          colors: ['#000000', '#FFFFFF', '#F5F5F5'],
          inspiration: 'Red carpet fashion embracing transparency',
          icon: '👚',
          aiGenerated: false
        },
        {
          id: 6,
          title: 'Color Blocking',
          category: 'y2k',
          description: 'Bold color combinations with retro-futuristic energy.',
          popularity: 82,
          season: 'Spring 2024',
          items: ['Electric Blue Blazer', 'Hot Pink Trousers', 'Yellow Heels'],
          colors: ['#0000FF', '#FF69B4', '#FFFF00'],
          inspiration: 'Early 2000s fashion with modern color theory',
          icon: '🎨',
          aiGenerated: false
        }
      ];

      setTrends(mockTrends);
    } catch (error) {
      console.error('Error loading trends:', error);
      setTrends([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTrends = activeCategory === 'all'
    ? trends
    : trends.filter(trend => trend.category === activeCategory);

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

  const getCategoryFromItem = (item) => {
    const itemLower = item.toLowerCase();
    if (itemLower.includes('jacket') || itemLower.includes('coat') || itemLower.includes('blazer')) return 'outerwear';
    if (itemLower.includes('shirt') || itemLower.includes('top') || itemLower.includes('tee') || itemLower.includes('sweater')) return 'top';
    if (itemLower.includes('pants') || itemLower.includes('jeans') || itemLower.includes('trousers') || itemLower.includes('leggings')) return 'bottom';
    if (itemLower.includes('shoes') || itemLower.includes('sneakers') || itemLower.includes('boots') || itemLower.includes('heels')) return 'shoes';
    if (itemLower.includes('dress')) return 'dress';
    return 'accessory';
  };

  const getColorFromItem = (item, defaultColor) => {
    const itemLower = item.toLowerCase();
    if (itemLower.includes('black')) return 'black';
    if (itemLower.includes('white')) return 'white';
    if (itemLower.includes('blue')) return 'blue';
    if (itemLower.includes('red')) return 'red';
    if (itemLower.includes('green')) return 'green';
    if (itemLower.includes('pink')) return 'pink';
    if (itemLower.includes('gray') || itemLower.includes('grey')) return 'gray';
    return defaultColor || 'multi';
  };

  const handleSaveLook = async (trend) => {
    try {
      const itemsToSave = [];

      trend.items.forEach((itemName) => {
        const category = getCategoryFromItem(itemName);
        const matchedWardrobeItem = Array.isArray(wardrobe) ? wardrobe.find(wItem => 
          wItem.name.toLowerCase() === itemName.toLowerCase() && 
          wItem.category.toLowerCase() === category.toLowerCase()
        ) : null;

        if (matchedWardrobeItem) {
          itemsToSave.push(matchedWardrobeItem._id);
        } else {
          // For suggested items, create an object that the backend can process
          itemsToSave.push({
            name: itemName,
            category: category,
            color: getColorFromItem(itemName, 'multi'), // Attempt to derive color
            // Add other relevant fields if available from the trend data
          });
        }
      });

      const lookData = {
        title: trend.title,
        description: `Trend-inspired: ${trend.description}`,
        mood: 'confident',
        occasion: 'casual',
        items: itemsToSave, // Now contains both IDs and objects
        tags: ['trend', trend.category, 'manual'],
        weatherConditions: {
          temperature: 20,
          condition: 'moderate'
        },
        generatedByAI: false,
        aiPrompt: `Trend: ${trend.title}`
      };

      console.log('TrendExplorer: lookData before onSaveLook:', lookData); // Added console.log
      await onSaveLook(lookData);
      alert('✅ Trend saved to your StyleBoard!');
    } catch (error) {
      console.error('Error saving trend:', error);
      alert('❌ Failed to save trend. Please try again.');
    }
  };

  const handleAskAIStylist = (trend) => {
    const trendContext = `I'm interested in the trend: "${trend.title}". ${trend.description}. Can you help me style this or suggest similar looks?`;

    if (onNavigateToChat) {
      onNavigateToChat(trendContext);
    }
  };

  const PremiumFallback = () => (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-lg rounded-3xl p-12 border border-purple-500/30"
      >
        <div className="text-8xl mb-6">🔒</div>
        <h2 className="text-4xl font-bold text-white mb-4">Premium Feature</h2>
        <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
          Unlock Trend Explorer to access the latest fashion trends, curated style insights, and AI-powered trend analysis.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all mb-4"
          onClick={() => setCurrentView('pricing')}
        >
          Upgrade to Unlock
        </motion.button>

        <p className="text-gray-400 text-sm">
          Cancel anytime.
        </p>
      </motion.div>
    </div>
  );

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"
          />
          <h3 className="text-2xl font-bold text-white mb-2">Loading...</h3>
        </div>
      </div>
    );
  }

  return (
    <Protect
      plan="trend_explorer"
      fallback={<PremiumFallback />}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">✨</span>
            <h1 className="text-4xl font-bold text-white">Trend Explorer</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover the latest fashion trends and stay ahead of the style curve
          </p>

      
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {trendCategories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"
            />
            <h3 className="text-2xl font-bold text-white mb-2">Loading Trends...</h3>
            <p className="text-gray-400">Curating the latest fashion trends</p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredTrends.map((trend, index) => (
                <motion.div
                  key={trend.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-gray-900/80 backdrop-blur-lg rounded-2xl overflow-hidden border border-gray-800 cursor-pointer group flex flex-col h-full"
                  onClick={() => setSelectedTrend(trend)}
                >
                  <div className="p-6 border-b border-gray-800 flex-grow-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{trend.icon}</span>
                        <div>
                          <h3 className="text-white font-bold text-lg">{trend.title}</h3>
                          <span className="text-purple-400 text-sm capitalize">{trend.category}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getPopularityColor(trend.popularity)}`}>
                          {trend.popularity}%
                        </div>
                        <div className="text-gray-400 text-xs">Trending</div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 h-16 overflow-hidden">
                      {trend.description}
                    </p>
                  </div>

                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-400 mb-1">
                          <span>Trend Score</span>
                          <span>{trend.popularity}%</span>
                        </div>
                        {getPopularityBar(trend.popularity)}
                      </div>

                      <div>
                        <h4 className="text-white text-sm font-medium mb-2">Color Palette</h4>
                        <div className="flex space-x-1">
                          {trend.colors.map((color, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3 + idx * 0.1 }}
                              className="w-6 h-6 rounded-full border border-gray-600 shadow-lg"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Season:</span>
                          <span className="text-white">{trend.season}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-400">Key Items: </span>
                          <span className="text-white">{trend.items.slice(0, 2).join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrend(trend);
                      }}
                      className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                      Get This Look
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <AnimatePresence>
          {selectedTrend && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedTrend(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-gray-900 border border-gray-800 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <span className="text-4xl">{selectedTrend.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedTrend.title}</h2>
                      <p className="text-purple-400 capitalize">{selectedTrend.category} • {selectedTrend.season}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTrend(null)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-white font-bold mb-2">Trend Overview</h3>
                      <p className="text-gray-300 leading-relaxed">{selectedTrend.description}</p>
                    </div>

                    <div>
                      <h3 className="text-white font-bold mb-3">Popularity</h3>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${getPopularityColor(selectedTrend.popularity)}`}>
                            {selectedTrend.popularity}%
                          </div>
                          <div className="flex-1">
                            {getPopularityBar(selectedTrend.popularity)}
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                              <span>Low</span>
                              <span>High</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-white font-bold mb-2">Inspiration</h3>
                          <p className="text-gray-300 italic">"{selectedTrend.inspiration}"</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h3 className="text-white font-bold mb-3">Complete Look</h3>
                          <div className="space-y-2">
                            {selectedTrend.items.map((item, idx) => (
                              <div key={idx} className="flex items-center space-x-3 bg-gray-800/50 rounded-xl p-3">
                                <span className="text-purple-400">•</span>
                                <span className="text-white">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-white font-bold mb-2">Color Palette</h3>
                          <div className="flex space-x-2">
                            {selectedTrend.colors.map((color, idx) => (
                              <motion.div
                                key={idx}
                                whileHover={{ scale: 1.2 }}
                                className="w-8 h-8 rounded-full border border-gray-600 shadow-lg"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex space-x-3 pt-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSaveLook(selectedTrend)}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold shadow-lg"
                          >
                            Save to Board
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAskAIStylist(selectedTrend)}
                            className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-gray-700 transition-all"
                          >
                            Ask AI Stylist
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Protect>
  );
}

export default TrendExplorer;