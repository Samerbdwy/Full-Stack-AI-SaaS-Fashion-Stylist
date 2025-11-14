// models/StyleBoard.js - FIXED VERSION
const mongoose = require('mongoose');
const styleBoardItemSchema = require('./StyleBoardItem');

const styleBoardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: String,
  mood: {
    type: String,
    enum: ['confident', 'chill', 'soft', 'power', 'edgy'],
    default: 'confident'
  },
  occasion: {
    type: String,
    enum: ['casual', 'formal', 'sport', 'party', 'work', 'date', 'beach', 'daily'],
    default: 'casual'
  },
  // FIXED: Allow mixed types - both ObjectId references and embedded objects
  items: [styleBoardItemSchema],
  weatherConditions: {
    temperature: Number,
    condition: String,
    minTemp: Number,
    maxTemp: Number
  },
  tags: [String],
  likes: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  generatedByAI: {
    type: Boolean,
    default: false
  },
  aiPrompt: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Indexes
styleBoardSchema.index({ user: 1, createdAt: -1 });
styleBoardSchema.index({ user: 1, mood: 1 });
styleBoardSchema.index({ user: 1, occasion: 1 });
styleBoardSchema.index({ isPublic: 1, likes: -1 });

module.exports = mongoose.model('StyleBoard', styleBoardSchema);