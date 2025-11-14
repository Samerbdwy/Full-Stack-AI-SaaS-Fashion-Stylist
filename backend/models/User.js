// models/User.js - CLERK INTEGRATION MODEL
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true
  },
  firstName: String,
  lastName: String,
  profileImage: String,
  
  // App-specific preferences
  preferences: {
    stylePreferences: [String],
    favoriteColors: [String],
    size: String,
    weatherLocation: String
  },
  
  // Analytics
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
userSchema.index({ clerkUserId: 1 });

module.exports = mongoose.model('User', userSchema);