// routes/ai.js - UPDATED FOR CLERK AUTHENTICATION
const express = require('express');
const { requireAuth, getAuth } = require('@clerk/express');
const clerkClient = require('@clerk/clerk-sdk-node');
const Wardrobe = require('../models/Wardrobe');

const router = express.Router();

// Initialize Gemini AI
let ai = null;
try {
  if (process.env.GEMINI_API_KEY) {
    const { GoogleGenAI } = require("@google/genai");
    ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY 
    });
    console.log(`✅ Gemini AI routes initialized with API key ending in ...${process.env.GEMINI_API_KEY.slice(-4)}`);
  } else {
    console.log('⚠️ No Gemini API key - using enhanced mock responses');
  }
} catch (error) {
  console.log('⚠️ Gemini AI initialization failed - using enhanced mock responses');
}

// ENHANCED FALLBACK RESPONSES - FIXED VERSION
const getEnhancedFallbackResponse = (message) => {
  if (!message) {
    return "Hello! I'm your AI Fashion Stylist! 👋 How can I help you with your style today?";
  }
  
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
    return "Hello! I'm your **AI Fashion Stylist**! 👋 How can I help you with your style today? I can suggest outfits, analyze your wardrobe, or help with any fashion questions!";
  } else if (lowerMessage.includes('night out') || lowerMessage.includes('party')) {
    return "For a night out, I'd recommend:\n\n- **Sleek black leather jacket**\n- **Dark wash jeans**  \n- **Statement boots**  \n- Silver jewelry to elevate the look! 🖤";
  } else if (lowerMessage.includes('date') || lowerMessage.includes('romantic')) {
    return "For a date night, try:\n\n- **Fitted sweater**  \n- **Tailored trousers**  \n- **Clean sneakers**  \n\nKeep it sophisticated but comfortable! 💫";
  } else if (lowerMessage.includes('work') || lowerMessage.includes('office')) {
    return "For the office, go with:\n\n- **Structured blazer**  \n- **Crisp white shirt**  \n- **Tailored pants**  \n\nProfessional yet stylish! 👔";
  } else if (lowerMessage.includes('casual') || lowerMessage.includes('weekend')) {
    return "For a casual day:\n\n- **Oversized hoodie**  \n- **Relaxed jeans**  \n- **Platform sneakers**  \n\nComfort meets style! 😎";
  } else if (lowerMessage.includes('weather') || lowerMessage.includes('cold') || lowerMessage.includes('rain')) {
    return "For cold weather, layer up with:\n\n- **Thermal base layer**\n- **Warm sweater**\n- **Insulated jacket**\n- **Comfortable jeans**\n- **Boots**\n\nStay warm and stylish! ❄️";
  } else if (lowerMessage.includes('summer') || lowerMessage.includes('hot') || lowerMessage.includes('warm')) {
    return "For warm weather, try:\n\n- **Breathable cotton tee**\n- **Linen shorts or pants**\n- **Comfortable sandals**\n- **Sunglasses**\n- **Sun hat**\n\nStay cool and fresh! ☀️";
  } else if (lowerMessage.includes('formal') || lowerMessage.includes('event') || lowerMessage.includes('wedding')) {
    return "For formal events:\n\n- **Elegant dress or suit**\n- **Classic heels or dress shoes**\n- **Statement accessories**\n- **Clutch or briefcase**\n\nLook polished and sophisticated! ✨";
  } else if (lowerMessage.includes('gym') || lowerMessage.includes('workout') || lowerMessage.includes('sport')) {
    return "For active wear:\n\n- **Moisture-wicking top**\n- **Comfortable leggings/shorts**\n- **Supportive sneakers**\n- **Breathable socks**\n\nPerformance meets style! 💪";
  } else {
    // Random stylish responses for other queries
    const randomResponses = [
      "I'd recommend pairing dark wash jeans with a crisp white tee and leather jacket for a classic casual look! 👖⚪🧥",
      "For professional settings, try tailored trousers with a fitted blazer and clean sneakers. Sophisticated yet modern! 👔",
      "Your oversized hoodie would look great with cargo pants and platform sneakers. Comfort meets style! 🥶",
      "Let's create a bold statement! Pair a graphic tee with distressed jeans and combat boots for an edgy look. 🖤",
      "Try mixing textures like leather, denim, and cotton for a dynamic outfit that shows personality! 🎨",
      "Accessories can transform any outfit! Consider adding a statement watch, layered necklaces, or a stylish hat. 💫"
    ];
    return randomResponses[Math.floor(Math.random() * randomResponses.length)];
  }
};

