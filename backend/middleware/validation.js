// middleware/validation.js - UPDATED VERSION
const Joi = require('joi');

// User validation schemas
const registerValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });
  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });
  return schema.validate(data);
};

// Wardrobe item validation
const wardrobeValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().max(100).required(),
    category: Joi.string().valid('top', 'bottom', 'shoes', 'outerwear', 'accessory', 'dress').required(),
    color: Joi.string().required(),
    occasion: Joi.string().valid('casual', 'formal', 'sport', 'party', 'work', 'date', 'daily'),
    tags: Joi.array().items(Joi.string()),
    brand: Joi.string().max(50),
    size: Joi.string().max(20),
    imageUrl: Joi.string().uri()
  });
  return schema.validate(data);
};

// StyleBoard validation - UPDATED VERSION (Accepts both strings and objects)
const styleBoardValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().max(100).required(),
    description: Joi.string().max(500),
    mood: Joi.string().valid('confident', 'chill', 'soft', 'power', 'edgy'),
    occasion: Joi.string().valid('casual', 'formal', 'sport', 'party', 'work', 'date', 'beach', 'daily'),
    // FIXED: Accept both strings (wardrobe IDs) and objects (AI-generated items)
    items: Joi.alternatives().try(
      Joi.array().items(Joi.string()), // array of wardrobe item IDs
      Joi.array().items(Joi.object({ // array of AI-generated item objects
        name: Joi.string().required(),
        category: Joi.string().valid('top', 'bottom', 'shoes', 'outerwear', 'accessory', 'dress'),
        color: Joi.string(),
        id: Joi.string() // optional ID for existing wardrobe items
      }))
    ),
    tags: Joi.array().items(Joi.string()),
    weatherConditions: Joi.object({
      temperature: Joi.number(),
      condition: Joi.string(),
      minTemp: Joi.number(),
      maxTemp: Joi.number()
    }),
    generatedByAI: Joi.boolean(),
    aiPrompt: Joi.string(),
    likes: Joi.number(),
    isPublic: Joi.boolean(),
    rating: Joi.number().min(1).max(5)
  });
  return schema.validate(data);
};

// Middleware functions
const validateRegister = (req, res, next) => {
  const { error } = registerValidation(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { error } = loginValidation(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  next();
};

const validateWardrobe = (req, res, next) => {
  const { error } = wardrobeValidation(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  next();
};

const validateStyleBoard = (req, res, next) => {
  const { error } = styleBoardValidation(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateWardrobe,
  validateStyleBoard
};