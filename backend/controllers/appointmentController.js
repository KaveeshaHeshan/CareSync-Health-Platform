const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Appointment Controller
 * Handles appointment booking, management, and lifecycle operations
 */

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, type, reason, notes } = req.body;

    // Validation
    if (!doctorId || !date || !time || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctor, date, time, and reason'
      });
    }

    // Verify doctor exists and is approved
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'DOCTOR') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    if (!doctor.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not approved yet'
      });
    }

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      time,
      status: { $nin: ['cancelled'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      date: new Date(date),
      time,
      type: type || 'in-person',
      reason,
      notes,
      amount: doctor.fees || 0
    });

    // Populate patient and doctor details
    await appointment.populate('patient doctor', 'name email phone specialization');

    // Create notification for doctor
    await Notification.create({
      user: doctorId,
      type: 'appointment_booked',
      title: 'New Appointment Booked',
      message: `${appointment.patient.name} has booked an appointment for ${date} at ${time}`,
      relatedAppointment: appointment._id,
      actionUrl: `/doctor/appointments`,
      priority: 'high'
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all appointments (filtered by user role)
// @route   GET /api/appointments
// @access  Private
exports.getAllAppointments = async (req, res) => {
  try {
    const { status, type, startDate, endDate } = req.query;

    // Build query based on user role
    let query = {};

    if (req.user.role === 'PATIENT') {
      query.patient = req.user.id;
    } else if (req.user.role === 'DOCTOR') {
      query.doctor = req.user.id;
    }
    // Admin can see all appointments (no filter)

    // Apply filters
    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone age gender')
      .populate('doctor', 'name email phone specialization experience fees rating')
      .sort({ date: -1, time: -1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone age gender')
      .populate('doctor', 'name email phone specialization experience fees rating');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const isAuthorized =
      req.user.role === 'ADMIN' ||
      appointment.patient._id.toString() === req.user.id ||
      appointment.doctor._id.toString() === req.user.id;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      });
    }

    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const isAuthorized =
      req.user.role === 'ADMIN' ||
      appointment.patient.toString() === req.user.id ||
      appointment.doctor.toString() === req.user.id;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    // Update allowed fields
    const { date, time, type, reason, notes, status } = req.body;

    if (date) appointment.date = new Date(date);
    if (time) appointment.time = time;
    if (type) appointment.type = type;
    if (reason) appointment.reason = reason;
    if (notes) appointment.notes = notes;
    if (status) appointment.status = status;

    await appointment.save();
    await appointment.populate('patient doctor', 'name email phone specialization');

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Confirm appointment (Doctor only)
// @route   PUT /api/appointments/:id/confirm
// @access  Private (Doctor)
exports.confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is the assigned doctor
    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned doctor can confirm this appointment'
      });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm appointment with status: ${appointment.status}`
      });
    }

    appointment.status = 'confirmed';
    await appointment.save();

    // Create notification for patient
    await Notification.create({
      user: appointment.patient._id,
      type: 'appointment_confirmed',
      title: 'Appointment Confirmed',
      message: `Your appointment on ${appointment.date.toDateString()} at ${appointment.time} has been confirmed`,
      relatedAppointment: appointment._id,
      actionUrl: `/patient/appointments`,
      priority: 'high'
    });

    res.json({
      success: true,
      message: 'Appointment confirmed successfully',
      appointment
    });
  } catch (error) {
    console.error('Confirm appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Complete appointment (Doctor only)
// @route   PUT /api/appointments/:id/complete
// @access  Private (Doctor)
exports.completeAppointment = async (req, res) => {
  try {
    const { prescription, notes } = req.body;

    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is the assigned doctor
    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned doctor can complete this appointment'
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot complete a cancelled appointment'
      });
    }

    appointment.status = 'completed';
    if (prescription) appointment.prescription = prescription;
    if (notes) appointment.notes = notes;
    
    await appointment.save();

    // Create notification for patient
    await Notification.create({
      user: appointment.patient._id,
      type: 'appointment_reminder',
      title: 'Appointment Completed',
      message: `Your appointment has been completed. ${prescription ? 'Prescription has been added.' : ''}`,
      relatedAppointment: appointment._id,
      actionUrl: `/patient/appointments/${appointment._id}`,
      priority: 'medium'
    });

    res.json({
      success: true,
      message: 'Appointment completed successfully',
      appointment
    });
  } catch (error) {
    console.error('Complete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;

    const appointment = await Appointment.findById(req.params.id)
      .populate('patient doctor', 'name email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const isAuthorized =
      appointment.patient._id.toString() === req.user.id ||
      appointment.doctor._id.toString() === req.user.id ||
      req.user.role === 'ADMIN';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed appointment'
      });
    }

    appointment.status = 'cancelled';
    if (reason) appointment.notes = `Cancelled: ${reason}`;
    
    await appointment.save();

    // Notify the other party
    const notifyUserId = req.user.id === appointment.patient._id.toString()
      ? appointment.doctor._id
      : appointment.patient._id;

    await Notification.create({
      user: notifyUserId,
      type: 'appointment_cancelled',
      title: 'Appointment Cancelled',
      message: `Appointment on ${appointment.date.toDateString()} at ${appointment.time} has been cancelled${reason ? ': ' + reason : ''}`,
      relatedAppointment: appointment._id,
      priority: 'high'
    });

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private (Admin)
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    await appointment.deleteOne();

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get available slots for a doctor
// @route   GET /api/appointments/doctor/:doctorId/slots
// @access  Public
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a date'
      });
    }

    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'DOCTOR') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get all booked slots for the date
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date: new Date(date),
      status: { $nin: ['cancelled'] }
    }).select('time');

    const bookedSlots = bookedAppointments.map(apt => apt.time);

    // Generate time slots (9 AM to 5 PM, 30-minute intervals)
    const allSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    // Filter out booked slots
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({
      success: true,
      date,
      availableSlots,
      bookedSlots
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get appointment statistics
// @route   GET /api/appointments/stats
// @access  Private (Doctor/Admin)
exports.getAppointmentStats = async (req, res) => {
  try {
    let query = {};

    // Filter by doctor if not admin
    if (req.user.role === 'DOCTOR') {
      query.doctor = req.user.id;
    }

    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      Appointment.countDocuments(query),
      Appointment.countDocuments({ ...query, status: 'pending' }),
      Appointment.countDocuments({ ...query, status: 'confirmed' }),
      Appointment.countDocuments({ ...query, status: 'completed' }),
      Appointment.countDocuments({ ...query, status: 'cancelled' })
    ]);

    res.json({
      success: true,
      stats: {
        total,
        pending,
        confirmed,
        completed,
        cancelled
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Alias for getAppointmentStats
exports.getStats = exports.getAppointmentStats;

// @desc    Get patient's appointments
// @route   GET /api/appointments/patient/:patientId
// @access  Private (Patient/Admin)
exports.getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check if user is authorized to view these appointments
    if (req.user.role === 'PATIENT' && req.user.id !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these appointments'
      });
    }

    const appointments = await Appointment.find({ patient: patientId })
      .populate('doctor', 'name specialization fees rating')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get doctor's appointments
// @route   GET /api/appointments/doctor/:doctorId
// @access  Private (Doctor/Admin)
exports.getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Check if user is authorized to view these appointments
    if (req.user.role === 'DOCTOR' && req.user.id !== doctorId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these appointments'
      });
    }

    const appointments = await Appointment.find({ doctor: doctorId })
      .populate('patient', 'name email phone age gender')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