// Helper function to get user ID from Clerk
const getUserId = (req) => {
  try {
    const { userId } = getAuth(req);
    return userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

// AI Chat endpoint - UPDATED FOR CLERK
router.post('/chat', requireAuth(), async (req, res) => {
  try {
    const { message } = req.body;
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    console.log('💬 AI Chat request from user:', userId);

    // IMMEDIATE FALLBACK - Don't even try API if we know it will fail
    if (!ai || !process.env.GEMINI_API_KEY) {
      console.log('📦 Using enhanced mock response (no API key/initialization failed)');
      const response = getEnhancedFallbackResponse(message);
      return res.json({
        success: true,
        response: response,
        isMock: true
      });
    }

    // Try real API call with better error handling
    try {
      console.log('🤖 Attempting Gemini API call...');
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `As a fashion stylist, respond to: "${message}" - provide helpful fashion advice.`,
        config: {
          temperature: 0.8,
          maxOutputTokens: 1500,
        }
      });

      let aiResponse = '';
      
      // Extract text from response
      if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        aiResponse = response.candidates[0].content.parts[0].text;
      } else if (response.text) {
        aiResponse = response.text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }

      console.log('✅ Gemini API success');
      return res.json({
        success: true,
        response: aiResponse,
        isMock: false
      });

    } catch (apiError) {
      console.log('🔴 Gemini API Error:', apiError.message);
      
      // Specific check for quota errors
      if (apiError.message.includes('429')) {
        console.error('🔴 Gemini API quota exceeded. Please check your Google AI Studio usage dashboard (ai.dev/usage) and billing details.');
        return res.json({
          success: true,
          response: "I'm currently very popular! Please try again in a few moments. ✨ (Quota Exceeded: Check ai.dev/usage)",
          isMock: true,
          apiError: 'Quota exceeded'
        });
      }

      // Use ENHANCED fallback responses instead of generic one
      const fallbackResponse = getEnhancedFallbackResponse(message);
      
      return res.json({
        success: true,
        response: fallbackResponse,
        isMock: true,
        apiError: apiError.message
      });
    }

  } catch (error) {
    console.error('🚨 AI Chat Route Error:', error);
    
    // Final fallback - use ENHANCED responses
    const fallbackResponse = getEnhancedFallbackResponse(req.body?.message || '');
    
    res.json({
      success: true,
      response: fallbackResponse,
      isMock: true,
      error: 'Chat service temporarily unavailable'
    });
  }
});

