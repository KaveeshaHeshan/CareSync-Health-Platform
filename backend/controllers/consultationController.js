const Consultation = require('../models/Consultation');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const crypto = require('crypto');

// Helper function to generate UUID
const generateUUID = () => {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
};

// @desc    Create video room for appointment
// @route   POST /api/consultations/room/:appointmentId
// @access  Private
exports.createRoom = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await Appointment.findById(appointmentId)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check if user is part of this appointment
    const isAuthorized = 
      appointment.patient._id.toString() === req.user._id.toString() ||
      appointment.doctor._id.toString() === req.user._id.toString();
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to access this consultation' });
    }

    // Check if appointment is confirmed
    if (appointment.status !== 'confirmed' && appointment.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Appointment must be confirmed to start consultation' 
      });
    }

    // Check if appointment type is online
    if (appointment.type !== 'online') {
      return res.status(400).json({ 
        message: 'Only online appointments can have video consultations' 
      });
    }
    
    // Check if room already exists
    let consultation = await Consultation.findOne({ appointment: appointmentId });
    
    if (!consultation) {
      // Create new room
      const roomId = `caresync-${generateUUID()}`;
      const roomPassword = Math.random().toString(36).substring(2, 10);
      
      consultation = await Consultation.create({
        appointment: appointmentId,
        patient: appointment.patient._id,
        doctor: appointment.doctor._id,
        roomId,
        roomPassword,
        status: 'scheduled',
        platform: 'jitsi'
      });

      // Notify participants
      await Notification.create({
        user: appointment.patient._id,
        type: 'CONSULTATION_SCHEDULED',
        title: 'Video Room Ready',
        message: `Video consultation room has been created for your appointment with Dr. ${appointment.doctor.name}.`,
        relatedConsultation: consultation._id,
        priority: 'high'
      });

      await Notification.create({
        user: appointment.doctor._id,
        type: 'CONSULTATION_SCHEDULED',
        title: 'Video Room Ready',
        message: `Video consultation room has been created for your appointment with ${appointment.patient.name}.`,
        relatedConsultation: consultation._id,
        priority: 'high'
      });
    }

    // Populate the consultation
    consultation = await Consultation.findById(consultation._id)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization')
      .populate('appointment');
    
    res.json({
      success: true,
      consultation,
      jitsiConfig: {
        roomName: consultation.roomId,
        password: consultation.roomPassword,
        domain: process.env.JITSI_DOMAIN || 'meet.jit.si',
      }
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Start consultation
// @route   PUT /api/consultations/:consultationId/start
// @access  Private
exports.startConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    
    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Verify authorization
    const isAuthorized =
      consultation.patient.toString() === req.user._id.toString() ||
      consultation.doctor.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Only start if scheduled
    if (consultation.status !== 'scheduled') {
      return res.status(400).json({ 
        message: 'Consultation is not in scheduled status' 
      });
    }

    consultation.status = 'ongoing';
    consultation.startTime = new Date();
    await consultation.save();

    // Add participant
    const userRole = req.user._id.toString() === consultation.doctor.toString() ? 'doctor' : 'patient';
    consultation.participants.push({
      user: req.user._id,
      role: userRole,
      joinedAt: new Date()
    });
    await consultation.save();

    const updatedConsultation = await Consultation.findById(consultation._id)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');
    
    res.json({ 
      success: true, 
      message: 'Consultation started',
      consultation: updatedConsultation 
    });
  } catch (error) {
    console.error('Start consultation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    End consultation
// @route   PUT /api/consultations/:consultationId/end
// @access  Private
exports.endConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { notes, symptoms, diagnosis } = req.body;
    
    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Verify authorization
    const isAuthorized =
      consultation.patient.toString() === req.user._id.toString() ||
      consultation.doctor.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Calculate duration
    const startTime = new Date(consultation.startTime || Date.now());
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 60000); // minutes
    
    consultation.status = 'completed';
    consultation.endTime = endTime;
    consultation.duration = duration;
    if (notes) consultation.notes = notes;
    if (symptoms) consultation.symptoms = symptoms;
    if (diagnosis) consultation.diagnosis = diagnosis;

    // Update participant left time
    const participant = consultation.participants.find(
      p => p.user.toString() === req.user._id.toString() && !p.leftAt
    );
    if (participant) {
      participant.leftAt = new Date();
    }

    await consultation.save();
    
    // Update appointment status
    await Appointment.findByIdAndUpdate(consultation.appointment, {
      status: 'completed'
    });

    // Notify participants
    await Notification.create({
      user: consultation.patient,
      type: 'CONSULTATION_COMPLETED',
      title: 'Consultation Completed',
      message: `Your video consultation has ended. Duration: ${duration} minutes.`,
      relatedConsultation: consultation._id,
      priority: 'medium'
    });

    await Notification.create({
      user: consultation.doctor,
      type: 'CONSULTATION_COMPLETED',
      title: 'Consultation Completed',
      message: `Video consultation has ended. Duration: ${duration} minutes.`,
      relatedConsultation: consultation._id,
      priority: 'medium'
    });

    const updatedConsultation = await Consultation.findById(consultation._id)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization')
      .populate('appointment');
    
    res.json({ 
      success: true,
      message: 'Consultation ended successfully',
      consultation: updatedConsultation 
    });
  } catch (error) {
    console.error('End consultation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel consultation
// @route   PUT /api/consultations/:consultationId/cancel
// @access  Private
exports.cancelConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { reason } = req.body;

    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Verify authorization
    const isAuthorized =
      consultation.patient.toString() === req.user._id.toString() ||
      consultation.doctor.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Can only cancel scheduled or ongoing consultations
    if (consultation.status === 'completed' || consultation.status === 'cancelled') {
      return res.status(400).json({ 
        message: 'Cannot cancel completed or already cancelled consultation' 
      });
    }

    consultation.status = 'cancelled';
    consultation.endTime = new Date();
    if (reason) consultation.notes = reason;
    await consultation.save();

    // Notify other participant
    const otherParticipant = req.user._id.toString() === consultation.patient.toString()
      ? consultation.doctor
      : consultation.patient;

    await Notification.create({
      user: otherParticipant,
      type: 'CONSULTATION_CANCELLED',
      title: 'Consultation Cancelled',
      message: reason ? `Consultation cancelled. Reason: ${reason}` : 'Consultation has been cancelled.',
      relatedConsultation: consultation._id,
      priority: 'high'
    });

    res.json({
      success: true,
      message: 'Consultation cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel consultation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get consultation history
// @route   GET /api/consultations/history
// @access  Private
exports.getHistory = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;

    // Build query based on user role
    const query = {
      $or: [
        { patient: req.user._id },
        { doctor: req.user._id }
      ]
    };

    if (status) query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const consultations = await Consultation.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization')
      .populate('appointment')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Consultation.countDocuments(query);
    
    res.json({ 
      success: true, 
      consultations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single consultation
// @route   GET /api/consultations/:consultationId
// @access  Private
exports.getConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;

    const consultation = await Consultation.findById(consultationId)
      .populate('patient', 'name email phone age gender')
      .populate('doctor', 'name specialization')
      .populate('appointment')
      .populate('participants.user', 'name email');

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Verify authorization
    const isAuthorized =
      consultation.patient._id.toString() === req.user._id.toString() ||
      consultation.doctor._id.toString() === req.user._id.toString() ||
      req.user.role === 'ADMIN';

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      consultation
    });
  } catch (error) {
    console.error('Get consultation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add participant to consultation
// @route   POST /api/consultations/:consultationId/participants
// @access  Private
exports.addParticipant = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { userId, role } = req.body;

    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Verify authorization (only doctor can add participants)
    if (consultation.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the doctor can add participants' });
    }

    // Check if user already a participant
    const existingParticipant = consultation.participants.find(
      p => p.user.toString() === userId && !p.leftAt
    );

    if (existingParticipant) {
      return res.status(400).json({ message: 'User already in consultation' });
    }

    consultation.participants.push({
      user: userId,
      role: role || 'observer',
      joinedAt: new Date()
    });

    await consultation.save();

    res.json({
      success: true,
      message: 'Participant added successfully',
      consultation
    });
  } catch (error) {
    console.error('Add participant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove participant from consultation
// @route   DELETE /api/consultations/:consultationId/participants/:userId
// @access  Private
exports.removeParticipant = async (req, res) => {
  try {
    const { consultationId, userId } = req.params;

    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Find participant
    const participant = consultation.participants.find(
      p => p.user.toString() === userId && !p.leftAt
    );

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found in consultation' });
    }

    participant.leftAt = new Date();
    await consultation.save();

    res.json({
      success: true,
      message: 'Participant removed successfully'
    });
  } catch (error) {
    console.error('Remove participant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add chat message
// @route   POST /api/consultations/:consultationId/messages
// @access  Private
exports.addChatMessage = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Verify authorization
    const isAuthorized =
      consultation.patient.toString() === req.user._id.toString() ||
      consultation.doctor.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    consultation.chatMessages.push({
      sender: req.user._id,
      message,
      timestamp: new Date()
    });

    await consultation.save();

    const updatedConsultation = await Consultation.findById(consultation._id)
      .populate('chatMessages.sender', 'name');

    res.json({
      success: true,
      message: 'Message added',
      chatMessages: updatedConsultation.chatMessages
    });
  } catch (error) {
    console.error('Add chat message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get chat messages
// @route   GET /api/consultations/:consultationId/messages
// @access  Private
exports.getChatMessages = async (req, res) => {
  try {
    const { consultationId } = req.params;

    const consultation = await Consultation.findById(consultationId)
      .populate('chatMessages.sender', 'name email');

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Verify authorization
    const isAuthorized =
      consultation.patient.toString() === req.user._id.toString() ||
      consultation.doctor.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      chatMessages: consultation.chatMessages
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update consultation quality metrics
// @route   PUT /api/consultations/:consultationId/quality
// @access  Private
exports.updateQualityMetrics = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { videoQuality, audioQuality, connectionStability } = req.body;

    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Verify authorization
    const isAuthorized =
      consultation.patient.toString() === req.user._id.toString() ||
      consultation.doctor.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (videoQuality) consultation.qualityMetrics.videoQuality = videoQuality;
    if (audioQuality) consultation.qualityMetrics.audioQuality = audioQuality;
    if (connectionStability) consultation.qualityMetrics.connectionStability = connectionStability;

    await consultation.save();

    res.json({
      success: true,
      message: 'Quality metrics updated',
      qualityMetrics: consultation.qualityMetrics
    });
  } catch (error) {
    console.error('Update quality metrics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add consultation feedback
// @route   POST /api/consultations/:consultationId/feedback
// @access  Private
exports.addFeedback = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Verify authorization
    const isAuthorized =
      consultation.patient.toString() === req.user._id.toString() ||
      consultation.doctor.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if completed
    if (consultation.status !== 'completed') {
      return res.status(400).json({ message: 'Can only add feedback to completed consultations' });
    }

    consultation.feedback.push({
      user: req.user._id,
      rating,
      comment,
      createdAt: new Date()
    });

    await consultation.save();

    const updatedConsultation = await Consultation.findById(consultation._id)
      .populate('feedback.user', 'name');

    res.json({
      success: true,
      message: 'Feedback added successfully',
      feedback: updatedConsultation.feedback
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get consultation statistics
// @route   GET /api/consultations/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build query based on user role
    const query = {};
    if (req.user.role === 'DOCTOR') {
      query.doctor = req.user._id;
    } else if (req.user.role === 'PATIENT') {
      query.patient = req.user._id;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [
      totalStats,
      statusBreakdown,
      platformBreakdown,
      averageDuration,
      averageRating
    ] = await Promise.all([
      // Total statistics
      Consultation.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
            }
          }
        }
      ]),
      // Status breakdown
      Consultation.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      // Platform breakdown
      Consultation.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$platform',
            count: { $sum: 1 }
          }
        }
      ]),
      // Average duration
      Consultation.aggregate([
        {
          $match: {
            ...query,
            status: 'completed',
            duration: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: '$duration' }
          }
        }
      ]),
      // Average rating
      Consultation.aggregate([
        {
          $match: {
            ...query,
            'feedback.0': { $exists: true }
          }
        },
        { $unwind: '$feedback' },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$feedback.rating' }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        overview: totalStats[0] || { total: 0, completed: 0, cancelled: 0 },
        statusBreakdown,
        platformBreakdown,
        averageDuration: averageDuration[0]?.avgDuration || 0,
        averageRating: averageRating[0]?.avgRating || 0
      }
    });
  } catch (error) {
    console.error('Get consultation stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};