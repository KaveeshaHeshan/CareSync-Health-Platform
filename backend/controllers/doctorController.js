const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const LabResult = require('../models/LabResult');
const Payment = require('../models/Payment');
const Consultation = require('../models/Consultation');
const Notification = require('../models/Notification');

/**
 * Doctor Controller
 * Handles doctor-specific operations, patient management, and medical workflows
 */

// @desc    Get doctor dashboard data
// @route   GET /api/doctors/dashboard
// @access  Private (Doctor)
exports.getDashboard = async (req, res) => {
  try {
    const doctorId = req.user.id;

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: today, $lt: tomorrow },
      status: { $in: ['pending', 'confirmed'] }
    })
      .populate('patient', 'name phone age gender')
      .sort({ time: 1 });

    // Get upcoming appointments (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingAppointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: tomorrow, $lt: nextWeek },
      status: { $in: ['pending', 'confirmed'] }
    })
      .populate('patient', 'name phone age gender')
      .sort({ date: 1, time: 1 })
      .limit(10);

    // Get pending appointments needing confirmation
    const pendingAppointments = await Appointment.find({
      doctor: doctorId,
      status: 'pending',
      date: { $gte: today }
    })
      .populate('patient', 'name phone age gender')
      .sort({ date: 1, time: 1 })
      .limit(5);

    // Get recent consultations
    const recentConsultations = await Consultation.find({
      doctor: doctorId,
      status: 'completed'
    })
      .populate('patient', 'name age gender')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get unread notifications
    const unreadNotifications = await Notification.find({
      user: doctorId,
      isRead: false
    })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get statistics
    const [totalPatients, totalAppointments, completedAppointments, totalEarnings] = await Promise.all([
      Appointment.distinct('patient', { doctor: doctorId, status: 'completed' }).then(patients => patients.length),
      Appointment.countDocuments({ doctor: doctorId }),
      Appointment.countDocuments({ doctor: doctorId, status: 'completed' }),
      Payment.aggregate([
        { $match: { doctor: doctorId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    res.json({
      success: true,
      dashboard: {
        todayAppointments,
        upcomingAppointments,
        pendingAppointments,
        recentConsultations,
        unreadNotifications,
        stats: {
          totalPatients,
          totalAppointments,
          completedAppointments,
          todayAppointmentsCount: todayAppointments.length,
          pendingAppointmentsCount: pendingAppointments.length,
          totalEarnings: totalEarnings.length > 0 ? totalEarnings[0].total : 0,
          unreadNotifications: unreadNotifications.length
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get doctor's patients list
// @route   GET /api/doctors/patients
// @access  Private (Doctor)
exports.getPatients = async (req, res) => {
  try {
    const { search } = req.query;

    // Get unique patient IDs from appointments
    let patientIds = await Appointment.distinct('patient', {
      doctor: req.user.id,
      status: 'completed'
    });

    // Build query for patients
    let patientQuery = { _id: { $in: patientIds } };

    if (search) {
      patientQuery.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }

    const patients = await User.find(patientQuery)
      .select('name email phone age gender')
      .sort({ name: 1 });

    // Get appointment count for each patient
    const patientsWithStats = await Promise.all(
      patients.map(async (patient) => {
        const appointmentCount = await Appointment.countDocuments({
          doctor: req.user.id,
          patient: patient._id,
          status: 'completed'
        });

        const lastAppointment = await Appointment.findOne({
          doctor: req.user.id,
          patient: patient._id,
          status: 'completed'
        }).sort({ date: -1 });

        return {
          ...patient.toObject(),
          appointmentCount,
          lastVisit: lastAppointment ? lastAppointment.date : null
        };
      })
    );

    res.json({
      success: true,
      count: patientsWithStats.length,
      patients: patientsWithStats
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single patient details
// @route   GET /api/doctors/patients/:id
// @access  Private (Doctor)
exports.getPatientDetails = async (req, res) => {
  try {
    const patient = await User.findById(req.params.id)
      .select('name email phone age gender createdAt');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Verify doctor has treated this patient
    const hasAppointment = await Appointment.findOne({
      doctor: req.user.id,
      patient: patient._id
    });

    if (!hasAppointment) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this patient'
      });
    }

    // Get patient's appointments with this doctor
    const appointments = await Appointment.find({
      doctor: req.user.id,
      patient: patient._id
    })
      .sort({ date: -1 })
      .limit(20);

    // Get prescriptions
    const prescriptions = await Prescription.find({
      doctor: req.user.id,
      patient: patient._id
    })
      .populate('appointment', 'date time')
      .sort({ createdAt: -1 });

    // Get lab results
    const labResults = await LabResult.find({
      doctor: req.user.id,
      patient: patient._id
    })
      .populate('appointment', 'date time')
      .sort({ testDate: -1 });

    res.json({
      success: true,
      patient: {
        ...patient.toObject(),
        appointments,
        prescriptions,
        labResults
      }
    });
  } catch (error) {
    console.error('Get patient details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create prescription for patient
// @route   POST /api/doctors/prescriptions
// @access  Private (Doctor)
exports.createPrescription = async (req, res) => {
  try {
    const { appointmentId, patientId, medications, diagnosis, notes, followUpDate } = req.body;

    // Validation
    if (!appointmentId || !patientId || !medications || medications.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide appointment, patient, and medications'
      });
    }

    // Verify appointment belongs to this doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: req.user.id,
      patient: patientId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or not authorized'
      });
    }

    // Create prescription
    const prescription = await Prescription.create({
      patient: patientId,
      doctor: req.user.id,
      appointment: appointmentId,
      medications,
      diagnosis,
      notes,
      followUpDate,
      status: 'active'
    });

    await prescription.populate('patient doctor appointment');

    // Create notification for patient
    await Notification.create({
      user: patientId,
      type: 'prescription_added',
      title: 'New Prescription Added',
      message: `Dr. ${req.user.name} has added a new prescription for you`,
      relatedPrescription: prescription._id,
      actionUrl: `/patient/prescriptions/${prescription._id}`,
      priority: 'high'
    });

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      prescription
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update prescription
// @route   PUT /api/doctors/prescriptions/:id
// @access  Private (Doctor)
exports.updatePrescription = async (req, res) => {
  try {
    let prescription = await Prescription.findOne({
      _id: req.params.id,
      doctor: req.user.id
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    const { medications, diagnosis, notes, followUpDate, status } = req.body;

    if (medications) prescription.medications = medications;
    if (diagnosis) prescription.diagnosis = diagnosis;
    if (notes) prescription.notes = notes;
    if (followUpDate) prescription.followUpDate = followUpDate;
    if (status) prescription.status = status;

    await prescription.save();
    await prescription.populate('patient appointment');

    res.json({
      success: true,
      message: 'Prescription updated successfully',
      prescription
    });
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get doctor's prescriptions
// @route   GET /api/doctors/prescriptions
// @access  Private (Doctor)
exports.getPrescriptions = async (req, res) => {
  try {
    const { status, patientId } = req.query;

    let query = { doctor: req.user.id };

    if (status) query.status = status;
    if (patientId) query.patient = patientId;

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name age gender')
      .populate('appointment', 'date time')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: prescriptions.length,
      prescriptions
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add lab result for patient
// @route   POST /api/doctors/lab-results
// @access  Private (Doctor)
exports.addLabResult = async (req, res) => {
  try {
    const {
      appointmentId,
      patientId,
      testType,
      testName,
      result,
      normalRange,
      unit,
      status,
      notes,
      labName,
      fileUrl
    } = req.body;

    // Validation
    if (!appointmentId || !patientId || !testType || !testName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide required fields'
      });
    }

    // Verify appointment belongs to this doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: req.user.id,
      patient: patientId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or not authorized'
      });
    }

    // Create lab result
    const labResult = await LabResult.create({
      patient: patientId,
      doctor: req.user.id,
      appointment: appointmentId,
      testType,
      testName,
      result,
      normalRange,
      unit,
      status: status || 'completed',
      notes,
      labName,
      testDate: new Date(),
      reportedBy: req.user.name,
      fileUrl
    });

    await labResult.populate('patient appointment');

    // Create notification for patient
    await Notification.create({
      user: patientId,
      type: 'lab_result_ready',
      title: 'Lab Result Ready',
      message: `Your ${testName} results are now available`,
      relatedLabResult: labResult._id,
      actionUrl: `/patient/lab-results/${labResult._id}`,
      priority: status === 'critical' ? 'urgent' : status === 'abnormal' ? 'high' : 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Lab result added successfully',
      labResult
    });
  } catch (error) {
    console.error('Add lab result error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get doctor's schedule/availability
// @route   GET /api/doctors/schedule
// @access  Private (Doctor)
exports.getSchedule = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = {
      doctor: req.user.id,
      status: { $in: ['pending', 'confirmed'] }
    };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name phone age gender')
      .sort({ date: 1, time: 1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get doctor's earnings/payments
// @route   GET /api/doctors/earnings
// @access  Private (Doctor)
exports.getEarnings = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    let query = { doctor: req.user.id };

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .populate('patient', 'name email')
      .populate('appointment', 'date time')
      .sort({ createdAt: -1 });

    // Calculate totals
    const totals = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      totalEarnings: 0,
      completedPayments: 0,
      pendingPayments: 0,
      failedPayments: 0
    };

    totals.forEach(item => {
      if (item._id === 'completed') {
        summary.totalEarnings = item.total;
        summary.completedPayments = item.count;
      } else if (item._id === 'pending') {
        summary.pendingPayments = item.count;
      } else if (item._id === 'failed') {
        summary.failedPayments = item.count;
      }
    });

    res.json({
      success: true,
      summary,
      count: payments.length,
      payments
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get doctor statistics
// @route   GET /api/doctors/stats
// @access  Private (Doctor)
exports.getStats = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const [
      totalPatients,
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      cancelledAppointments,
      totalPrescriptions,
      totalLabResults,
      totalConsultations,
      totalEarnings,
      thisMonthEarnings
    ] = await Promise.all([
      Appointment.distinct('patient', { doctor: doctorId, status: 'completed' }).then(p => p.length),
      Appointment.countDocuments({ doctor: doctorId }),
      Appointment.countDocuments({ doctor: doctorId, date: { $gte: new Date() }, status: { $in: ['pending', 'confirmed'] } }),
      Appointment.countDocuments({ doctor: doctorId, status: 'completed' }),
      Appointment.countDocuments({ doctor: doctorId, status: 'cancelled' }),
      Prescription.countDocuments({ doctor: doctorId }),
      LabResult.countDocuments({ doctor: doctorId }),
      Consultation.countDocuments({ doctor: doctorId, status: 'completed' }),
      Payment.aggregate([
        { $match: { doctor: doctorId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        {
          $match: {
            doctor: doctorId,
            status: 'completed',
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        patients: totalPatients,
        appointments: {
          total: totalAppointments,
          upcoming: upcomingAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments
        },
        prescriptions: totalPrescriptions,
        labResults: totalLabResults,
        consultations: totalConsultations,
        earnings: {
          total: totalEarnings.length > 0 ? totalEarnings[0].total : 0,
          thisMonth: thisMonthEarnings.length > 0 ? thisMonthEarnings[0].total : 0
        }
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

// @desc    Get doctor's consultation history
// @route   GET /api/doctors/consultations
// @access  Private (Doctor)
exports.getConsultations = async (req, res) => {
  try {
    const { status } = req.query;

    let query = { doctor: req.user.id };

    if (status) {
      query.status = status;
    }

    const consultations = await Consultation.find(query)
      .populate('patient', 'name age gender')
      .populate('appointment', 'date time reason')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: consultations.length,
      consultations
    });
  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Aliases for route compatibility
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user.id })
      .populate('patient', 'name email phone age gender')
      .sort({ date: -1 });

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

exports.getPatient = exports.getPatientDetails;
exports.addPrescription = exports.createPrescription;
exports.getAvailability = async (req, res) => {
  try {
    const doctor = await User.findById(req.user.id).select('availability schedule');
    
    res.json({
      success: true,
      availability: doctor.availability || [],
      schedule: doctor.schedule || {}
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    const doctor = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { availability } },
      { new: true, runValidators: true }
    ).select('availability');

    res.json({
      success: true,
      message: 'Availability updated successfully',
      availability: doctor.availability
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.updateSlots = async (req, res) => {
  try {
    const { slots } = req.body;

    const doctor = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { slots } },
      { new: true, runValidators: true }
    ).select('slots');

    res.json({
      success: true,
      message: 'Slots updated successfully',
      slots: doctor.slots
    });
  } catch (error) {
    console.error('Update slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getReviews = async (req, res) => {
  try {
    // For now, return an empty array since we don't have a Review model
    // You can implement this later
    res.json({
      success: true,
      count: 0,
      reviews: []
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