// AI Outfit Generation endpoint - UPDATED FOR CLERK
router.post('/generate-outfit', requireAuth(), async (req, res) => {
  try {
    const { mood, occasion, weather } = req.body;
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    console.log('🎨 AI Outfit Generation request from user:', userId, { mood, occasion, weather });

    // Enhanced mock outfits for each mood
    const mockOutfits = {
      confident: {
        title: "Urban Explorer Look",
        description: "Bold and confident streetwear for making a statement",
        items: [
          "Black Leather Moto Jacket",
          "White Graphic Tee",
          "Distressed Denim Jeans",
          "Combat Boots",
          "Silver Chain Necklace"
        ],
        mood: "confident",
        occasion: occasion || "casual",
        colors: ["#000000", "#FFFFFF", "#36454F"]
      },
      chill: {
        title: "Cozy Comfort Outfit",
        description: "Relaxed and comfortable for laid-back days",
        items: [
          "Oversized Hoodie",
          "Black Leggings",
          "Platform Sneakers",
          "Beanie",
          "Crossbody Bag"
        ],
        mood: "chill",
        occasion: occasion || "casual",
        colors: ["#8B4513", "#000000", "#696969"]
      },
      soft: {
        title: "Gentle Elegance",
        description: "Soft and delicate with gentle pastel tones",
        items: [
          "Cashmere Sweater",
          "Wide-leg Trousers",
          "Minimalist Sneakers",
          "Delicate Jewelry",
          "Structured Tote"
        ],
        mood: "soft",
        occasion: occasion || "casual",
        colors: ["#FFB6C1", "#FFFFFF", "#E6E6FA"]
      },
      power: {
        title: "Executive Power",
        description: "Sharp and sophisticated professional look",
        items: [
          "Structured Blazer",
          "Crisp White Button-Down",
          "Tailored Trousers",
          "Leather Loafers",
          "Statement Watch"
        ],
        mood: "power",
        occasion: occasion || "work",
        colors: ["#000080", "#FFFFFF", "#2F4F4F"]
      },
      edgy: {
        title: "Dark Aesthetic",
        description: "Bold and edgy with monochrome elements",
        items: [
          "Biker Jacket",
          "Ripped Black Jeans",
          "Harness Details",
          "Combat Boots",
          "Chunky Rings"
        ],
        mood: "edgy",
        occasion: occasion || "party",
        colors: ["#000000", "#2F4F4F", "#800000"]
      }
    };

    // If no API key, use enhanced mock response
    if (!process.env.GEMINI_API_KEY || !ai) {
      const outfit = mockOutfits[mood] || mockOutfits.confident;
      console.log('📦 Using mock outfit for mood:', mood);
      
      return res.json({
        success: true,
        outfit,
        isMock: true
      });
    }

    // Real AI call to Gemini
    try {
      const prompt = `Create a fashionable outfit for someone feeling ${mood} for a ${occasion} occasion. 
      Weather: ${weather}. 
      Return ONLY valid JSON in this exact format:
      {
        "title": "Creative outfit name",
        "description": "Brief description matching the ${mood} vibe",
        "items": ["item1", "item2", "item3", "item4", "item5"],
        "mood": "${mood}",
        "occasion": "${occasion}",
        "colors": ["#hex1", "#hex2", "#hex3"]
      }
      Make it unique and truly reflect the ${mood} feeling.`;

      console.log('🤖 Sending prompt to Gemini for mood:', mood);

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          temperature: 0.9, // Higher temperature for more creativity
          maxOutputTokens: 800,
        }
      });

      let aiResponse = '';
      
      // Extract text from response
      if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        aiResponse = response.candidates[0].content.parts[0].text;
      } else if (response.text) {
        aiResponse = response.text;
      }

      console.log('🤖 Raw AI Response:', aiResponse);

      // Try to parse JSON from AI response
      try {
        // Clean the response - remove markdown code blocks if present
        const cleanedResponse = aiResponse.replace(/```json|```/g, '').trim();
        const parsedOutfit = JSON.parse(cleanedResponse);
        
        console.log('✅ Successfully parsed AI outfit:', parsedOutfit.title);
        
        res.json({
          success: true,
          outfit: parsedOutfit,
          isMock: false
        });

      } catch (parseError) {
        console.log('❌ Failed to parse AI response, using enhanced mock data:', parseError.message);
        
        // Use mood-specific mock data instead of always falling back to confident
        const fallbackOutfit = mockOutfits[mood] || mockOutfits.confident;
        console.log('📦 Falling back to mock outfit for mood:', mood);
        
        res.json({
          success: true,
          outfit: fallbackOutfit,
          isMock: true,
          error: "AI response parsing failed"
        });
      }

    } catch (apiError) {
      console.error('🔴 Gemini API Error:', apiError);
      
      // Use mood-specific fallback data
      const fallbackOutfit = mockOutfits[mood] || mockOutfits.confident;
      console.log('📦 API error, using fallback for mood:', mood);
      
      res.json({
        success: true,
        outfit: fallbackOutfit,
        isMock: true,
        error: "AI service unavailable"
      });
    }

  } catch (error) {
    console.error('🚨 AI Outfit Generation Error:', error);
    
    // Final fallback with mood-specific data
    const mockOutfits = {
      confident: {
        title: "Confident Street Style",
        description: "Bold and expressive outfit for confident days",
        items: [
          "Leather Jacket",
          "Graphic T-Shirt",
          "Distressed Jeans",
          "Statement Sneakers",
          "Silver Accessories"
        ],
        mood: "confident",
        occasion: "casual",
        colors: ["#000000", "#FFFFFF", "#C0C0C0"]
      },
      chill: {
        title: "Relaxed Comfort",
        description: "Perfect for laid-back, comfortable days",
        items: [
          "Soft Hoodie",
          "Comfortable Joggers",
          "Casual Sneakers",
          "Cozy Beanie",
          "Minimal Backpack"
        ],
        mood: "chill",
        occasion: "casual",
        colors: ["#8B4513", "#696969", "#2F4F4F"]
      },
      soft: {
        title: "Gentle Beauty",
        description: "Soft and elegant with delicate touches",
        items: [
          "Pastel Sweater",
          "Flowy Skirt",
          "Elegant Flats",
          "Dainty Necklace",
          "Straw Tote"
        ],
        mood: "soft",
        occasion: "casual",
        colors: ["#FFB6C1", "#E6E6FA", "#F0FFF0"]
      },
      power: {
        title: "Professional Edge",
        description: "Sharp and commanding professional attire",
        items: [
          "Tailored Blazer",
          "Silk Blouse",
          "Straight-leg Pants",
          "Leather Pumps",
          "Luxury Watch"
        ],
        mood: "power",
        occasion: "work",
        colors: ["#000080", "#2F4F4F", "#FFFFFF"]
      },
      edgy: {
        title: "Urban Rebel",
        description: "Bold and unconventional street style",
        items: [
          "Asymmetrical Jacket",
          "Mesh Top",
          "Cargo Pants",
          "Platform Boots",
          "Spiked Accessories"
        ],
        mood: "edgy",
        occasion: "party",
        colors: ["#000000", "#800000", "#2F4F4F"]
      }
    };
    
    const finalOutfit = mockOutfits[req.body.mood] || mockOutfits.confident;
    
    res.json({
      success: true,
      outfit: finalOutfit,
      isMock: true,
      error: "Generation service error"
    });
  }
});

