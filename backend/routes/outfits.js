const express = require('express');
const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');
const Outfit = require('../models/Outfit');
const DailyOutfit = require('../models/DailyOutfit');
const Wardrobe = require('../models/Wardrobe');

const router = express.Router();

// [KEEP ALL YOUR EXISTING OUTFIT ROUTES EXACTLY AS THEY ARE - lines 1-400]
// Get all outfits for user
router.get('/', async (req, res) => {
  try {
    const { mood, occasion, season, page = 1, limit = 12 } = req.query;
    
    const filter = { user: req.user._id };
    if (mood) filter.mood = mood;
    if (occasion) filter.occasion = occasion;
    if (season) filter.season = season;

    const outfits = await Outfit.find(filter)
      .populate('items', 'name category color imageUrl occasion tags')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Outfit.countDocuments(filter);

    res.json({
      success: true,
      outfits,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching outfits'
    });
  }
});

// Get single outfit
router.get('/:id', async (req, res) => {
  try {
    const outfit = await Outfit.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('items');

    if (!outfit) {
      return res.status(404).json({
        success: false,
        error: 'Outfit not found'
      });
    }

    res.json({
      success: true,
      outfit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching outfit'
    });
  }
});

// Create new outfit
router.post('/', async (req, res) => {
  try {
    const { title, description, mood, occasion, items, weatherConditions, season, tags } = req.body;

    // Verify all items belong to the user
    if (items && items.length > 0) {
      const userItems = await Wardrobe.find({
        _id: { $in: items },
        user: req.user._id
      });
      
      if (userItems.length !== items.length) {
        return res.status(400).json({
          success: false,
          error: 'Some items do not belong to you'
        });
      }
    }

    const outfitData = {
      title,
      description,
      mood,
      occasion,
      items,
      weatherConditions,
      season,
      tags,
      user: req.user._id
    };

    const outfit = new Outfit(outfitData);
    await outfit.save();
    await outfit.populate('items');

    res.status(201).json({
      success: true,
      message: 'Outfit created successfully',
      outfit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error creating outfit'
    });
  }
});

// Update outfit
router.put('/:id', async (req, res) => {
  try {
    // Verify all items belong to the user if items are being updated
    if (req.body.items && req.body.items.length > 0) {
      const userItems = await Wardrobe.find({
        _id: { $in: req.body.items },
        user: req.user._id
      });
      
      if (userItems.length !== req.body.items.length) {
        return res.status(400).json({
          success: false,
          error: 'Some items do not belong to you'
        });
      }
    }

    const outfit = await Outfit.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('items');

    if (!outfit) {
      return res.status(404).json({
        success: false,
        error: 'Outfit not found'
      });
    }

    res.json({
      success: true,
      message: 'Outfit updated successfully',
      outfit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error updating outfit'
    });
  }
});

// Delete outfit
router.delete('/:id', async (req, res) => {
  try {
    const outfit = await Outfit.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!outfit) {
      return res.status(404).json({
        success: false,
        error: 'Outfit not found'
      });
    }

    res.json({
      success: true,
      message: 'Outfit deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error deleting outfit'
    });
  }
});

// Mark outfit as worn
router.patch('/:id/wear', async (req, res) => {
  try {
    const outfit = await Outfit.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!outfit) {
      return res.status(404).json({
        success: false,
        error: 'Outfit not found'
      });
    }

    outfit.wearCount += 1;
    outfit.lastWorn = new Date();
    await outfit.save();

    // Also update wear count for individual items
    await Wardrobe.updateMany(
      { _id: { $in: outfit.items }, user: req.user._id },
      { 
        $inc: { wearCount: 1 },
        $set: { lastWorn: new Date() }
      }
    );

    res.json({
      success: true,
      message: 'Outfit marked as worn',
      wearCount: outfit.wearCount,
      lastWorn: outfit.lastWorn
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error marking outfit as worn'
    });
  }
});

