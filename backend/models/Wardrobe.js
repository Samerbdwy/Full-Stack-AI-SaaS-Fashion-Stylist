// models/Wardrobe.js
const mongoose = require('mongoose');

const wardrobeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: true,
    enum: ['top', 'bottom', 'shoes', 'outerwear', 'accessory', 'dress']
  },
  color: {
    type: String,
    required: [true, 'Color is required']
  },
  occasion: {
    type: String,
    enum: ['casual', 'formal', 'sport', 'party', 'work', 'beach', 'date'],
    default: 'casual'
  },
  tags: [String],
  brand: String,
  size: String,
  imageUrl: String,
  isFavorite: {
    type: Boolean,
    default: false
  },
  lastWorn: Date,
  wearCount: {
    type: Number,
    default: 0
  },
  season: {
    type: [String],
    enum: ['spring', 'summer', 'fall', 'winter'],
    default: ['spring', 'summer', 'fall', 'winter']
  },
  condition: {
    type: String,
    enum: ['new', 'excellent', 'good', 'fair', 'poor'],
    default: 'good'
  }
}, {
  timestamps: true
});

// Index for efficient queries
wardrobeSchema.index({ user: 1, category: 1 });
wardrobeSchema.index({ user: 1, tags: 1 });
wardrobeSchema.index({ user: 1, occasion: 1 });
wardrobeSchema.index({ user: 1, createdAt: -1 });

// Virtual for formatted display name
wardrobeSchema.virtual('displayName').get(function() {
  return `${this.color} ${this.name}`;
});

module.exports = mongoose.model('Wardrobe', wardrobeSchema);