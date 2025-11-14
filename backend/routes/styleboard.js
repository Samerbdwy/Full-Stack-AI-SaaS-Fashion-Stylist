const express = require('express');
const StyleBoard = require('../models/StyleBoard');
const Wardrobe = require('../models/Wardrobe');
const { validateStyleBoard } = require('../middleware/validation');

const router = express.Router();

// Get all saved looks for user
router.get('/', async (req, res) => {
  try {
    const { mood, occasion, page = 1, limit = 12 } = req.query;
    
    const filter = { user: req.user._id };
    if (mood) filter.mood = mood;
    if (occasion) filter.occasion = occasion;

    // No longer need to populate 'items', as the data is embedded.
    const looks = await StyleBoard.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await StyleBoard.countDocuments(filter);

    res.json({
      success: true,
      looks,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching saved looks'
    });
  }
});

// Get single saved look
router.get('/:id', async (req, res) => {
  try {
    // No longer need to populate 'items'
    const look = await StyleBoard.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!look) {
      return res.status(404).json({
        success: false,
        error: 'Saved look not found'
      });
    }

    res.json({
      success: true,
      look
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching saved look'
    });
  }
});

// Create new saved look - FIXED VERSION
router.post('/', validateStyleBoard, async (req, res) => {
  try {
    const { items, ...restOfBody } = req.body;
    const processedItems = [];

    if (items && items.length > 0) {
      for (const item of items) {
        if (typeof item === 'string') {
          // It's a wardrobe item ID
          const wardrobeItem = await Wardrobe.findOne({ _id: item, user: req.user._id });
          if (wardrobeItem) {
            processedItems.push({
              name: wardrobeItem.name,
              category: wardrobeItem.category,
              color: wardrobeItem.color,
              imageUrl: wardrobeItem.imageUrl,
              wardrobeItem: wardrobeItem._id
            });
          }
        } else if (typeof item === 'object' && item.name) {
          // It's a 'virtual' item, don't save to wardrobe
          processedItems.push({
            name: item.name,
            category: item.category || 'misc',
            color: item.color || 'unknown',
            imageUrl: item.imageUrl || '',
            wardrobeItem: null
          });
        }
      }
    }

    const newLook = new StyleBoard({
      ...restOfBody,
      user: req.user._id,
      items: processedItems
    });

    await newLook.save();

    // The look is already populated, no need to re-fetch or populate
    res.status(201).json({
      success: true,
      message: 'Look saved successfully',
      look: newLook
    });

  } catch (error) {
    console.error('Error saving look:', error);
    res.status(500).json({
      success: false,
      error: 'Error saving look: ' + error.message
    });
  }
});

// Update saved look - FIXED VERSION
router.put('/:id', validateStyleBoard, async (req, res) => {
  try {
    const look = await StyleBoard.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!look) {
      return res.status(404).json({
        success: false,
        error: 'Saved look not found'
      });
    }

    res.json({
      success: true,
      message: 'Look updated successfully',
      look
    });
  } catch (error) {
    console.error('Error updating look:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating look'
    });
  }
});

// Delete saved look
router.delete('/:id', async (req, res) => {
  try {
    const look = await StyleBoard.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!look) {
      return res.status(404).json({
        success: false,
        error: 'Saved look not found'
      });
    }

    res.json({
      success: true,
      message: 'Look deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error deleting look'
    });
  }
});

// Toggle like on a look
router.patch('/:id/like', async (req, res) => {
  try {
    const look = await StyleBoard.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!look) {
      return res.status(404).json({
        success: false,
        error: 'Saved look not found'
      });
    }

    look.likes += 1;
    await look.save();

    res.json({
      success: true,
      message: 'Look liked successfully',
      likes: look.likes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error liking look'
    });
  }
});

// Toggle public/private status
router.patch('/:id/visibility', async (req, res) => {
  try {
    const look = await StyleBoard.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!look) {
      return res.status(404).json({
        success: false,
        error: 'Saved look not found'
      });
    }

    look.isPublic = !look.isPublic;
    await look.save();

    res.json({
      success: true,
      message: `Look is now ${look.isPublic ? 'public' : 'private'}`,
      isPublic: look.isPublic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error updating visibility'
    });
  }
});

// Get looks by mood
router.get('/mood/:mood', async (req, res) => {
  try {
    const { mood } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const looks = await StyleBoard.find({
      user: req.user._id,
      mood
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await StyleBoard.countDocuments({
      user: req.user._id,
      mood
    });

    res.json({
      success: true,
      looks,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching looks by mood'
    });
  }
});

// Get all public style boards
router.get('/public', async (req, res) => {
  try {
    const { mood, occasion, page = 1, limit = 12 } = req.query;
    
    const filter = { isPublic: true };
    if (mood) filter.mood = mood;
    if (occasion) filter.occasion = occasion;

    const looks = await StyleBoard.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('items', 'name color category brand size imageUrl');

    const total = await StyleBoard.countDocuments(filter);

    res.json({
      success: true,
      looks,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching public style boards:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching public style boards'
    });
  }
});

// Get styleboard statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await StyleBoard.aggregate([
      { $match: { user: req.user._id } },
      {
        $facet: {
          moodDistribution: [
            { $group: { _id: '$mood', count: { $sum: 1 } } }
          ],
          occasionDistribution: [
            { $group: { _id: '$occasion', count: { $sum: 1 } } }
          ],
          totalLooks: [
            { $count: 'count' }
          ],
          publicLooks: [
            { $match: { isPublic: true } },
            { $count: 'count' }
          ],
          aiGeneratedLooks: [
            { $match: { generatedByAI: true } },
            { $count: 'count' }
          ],
          topRatedLooks: [
            { $match: { rating: { $gte: 4 } } },
            { $count: 'count' }
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
      error: 'Error fetching styleboard statistics'
    });
  }
});

module.exports = router;
