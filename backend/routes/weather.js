const express = require('express');
const weatherService = require('../services/weatherService');
const { clerkAuth, devAuth } = require('../middleware/clerkAuth');

const router = express.Router();

// Use appropriate auth based on environment
const auth = process.env.NODE_ENV === 'production' ? clerkAuth : devAuth;

// Apply auth to all routes
router.use(auth);

// Get weather for user's current location (IP-based) - UPDATED
router.get('/current', auth, async (req, res) => {
  try {
    const clientIP = req.clientIp;
    console.log('📍 Getting weather for IP:', clientIP);

    // Get location from IP
    const location = await weatherService.getLocationFromIP(clientIP);
    
    // Get weather data for the location
    const weather = await weatherService.getWeatherData(location);

    res.json({
      success: true,
      weather,
      location: {
        city: location.city,
        country: location.country,
        detectedByIP: !location.isMock
      },
      message: location.isMock ? 
        'Using default location (Cairo) - Real IP detection available in production' : 
        `Weather for ${location.city}, ${location.country}`
    });

  } catch (error) {
    console.error('Weather Error:', error);
    
    // Final fallback
    const fallbackWeather = {
      location: 'Cairo, Egypt',
      temperature: 28,
      condition: 'Clear',
      description: 'sunny',
      humidity: 40,
      windSpeed: 2.5,
      icon: '01d',
      feelsLike: 29,
      minTemp: 25,
      maxTemp: 32,
      isMock: true
    };

    res.json({
      success: true,
      weather: fallbackWeather,
      error: 'Weather service temporarily unavailable'
    });
  }
});

// Get weather by coordinates - UPDATED
router.get('/coordinates', auth, async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const location = { lat: parseFloat(lat), lon: parseFloat(lon), city: 'Current Location', country: '' };
    const weather = await weatherService.getWeatherData(location);

    res.json({
      success: true,
      weather,
      coordinates: { lat, lon }
    });

  } catch (error) {
    console.error('Weather Coordinates Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching weather data'
    });
  }
});

// Get automatic weather-based outfit recommendations - UPDATED
router.get('/recommendations/auto', auth, async (req, res) => {
  try {
    const clientIP = req.clientIp;
    
    // Get location and weather automatically
    const location = await weatherService.getLocationFromIP(clientIP);
    const weather = await weatherService.getWeatherData(location);
    
    // Get outfit recommendations based on weather
    const recommendations = weatherService.getWeatherOutfitRecommendations(weather);

    res.json({
      success: true,
      recommendations,
      weather,
      location: {
        city: location.city,
        country: location.country
      }
    });

  } catch (error) {
    console.error('Auto Recommendations Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error generating automatic recommendations'
    });
  }
});

// Get weather-based outfit recommendations (manual input) - UPDATED
router.get('/recommendations', auth, async (req, res) => {
  try {
    const { temperature, condition } = req.query;

    if (!temperature || !condition) {
      return res.status(400).json({
        success: false,
        error: 'Temperature and condition are required'
      });
    }

    const mockWeather = {
      temperature: parseInt(temperature),
      condition: condition
    };

    const recommendations = weatherService.getWeatherOutfitRecommendations(mockWeather);

    res.json({
      success: true,
      recommendations,
      weather: {
        temperature: mockWeather.temperature,
        condition: mockWeather.condition
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error generating weather recommendations'
    });
  }
});

// Get location info from IP - NEW ENDPOINT
router.get('/location', auth, async (req, res) => {
  try {
    const clientIP = req.clientIp;
    const location = await weatherService.getLocationFromIP(clientIP);

    res.json({
      success: true,
      location,
      clientIP,
      detected: !location.isMock
    });

  } catch (error) {
    console.error('Location Detection Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error detecting location'
    });
  }
});

module.exports = router;