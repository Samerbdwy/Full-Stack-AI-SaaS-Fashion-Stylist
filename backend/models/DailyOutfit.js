// models/DailyOutfit.js
const mongoose = require('mongoose');

const dailyOutfitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One OOTD per user per day
  },
  outfit: {
    title: String,
    description: String,
    items: [String],
    mood: String,
    occasion: String,
    colors: [String],
    weatherBased: Boolean,
    temperature: Number,
    weatherCondition: String,
    weatherNotes: String
  },
  weatherData: {
    location: String,
    temperature: Number,
    condition: String,
    description: String,
    humidity: Number,
    windSpeed: Number,
    isMock: Boolean
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  }
}, {
  timestamps: true
});

// TTL index to auto-delete expired OOTDs
dailyOutfitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('DailyOutfit', dailyOutfitSchema);