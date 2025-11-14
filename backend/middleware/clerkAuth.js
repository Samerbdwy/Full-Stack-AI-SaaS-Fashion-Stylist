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

let clerkAuth;

if (process.env.CLERK_SECRET_KEY) {
  const { requireAuth } = require('@clerk/clerk-sdk-node');
  clerkAuth = requireAuth();
} else {
  clerkAuth = devAuth;
}

module.exports = { clerkAuth, devAuth };