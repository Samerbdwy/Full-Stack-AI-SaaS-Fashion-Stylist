const express = require('express');
const { clerkAuth, devAuth } = require('../middleware/clerkAuth');
const clerk = require('@clerk/clerk-sdk-node');
const { Webhook } = require('svix');

const router = express.Router();
const auth = process.env.NODE_ENV === 'production' ? clerkAuth : devAuth;

router.use(auth);

/*
  NOTE: This webhook is commented out because it is not needed for Clerk's B2C billing.
  The <PricingTable /> component on the frontend handles subscription changes, and the backend
  uses the has() method to check for access. Storing the plan in publicMetadata is not
  the correct approach for B2C billing and can cause conflicts.
*/
/*
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return res.status(400).send('Webhook secret is not configured.');
  }

  const svix_id = req.headers['svix-id'];
  const svix_timestamp = req.headers['svix-timestamp'];
  const svix_signature = req.headers['svix-signature'];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).send('Error occured -- no svix headers');
  }

  const payload = req.body;
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err.message);
    return res.status(400).send('Error occured');
  }

  const { type, data } = evt;

  switch (type) {
    case 'user.created':
    case 'user.updated':
      const userId = data.id;
      const plan = data.public_metadata.plan || 'free_user';
      
      try {
        await clerk.users.updateUser(userId, {
          publicMetadata: { plan: plan }
        });
        console.log(`User ${userId} plan set to ${plan}`);
      } catch (error) {
        console.error(`Failed to update user ${userId} with default plan:`, error);
      }
      break;
    
    default:
      console.log(`Unhandled event type ${type}`);
  }

  res.status(200).send('Webhook processed');
});
*/

module.exports = router;