// server.js - COMPLETELY UPDATED FOR CLERK INTEGRATION
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const requestIp = require('request-ip');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// CORS Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.vercel.app', 'http://localhost:5173']
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// IP Detection Middleware
app.use(requestIp.mw());

// Initialize Clerk PROPERLY
let clerkInitialized = false;
let clerkMiddleware, requireAuth, getAuth, clerkClient;

// Check if Clerk environment variables are set
if (process.env.CLERK_SECRET_KEY && process.env.CLERK_PUBLISHABLE_KEY) {
  try {
    const clerk = require('@clerk/express');
    clerkMiddleware = clerk.clerkMiddleware;
    requireAuth = clerk.requireAuth;
    getAuth = clerk.getAuth;
    clerkClient = require('@clerk/clerk-sdk-node');
    
    // Use Clerk middleware - THIS IS CRITICAL
    app.use(clerkMiddleware());
    clerkInitialized = true;
    console.log('✅ Clerk middleware initialized successfully');
  } catch (error) {
    console.log('⚠️ Clerk initialization failed despite keys being present:', error.message);
    console.log('   Falling back to development mode.');
  }
} else {
  console.log('⚠️ Clerk environment variables (CLERK_SECRET_KEY, CLERK_PUBLISHABLE_KEY) not fully set.');
  console.log('   Running in development mode with mock user.');
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Enhanced Request logging
app.use((req, res, next) => {
  const clientIp = req.clientIp;
  const { userId } = getAuth(req);
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${clientIp} - User: ${userId || 'anonymous'}`);
  next();
});

// PROPER: Clerk to MongoDB user mapping
app.use(async (req, res, next) => {
  try {
    const { userId, sessionClaims } = getAuth(req);
    if (userId) {
      // Find or create user in MongoDB using Clerk userId
      const User = require('./models/User');
      let user = await User.findOne({ clerkUserId: userId });
      
      if (!user) {
        // Create new user in MongoDB
        user = new User({
          clerkUserId: userId,
          email: sessionClaims?.email,
          username: sessionClaims?.username,
          firstName: sessionClaims?.given_name,
          lastName: sessionClaims?.family_name
        });
        
        // Ensure undefined is used instead of null for sparse indexes
        if (!user.email) delete user.email;
        if (!user.username) delete user.username;

        await user.save();
        console.log('👤 New user created in MongoDB:', user._id);
      }
      
      req.user = user; // Full MongoDB user document
    } else if (!clerkInitialized) {
      // Development mode - mock user
      const User = require('./models/User');
      let user = await User.findOne({ clerkUserId: 'dev_user' });
      if (!user) {
        user = new User({ clerkUserId: 'dev_user', email: 'dev@fashionai.com', username: 'dev_user' });
        await user.save();
      }
      req.user = user;
    } else {
      req.user = null;
    }
    next();
  } catch (error) {
    console.error('User mapping error:', error);
    next(error);
  }
});

// Import route files
const usersRoutes = require('./routes/users');
const wardrobeRoutes = require('./routes/wardrobe');
const outfitsRoutes = require('./routes/outfits');
const styleboardRoutes = require('./routes/styleboard');
const aiRoutes = require('./routes/ai');
const weatherRoutes = require('./routes/weather');
const paymentsRoutes = require('./routes/payments');

// Public routes
app.use('/api/health', (req, res) => {
  const { userId } = getAuth(req);
  const healthInfo = {
    status: 'OK',
    message: 'FashionAI Backend is running smoothly',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    clientIP: req.clientIp,
    userAuthenticated: !!userId,
    clerkInitialized: clerkInitialized,
    features: ['AI Stylist', 'Paid Trend Explorer ($10/month)'],
    environment: process.env.NODE_ENV || 'development'
  };
  
  if (userId) {
    healthInfo.userId = userId;
  }
  
  res.status(200).json(healthInfo);
});

// PROTECTED ROUTES - Use Clerk requireAuth() directly
if (clerkInitialized) {
  console.log('🔐 Using Clerk requireAuth() for protected routes');
  
  app.use('/api/users', requireAuth(), usersRoutes);
  app.use('/api/wardrobe', requireAuth(), wardrobeRoutes);
  app.use('/api/outfits', requireAuth(), outfitsRoutes);
  app.use('/api/styleboard', requireAuth(), styleboardRoutes);
  app.use('/api/ai', requireAuth(), aiRoutes);
  app.use('/api/weather', requireAuth(), weatherRoutes);
  app.use('/api/payments', requireAuth(), paymentsRoutes);
  
} else {
  console.log('🔓 Development mode - routes unprotected');
  
  // Direct route mounting without auth for development
  app.use('/api/users', usersRoutes);
  app.use('/api/wardrobe', wardrobeRoutes);
  app.use('/api/outfits', outfitsRoutes);
  app.use('/api/styleboard', styleboardRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/weather', weatherRoutes);
  app.use('/api/payments', paymentsRoutes);
}

// Protected Trend Explorer Route - USING CLERK'S has() METHOD
app.get('/api/trends', requireAuth(), async (req, res) => {
  try {
    const { userId, has } = getAuth(req);
    
    // For development, allow access to everyone
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!clerkInitialized || isDevelopment) {
      const trends = getManualTrends();
      return res.json({
        success: true,
        trends,
        hasAccess: true,
        userType: 'development',
        accessedAt: new Date().toISOString()
      });
    }

    const hasTrendExplorer = has({ plan: 'trend_exploler' });
    
    if (!hasTrendExplorer) {
      return res.status(403).json({
        success: false,
        error: 'Trend Explorer is a premium feature',
        message: 'Upgrade to access Trend Explorer',
        requiredPlan: 'trend_exploler'
      });
    }

    const trends = getManualTrends();
    
    res.json({
      success: true,
      trends,
      hasAccess: true,
      userType: 'paid'
    });

  } catch (error) {
    console.error('Trends access error:', error);
    
    // Fallback for development
    if (process.env.NODE_ENV === 'development' || !clerkInitialized) {
      const trends = getManualTrends();
      return res.json({
        success: true,
        trends,
        hasAccess: true,
        userType: 'development_fallback'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error accessing trends'
    });
  }
});

// User subscription status endpoint
app.get('/api/user/subscription', requireAuth(), async (req, res) => {
  try {
    const { userId, has } = getAuth(req);
    
    if (!clerkInitialized || process.env.NODE_ENV === 'development') {
      return res.json({
        success: true,
        subscription: {
          userId: userId,
          plan: 'development',
          hasTrendExplorer: true,
          isFreeUser: false,
        }
      });
    }

    const hasTrendExplorer = has({ plan: 'trend_exploler' });
    const isFreeUser = has({ plan: 'free_user' });

    let plan = 'free_user';
    if (hasTrendExplorer) {
      plan = 'trend_exploler';
    }
    
    const subscriptionInfo = {
      userId,
      plan,
      hasTrendExplorer,
      isFreeUser,
    };
    
    res.json({
      success: true,
      subscription: subscriptionInfo
    });
    
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({
      success: false,
      error: 'Error checking subscription status'
    });
  }
});

// Manual trends data
function getManualTrends() {
  return [
    {
      id: 1,
      title: 'Oversized Blazers',
      category: 'streetwear',
      description: 'Structured blazers in exaggerated proportions for powerful urban style.',
      popularity: 95,
      season: 'Spring 2024',
      items: ['Oversized Black Blazer', 'Graphic Tank Top', 'Cargo Pants', 'Chunky Boots'],
      colors: ['#000000', '#2F4F4F', '#FFFFFF'],
      inspiration: 'Seen on runways and street style stars globally',
      icon: '🧥',
      priceRange: '$$'
    },
    {
      id: 2,
      title: 'Pastel Leather',
      category: 'minimalist', 
      description: 'Soft leather pieces in unexpected pastel shades for modern elegance.',
      popularity: 88,
      season: 'Spring 2024',
      items: ['Pastel Pink Leather Jacket', 'White Linen Dress', 'Strappy Sandals'],
      colors: ['#FFB6C1', '#FFFFFF', '#E6E6FA'],
      inspiration: 'Minimalist luxury brands embracing color',
      icon: '👜',
      priceRange: '$$$'
    },
    {
      id: 3,
      title: '90s Grunge Revival',
      category: 'vintage',
      description: 'Distressed denim and layered accessories with modern updates.',
      popularity: 92,
      season: 'Spring 2024',
      items: ['Distressed Denim Jacket', 'Vintage Band Tee', 'Combat Boots'],
      colors: ['#000000', '#36454F', '#8B0000'],
      inspiration: 'Nostalgic 90s fashion with contemporary fits',
      icon: '🎸',
      priceRange: '$'
    },
    {
      id: 4,
      title: 'Techwear Fusion',
      category: 'streetwear',
      description: 'Technical fabrics meet urban aesthetics with functional designs.',
      popularity: 85,
      season: 'Spring 2024',
      items: ['Waterproof Cargo Pants', 'Modular Vest', 'Tech Sneakers'],
      colors: ['#2F4F4F', '#696969', '#006400'],
      inspiration: 'Cyberpunk influences in everyday wear',
      icon: '🤖',
      priceRange: '$$$'
    },
    {
      id: 5,
      title: 'Sheer Layering',
      category: 'minimalist',
      description: 'Delicate sheer pieces layered for depth and elegant texture.',
      popularity: 78,
      season: 'Spring 2024',
      items: ['Sheer Black Top', 'Silk Slip Dress', 'Tailored Trousers'],
      colors: ['#000000', '#FFFFFF', '#F5F5F5'],
      inspiration: 'Red carpet fashion embracing transparency',
      icon: '👚',
      priceRange: '$$'
    },
    {
      id: 6,
      title: 'Color Blocking',
      category: 'y2k',
      description: 'Bold color combinations with retro-futuristic energy.',
      popularity: 82,
      season: 'Spring 2024',
      items: ['Electric Blue Blazer', 'Hot Pink Trousers', 'Yellow Heels'],
      colors: ['#0000FF', '#FF69B4', '#FFFF00'],
      inspiration: 'Early 2000s fashion with modern color theory',
      icon: '🎨',
      priceRange: '$$'
    }
  ].map(trend => ({
    ...trend,
    isPremium: true,
    accessLevel: 'paid'
  }));
}

// Authentication status endpoint
app.get('/api/auth/status', (req, res) => {
  const { userId } = getAuth(req);
  res.json({
    success: true,
    authenticated: !!userId,
    userId: userId,
    clerkInitialized,
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Route ${req.originalUrl} not found`,
    clientIP: req.clientIp
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 FashionAI Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: http://localhost:5173`);
  console.log(`🔐 Clerk Authentication: ${clerkInitialized ? 'ENABLED' : 'DISABLED (Dev Mode)'}`);
  console.log(`💎 Trend Explorer: Paid feature ($10/month)`);
  console.log(`📊 Routes protected with Clerk requireAuth()`);
});