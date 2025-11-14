import { Clerk } from '@clerk/clerk-sdk-node';

class ClerkService {
  constructor() {
    this.clerkClient = Clerk({ apiKey: process.env.CLERK_SECRET_KEY });
  }



  async getBillingPortalUrl(userId) {
    try {
      const returnUrl = process.env.FRONTEND_URL || 'http://localhost:5173'; // Where to redirect after managing subscription
      const billingPortalSession = await this.clerkClient.billingPortal.sessions.create({
        customer: userId, // Assuming Clerk userId is directly usable as customer ID for billing portal
        return_url: returnUrl,
      });
      return billingPortalSession.url;
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      throw new Error('Failed to generate billing portal URL.');
    }
  }
}

export default new ClerkService();