// Function to generate smart tags when items don't have tags
function generateSmartTags(wardrobe) {
  const tags = [];
  
  wardrobe.forEach(item => {
    // Generate tags from category
    if (item.category) {
      tags.push(item.category);
    }
    
    // Generate tags from color
    if (item.color) {
      tags.push(item.color);
    }
    
    // Generate tags from occasion
    if (item.occasion && item.occasion !== 'casual') {
      tags.push(item.occasion);
    }
    
    // Generate tags from item name analysis
    if (item.name) {
      const name = item.name.toLowerCase();
      if (name.includes('jeans')) tags.push('denim', 'casual');
      if (name.includes('blazer') || name.includes('suit')) tags.push('formal', 'professional');
      if (name.includes('dress')) tags.push('elegant', 'feminine');
      if (name.includes('shirt') || name.includes('top')) tags.push('tops');
      if (name.includes('shoe') || name.includes('sneaker')) tags.push('footwear');
      if (name.includes('jacket') || name.includes('coat')) tags.push('outerwear');
    }
  });
  
  // Count tag frequency and return most common ones
  const tagCounts = tags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);
}

// Enhanced helper function to determine personality from real wardrobe data
function determinePersonality(wardrobe, colors, tags) {
  const colorCount = Object.keys(colors).length;
  const totalItems = wardrobe.length;
  
  // Get actual colors from wardrobe for the palette
  const actualColors = Object.keys(colors).slice(0, 4);
  
  // Convert color names to hex codes for the palette
  const colorMap = {
    'black': '#000000', 'white': '#FFFFFF', 'blue': '#0000FF', 'navy': '#000080',
    'red': '#FF0000', 'green': '#008000', 'yellow': '#FFFF00', 'pink': '#FFC0CB',
    'purple': '#800080', 'brown': '#8B4513', 'gray': '#808080', 'grey': '#808080',
    'orange': '#FFA500', 'beige': '#F5F5DC', 'cream': '#FFFDD0', 'khaki': '#F0E68C'
  };
  
  // Create color palette from actual wardrobe colors
  let colorPalette = actualColors.map(color => 
    colorMap[color.toLowerCase()] || '#6B7280'
  ).slice(0, 4);

  // Generate smart tags based on item properties since tags might be empty
  const generatedTags = generateSmartTags(wardrobe);
  
  // Analyze wardrobe characteristics from ACTUAL data
  const hasBlazer = wardrobe.some(item => 
    item.name?.toLowerCase().includes('blazer') ||
    item.category === 'outerwear'
  );
  
  const hasDress = wardrobe.some(item => 
    item.category === 'dress'
  );
  
  const hasFormalItems = wardrobe.some(item => 
    item.occasion === 'formal' || 
    item.occasion === 'work' ||
    hasBlazer ||
    hasDress
  );

  const hasCasualItems = wardrobe.some(item => 
    item.occasion === 'casual' ||
    item.category === 'jeans' ||
    item.name?.toLowerCase().includes('jeans')
  );

  // Determine personality based on ACTUAL analysis
  if (hasFormalItems && hasBlazer) {
    return {
      name: 'Classic Professional',
      description: 'You appreciate traditional elegance, quality fabrics, and pieces that stand the test of time.',
      strengths: ['Sophisticated taste', 'Quality over quantity', 'Elegant simplicity'],
      improvements: ['Add contemporary twists', 'Play with proportions', 'Try casual-elegant fusion'],
      colorPalette: colorPalette,
      icon: '👔'
    };
  } else if (hasFormalItems) {
    return {
      name: 'Polished Traditionalist',
      description: 'You value timeless pieces and sophisticated styling with a focus on quality.',
      strengths: ['Timeless appeal', 'Attention to detail', 'Refined aesthetic'],
      improvements: ['Incorporate modern elements', 'Experiment with accessories'],
      colorPalette: colorPalette,
      icon: '💼'
    };
  } else if (hasCasualItems && colorCount <= 2) {
    return {
      name: 'Minimalist Casual',
      description: 'You prefer comfortable, versatile pieces in a curated color palette.',
      strengths: ['Easy styling', 'Versatile wardrobe', 'Cohesive looks'],
      improvements: ['Add statement pieces', 'Experiment with patterns'],
      colorPalette: colorPalette,
      icon: '👕'
    };
  } else if (totalItems <= 5) {
    return {
      name: 'Building Foundation',
      description: 'You are building your wardrobe foundation - a great start to developing your unique style!',
      strengths: ['Intentional choices', 'Room for growth', 'Developing taste'],
      improvements: ['Add versatile basics', 'Experiment with colors', 'Build complete outfits'],
      colorPalette: colorPalette,
      icon: '🏗️'
    };
  } else {
    return {
      name: 'Versatile Explorer',
      description: 'You enjoy mixing different styles and experimenting with fashion to create unique looks.',
      strengths: ['Adaptable style', 'Creative combinations', 'Open to experimentation'],
      improvements: ['Define signature pieces', 'Focus on cohesion'],
      colorPalette: colorPalette,
      icon: '🎨'
    };
  }
}