// Toggle favorite status
router.patch('/:id/favorite', async (req, res) => {
  try {
    const outfit = await Outfit.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!outfit) {
      return res.status(404).json({
        success: false,
        error: 'Outfit not found'
      });
    }

    outfit.isFavorite = !outfit.isFavorite;
    await outfit.save();

    res.json({
      success: true,
      message: `Outfit ${outfit.isFavorite ? 'added to' : 'removed from'} favorites`,
      isFavorite: outfit.isFavorite
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error updating favorite status'
    });
  }
});

// Rate outfit
router.patch('/:id/rate', async (req, res) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    const outfit = await Outfit.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { rating },
      { new: true }
    );

    if (!outfit) {
      return res.status(404).json({
        success: false,
        error: 'Outfit not found'
      });
    }

    res.json({
      success: true,
      message: 'Outfit rated successfully',
      rating: outfit.rating
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error rating outfit'
    });
  }
});

// Get outfit statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Outfit.aggregate([
      { $match: { user: req.user._id } },
      {
        $facet: {
          moodDistribution: [
            { $group: { _id: '$mood', count: { $sum: 1 } } }
          ],
          occasionDistribution: [
            { $group: { _id: '$occasion', count: { $sum: 1 } } }
          ],
          seasonDistribution: [
            { $group: { _id: '$season', count: { $sum: 1 } } }
          ],
          totalOutfits: [
            { $count: 'count' }
          ],
          favoriteOutfits: [
            { $match: { isFavorite: true } },
            { $count: 'count' }
          ],
          aiGeneratedOutfits: [
            { $match: { aiGenerated: true } },
            { $count: 'count' }
          ],
          mostWornOutfits: [
            { $sort: { wearCount: -1 } },
            { $limit: 5 },
            { $project: { title: 1, wearCount: 1, mood: 1 } }
          ],
          averageRating: [
            { $match: { rating: { $exists: true } } },
            { $group: { _id: null, average: { $avg: '$rating' } } }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching outfit statistics'
    });
  }
});

// Get outfits by weather conditions
router.get('/weather/:condition', async (req, res) => {
  try {
    const { condition } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const outfits = await Outfit.find({
      user: req.user._id,
      'weatherConditions.condition': new RegExp(condition, 'i')
    })
      .populate('items')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Outfit.countDocuments({
      user: req.user._id,
      'weatherConditions.condition': new RegExp(condition, 'i')
    });

    res.json({
      success: true,
      outfits,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching weather-based outfits'
    });
  }
});

// Enhanced weather-based outfit generator
function generateWeatherBasedOutfit(weather) {
  const temp = weather.temperature;
  const condition = weather.condition.toLowerCase();
  
  let baseOutfit = {
    title: "Weather-Adaptive Style",
    description: "Perfectly tailored for today's conditions",
    items: [],
    mood: "confident",
    occasion: "casual",
    colors: ["#000000", "#FFFFFF", "#808080"],
    weatherNotes: ""
  };

  // Temperature-based recommendations
  if (temp < 10) {
    baseOutfit = {
      title: "Cozy Winter Warrior",
      description: "Stay warm and stylish in the cold weather",
      items: [
        "Insulated Winter Coat",
        "Thermal Base Layer",
        "Warm Sweater",
        "Winter Trousers",
        "Insulated Boots",
        "Beanie and Gloves"
      ],
      mood: "chill",
      occasion: "casual",
      colors: ["#2F4F4F", "#8B4513", "#000000"],
      weatherNotes: "Layered for maximum warmth in cold conditions"
    };
  } else if (temp < 20) {
    baseOutfit = {
      title: "Comfortable Layers",
      description: "Perfect for mild weather with versatile layers",
      items: [
        "Light Jacket or Cardigan",
        "Long Sleeve Top",
        "Comfortable Jeans",
        "Sneakers",
        "Light Scarf"
      ],
      mood: "confident",
      occasion: "casual",
      colors: ["#808080", "#2F4F4F", "#FFFFFF"],
      weatherNotes: "Light layers for changing temperatures"
    };
  } else {
    baseOutfit = {
      title: "Summer Breeze",
      description: "Light and breathable for warm days",
      items: [
        "Breathable T-Shirt",
        "Shorts or Light Pants",
        "Sandals or Light Shoes",
        "Sunglasses",
        "Sun Hat"
      ],
      mood: "chill",
      occasion: "casual",
      colors: ["#FFFFFF", "#87CEEB", "#FFD700"],
      weatherNotes: "Designed for comfort in warm weather"
    };
  }

  // Weather condition adjustments
  if (condition.includes('rain')) {
    baseOutfit.items.push("Waterproof Jacket", "Umbrella");
    baseOutfit.weatherNotes += " - Rain ready with waterproof elements";
  }

  if (condition.includes('sun') || condition.includes('clear')) {
    baseOutfit.items.push("Sunglasses", "Sun Protection");
    baseOutfit.weatherNotes += " - Sun protection included";
  }

  if (condition.includes('wind')) {
    baseOutfit.items.push("Wind-Resistant Layer");
    baseOutfit.weatherNotes += " - Wind-resistant elements";
  }

  return baseOutfit;
}

