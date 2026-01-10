const mongoose = require('mongoose');

/**
 * APPOINTMENT MODEL
 * Tracks the relationship between Patients and Doctors.
 */
const AppointmentSchema = new mongoose.Schema({
  // Reference to the User who is the Patient
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Reference to the User who is the Doctor
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Date and time of the appointment
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  // Type of appointment
  type: {
    type: String,
    enum: ['in-person', 'tele-consultation', 'video-call'],
    default: 'in-person'
  },
  // Overall status of the visit
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  // Payment tracking for Stripe integration
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  // Store the Stripe Payment Intent ID for record keeping
  paymentId: {
    type: String
  },
  // Optional notes for the doctor
  reason: {
    type: String,
    trim: true
  },
  // Cancellation details
  cancellationReason: {
    type: String
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);