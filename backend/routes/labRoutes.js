const express = require('express');
const router = express.Router();

// Import Middlewares
const auth = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Import Controller Logic
const {
  getPatientResults,
  getReportById,
  uploadLabResult,
  searchMedicalServices
} = require('../controllers/labController');

/**
 * @route   GET /api/lab/my-results
 * @desc    Get all lab results for the logged-in patient
 * @access  Private (Patient only)
 */
router.get('/my-results', auth, checkRole(['PATIENT']), getPatientResults);

/**
 * @route   GET /api/lab/reports/:reportId
 * @desc    Get a specific lab report by ID
 * @access  Private
 */
router.get('/reports/:reportId', auth, getReportById);

/**
 * @route   POST /api/lab/upload
 * @desc    Upload a lab result (with file)
 * @access  Private (Lab/Admin only)
 */
router.post('/upload', auth, checkRole(['LAB', 'ADMIN', 'DOCTOR']), uploadLabResult);

/**
 * @route   GET /api/lab/search
 * @desc    Search for available medications or lab tests
 * @access  Public or Private
 */
router.get('/search', searchMedicalServices);

module.exports = router;
