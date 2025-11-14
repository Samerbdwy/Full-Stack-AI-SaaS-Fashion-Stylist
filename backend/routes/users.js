// routes/users.js - UPDATED (NO USER MODEL)
const express = require('express');
const Wardrobe = require('../models/Wardrobe');
const StyleBoard = require('../models/StyleBoard');
const User = require('../models/User'); // ADD THIS LINE

const router = express.Router();
const clerkService = require('../services/clerkService').default;

// Get user dashboard stats (using Clerk userId directly)
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user._id;

    // Get counts from our app data only
    const wardrobeCount = await Wardrobe.countDocuments({ user: userId });
    const styleBoardCount = await StyleBoard.countDocuments({ user: userId });
    const favoriteItems = await Wardrobe.countDocuments({ 
      user: userId, 
      isFavorite: true 
    });

    // Get recent items
    const recentItems = await Wardrobe.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name category color');

    // Get style distribution
    const categoryDistribution = await Wardrobe.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalItems: wardrobeCount,
        savedLooks: styleBoardCount,
        favoriteItems,
        categoryDistribution
      },
      recentItems,
      user: {
        clerkUserId: userId,
        // Profile data comes from Clerk, not our database
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching dashboard data' 
    });
  }
});

// Update user preferences (app-specific, not profile)
router.put('/preferences', async (req, res) => {
  try {
    // Since we're using Clerk for authentication, profile updates
    // should be handled through Clerk's user management
    // This endpoint can be used for app-specific preferences
    
    const { preferences, weatherLocation } = req.body;
    
    // In a future implementation, you might store these in a separate collection
    // For now, we'll just return success
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      updatedFields: {
        preferences,
        weatherLocation
      }
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error updating preferences' 
    });
  }
});

// Delete user data (NOT account - Clerk handles account deletion)
router.delete('/data', async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete all user data from our database
    // Clerk handles the actual account deletion
    await Promise.all([
      Wardrobe.deleteMany({ user: userId }),
      StyleBoard.deleteMany({ user: userId })
    ]);

    res.json({
      success: true,
      message: 'User data deleted successfully from FashionAI. Account management is handled by Clerk.'
    });
  } catch (error) {
    console.error('User data deletion error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error deleting user data' 
    });
  }
});

// Get user profile info from Clerk
router.get('/profile', async (req, res) => {
  try {
    const clerkUserId = req.user.clerkUserId; // Use clerkUserId from req.user
    const subscriptionInfo = await clerkService.checkUserSubscription(clerkUserId);
    
    res.json({
      success: true,
      profile: {
        clerkUserId: clerkUserId,
        // Other profile fields would come from Clerk
        managedBy: 'Clerk Authentication'
      },
      subscription: subscriptionInfo,
      message: 'Profile and subscription data managed by Clerk authentication service'
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching profile data' 
    });
  }
});

module.exports = router;