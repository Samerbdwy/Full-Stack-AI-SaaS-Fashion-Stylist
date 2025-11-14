// models/Outfit.js
const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Outfit title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: String,
  mood: {
    type: String,
    enum: ['confident', 'chill', 'soft', 'power', 'edgy'],
    required: true
  },
  occasion: {
    type: String,
    enum: ['casual', 'formal', 'sport', 'party', 'work', 'date', 'beach'],
    required: true
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wardrobe',
    required: true
  }],
  suggestedItems: [{
    type: String
  }],
  weatherConditions: {
    temperature: {
      min: Number,
      max: Number,
      current: Number
    },
    condition: String,
    humidity: Number,
    windSpeed: Number
  },
  season: {
    type: String,
    enum: ['spring', 'summer', 'fall', 'winter', 'all'],
    default: 'all'
  },
  tags: [String],
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiPrompt: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  wearCount: {
    type: Number,
    default: 0
  },
  lastWorn: Date,
  isFavorite: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
outfitSchema.index({ user: 1, createdAt: -1 });
outfitSchema.index({ user: 1, mood: 1 });
outfitSchema.index({ user: 1, occasion: 1 });
outfitSchema.index({ user: 1, season: 1 });
outfitSchema.index({ aiGenerated: 1, rating: -1 });

// Virtual for complete outfit details
outfitSchema.virtual('outfitDetails').get(function() {
  return {
    title: this.title,
    mood: this.mood,
    occasion: this.occasion,
    items: this.items.length,
    season: this.season,
    weather: this.weatherConditions
  };
});

module.exports = mongoose.model('Outfit', outfitSchema);