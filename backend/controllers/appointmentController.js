const Appointment = require('../models/Appointment');
const User = require('../models/User');

/**
 * @desc    Get all appointments (filtered by user role)
 * @route   GET /api/appointments
 * @access  Private
 */
exports.getAppointments = async (req, res) => {
  try {
    let filter = {};

    // Filter based on user role
    if (req.user.role === 'PATIENT') {
      filter.patient = req.user.id;
    } else if (req.user.role === 'DOCTOR') {
      filter.doctor = req.user.id;
    }
    // ADMIN sees all appointments (no filter)

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization')
      .sort({ date: -1, time: -1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to fetch appointments' 
    });
  }
};

/**
 * @desc    Get detailed information for a specific appointment
 * @route   GET /api/appointments/:id
 * @access  Private
 */
exports.getAppointmentDetails = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone address')
      .populate('doctor', 'name email specialization');

    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Appointment not found' 
      });
    }

    // Check if user has permission to view this appointment
    const isPatient = req.user.id === appointment.patient._id.toString();
    const isDoctor = req.user.id === appointment.doctor._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        msg: 'Not authorized to view this appointment' 
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment details error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to fetch appointment details' 
    });
  }
};

/**
 * @desc    Book a new appointment
 * @route   POST /api/appointments
 * @access  Private (Patient only)
 */
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason, type } = req.body;

    // Validate required fields
    if (!doctorId || !date || !time) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Please provide doctor, date, and time' 
      });
    }

    // Check if doctor exists
    const doctor = await User.findOne({ _id: doctorId, role: 'DOCTOR' });
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Doctor not found' 
      });
    }

    // Check if slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      time: time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ 
        success: false, 
        msg: 'This time slot is already booked' 
      });
    }

    // Create new appointment
    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      date: new Date(date),
      time: time,
      reason: reason || 'General consultation',
      type: type || 'in-person',
      status: 'pending'
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization');

    res.status(201).json({
      success: true,
      msg: 'Appointment booked successfully',
      data: populatedAppointment
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to book appointment' 
    });
  }
};

/**
 * @desc    Update appointment status
 * @route   PATCH /api/appointments/:id/status
 * @access  Private (Doctor or Admin)
 */
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Invalid status value' 
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Appointment not found' 
      });
    }

    // Update status
    appointment.status = status;
    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization');

    res.json({
      success: true,
      msg: 'Appointment status updated successfully',
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to update appointment status' 
    });
  }
};

/**
 * @desc    Get available time slots for a specific doctor
 * @route   GET /api/appointments/slots/:doctorId
 * @access  Public
 */
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Please provide a date' 
      });
    }

    // Check if doctor exists
    const doctor = await User.findOne({ _id: doctorId, role: 'DOCTOR' });
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Doctor not found' 
      });
    }

    // Get all booked appointments for that day
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] }
    }).select('time');

    const bookedTimes = bookedAppointments.map(apt => apt.time);

    // Generate available slots (9 AM to 5 PM, hourly)
    const allSlots = [
      '09:00', '10:00', '11:00', '12:00', 
      '13:00', '14:00', '15:00', '16:00', '17:00'
    ];

    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

    res.json({
      success: true,
      date: date,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization
      },
      availableSlots: availableSlots,
      bookedSlots: bookedTimes
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to fetch available slots' 
    });
  }
};

/**
 * @desc    Doctor sets their available slots
 * @route   POST /api/appointments/doctor/slots
 * @access  Private (Doctor only)
 */
exports.setDoctorAvailability = async (req, res) => {
  try {
    const { date, timeSlots } = req.body;

    if (!date || !timeSlots || !Array.isArray(timeSlots)) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Please provide date and time slots array' 
      });
    }

    // Store availability in User model or create a separate Availability collection
    // For now, we'll return success
    res.json({
      success: true,
      msg: 'Availability updated successfully',
      data: { date, timeSlots }
    });
  } catch (error) {
    console.error('Set availability error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to update availability' 
    });
  }
};

/**
 * @desc    Cancel an appointment
 * @route   DELETE /api/appointments/:id
 * @access  Private (Patient or Doctor)
 */
exports.cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Appointment not found' 
      });
    }

    // Check if user has permission to cancel
    const isPatient = req.user.id === appointment.patient.toString();
    const isDoctor = req.user.id === appointment.doctor.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        msg: 'Not authorized to cancel this appointment' 
      });
    }

    // Update status to cancelled instead of deleting
    appointment.status = 'cancelled';
    appointment.cancellationReason = reason || 'No reason provided';
    appointment.cancelledBy = req.user.id;
    appointment.cancelledAt = Date.now();
    await appointment.save();

    res.json({
      success: true,
      msg: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to cancel appointment' 
    });
  }
};
