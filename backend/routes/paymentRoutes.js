const express = require('express');
const router = express.Router();

// 1. Import Middlewares
const auth = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// 2. Import Controller Logic
const { 
  createCheckoutSession, 
  verifyPayment 
} = require('../controllers/paymentController');

/**
 * STRIPE PAYMENT ROUTES
 * These endpoints are protected; only logged-in patients can initiate payments.
 */

// @route   POST /api/payments/create-checkout
// @desc    Initiate a Stripe Checkout Session for an appointment
// @access  Private (Patient only)
router.post(
  '/create-checkout', 
  auth, 
  checkRole(['PATIENT']), 
  createCheckoutSession
);

// @route   GET /api/payments/verify/:sessionId
// @desc    Verify if a Stripe payment was successful and update DB
// @access  Private (Patient only)
router.get(
  '/verify/:sessionId', 
  auth, 
  checkRole(['PATIENT']), 
  verifyPayment
);

module.exports = router;