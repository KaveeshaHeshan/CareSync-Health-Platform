const Prescription = require('../models/Prescription');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

// @desc    Get pharmacy dashboard
// @route   GET /api/pharmacy/dashboard
// @access  Private/Pharmacy
exports.getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Parallel queries for dashboard data
    const [
      totalPrescriptions,
      pendingPrescriptions,
      dispensedPrescriptions,
      todayPrescriptions,
      recentPrescriptions,
      prescriptionsByStatus
    ] = await Promise.all([
      Prescription.countDocuments(),
      Prescription.countDocuments({ status: 'active' }),
      Prescription.countDocuments({ status: 'dispensed' }),
      Prescription.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow }
      }),
      Prescription.find()
        .populate('patient', 'name email phone')
        .populate('doctor', 'name specialization')
        .sort({ createdAt: -1 })
        .limit(10),
      Prescription.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Medication statistics
    const medicationStats = await Prescription.aggregate([
      { $unwind: '$medications' },
      {
        $group: {
          _id: '$medications.name',
          totalQuantity: { $sum: { $toInt: '$medications.quantity' } },
          prescriptionCount: { $sum: 1 }
        }
      },
      { $sort: { prescriptionCount: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      dashboard: {
        overview: {
          totalPrescriptions,
          pendingPrescriptions,
          dispensedPrescriptions,
          todayPrescriptions
        },
        prescriptionsByStatus,
        medicationStats,
        recentPrescriptions
      }
    });
  } catch (error) {
    console.error('Get pharmacy dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all prescriptions
// @route   GET /api/pharmacy/prescriptions
// @access  Private/Pharmacy
exports.getAllPrescriptions = async (req, res) => {
  try {
    const {
      status,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Add search filter if provided
    if (search) {
      const patients = await User.find({
        role: 'PATIENT',
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      query.patient = { $in: patients.map(p => p._id) };
    }

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name email phone age gender')
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Prescription.countDocuments(query);

    res.json({
      success: true,
      prescriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all prescriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single prescription
// @route   GET /api/pharmacy/prescriptions/:id
// @access  Private/Pharmacy
exports.getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name email phone age gender')
      .populate('doctor', 'name specialization')
      .populate('appointment');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json({
      success: true,
      prescription
    });
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark prescription as dispensed
// @route   PUT /api/pharmacy/prescriptions/:id/dispense
// @access  Private/Pharmacy
exports.dispensePrescription = async (req, res) => {
  try {
    const { notes, dispensedBy } = req.body;

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (prescription.status !== 'active') {
      return res.status(400).json({
        message: 'Only active prescriptions can be dispensed'
      });
    }

    prescription.status = 'dispensed';
    prescription.dispensedDate = new Date();
    prescription.dispensedBy = dispensedBy || req.user.name;
    if (notes) prescription.pharmacyNotes = notes;

    await prescription.save();

    // Notify patient
    await Notification.create({
      user: prescription.patient,
      type: 'PRESCRIPTION_DISPENSED',
      title: 'Prescription Dispensed',
      message: 'Your prescription has been dispensed and is ready for pickup.',
      relatedPrescription: prescription._id,
      priority: 'medium'
    });

    // Notify doctor
    await Notification.create({
      user: prescription.doctor,
      type: 'PRESCRIPTION_DISPENSED',
      title: 'Prescription Dispensed',
      message: `Prescription for patient ${prescription.patient.name} has been dispensed.`,
      relatedPrescription: prescription._id,
      priority: 'low'
    });

    const updatedPrescription = await Prescription.findById(prescription._id)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');

    res.json({
      success: true,
      message: 'Prescription dispensed successfully',
      prescription: updatedPrescription
    });
  } catch (error) {
    console.error('Dispense prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark prescription as completed
// @route   PUT /api/pharmacy/prescriptions/:id/complete
// @access  Private/Pharmacy
exports.completePrescription = async (req, res) => {
  try {
    const { notes } = req.body;

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    prescription.status = 'completed';
    if (notes) prescription.pharmacyNotes = notes;

    await prescription.save();

    const updatedPrescription = await Prescription.findById(prescription._id)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');

    res.json({
      success: true,
      message: 'Prescription completed successfully',
      prescription: updatedPrescription
    });
  } catch (error) {
    console.error('Complete prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel prescription
// @route   PUT /api/pharmacy/prescriptions/:id/cancel
// @access  Private/Pharmacy
exports.cancelPrescription = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Cancellation reason is required' });
    }

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (prescription.status === 'completed') {
      return res.status(400).json({
        message: 'Cannot cancel completed prescription'
      });
    }

    prescription.status = 'cancelled';
    prescription.pharmacyNotes = reason;

    await prescription.save();

    // Notify patient
    await Notification.create({
      user: prescription.patient,
      type: 'PRESCRIPTION_CANCELLED',
      title: 'Prescription Cancelled',
      message: `Your prescription has been cancelled. Reason: ${reason}`,
      relatedPrescription: prescription._id,
      priority: 'high'
    });

    // Notify doctor
    await Notification.create({
      user: prescription.doctor,
      type: 'PRESCRIPTION_CANCELLED',
      title: 'Prescription Cancelled',
      message: `Prescription for patient ${prescription.patient.name} has been cancelled.`,
      relatedPrescription: prescription._id,
      priority: 'medium'
    });

    const updatedPrescription = await Prescription.findById(prescription._id)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');

    res.json({
      success: true,
      message: 'Prescription cancelled successfully',
      prescription: updatedPrescription
    });
  } catch (error) {
    console.error('Cancel prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add pharmacy notes
// @route   PUT /api/pharmacy/prescriptions/:id/notes
// @access  Private/Pharmacy
exports.addNotes = async (req, res) => {
  try {
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({ message: 'Notes are required' });
    }

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    prescription.pharmacyNotes = notes;
    await prescription.save();

    res.json({
      success: true,
      message: 'Notes added successfully',
      prescription
    });
  } catch (error) {
    console.error('Add notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get active prescriptions
// @route   GET /api/pharmacy/prescriptions/active
// @access  Private/Pharmacy
exports.getActivePrescriptions = async (req, res) => {
  try {
    const activePrescriptions = await Prescription.find({ status: 'active' })
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: activePrescriptions.length,
      prescriptions: activePrescriptions
    });
  } catch (error) {
    console.error('Get active prescriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search medications
// @route   GET /api/pharmacy/medications/search
// @access  Private/Pharmacy
exports.searchMedications = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Search in prescriptions for medications
    const prescriptions = await Prescription.aggregate([
      { $unwind: '$medications' },
      {
        $match: {
          'medications.name': { $regex: query, $options: 'i' }
        }
      },
      {
        $group: {
          _id: '$medications.name',
          totalPrescriptions: { $sum: 1 },
          commonDosage: { $first: '$medications.dosage' },
          commonFrequency: { $first: '$medications.frequency' }
        }
      },
      { $sort: { totalPrescriptions: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      success: true,
      medications: prescriptions
    });
  } catch (error) {
    console.error('Search medications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get pharmacy statistics
// @route   GET /api/pharmacy/stats
// @access  Private/Pharmacy
exports.getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const [
      totalStats,
      statusBreakdown,
      topMedications,
      dailyDispensed
    ] = await Promise.all([
      // Total statistics
      Prescription.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            dispensed: {
              $sum: { $cond: [{ $eq: ['$status', 'dispensed'] }, 1, 0] }
            },
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
      Prescription.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      // Top medications
      Prescription.aggregate([
        { $match: dateFilter },
        { $unwind: '$medications' },
        {
          $group: {
            _id: '$medications.name',
            count: { $sum: 1 },
            totalQuantity: { $sum: { $toInt: '$medications.quantity' } }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 15 }
      ]),
      // Daily dispensed (last 30 days)
      Prescription.aggregate([
        {
          $match: {
            status: 'dispensed',
            dispensedDate: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$dispensedDate' } }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        overview: totalStats[0] || {
          total: 0,
          active: 0,
          dispensed: 0,
          completed: 0,
          cancelled: 0
        },
        statusBreakdown,
        topMedications,
        dailyDispensed
      }
    });
  } catch (error) {
    console.error('Get pharmacy stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify prescription
// @route   POST /api/pharmacy/prescriptions/:id/verify
// @access  Private/Pharmacy
exports.verifyPrescription = async (req, res) => {
  try {
    const { verified, verificationNotes } = req.body;

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    prescription.isVerified = verified;
    prescription.verificationDate = new Date();
    prescription.verifiedBy = req.user.name;
    if (verificationNotes) {
      prescription.pharmacyNotes = verificationNotes;
    }

    await prescription.save();

    res.json({
      success: true,
      message: verified ? 'Prescription verified successfully' : 'Prescription verification failed',
      prescription
    });
  } catch (error) {
    console.error('Verify prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};