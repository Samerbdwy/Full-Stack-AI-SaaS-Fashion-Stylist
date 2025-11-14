// services/weatherService.js - IP-BASED WEATHER SERVICE
const axios = require('axios');

class WeatherService {
  constructor() {
    this.openWeatherApiKey = process.env.OPENWEATHER_API_KEY;
  }

  // Get location from IP address
  async getLocationFromIP(clientIP = '') {
    try {
      // For local development or if no IP provided
      if (!clientIP || clientIP === '::1' || clientIP === '127.0.0.1') {
        console.log('📍 Using default location (Cairo) for local development');
        return {
          city: 'Cairo',
          country: 'Egypt',
          countryCode: 'EG',
          lat: 30.0444,
          lon: 31.2357,
          isMock: true
        };
      }

      console.log('📍 Detecting location for IP:', clientIP);
      
      const response = await axios.get(`http://ip-api.com/json/${clientIP}`);
      const data = response.data;
      
      if (data.status === 'success') {
        console.log('📍 Location detected:', data.city, data.country);
        return {
          city: data.city,
          country: data.country,
          countryCode: data.countryCode,
          lat: data.lat,
          lon: data.lon,
          isMock: false
        };
      } else {
        throw new Error('IP location service failed: ' + data.message);
      }
    } catch (error) {
      console.log('📍 IP location failed, using default Cairo:', error.message);
      return {
        city: 'Cairo',
        country: 'Egypt',
        countryCode: 'EG',
        lat: 30.0444,
        lon: 31.2357,
        isMock: true
      };
    }
  }

  // Get weather data for location
  async getWeatherData(location) {
    try {
      if (!this.openWeatherApiKey) {
        console.log('🌤️ No API key, using mock weather data');
        return this.getMockWeatherData(location);
      }

      console.log('🌤️ Fetching real weather for:', location.city, location.country);
      
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${this.openWeatherApiKey}&units=metric`
      );

      const weatherData = response.data;
      
      const weather = {
        location: `${weatherData.name}, ${weatherData.sys.country}`,
        temperature: Math.round(weatherData.main.temp),
        condition: weatherData.weather[0].main,
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        icon: weatherData.weather[0].icon,
        feelsLike: Math.round(weatherData.main.feels_like),
        minTemp: Math.round(weatherData.main.temp_min),
        maxTemp: Math.round(weatherData.main.temp_max),
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility,
        sunrise: new Date(weatherData.sys.sunrise * 1000),
        sunset: new Date(weatherData.sys.sunset * 1000),
        isMock: false
      };

      console.log('🌤️ Real weather data received:', weather.temperature + '°C', weather.condition);
      return weather;
    } catch (error) {
      console.log('🌤️ Weather API failed, using mock data:', error.message);
      return this.getMockWeatherData(location);
    }
  }

  // Mock weather data for fallback
  getMockWeatherData(location) {
    // Generate realistic mock data based on location and time
    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth();
    
    // Seasonal temperature adjustments
    let baseTemp = 20; // Default
    if (location.countryCode === 'EG') baseTemp = 28; // Egypt - warm
    if (['US', 'CA'].includes(location.countryCode)) baseTemp = 15; // North America
    if (['RU', 'NO', 'SE', 'FI'].includes(location.countryCode)) baseTemp = 8; // Cold countries
    
    // Time of day adjustments
    if (hour >= 22 || hour <= 6) baseTemp -= 5; // Night
    if (hour >= 12 && hour <= 16) baseTemp += 3; // Afternoon
    
    // Seasonal adjustments
    if (month >= 11 || month <= 1) baseTemp -= 8; // Winter
    if (month >= 6 && month <= 8) baseTemp += 10; // Summer
    
    // Condition based on location and season
    let condition = 'Clear';
    if (location.countryCode === 'EG') condition = 'Clear'; // Egypt is usually clear
    if (['GB', 'UK', 'IE'].includes(location.countryCode)) condition = 'Clouds'; // UK is often cloudy
    
    return {
      location: `${location.city}, ${location.country}`,
      temperature: Math.round(baseTemp),
      condition: condition,
      description: 'partly cloudy',
      humidity: 65,
      windSpeed: 3.5,
      icon: '02d',
      feelsLike: Math.round(baseTemp + 1),
      minTemp: Math.round(baseTemp - 3),
      maxTemp: Math.round(baseTemp + 5),
      pressure: 1013,
      visibility: 10000,
      sunrise: new Date(now.setHours(6, 0, 0, 0)),
      sunset: new Date(now.setHours(18, 0, 0, 0)),
      isMock: true
    };
  }

  // Get weather-based outfit recommendations
  getWeatherOutfitRecommendations(weather) {
    const temp = weather.temperature;
    const condition = weather.condition.toLowerCase();
    
    let recommendations = {
      temperature: temp,
      condition: weather.condition,
      outfitType: '',
      items: [],
      colors: [],
      notes: ''
    };

    // Temperature-based recommendations
    if (temp < 10) {
      recommendations.outfitType = 'Winter Layers';
      recommendations.items = [
        'Heavy coat or parka',
        'Thermal base layer',
        'Warm sweater',
        'Winter trousers',
        'Insulated boots',
        'Beanie and gloves'
      ];
      recommendations.colors = ['Dark colors', 'Neutral tones', 'Earthy colors'];
      recommendations.notes = 'Layer up for maximum warmth';
    } else if (temp < 20) {
      recommendations.outfitType = 'Light Layers';
      recommendations.items = [
        'Light jacket or hoodie',
        'Long sleeve top',
        'Comfortable jeans',
        'Sneakers',
        'Light scarf'
      ];
      recommendations.colors = ['Medium tones', 'Pastels', 'Classic colors'];
      recommendations.notes = 'Perfect for changing temperatures';
    } else {
      recommendations.outfitType = 'Summer Comfort';
      recommendations.items = [
        'Breathable t-shirt',
        'Shorts or light pants',
        'Sandals or light shoes',
        'Sunglasses',
        'Sun hat'
      ];
      recommendations.colors = ['Light colors', 'Bright tones', 'Whites'];
      recommendations.notes = 'Stay cool and comfortable';
    }

    // Weather condition adjustments
    if (condition.includes('rain')) {
      recommendations.items.push('Waterproof jacket', 'Umbrella');
      recommendations.notes += ' - Rain protection needed';
    }

    if (condition.includes('sun') || condition.includes('clear')) {
      recommendations.items.push('Sunglasses', 'Sun protection');
      recommendations.notes += ' - Sun protection recommended';
    }

    if (condition.includes('wind')) {
      recommendations.items.push('Wind-resistant layer');
      recommendations.notes += ' - Wind-resistant elements';
    }

    return recommendations;
  }
}

module.exports = new WeatherService();