// Smart OOTD Generation with PERSISTENT 24-hour caching
router.get('/smart/ootd', async (req, res) => {
  try {
    const userId = req.user._id;
    const clientIP = req.clientIp;
    
    // FIXED: Check for ANY existing OOTD, not just today's
    // This ensures counter persists across sessions
    const existingOOTD = await DailyOutfit.findOne({ 
      user: userId
    }).sort({ generatedAt: -1 }); // Get the most recent one

    // If we have a valid OOTD that hasn't expired, return it
    if (existingOOTD && existingOOTD.expiresAt > new Date()) {
      const timeUntilRefresh = existingOOTD.expiresAt - new Date();
      const hoursLeft = Math.floor(timeUntilRefresh / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeUntilRefresh % (1000 * 60 * 60)) / (1000 * 60));
      
      console.log('🔄 Returning cached OOTD with counter:', { hoursLeft, minutesLeft });
      
      return res.json({
        success: true,
        outfit: existingOOTD.outfit,
        weather: existingOOTD.weatherData,
        isCached: true,
        timeUntilRefresh: {
          hours: hoursLeft,
          minutes: minutesLeft,
          totalMs: timeUntilRefresh
        },
        generatedAt: existingOOTD.generatedAt
      });
    }

    // If no valid OOTD or expired, generate a new one
    console.log('🔄 Generating new OOTD for user:', userId, 'IP:', clientIP);
    
    // Clean up expired OOTDs
    await DailyOutfit.deleteMany({ 
      user: userId,
      expiresAt: { $lt: new Date() }
    });

    // Use our new weather service for IP-based location and weather
    const weatherService = require('../services/weatherService');
    const location = await weatherService.getLocationFromIP(clientIP);
    const currentWeather = await weatherService.getWeatherData(location);
    
    console.log('📍 Location:', location.city, location.country);
    console.log('🌤️ Weather:', currentWeather.temperature + '°C', currentWeather.condition);

    // Generate AI outfit based on weather
    let aiOutfit;
    
    if (process.env.GEMINI_API_KEY) {
      try {
        // Enhanced prompt with weather context
        const weatherPrompt = `Create a fashionable outfit recommendation for today's weather:
        - Temperature: ${currentWeather.temperature}°C
        - Condition: ${currentWeather.condition} (${currentWeather.description})
        - Location: ${currentWeather.location}
        
        Return ONLY valid JSON in this exact format:
        {
          "title": "Creative outfit name",
          "description": "Brief description explaining why this outfit works for today's weather",
          "items": ["item1", "item2", "item3", "item4", "item5"],
          "mood": "confident/chill/soft/power/edgy",
          "occasion": "casual/formal/work/party",
          "colors": ["#hex1", "#hex2", "#hex3"],
          "weatherNotes": "How this outfit addresses today's weather conditions"
        }
        
        Make it practical and stylish for the current conditions.`;

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: weatherPrompt,
          config: { temperature: 0.8, maxOutputTokens: 800 }
        });

        let aiResponse = '';
        if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
          aiResponse = response.candidates[0].content.parts[0].text;
        } else if (response.text) {
          aiResponse = response.text;
        }

        const cleanedResponse = aiResponse.replace(/```json|```/g, '').trim();
        aiOutfit = JSON.parse(cleanedResponse);
        
        console.log('🤖 AI generated outfit for:', currentWeather.location);
      } catch (aiError) {
        console.log('AI generation failed, using fallback:', aiError.message);
        aiOutfit = generateWeatherBasedOutfit(currentWeather);
      }
    } else {
      aiOutfit = generateWeatherBasedOutfit(currentWeather);
    }

    // Save to daily outfit cache with 24-hour expiration
    const dailyOutfit = new DailyOutfit({
      user: userId,
      outfit: {
        ...aiOutfit,
        weatherBased: true,
        temperature: currentWeather.temperature,
        weatherCondition: currentWeather.condition,
        location: currentWeather.location
      },
      weatherData: currentWeather,
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    });

    await dailyOutfit.save();

    console.log('💾 Saved new OOTD with expiration:', dailyOutfit.expiresAt);

    res.json({
      success: true,
      outfit: dailyOutfit.outfit,
      weather: dailyOutfit.weatherData,
      location: {
        city: location.city,
        country: location.country,
        detectedByIP: !location.isMock
      },
      isCached: false,
      timeUntilRefresh: {
        hours: 24,
        minutes: 0,
        totalMs: 24 * 60 * 60 * 1000
      },
      generatedAt: dailyOutfit.generatedAt
    });

  } catch (error) {
    console.error('Smart OOTD Error:', error);
    
    // Final fallback with IP-based location
    const weatherService = require('../services/weatherService');
    const location = await weatherService.getLocationFromIP(req.clientIp);
    const fallbackOutfit = generateWeatherBasedOutfit({
      temperature: location.countryCode === 'EG' ? 28 : 20,
      condition: 'Clear',
      location: `${location.city}, ${location.country}`
    });

    res.json({
      success: true,
      outfit: fallbackOutfit,
      weather: {
        temperature: location.countryCode === 'EG' ? 28 : 20,
        condition: 'Clear',
        location: `${location.city}, ${location.country}`,
        isMock: true
      },
      isCached: false,
      isFallback: true
    });
  }
});

