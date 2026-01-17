const mongoose = require('mongoose');

/**
 * Notification Model
 * Handles user notifications for appointments, payments, prescriptions, lab results, etc.
 */
const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'appointment_booked',
      'appointment_confirmed',
      'appointment_cancelled',
      'appointment_reminder',
      'payment_received',
      'payment_failed',
      'payment_refunded',
      'prescription_added',
      'lab_result_ready',
      'doctor_approved',
      'doctor_rejected',
      'consultation_started',
      'consultation_ended',
      'general'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  // Related entity references (optional)
  relatedAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  relatedPayment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  relatedPrescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  relatedLabResult: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabResult'
  },
  relatedConsultation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation'
  },
  // Action link (optional - where to navigate when clicked)
  actionUrl: {
    type: String
  },
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Expiry date (optional - for time-sensitive notifications)
  expiresAt: {
    type: Date
  }
}, { 
  timestamps: true 
});

// Index for efficient querying
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1, expiresAt: 1 });

// Mark notification as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  return await this.save();
};

// Static method to mark multiple notifications as read
notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ user: userId, isRead: false });
};

// Static method to delete old expired notifications
notificationSchema.statics.deleteExpired = async function() {
  const now = new Date();
  return await this.deleteMany({
    expiresAt: { $exists: true, $lt: now }
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
