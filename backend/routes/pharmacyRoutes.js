const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getDashboard,
  getAllPrescriptions,
  getPrescription,
  dispensePrescription,
  completePrescription,
  cancelPrescription,
  addNotes,
  getActivePrescriptions,
  searchMedications,
  getStats,
  verifyPrescription
} = require('../controllers/pharmacyController');

// All routes require authentication
router.use(protect);

// Dashboard (pharmacy staff and admin)
router.get('/dashboard', authorize('ADMIN'), getDashboard);

// Search medications
router.get('/medications/search', searchMedications);

// Get all prescriptions (admin and pharmacy staff)
router.get('/prescriptions', authorize('ADMIN'), getAllPrescriptions);

// Get active prescriptions
router.get('/prescriptions/active', authorize('ADMIN'), getActivePrescriptions);

// Statistics
router.get('/stats', authorize('ADMIN'), getStats);

// Single prescription operations
router.get('/prescriptions/:id', getPrescription);
router.put('/prescriptions/:id/dispense', authorize('ADMIN'), dispensePrescription);
router.put('/prescriptions/:id/complete', authorize('ADMIN'), completePrescription);
router.put('/prescriptions/:id/cancel', authorize('ADMIN'), cancelPrescription);
router.put('/prescriptions/:id/notes', authorize('ADMIN'), addNotes);

// Verify prescription
router.put('/prescriptions/:id/verify', authorize('ADMIN'), verifyPrescription);

module.exports = router;