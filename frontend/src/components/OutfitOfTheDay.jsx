// components/OutfitOfTheDay.jsx - FIXED VERSION WITH PERSISTENT COUNTER
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';

const OutfitOfTheDay = ({ onGenerateOutfit, onGetWeather, api, onSaveLook, savedLooks, wardrobe }) => {
  const { user } = useUser();
  const userId = user?.id;

  const [outfit, setOutfit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(null);
  const [isCached, setIsCached] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load OOTD data - FIXED: Use sessionStorage to preserve state
  useEffect(() => {
    if (userId) { // Only load OOTD if userId is available
      loadOOTD();
    }
  }, [userId]); // Re-run when userId changes

  const loadOOTD = async () => {
    if (!userId) return; // Ensure userId is available before proceeding
    setIsLoading(true);
    try {
      // Check if we have cached OOTD data in sessionStorage
      const cachedOOTD = sessionStorage.getItem(`cachedOOTD_${userId}`);
      const cachedTime = sessionStorage.getItem(`ootdGeneratedAt_${userId}`);
      
      if (cachedOOTD && cachedTime) {
        const generatedAt = new Date(cachedTime);
        const now = new Date();
        const timeDiff = now - generatedAt;
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        // If cached OOTD is less than 24 hours old, use it
        if (hoursDiff < 24) {
          const ootdData = JSON.parse(cachedOOTD);
          setOutfit(ootdData.outfit);
          setWeather(ootdData.weather);
          setIsCached(true);
          
          // Calculate remaining time
          const remainingMs = 24 * 60 * 60 * 1000 - timeDiff;
          const hoursLeft = Math.floor(remainingMs / (1000 * 60 * 60));
          const minutesLeft = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
          
          setTimeUntilRefresh({
            hours: hoursLeft,
            minutes: minutesLeft,
            totalMs: remainingMs
          });
          
          startCountdown(remainingMs);
          setIsLoading(false);
          console.log('🔄 Using cached OOTD with counter for user:', userId, { hoursLeft, minutesLeft });
          return;
        } else {
          // Clear expired cache
          sessionStorage.removeItem(`cachedOOTD_${userId}`);
          sessionStorage.removeItem(`ootdGeneratedAt_${userId}`);
        }
      }

      // If no valid cache, fetch new OOTD
      const response = await onGenerateOutfit();
      
      if (response.success) {
        setOutfit(response.outfit);
        setWeather(response.weather);
        setIsCached(response.isCached);
        
        // Cache the OOTD data
        const ootdData = {
          outfit: response.outfit,
          weather: response.weather,
          isCached: response.isCached
        };
        sessionStorage.setItem(`cachedOOTD_${userId}`, JSON.stringify(ootdData));
        sessionStorage.setItem(`ootdGeneratedAt_${userId}`, new Date().toISOString());
        
        const refreshTime = response.timeUntilRefresh || { hours: 24, minutes: 0, totalMs: 24 * 60 * 60 * 1000 };
        setTimeUntilRefresh(refreshTime);
        startCountdown(refreshTime.totalMs);
        
        console.log('🔄 Generated new OOTD and cached it for user:', userId);
      }
    } catch (error) {
      console.error('OOTD loading error:', error);
      await loadFallbackOOTD();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFallbackOOTD = async () => {
    if (!userId) return; // Ensure userId is available before proceeding
    try {
      const weatherResponse = await onGetWeather();
      const outfitResponse = await api.generateOutfit('confident', 'daily', weatherResponse.weather.condition);
      
      setOutfit(outfitResponse.outfit);
      setWeather(weatherResponse.weather);
      
      // Cache fallback OOTD
      const ootdData = {
        outfit: outfitResponse.outfit,
        weather: weatherResponse.weather,
        isCached: false
      };
      sessionStorage.setItem(`cachedOOTD_${userId}`, JSON.stringify(ootdData));
      sessionStorage.setItem(`ootdGeneratedAt_${userId}`, new Date().toISOString());
      
      setTimeUntilRefresh({ hours: 24, minutes: 0, totalMs: 24 * 60 * 60 * 1000 });
      startCountdown(24 * 60 * 60 * 1000);
    } catch (error) {
      console.error('Fallback OOTD error:', error);
    }
  };

  const startCountdown = (totalMs) => {
    const updateCountdown = () => {
      setTimeUntilRefresh(prev => {
        if (!prev) return { hours: 24, minutes: 0, totalMs: 24 * 60 * 60 * 1000 };
        
        const newTotalMs = prev.totalMs - 1000;
        if (newTotalMs <= 0) {
          clearInterval(interval);
          // Clear cache when countdown ends
          if (userId) {
            sessionStorage.removeItem(`cachedOOTD_${userId}`);
            sessionStorage.removeItem(`ootdGeneratedAt_${userId}`);
          }
          return { hours: 0, minutes: 0, totalMs: 0 };
        }
        
        return {
          hours: Math.floor(newTotalMs / (1000 * 60 * 60)),
          minutes: Math.floor((newTotalMs % (1000 * 60 * 60)) / (1000 * 60)),
          totalMs: newTotalMs
        };
      });
    };

    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  };

const forceRefresh = async () => {
  if (timeUntilRefresh && timeUntilRefresh.totalMs > 0) {
    const hours = timeUntilRefresh.hours;
    const minutes = timeUntilRefresh.minutes;
    
    let message = "🔄 Your next AI-generated outfit is coming soon!\n\n";
    
    if (hours > 0) {
      message += `⏰ Available in: ${hours}h ${minutes}m\n\n`;
    } else {
      message += `⏰ Available in: ${minutes} minutes\n\n`;
    }
    
    message += "💡 Why the wait?\n";
    message += "• Ensures fresh, weather-appropriate outfits\n";
    message += "• Gives AI time to analyze latest trends\n";
    message += "• Prevents outfit repetition\n\n";
    message += "Check back soon for your new look! 🌟";
    
    alert(message);
  } else {
    // Counter is done, actually refresh
    alert('🎉 Time for a new look! Generating your fresh outfit now...');
    if (userId) {
      sessionStorage.removeItem(`cachedOOTD_${userId}`);
      sessionStorage.removeItem(`ootdGeneratedAt_${userId}`);
    }
    await loadOOTD();
  }
};

  // Save to StyleBoard functionality
  const saveToStyleBoard = async () => {
    if (!outfit || !onSaveLook) return;
    
    setIsSaving(true);
    try {
      const occasionMap = {
        'daily': 'casual',
        'everyday': 'casual', 
        'business': 'work',
        'professional': 'work',
        'evening': 'party'
      };
      
      const validOccasion = occasionMap[outfit.occasion?.toLowerCase()] || 'casual';

      const itemsToSave = [];

      if (outfit.items && outfit.items.length > 0) {
        outfit.items.forEach((itemString) => {
          const category = getCategoryFromItem(itemString);
          const matchedWardrobeItem = Array.isArray(wardrobe) ? wardrobe.find(wItem => 
            wItem.name.toLowerCase() === itemString.toLowerCase() && 
            wItem.category.toLowerCase() === category.toLowerCase()
          ) : null;

          if (matchedWardrobeItem) {
            itemsToSave.push(matchedWardrobeItem._id);
          } else {
            // For suggested items, create an object that the backend can process
            itemsToSave.push({
              name: itemString,
              category: category,
              color: getColorFromItem(itemString, 'multi'), // Attempt to derive color
              // Add other relevant fields if available from the AI outfit
            });
          }
        });
      }

      const lookData = {
        title: outfit.title || `OOTD - ${new Date().toLocaleDateString()}`,
        description: `${outfit.description || 'AI-generated daily outfit'} - Created for ${weather?.location || 'your location'}`,
        mood: outfit.mood || 'confident',
        occasion: validOccasion,
        items: itemsToSave, // Now contains both IDs and objects
        tags: ['ootd', 'ai-generated', 'weather-based', outfit.mood, validOccasion].filter(Boolean),
        weatherConditions: {
          temperature: weather?.temperature,
          condition: weather?.condition,
          minTemp: weather?.minTemp,
          maxTemp: weather?.maxTemp
        },
        generatedByAI: true,
        aiPrompt: `OOTD for ${weather?.location}: ${weather?.temperature}°C, ${weather?.condition}`
      };

      console.log('💾 Saving OOTD to StyleBoard:', lookData);
      await onSaveLook(lookData);
      setSaveSuccess(true);
      
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error saving to StyleBoard:', error);
      alert('Failed to save outfit to StyleBoard. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper functions to categorize outfit items
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

  // Format countdown display
  const formatCountdown = () => {
    if (!timeUntilRefresh) return '24h 0m';
    return `${timeUntilRefresh.hours}h ${timeUntilRefresh.minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"
          />
          <h3 className="text-2xl font-bold text-white mb-2">
            Crafting Your Daily Look...
          </h3>
          <p className="text-gray-400">
            Analyzing weather and generating the perfect outfit for today!
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with Countdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <span className="text-4xl">👑</span>
          <h1 className="text-4xl font-bold text-white">Outfit of the Day</h1>
        </div>
        <p className="text-xl text-gray-300">
          Your AI-curated look for today
        </p>
        
        {/* Countdown Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center space-x-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full mt-4"
        >
          <span>🕐</span>
          <span className="text-sm font-medium">
            New outfit in: {formatCountdown()}
          </span>
          {isCached && (
            <span className="text-xs bg-green-500/30 text-green-300 px-2 py-1 rounded-full">
              Cached
            </span>
          )}
        </motion.div>
      </motion.div>

      {/* Rest of your component remains the same... */}
      {/* Weather Card */}
      {weather && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-gray-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-lg">Today's Weather</h3>
              <p className="text-gray-400">{weather.location}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{weather.temperature}°C</div>
              <div className="text-gray-400 capitalize">{weather.condition}</div>
            </div>
          </div>
          {weather.isMock && (
            <div className="mt-2 text-yellow-400 text-sm">
              ⚠️ Using demo weather data
            </div>
          )}
        </motion.div>
      )}

      {/* Main Outfit Card */}
      {outfit && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-lg rounded-3xl p-8 border border-purple-500/30 mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Outfit Preview */}
            <div className="flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
                className="w-48 h-48 bg-gray-800/50 rounded-2xl flex items-center justify-center mb-6 border border-gray-700"
              >
                <span className="text-8xl">
                  {outfit.mood === 'confident' && '😎'}
                  {outfit.mood === 'chill' && '🥶'}
                  {outfit.mood === 'soft' && '😇'}
                  {outfit.mood === 'power' && '💪'}
                  {outfit.mood === 'edgy' && '🖤'}
                </span>
              </motion.div>
              
              {/* Color Palette */}
              <div className="text-center mb-6">
                <h3 className="text-white font-bold mb-3">Color Palette</h3>
                <div className="flex justify-center space-x-2">
                  {outfit.colors && outfit.colors.map((color, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="w-8 h-8 rounded-full border border-gray-600 shadow-lg"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Weather Impact */}
              <div className="text-center">
                <div className="text-gray-400 text-sm">Weather Impact</div>
                <div className="text-white font-semibold">
                  {weather && (
                    <>
                      {weather.temperature}°C • {weather.condition}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Outfit Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{outfit.title}</h2>
                <p className="text-gray-300 text-lg mb-4">{outfit.description}</p>
                
                {/* Weather Notes */}
                {outfit.weatherNotes && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="bg-black/30 rounded-2xl p-4 border border-gray-700 mb-4"
                  >
                    <p className="text-gray-300 text-sm">
                      <span className="text-blue-400">🌤️ Weather Note:</span> {outfit.weatherNotes}
                    </p>
                  </motion.div>
                )}

                {/* Mood & Occasion Badges */}
                <div className="flex space-x-3 mb-6">
                  <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm capitalize">
                    {outfit.mood} mood
                  </span>
                  <span className="bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full text-sm capitalize">
                    {outfit.occasion}
                  </span>
                  {weather && (
                    <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                      {weather.temperature}°C
                    </span>
                  )}
                </div>
              </div>

              {/* Outfit Items */}
              <div>
                <h3 className="text-white font-bold text-xl mb-3">Your Outfit Pieces</h3>
                <div className="space-y-2">
                  {outfit.items && outfit.items.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-center space-x-3 bg-gray-800/50 rounded-xl p-3"
                    >
                      <span className="text-purple-400">•</span>
                      <span className="text-white">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success Message */}
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/20 border border-green-500/50 text-green-300 px-6 py-4 rounded-2xl mb-6 text-center"
        >
          ✅ Outfit saved to StyleBoard! Check your saved looks.
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row justify-center gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={forceRefresh}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl flex items-center justify-center space-x-2"
        >
          <span>🔄</span>
          <span>Request New Look</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={saveToStyleBoard}
          disabled={isSaving || !outfit}
          className="bg-gray-800 text-white px-8 py-4 rounded-2xl font-bold border border-gray-700 hover:bg-gray-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>📌</span>
              <span>Save to StyleBoard</span>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* StyleBoard Counter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center mt-6"
      >
        <p className="text-gray-400 text-sm">
          You have <span className="text-purple-400 font-bold">{savedLooks?.length || 0}</span> saved looks in your StyleBoard
        </p>
      </motion.div>
    </div>
  );
};

export default OutfitOfTheDay;