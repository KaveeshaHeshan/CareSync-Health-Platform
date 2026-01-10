// Import the stripe package
const Stripe = require('stripe');

/**
 * Initialize Stripe with your Secret Key from the .env file.
 * The Secret Key (sk_test_...) should never be shared or committed to version control.
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // Use the latest API version or a specific one for stability
  apiVersion: '2023-10-16', 
});

module.exports = stripe;