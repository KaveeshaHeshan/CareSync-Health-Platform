const mongoose = require('mongoose');

/**
 * Consultation Model
 * Manages video consultation sessions for online appointments
 */
const consultationSchema = new mongoose.Schema({
  appointment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment', 
    required: true,
    index: true
  },
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  doctor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  roomId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  roomPassword: {
    type: String
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  // Video platform details
  platform: {
    type: String,
    enum: ['jitsi', 'twilio', 'agora', 'zoom'],
    default: 'jitsi'
  },
  // Recording details
  recordingUrl: {
    type: String
  },
  recordingEnabled: {
    type: Boolean,
    default: false
  },
  // Consultation notes
  notes: {
    type: String
  },
  // Clinical summary
  symptoms: {
    type: String
  },
  diagnosis: {
    type: String
  },
  // Prescription tracking
  prescriptionAdded: {
    type: Boolean,
    default: false
  },
  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  // Participant information
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: Date,
    leftAt: Date,
    duration: Number // in minutes
  }],
  // Chat messages (optional - for storing in-call messages)
  chatMessages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Technical details
  connectionQuality: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  technicalIssues: {
    type: String
  },
  // Rating and feedback
  patientRating: {
    type: Number,
    min: 1,
    max: 5
  },
  patientFeedback: {
    type: String
  },
  doctorRating: {
    type: Number,
    min: 1,
    max: 5
  },
  doctorFeedback: {
    type: String
  }
}, { 
  timestamps: true 
});

// Index for efficient querying
consultationSchema.index({ patient: 1, status: 1, createdAt: -1 });
consultationSchema.index({ doctor: 1, status: 1, createdAt: -1 });
consultationSchema.index({ roomId: 1 });

// Calculate duration when ending consultation
consultationSchema.methods.calculateDuration = function() {
  if (this.startTime && this.endTime) {
    const durationMs = this.endTime - this.startTime;
    this.duration = Math.round(durationMs / 60000); // Convert to minutes
  }
  return this.duration;
};

// Start consultation
consultationSchema.methods.start = async function() {
  this.status = 'ongoing';
  this.startTime = new Date();
  return await this.save();
};

// End consultation
consultationSchema.methods.end = async function(notes) {
  this.status = 'completed';
  this.endTime = new Date();
  this.calculateDuration();
  if (notes) this.notes = notes;
  return await this.save();
};

// Add participant
consultationSchema.methods.addParticipant = function(userId) {
  this.participants.push({
    userId,
    joinedAt: new Date()
  });
  return this.save();
};

// Remove participant
consultationSchema.methods.removeParticipant = function(userId) {
  const participant = this.participants.find(
    p => p.userId.toString() === userId.toString() && !p.leftAt
  );
  if (participant) {
    participant.leftAt = new Date();
    if (participant.joinedAt) {
      const durationMs = participant.leftAt - participant.joinedAt;
      participant.duration = Math.round(durationMs / 60000);
    }
  }
  return this.save();
};

// Add chat message
consultationSchema.methods.addChatMessage = function(senderId, message) {
  this.chatMessages.push({
    sender: senderId,
    message,
    timestamp: new Date()
  });
  return this.save();
};

// Static method to get ongoing consultations
consultationSchema.statics.getOngoing = async function() {
  return await this.find({ status: 'ongoing' })
    .populate('patient doctor appointment')
    .sort({ startTime: -1 });
};

// Static method to get consultation history
consultationSchema.statics.getHistory = async function(userId, role) {
  const query = role === 'DOCTOR' 
    ? { doctor: userId } 
    : { patient: userId };
  
  return await this.find(query)
    .populate('patient doctor appointment prescription')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Consultation', consultationSchema);
