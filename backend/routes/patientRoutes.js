const express = require('express');
const router = express.Router();

// 1. Import Middlewares
const auth = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// 2. Import Controller Logic
const { 
  getProfile, 
  getMedicalHistory, 
  getLabResults, 
  updateProfile 
} = require('../controllers/patientController');

/**
 * All routes in this file require the user to be logged in (auth)
 * and have the role of 'PATIENT'.
 */

// @route   GET /api/patients/profile
// @desc    Get current logged-in patient profile
router.get('/profile', auth, checkRole(['PATIENT']), getProfile);

// @route   PUT /api/patients/profile
// @desc    Update patient profile details
router.put('/profile', auth, checkRole(['PATIENT']), updateProfile);

// @route   GET /api/patients/history
// @desc    Get all appointments/medical history for the patient
router.get('/history', auth, checkRole(['PATIENT']), getMedicalHistory);

// @route   GET /api/patients/lab-results
// @desc    Get all lab results for the patient
router.get('/lab-results', auth, checkRole(['PATIENT']), getLabResults);

module.exports = router;