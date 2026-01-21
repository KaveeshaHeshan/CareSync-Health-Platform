const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createPaymentIntent,
  confirmPayment,
  processRefund,
  getPaymentHistory,
  getPayment,
  getPaymentStats,
  webhookHandler,
  getDoctorEarnings
} = require('../controllers/paymentController');

// Stripe webhook (must be before protect middleware)
router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);

// All other routes require authentication
router.use(protect);

// Create payment intent (patient only)
router.post('/create-intent', authorize('PATIENT'), createPaymentIntent);

// Confirm payment (patient only)
router.post('/confirm', authorize('PATIENT'), confirmPayment);

// Process refund (admin only)
router.post('/refund/:paymentId', authorize('ADMIN'), processRefund);

// Get payment history (role-based)
router.get('/history', getPaymentHistory);

// Get single payment
router.get('/:id', getPayment);

// Get payment statistics
router.get('/stats/overview', authorize('DOCTOR', 'ADMIN'), getPaymentStats);

// Get doctor earnings (doctor and admin)
router.get('/earnings/doctor', authorize('DOCTOR', 'ADMIN'), getDoctorEarnings);

module.exports = router;