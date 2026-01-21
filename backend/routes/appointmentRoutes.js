const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createAppointment,
  getAllAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  completeAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAvailableSlots,
  getStats
} = require('../controllers/appointmentController');

// All routes require authentication
router.use(protect);

// Create appointment (patient only)
router.post('/', authorize('PATIENT'), createAppointment);

// Get all appointments (admin only)
router.get('/', authorize('ADMIN'), getAllAppointments);

// Get patient's appointments
router.get('/patient/:patientId', authorize('PATIENT', 'ADMIN'), getPatientAppointments);

// Get doctor's appointments
router.get('/doctor/:doctorId', authorize('DOCTOR', 'ADMIN'), getDoctorAppointments);

// Get available slots for a doctor
router.get('/slots/:doctorId', getAvailableSlots);

// Get appointment statistics (doctor or admin)
router.get('/stats', authorize('DOCTOR', 'ADMIN'), getStats);

// Get single appointment
router.get('/:id', getAppointment);

// Update appointment
router.put('/:id', updateAppointment);

// Cancel appointment
router.put('/:id/cancel', cancelAppointment);

// Complete appointment (doctor only)
router.put('/:id/complete', authorize('DOCTOR'), completeAppointment);

module.exports = router;