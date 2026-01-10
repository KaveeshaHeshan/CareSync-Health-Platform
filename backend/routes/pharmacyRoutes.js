const express = require('express');
const router = express.Router();

// Import Middlewares
const auth = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Import Controller Logic
const {
  getMyPrescriptions,
  updatePrescriptionStatus,
  createPrescription
} = require('../controllers/pharmacyController');

/**
 * @route   GET /api/pharmacy/prescriptions
 * @desc    Get prescriptions for the logged-in patient
 * @access  Private (Patient only)
 */
router.get('/prescriptions', auth, checkRole(['PATIENT']), getMyPrescriptions);

/**
 * @route   PATCH /api/pharmacy/prescriptions/:id
 * @desc    Update prescription status
 * @access  Private (Pharmacy/Admin only)
 */
router.patch('/prescriptions/:id', auth, checkRole(['PHARMACY', 'ADMIN', 'DOCTOR']), updatePrescriptionStatus);

/**
 * @route   POST /api/pharmacy/prescriptions
 * @desc    Create a new prescription
 * @access  Private (Doctor only)
 */
router.post('/prescriptions', auth, checkRole(['DOCTOR']), createPrescription);

/**
 * @route   GET /api/pharmacy/prescriptions/patient/:patientId
 * @desc    Get prescriptions for a specific patient (Doctor view)
 * @access  Private (Doctor only)
 */
const { getPatientPrescriptions } = require('../controllers/pharmacyController');
router.get('/prescriptions/patient/:patientId', auth, checkRole(['DOCTOR', 'ADMIN']), getPatientPrescriptions);

module.exports = router;
