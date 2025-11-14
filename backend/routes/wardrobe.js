// routes/wardrobe.js - UPDATED FOR CLERK
const express = require('express');
const Wardrobe = require('../models/Wardrobe');
const { validateWardrobe } = require('../middleware/validation');

const router = express.Router();

// Get all wardrobe items for user
router.get('/', async (req, res) => {
  try {
    const { category, occasion, tag, favorite, page = 1, limit = 20 } = req.query;
    
    // Use req.user._id from Clerk auth
    const filter = { user: req.user._id };
    
    if (category) filter.category = category;
    if (occasion) filter.occasion = occasion;
    if (tag) filter.tags = { $in: [tag] };
    if (favorite !== undefined) filter.isFavorite = favorite === 'true';

    const items = await Wardrobe.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Wardrobe.countDocuments(filter);

    res.json({
      success: true,
      items,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching wardrobe items'
    });
  }
});
// Get single wardrobe item
router.get('/:id', async (req, res) => {
  try {
    const item = await Wardrobe.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Wardrobe item not found'
      });
    }

    res.json({
      success: true,
      item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching wardrobe item'
    });
  }
});

// Create new wardrobe item
router.post('/', validateWardrobe, async (req, res) => {
  try {
    const wardrobeData = {
      ...req.body,
      user: req.user._id
    };

    const item = new Wardrobe(wardrobeData);
    await item.save();

    res.status(201).json({
      success: true,
      message: 'Wardrobe item created successfully',
      item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error creating wardrobe item'
    });
  }
});

// Update wardrobe item
router.put('/:id', validateWardrobe, async (req, res) => {
  try {
    const item = await Wardrobe.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Wardrobe item not found'
      });
    }

    res.json({
      success: true,
      message: 'Wardrobe item updated successfully',
      item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error updating wardrobe item'
    });
  }
});

// Delete wardrobe item
router.delete('/:id', async (req, res) => {
  try {
    const item = await Wardrobe.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Wardrobe item not found'
      });
    }

    res.json({
      success: true,
      message: 'Wardrobe item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error deleting wardrobe item'
    });
  }
});

// Toggle favorite status
router.patch('/:id/favorite', async (req, res) => {
  try {
    const item = await Wardrobe.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Wardrobe item not found'
      });
    }

    item.isFavorite = !item.isFavorite;
    await item.save();

    res.json({
      success: true,
      message: `Item ${item.isFavorite ? 'added to' : 'removed from'} favorites`,
      item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error updating favorite status'
    });
  }
});

// Update wear count (when item is worn)
router.patch('/:id/wear', async (req, res) => {
  try {
    const item = await Wardrobe.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Wardrobe item not found'
      });
    }

    item.wearCount += 1;
    item.lastWorn = new Date();
    await item.save();

    res.json({
      success: true,
      message: 'Wear count updated',
      item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error updating wear count'
    });
  }
});

// Get wardrobe statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Wardrobe.aggregate([
      { $match: { user: req.user._id } },
      {
        $facet: {
          categoryCounts: [
            { $group: { _id: '$category', count: { $sum: 1 } } }
          ],
          occasionCounts: [
            { $group: { _id: '$occasion', count: { $sum: 1 } } }
          ],
          colorDistribution: [
            { $group: { _id: '$color', count: { $sum: 1 } } }
          ],
          favoriteCount: [
            { $match: { isFavorite: true } },
            { $count: 'count' }
          ],
          totalItems: [
            { $count: 'count' }
          ],
          mostWorn: [
            { $sort: { wearCount: -1 } },
            { $limit: 5 },
            { $project: { name: 1, wearCount: 1, category: 1 } }
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
      error: 'Error fetching wardrobe statistics'
    });
  }
});

// Get items by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const items = await Wardrobe.find({
      user: req.user._id,
      category
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Wardrobe.countDocuments({
      user: req.user._id,
      category
    });

    res.json({
      success: true,
      items,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching category items'
    });
  }
});

// Search wardrobe items
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const items = await Wardrobe.find({
      user: req.user._id,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { color: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Wardrobe.countDocuments({
      user: req.user._id,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { color: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    });

    res.json({
      success: true,
      items,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error searching wardrobe items'
    });
  }
});

module.exports = router;