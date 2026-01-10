const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

// Import the controller logic
const { register, login, getMe, logout, forgotPassword } = require('../controllers/authController');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Patient, Doctor, or Admin)
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
router.get('/me', authMiddleware, getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (stateless JWT; endpoint for client convenience)
 * @access  Private
 */
router.post('/logout', authMiddleware, logout);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', forgotPassword);

module.exports = router;