const express = require('express');
const router = express.Router();

// Import Middlewares
const auth = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Import Controller Logic
const {
  getAppointments,
  getAppointmentDetails,
  bookAppointment,
  updateStatus,
  getAvailableSlots,
  cancelAppointment
} = require('../controllers/appointmentController');

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments (filtered by user role)
 * @access  Private (Patient sees their appointments, Doctor sees their schedule)
 */
router.get('/', auth, getAppointments);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get detailed information for a specific appointment
 * @access  Private
 */
router.get('/:id', auth, getAppointmentDetails);

/**
 * @route   POST /api/appointments
 * @desc    Book a new appointment
 * @access  Private (Patient only)
 */
router.post('/', auth, checkRole(['PATIENT']), bookAppointment);

/**
 * @route   PATCH /api/appointments/:id/status
 * @desc    Update appointment status (confirm, cancel, complete)
 * @access  Private (Doctor or Admin)
 */
router.patch('/:id/status', auth, checkRole(['DOCTOR', 'ADMIN']), updateStatus);

/**
 * @route   GET /api/appointments/slots/:doctorId
 * @desc    Get available time slots for a specific doctor
 * @access  Public or Private
 */
router.get('/slots/:doctorId', getAvailableSlots);

/**
 * @route   POST /api/appointments/doctor/slots
 * @desc    Doctor sets their available slots
 * @access  Private (Doctor only)
 */
const { setDoctorAvailability } = require('../controllers/appointmentController');
router.post('/doctor/slots', auth, checkRole(['DOCTOR']), setDoctorAvailability);

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Cancel an appointment
 * @access  Private (Patient or Doctor)
 */
router.delete('/:id', auth, cancelAppointment);

module.exports = router;
