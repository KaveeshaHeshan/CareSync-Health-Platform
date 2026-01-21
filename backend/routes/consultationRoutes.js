const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createRoom,
  startConsultation,
  endConsultation,
  cancelConsultation,
  getHistory,
  getConsultation,
  addParticipant,
  removeParticipant,
  addChatMessage,
  getChatMessages,
  updateQualityMetrics,
  addFeedback,
  getStats
} = require('../controllers/consultationController');

// All routes require authentication
router.use(protect);

// Create video room for appointment
router.post('/room/:appointmentId', authorize('PATIENT', 'DOCTOR'), createRoom);

// Get consultation history
router.get('/history', authorize('PATIENT', 'DOCTOR', 'ADMIN'), getHistory);

// Get consultation statistics (doctor and admin)
router.get('/stats', authorize('DOCTOR', 'ADMIN'), getStats);

// Get single consultation
router.get('/:id', getConsultation);

// Start consultation
router.put('/:id/start', authorize('PATIENT', 'DOCTOR'), startConsultation);

// End consultation
router.put('/:id/end', authorize('PATIENT', 'DOCTOR'), endConsultation);

// Cancel consultation
router.put('/:id/cancel', authorize('PATIENT', 'DOCTOR'), cancelConsultation);

// Participant management
router.post('/:id/participants', authorize('DOCTOR'), addParticipant);
router.delete('/:id/participants/:userId', authorize('DOCTOR'), removeParticipant);

// Chat messages
router.post('/:id/chat', authorize('PATIENT', 'DOCTOR'), addChatMessage);
router.get('/:id/chat', authorize('PATIENT', 'DOCTOR'), getChatMessages);

// Quality metrics
router.put('/:id/quality', authorize('PATIENT', 'DOCTOR'), updateQualityMetrics);

// Feedback
router.post('/:id/feedback', authorize('PATIENT', 'DOCTOR'), addFeedback);

module.exports = router;