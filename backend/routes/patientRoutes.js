const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getDashboard,
  getAppointments,
  getPrescriptions,
  getLabResults,
  getPayments,
  updateHealthProfile,
  getHealthProfile,
  getMedicalHistory,
  addMedicalHistory,
  updateMedicalHistory,
  deleteMedicalHistory,
  getNotifications,
  markNotificationRead
} = require('../controllers/patientController');

// All routes require authentication and PATIENT role
router.use(protect);
router.use(authorize('PATIENT', 'ADMIN'));

// Dashboard
router.get('/dashboard', getDashboard);

// Appointments
router.get('/appointments', getAppointments);

// Prescriptions
router.get('/prescriptions', getPrescriptions);

// Lab Results
router.get('/lab-results', getLabResults);

// Payments
router.get('/payments', getPayments);

// Health Profile
router.get('/health-profile', getHealthProfile);
router.put('/health-profile', updateHealthProfile);

// Medical History
router.get('/medical-history', getMedicalHistory);
router.post('/medical-history', addMedicalHistory);
router.put('/medical-history/:id', updateMedicalHistory);
router.delete('/medical-history/:id', deleteMedicalHistory);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

module.exports = router;