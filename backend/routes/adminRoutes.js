const express = require('express');
const router = express.Router();

// Import Middlewares
const auth = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Import Controller Logic
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getStats
} = require('../controllers/adminController');

/**
 * @route   GET /api/admin/users
 * @desc    Get all users in the system
 * @access  Private (Admin only)
 */
router.get('/users', auth, checkRole(['ADMIN']), getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin only)
 */
router.get('/users/:id', auth, checkRole(['ADMIN']), getUserById);

/**
 * @route   PATCH /api/admin/users/:id
 * @desc    Update user details
 * @access  Private (Admin only)
 */
router.patch('/users/:id', auth, checkRole(['ADMIN']), updateUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user
 * @access  Private (Admin only)
 */
router.delete('/users/:id', auth, checkRole(['ADMIN']), deleteUser);

/**
 * @route   GET /api/admin/stats
 * @desc    Get platform statistics
 * @access  Private (Admin only)
 */
router.get('/stats', auth, checkRole(['ADMIN']), getStats);

/**
 * @route   GET /api/admin/doctors
 * @desc    Get all doctors
 * @access  Public (for booking)
 */
const { getDoctors } = require('../controllers/adminController');
router.get('/doctors', getDoctors);

module.exports = router;
