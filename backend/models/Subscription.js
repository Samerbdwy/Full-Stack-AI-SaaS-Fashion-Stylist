// models/Subscription.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['free_user', 'trend_explorer'],
    default: 'free_user'
  },
  clerkCustomerId: {
    type: String,
    unique: true,
    sparse: true
  },
  clerkSubscriptionId: String,
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'incomplete', 'incomplete_expired', 'trialing'],
    default: 'active'
  },
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  priceId: String, // Clerk price ID
  features: {
    trendExplorer: {
      type: Boolean,
      default: false
    },
    advancedAI: {
      type: Boolean,
      default: false
    },
    premiumOutfits: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    }
  },
  paymentHistory: [{
    date: Date,
    amount: Number,
    currency: String,
    status: String,
    receiptUrl: String
  }]
}, {
  timestamps: true
});

// Update user's subscription when this changes
subscriptionSchema.post('save', async function() {
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(this.user, {
    'subscription.plan': this.plan,
    'subscription.status': this.status,
    'subscription.currentPeriodEnd': this.currentPeriodEnd
  });
});

module.exports = mongoose.model('Subscription', subscriptionSchema);