// AI Style Analysis endpoint - UPDATED FOR CLERK
router.get('/style-analysis', requireAuth(), async (req, res) => {
  try {
    // Use req.user from the user mapping middleware
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        error: 'User not found or not authenticated'
      });
    }
    const userId = req.user._id; // This is the MongoDB ObjectId
    
    console.log('📊 AI Style Analysis request from user:', req.auth.userId, '(Mongo ID:', userId, ')');

    // Get user's actual wardrobe items using the MongoDB user ID
    const userWardrobe = await Wardrobe.find({ user: userId });
    
    console.log(`🔍 Analyzing ${userWardrobe.length} wardrobe items for user:`, userId);

    // If no items in wardrobe, return appropriate message
    if (userWardrobe.length === 0) {
      return res.json({
        success: true,
        analysis: {
          personality: {
            name: 'Getting Started',
            description: 'Add some items to your wardrobe to get personalized style analysis!',
            strengths: ['Fresh start', 'Endless possibilities', 'Clean slate'],
            improvements: ['Add your first clothing items', 'Explore different styles', 'Build your unique wardrobe'],
            colorPalette: ['#6B7280', '#9CA3AF', '#D1D5DB'],
            icon: '🆕'
          },
          stats: {
            totalItems: 0,
            topColors: [],
            commonTags: [],
            categoryBreakdown: {}
          }
        },
        isMock: false
      });
    }

    // REAL ANALYSIS BASED ON ACTUAL WARDROBE DATA
    const colors = userWardrobe.reduce((acc, item) => {
      acc[item.color] = (acc[item.color] || 0) + 1;
      return acc;
    }, {});

    // Generate smart tags if no tags exist in wardrobe
    const allTags = userWardrobe.flatMap(item => item.tags || []);
    let tagCounts = {};

    if (allTags.length > 0) {
      // Use existing tags
      tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});
    } else {
      // Generate smart tags
      const generatedTags = generateSmartTags(userWardrobe);
      tagCounts = generatedTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});
    }

    const categories = userWardrobe.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    // Determine style personality based on ACTUAL data
    const personality = determinePersonality(userWardrobe, colors, tagCounts);

    const analysis = {
      personality,
      stats: {
        totalItems: userWardrobe.length,
        topColors: Object.entries(colors).sort((a, b) => b[1] - a[1]).slice(0, 3),
        commonTags: Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
        categoryBreakdown: categories
      }
    };

    console.log('✅ Style analysis completed with real data for user:', userId);
    
    res.json({
      success: true,
      analysis: analysis,
      isMock: false
    });

  } catch (error) {
    console.error('AI Style Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error analyzing style'
    });
  }
});

