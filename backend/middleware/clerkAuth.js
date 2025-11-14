// middleware/clerkAuth.js - SIMPLIFIED CLERK COMPATIBILITY
// This is only used when Clerk is not available (development fallback)

const devAuth = (req, res, next) => {
  // Development mode - always create a mock user
  req.user = {
    _id: 'dev_user',
    clerkUserId: 'dev_user'
  };
  next();
};

// For production, we use Clerk's requireAuth() directly
// This file only exists to prevent import errors in development
const clerkAuth = devAuth; // Use same as devAuth when Clerk not available

module.exports = { clerkAuth, devAuth };