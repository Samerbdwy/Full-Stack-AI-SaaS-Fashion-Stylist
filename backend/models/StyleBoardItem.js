const mongoose = require('mongoose');

const styleBoardItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  color: String,
  imageUrl: String,
  // This is the link to a real wardrobe item, if it exists
  wardrobeItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wardrobe',
    default: null
  }
}, { timestamps: true });

module.exports = styleBoardItemSchema;