// Original OOTD generation (keep for backward compatibility)
router.get('/generate/ootd', async (req, res) => {
  try {
    const { mood, occasion, weather } = req.query;
    
    // Get user's wardrobe
    const userWardrobe = await Wardrobe.find({ user: req.user._id });
    
    if (userWardrobe.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please add some items to your wardrobe first'
      });
    }

    // Simple algorithm to generate OOTD
    const generateOOTD = () => {
      const outfitItems = [];
      const categories = ['top', 'bottom', 'shoes'];
      
      categories.forEach(category => {
        const categoryItems = userWardrobe.filter(item => item.category === category);
        if (categoryItems.length > 0) {
          const randomItem = categoryItems[Math.floor(Math.random() * categoryItems.length)];
          outfitItems.push(randomItem._id);
        }
      });

      // Add outerwear if weather suggests
      if (weather && (weather.includes('cold') || weather.includes('rain'))) {
        const outerwear = userWardrobe.filter(item => item.category === 'outerwear');
        if (outerwear.length > 0) {
          const randomOuterwear = outerwear[Math.floor(Math.random() * outerwear.length)];
          outfitItems.push(randomOuterwear._id);
        }
      }

      return outfitItems;
    };

    const outfitItemIds = generateOOTD();
    const outfitItems = await Wardrobe.find({ _id: { $in: outfitItemIds } });

    const ootd = new Outfit({
      title: `Outfit of the Day - ${new Date().toLocaleDateString()}`,
      description: `AI-generated outfit for ${mood || 'your'} mood and ${occasion || 'daily'} activities`,
      mood: mood || 'confident',
      occasion: occasion || 'casual',
      items: outfitItemIds,
      weatherConditions: {
        condition: weather || 'moderate',
        current: 20 // Default temperature
      },
      season: getCurrentSeason(),
      aiGenerated: true,
      user: req.user._id
    });

    await ootd.save();
    await ootd.populate('items');

    res.json({
      success: true,
      message: 'Outfit of the day generated successfully',
      outfit: ootd
    });

  } catch (error) {
    console.error('OOTD Generation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error generating outfit of the day'
    });
  }
});

// Helper function to get current season
function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}

module.exports = router;