// Debug endpoint - UPDATED FOR CLERK
router.get('/debug', requireAuth(), async (req, res) => {
  try {
    const userId = getUserId(req);
    
    const debugInfo = {
      hasApiKey: !!process.env.GEMINI_API_KEY,
      aiInitialized: !!ai,
      userId: userId,
      timestamp: new Date().toISOString()
    };

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: false,
        error: 'NO_API_KEY',
        message: 'GEMINI_API_KEY missing from .env',
        debug: debugInfo
      });
    }

    if (!ai) {
      return res.json({
        success: false,
        error: 'AI_NOT_INITIALIZED',
        message: 'GoogleGenAI failed to initialize',
        debug: debugInfo
      });
    }

    // Test API call
    const testResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Say 'TEST SUCCESSFUL' and nothing else.",
      config: { maxOutputTokens: 20 }
    });

    let extractedText = 'Unknown format';
    if (testResponse.candidates?.[0]?.content?.parts?.[0]?.text) {
      extractedText = testResponse.candidates[0].content.parts[0].text;
    }

    res.json({
      success: true,
      message: 'API is working!',
      extractedText,
      debug: debugInfo
    });

  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      debug: { hasApiKey: !!process.env.GEMINI_API_KEY, aiInitialized: !!ai }
    });
  }
});

// Test endpoint - UPDATED FOR CLERK
router.get('/test', requireAuth(), (req, res) => {
  const userId = getUserId(req);
  
  res.json({
    success: true,
    message: 'AI routes are working',
    userId: userId,
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;