const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const Prescription = require('../models/Prescription');
const LabResult = require('../models/LabResult');
const Consultation = require('../models/Consultation');
const Notification = require('../models/Notification');

// @desc    Get admin dashboard with comprehensive statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboard = async (req, res) => {
  try {
    // Get current date for today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Parallel queries for better performance
    const [
      totalUsers,
      totalDoctors,
      totalPatients,
      pendingDoctors,
      totalAppointments,
      todayAppointments,
      totalRevenue,
      todayRevenue,
      totalConsultations,
      recentUsers,
      recentAppointments
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'DOCTOR' }),
      User.countDocuments({ role: 'PATIENT' }),
      User.countDocuments({ role: 'DOCTOR', isApproved: false }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ 
        date: { $gte: today, $lt: tomorrow } 
      }),
      Payment.aggregate([
        { $match: { status: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { 
          $match: { 
            status: 'succeeded',
            createdAt: { $gte: today, $lt: tomorrow }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Consultation.countDocuments(),
      User.find()
        .select('name email role isActive isApproved createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
      Appointment.find()
        .populate('patient', 'name email')
        .populate('doctor', 'name specialization')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    // Get monthly revenue trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Appointment status breakdown
    const appointmentStats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // User registration trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.json({
      success: true,
      dashboard: {
        overview: {
          totalUsers,
          totalDoctors,
          totalPatients,
          pendingDoctors,
          totalAppointments,
          todayAppointments,
          totalRevenue: totalRevenue[0]?.total || 0,
          todayRevenue: todayRevenue[0]?.total || 0,
          totalConsultations
        },
        recentUsers,
        recentAppointments,
        monthlyRevenue,
        appointmentStats,
        userGrowth
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { role, isActive, isApproved, search, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isApproved !== undefined && role === 'DOCTOR') {
      query.isApproved = isApproved === 'true';
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get additional stats based on role
    let additionalData = {};

    if (user.role === 'DOCTOR') {
      const [appointments, prescriptions, earnings, consultations] = await Promise.all([
        Appointment.countDocuments({ doctor: user._id }),
        Prescription.countDocuments({ doctor: user._id }),
        Payment.aggregate([
          { $match: { doctor: user._id, status: 'succeeded' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Consultation.countDocuments({ doctor: user._id })
      ]);

      additionalData = {
        totalAppointments: appointments,
        totalPrescriptions: prescriptions,
        totalEarnings: earnings[0]?.total || 0,
        totalConsultations: consultations
      };
    } else if (user.role === 'PATIENT') {
      const [appointments, prescriptions, payments] = await Promise.all([
        Appointment.countDocuments({ patient: user._id }),
        Prescription.countDocuments({ patient: user._id }),
        Payment.aggregate([
          { $match: { patient: user._id, status: 'succeeded' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
      ]);

      additionalData = {
        totalAppointments: appointments,
        totalPrescriptions: prescriptions,
        totalSpent: payments[0]?.total || 0
      };
    }

    res.json({
      success: true,
      user,
      stats: additionalData
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user status (activate/deactivate)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create notification
    await Notification.create({
      user: user._id,
      type: isActive ? 'ACCOUNT_ACTIVATED' : 'ACCOUNT_SUSPENDED',
      title: isActive ? 'Account Activated' : 'Account Suspended',
      message: isActive 
        ? 'Your account has been activated by admin.'
        : 'Your account has been suspended. Please contact support.',
      priority: 'high'
    });

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve/Reject doctor
// @route   PUT /api/admin/doctors/:id/approval
// @access  Private/Admin
exports.updateDoctorApproval = async (req, res) => {
  try {
    const { isApproved, rejectionReason } = req.body;

    const doctor = await User.findOne({ 
      _id: req.params.id, 
      role: 'DOCTOR' 
    }).select('-password');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    doctor.isApproved = isApproved;
    if (isApproved) {
      doctor.isActive = true;
    }
    await doctor.save();

    // Create notification
    await Notification.create({
      user: doctor._id,
      type: isApproved ? 'DOCTOR_APPROVED' : 'DOCTOR_REJECTED',
      title: isApproved ? 'Application Approved' : 'Application Rejected',
      message: isApproved
        ? 'Congratulations! Your doctor application has been approved. You can now start accepting appointments.'
        : `Your doctor application has been rejected. Reason: ${rejectionReason || 'Not specified'}`,
      priority: 'high'
    });

    res.json({
      success: true,
      message: `Doctor ${isApproved ? 'approved' : 'rejected'} successfully`,
      doctor
    });
  } catch (error) {
    console.error('Update doctor approval error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get pending doctor approvals
// @route   GET /api/admin/doctors/pending
// @access  Private/Admin
exports.getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await User.find({
      role: 'DOCTOR',
      isApproved: false
    })
    .select('-password')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pendingDoctors.length,
      doctors: pendingDoctors
    });
  } catch (error) {
    console.error('Get pending doctors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting admins
    if (user.role === 'ADMIN') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }

    // Check if user has active appointments
    const activeAppointments = await Appointment.countDocuments({
      $or: [
        { patient: user._id, status: { $in: ['pending', 'confirmed'] } },
        { doctor: user._id, status: { $in: ['pending', 'confirmed'] } }
      ]
    });

    if (activeAppointments > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete user with active appointments. Please cancel them first.' 
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all appointments
// @route   GET /api/admin/appointments
// @access  Private/Admin
exports.getAllAppointments = async (req, res) => {
  try {
    const { status, type, date, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization fees')
      .sort({ date: -1, time: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Default to last 30 days if no dates provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Revenue analytics
    const revenueAnalytics = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Appointment analytics
    const appointmentAnalytics = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Doctor performance
    const doctorPerformance = await Appointment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$doctor',
          appointmentsCompleted: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: '$doctor' },
      {
        $lookup: {
          from: 'payments',
          let: { doctorId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$doctor', '$$doctorId'] },
                status: 'succeeded',
                createdAt: { $gte: start, $lte: end }
              }
            },
            {
              $group: {
                _id: null,
                totalEarnings: { $sum: '$amount' }
              }
            }
          ],
          as: 'earnings'
        }
      },
      {
        $project: {
          doctorId: '$_id',
          doctorName: '$doctor.name',
          specialization: '$doctor.specialization',
          appointmentsCompleted: 1,
          totalEarnings: { $ifNull: [{ $arrayElemAt: ['$earnings.totalEarnings', 0] }, 0] }
        }
      },
      { $sort: { appointmentsCompleted: -1 } },
      { $limit: 10 }
    ]);

    // Specialization demand
    const specializationDemand = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'doctor',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: '$doctor' },
      {
        $group: {
          _id: '$doctor.specialization',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // User growth
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            role: '$role'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        revenueAnalytics,
        appointmentAnalytics,
        doctorPerformance,
        specializationDemand,
        userGrowth
      },
      period: {
        start,
        end
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getSystemStats = async (req, res) => {
  try {
    const [
      userStats,
      appointmentStats,
      paymentStats,
      consultationStats
    ] = await Promise.all([
      // User statistics
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } }
          }
        }
      ]),
      // Appointment statistics
      Appointment.aggregate([
        {
          $facet: {
            byStatus: [
              { $group: { _id: '$status', count: { $sum: 1 } } }
            ],
            byType: [
              { $group: { _id: '$type', count: { $sum: 1 } } }
            ],
            total: [
              { $count: 'count' }
            ]
          }
        }
      ]),
      // Payment statistics
      Payment.aggregate([
        {
          $facet: {
            byStatus: [
              { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } }
            ],
            total: [
              { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$amount' } } }
            ]
          }
        }
      ]),
      // Consultation statistics
      Consultation.aggregate([
        {
          $facet: {
            byStatus: [
              { $group: { _id: '$status', count: { $sum: 1 } } }
            ],
            totalDuration: [
              { $group: { _id: null, total: { $sum: '$duration' } } }
            ]
          }
        }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        users: userStats,
        appointments: appointmentStats[0],
        payments: paymentStats[0],
        consultations: consultationStats[0]
      }
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send notification to users
// @route   POST /api/admin/notifications/send
// @access  Private/Admin
exports.sendNotification = async (req, res) => {
  try {
    const { userIds, role, title, message, priority } = req.body;

    // Validation
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    let targetUsers = [];

    if (userIds && userIds.length > 0) {
      // Send to specific users
      targetUsers = userIds;
    } else if (role) {
      // Send to all users of a role
      const users = await User.find({ role }).select('_id');
      targetUsers = users.map(user => user._id);
    } else {
      return res.status(400).json({ message: 'Either userIds or role must be provided' });
    }

    // Create notifications for all target users
    const notifications = targetUsers.map(userId => ({
      user: userId,
      type: 'GENERAL',
      title,
      message,
      priority: priority || 'medium'
    }));

    await Notification.insertMany(notifications);

    res.json({
      success: true,
      message: `Notification sent to ${notifications.length} users`,
      count: notifications.length
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
