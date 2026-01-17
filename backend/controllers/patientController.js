const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const LabResult = require('../models/LabResult');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

/**
 * Patient Controller
 * Handles patient-specific operations and data retrieval
 */

// @desc    Get patient dashboard data
// @route   GET /api/patients/dashboard
// @access  Private (Patient)
exports.getDashboard = async (req, res) => {
  try {
    const patientId = req.user.id;

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.find({
      patient: patientId,
      date: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    })
      .populate('doctor', 'name specialization fees rating')
      .sort({ date: 1, time: 1 })
      .limit(5);

    // Get recent prescriptions
    const recentPrescriptions = await Prescription.find({
      patient: patientId,
      status: 'active'
    })
      .populate('doctor', 'name specialization')
      .populate('appointment')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get pending lab results
    const pendingLabResults = await LabResult.find({
      patient: patientId,
      status: { $in: ['pending', 'abnormal', 'critical'] }
    })
      .populate('appointment')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get unread notifications
    const unreadNotifications = await Notification.find({
      user: patientId,
      isRead: false
    })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get appointment statistics
    const [totalAppointments, completedAppointments, pendingPayments] = await Promise.all([
      Appointment.countDocuments({ patient: patientId }),
      Appointment.countDocuments({ patient: patientId, status: 'completed' }),
      Payment.countDocuments({ patient: patientId, status: 'pending' })
    ]);

    res.json({
      success: true,
      dashboard: {
        upcomingAppointments,
        recentPrescriptions,
        pendingLabResults,
        unreadNotifications,
        stats: {
          totalAppointments,
          completedAppointments,
          pendingPayments,
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

// @desc    Get all available doctors
// @route   GET /api/patients/doctors
// @access  Private (Patient)
exports.getDoctors = async (req, res) => {
  try {
    const { specialization, search, minRating, maxFees, sortBy } = req.query;

    // Build query
    let query = {
      role: 'DOCTOR',
      isApproved: true,
      isActive: true
    };

    // Apply filters
    if (specialization) {
      query.specialization = new RegExp(specialization, 'i');
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { specialization: new RegExp(search, 'i') }
      ];
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    if (maxFees) {
      query.fees = { $lte: parseFloat(maxFees) };
    }

    // Build sort
    let sort = {};
    if (sortBy === 'rating') {
      sort.rating = -1;
    } else if (sortBy === 'fees-low') {
      sort.fees = 1;
    } else if (sortBy === 'fees-high') {
      sort.fees = -1;
    } else if (sortBy === 'experience') {
      sort.experience = -1;
    } else {
      sort.name = 1; // Default: alphabetical
    }

    const doctors = await User.find(query)
      .select('name email phone specialization experience fees rating')
      .sort(sort);

    res.json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single doctor profile
// @route   GET /api/patients/doctors/:id
// @access  Private (Patient)
exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await User.findOne({
      _id: req.params.id,
      role: 'DOCTOR',
      isApproved: true
    }).select('name email phone specialization experience fees rating isActive');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get doctor's completed appointments count
    const completedAppointments = await Appointment.countDocuments({
      doctor: doctor._id,
      status: 'completed'
    });

    // Get recent reviews (if review system implemented)
    // This is a placeholder for future review functionality

    res.json({
      success: true,
      doctor: {
        ...doctor.toObject(),
        completedAppointments
      }
    });
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get patient's medical records
// @route   GET /api/patients/medical-records
// @access  Private (Patient)
exports.getMedicalRecords = async (req, res) => {
  try {
    const patientId = req.user.id;

    // Get all appointments with prescriptions
    const appointments = await Appointment.find({
      patient: patientId,
      status: 'completed'
    })
      .populate('doctor', 'name specialization')
      .sort({ date: -1 });

    // Get all prescriptions
    const prescriptions = await Prescription.find({
      patient: patientId
    })
      .populate('doctor', 'name specialization')
      .populate('appointment', 'date time reason')
      .sort({ createdAt: -1 });

    // Get all lab results
    const labResults = await LabResult.find({
      patient: patientId
    })
      .populate('appointment', 'date time')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      medicalRecords: {
        appointments,
        prescriptions,
        labResults
      }
    });
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get patient's prescriptions
// @route   GET /api/patients/prescriptions
// @access  Private (Patient)
exports.getPrescriptions = async (req, res) => {
  try {
    const { status } = req.query;

    let query = { patient: req.user.id };

    if (status) {
      query.status = status;
    }

    const prescriptions = await Prescription.find(query)
      .populate('doctor', 'name specialization phone')
      .populate('appointment', 'date time reason')
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

// @desc    Get single prescription
// @route   GET /api/patients/prescriptions/:id
// @access  Private (Patient)
exports.getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      patient: req.user.id
    })
      .populate('doctor', 'name specialization phone email')
      .populate('appointment', 'date time reason');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.json({
      success: true,
      prescription
    });
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get patient's lab results
// @route   GET /api/patients/lab-results
// @access  Private (Patient)
exports.getLabResults = async (req, res) => {
  try {
    const { status, testType } = req.query;

    let query = { patient: req.user.id };

    if (status) {
      query.status = status;
    }

    if (testType) {
      query.testType = testType;
    }

    const labResults = await LabResult.find(query)
      .populate('appointment', 'date time doctor')
      .populate('doctor', 'name specialization')
      .sort({ testDate: -1 });

    res.json({
      success: true,
      count: labResults.length,
      labResults
    });
  } catch (error) {
    console.error('Get lab results error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single lab result
// @route   GET /api/patients/lab-results/:id
// @access  Private (Patient)
exports.getLabResult = async (req, res) => {
  try {
    const labResult = await LabResult.findOne({
      _id: req.params.id,
      patient: req.user.id
    })
      .populate('appointment', 'date time reason')
      .populate('doctor', 'name specialization phone');

    if (!labResult) {
      return res.status(404).json({
        success: false,
        message: 'Lab result not found'
      });
    }

    res.json({
      success: true,
      labResult
    });
  } catch (error) {
    console.error('Get lab result error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get patient's payment history
// @route   GET /api/patients/payments
// @access  Private (Patient)
exports.getPayments = async (req, res) => {
  try {
    const { status } = req.query;

    let query = { patient: req.user.id };

    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate('appointment', 'date time')
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get patient's notifications
// @route   GET /api/patients/notifications
// @access  Private (Patient)
exports.getNotifications = async (req, res) => {
  try {
    const { isRead } = req.query;

    let query = { user: req.user.id };

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false
    });

    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/patients/notifications/:id/read
// @access  Private (Patient)
exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/patients/notifications/read-all
// @access  Private (Patient)
exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get patient statistics
// @route   GET /api/patients/stats
// @access  Private (Patient)
exports.getStats = async (req, res) => {
  try {
    const patientId = req.user.id;

    const [
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      cancelledAppointments,
      totalPrescriptions,
      activePrescriptions,
      totalLabResults,
      pendingLabResults,
      totalPayments,
      pendingPayments,
      totalSpent
    ] = await Promise.all([
      Appointment.countDocuments({ patient: patientId }),
      Appointment.countDocuments({ patient: patientId, date: { $gte: new Date() }, status: { $in: ['pending', 'confirmed'] } }),
      Appointment.countDocuments({ patient: patientId, status: 'completed' }),
      Appointment.countDocuments({ patient: patientId, status: 'cancelled' }),
      Prescription.countDocuments({ patient: patientId }),
      Prescription.countDocuments({ patient: patientId, status: 'active' }),
      LabResult.countDocuments({ patient: patientId }),
      LabResult.countDocuments({ patient: patientId, status: 'pending' }),
      Payment.countDocuments({ patient: patientId }),
      Payment.countDocuments({ patient: patientId, status: 'pending' }),
      Payment.aggregate([
        { $match: { patient: patientId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        appointments: {
          total: totalAppointments,
          upcoming: upcomingAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments
        },
        prescriptions: {
          total: totalPrescriptions,
          active: activePrescriptions
        },
        labResults: {
          total: totalLabResults,
          pending: pendingLabResults
        },
        payments: {
          total: totalPayments,
          pending: pendingPayments,
          totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0
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
