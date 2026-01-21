const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getDashboard,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateDoctorApproval,
  getPendingDoctors,
  deleteUser,
  getAllAppointments,
  getAnalytics,
  getSystemStats,
  sendNotification
} = require('../controllers/adminController');

// All routes require authentication and ADMIN role
router.use(protect);
router.use(authorize('ADMIN'));

// Dashboard
router.get('/dashboard', getDashboard);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Doctor Approval
router.get('/doctors/pending', getPendingDoctors);
router.put('/doctors/:id/approval', updateDoctorApproval);

// Appointments
router.get('/appointments', getAllAppointments);

// Analytics & Stats
router.get('/analytics', getAnalytics);
router.get('/stats', getSystemStats);

// Notifications
router.post('/notifications', sendNotification);

module.exports = router;