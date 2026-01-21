const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getDashboard,
  getAllTests,
  getTest,
  createTest,
  updateTest,
  uploadResultFile,
  acknowledgeResult,
  deleteTest,
  getStats,
  getPendingTests,
  getCriticalResults,
  getTestTypes
} = require('../controllers/labController');

// All routes require authentication
router.use(protect);

// Dashboard (lab staff and admin)
router.get('/dashboard', authorize('ADMIN'), getDashboard);

// Test Types (public for authenticated users)
router.get('/test-types', getTestTypes);

// Get all tests (admin and lab staff)
router.get('/tests', authorize('ADMIN', 'DOCTOR'), getAllTests);

// Get pending tests
router.get('/tests/pending', authorize('ADMIN'), getPendingTests);

// Get critical results
router.get('/tests/critical', authorize('ADMIN', 'DOCTOR'), getCriticalResults);

// Statistics
router.get('/stats', authorize('ADMIN'), getStats);

// Single test operations
router.get('/tests/:id', getTest);
router.post('/tests', authorize('DOCTOR', 'ADMIN'), createTest);
router.put('/tests/:id', authorize('ADMIN'), updateTest);
router.delete('/tests/:id', authorize('ADMIN'), deleteTest);

// File upload
router.post('/tests/:id/upload', authorize('ADMIN'), uploadResultFile);

// Acknowledge critical result
router.put('/tests/:id/acknowledge', authorize('DOCTOR'), acknowledgeResult);

module.exports = router;