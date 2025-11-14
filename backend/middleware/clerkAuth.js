// middleware/clerkAuth.js - UPDATED & FIXED
// Development fallback - not used in production (server.js handles real auth)

const devAuth = (req, res, next) => {
  req.user = {
    _id: 'dev_user',
    clerkUserId: 'dev_user'
  };
  next();
};

// Use devAuth for all cases since server.js handles real Clerk auth
module.exports = { clerkAuth: devAuth, devAuth };