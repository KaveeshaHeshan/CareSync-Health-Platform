const LabResult = require('../models/LabResult');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

// @desc    Get lab dashboard
// @route   GET /api/lab/dashboard
// @access  Private/Lab
exports.getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Parallel queries for dashboard data
    const [
      totalTests,
      pendingTests,
      completedTests,
      todayTests,
      recentTests,
      criticalResults,
      testsByStatus
    ] = await Promise.all([
      LabResult.countDocuments(),
      LabResult.countDocuments({ status: 'pending' }),
      LabResult.countDocuments({ status: 'completed' }),
      LabResult.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow }
      }),
      LabResult.find()
        .populate('patient', 'name email phone')
        .populate('doctor', 'name specialization')
        .sort({ createdAt: -1 })
        .limit(10),
      LabResult.countDocuments({
        status: 'completed',
        isCritical: true,
        isAcknowledged: false
      }),
      LabResult.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Test type distribution
    const testTypeStats = await LabResult.aggregate([
      {
        $group: {
          _id: '$testType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      dashboard: {
        overview: {
          totalTests,
          pendingTests,
          completedTests,
          todayTests,
          criticalResults
        },
        testsByStatus,
        testTypeStats,
        recentTests
      }
    });
  } catch (error) {
    console.error('Get lab dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all lab test requests
// @route   GET /api/lab/tests
// @access  Private/Lab
exports.getAllTests = async (req, res) => {
  try {
    const {
      status,
      testType,
      isCritical,
      isAbnormal,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (testType) query.testType = testType;
    if (isCritical !== undefined) query.isCritical = isCritical === 'true';
    if (isAbnormal !== undefined) query.isAbnormal = isAbnormal === 'true';

    if (startDate || endDate) {
      query.testDate = {};
      if (startDate) query.testDate.$gte = new Date(startDate);
      if (endDate) query.testDate.$lte = new Date(endDate);
    }

    // Get tests with populated fields
    let testsQuery = LabResult.find(query)
      .populate('patient', 'name email phone age gender')
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

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

    const tests = await testsQuery;
    const total = await LabResult.countDocuments(query);

    res.json({
      success: true,
      tests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all tests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single lab test
// @route   GET /api/lab/tests/:id
// @access  Private/Lab
exports.getTest = async (req, res) => {
  try {
    const test = await LabResult.findById(req.params.id)
      .populate('patient', 'name email phone age gender')
      .populate('doctor', 'name specialization')
      .populate('uploadedBy', 'name email');

    if (!test) {
      return res.status(404).json({ message: 'Lab test not found' });
    }

    res.json({
      success: true,
      test
    });
  } catch (error) {
    console.error('Get test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create lab test request
// @route   POST /api/lab/tests
// @access  Private/Lab
exports.createTest = async (req, res) => {
  try {
    const {
      patient,
      doctor,
      testType,
      testDate,
      description,
      urgency
    } = req.body;

    // Validation
    if (!patient || !testType || !testDate) {
      return res.status(400).json({
        message: 'Patient, test type, and test date are required'
      });
    }

    // Verify patient exists
    const patientUser = await User.findById(patient);
    if (!patientUser || patientUser.role !== 'PATIENT') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Verify doctor exists if provided
    if (doctor) {
      const doctorUser = await User.findById(doctor);
      if (!doctorUser || doctorUser.role !== 'DOCTOR') {
        return res.status(404).json({ message: 'Doctor not found' });
      }
    }

    // Create lab test
    const labTest = await LabResult.create({
      patient,
      doctor,
      testType,
      testDate,
      description,
      urgency: urgency || 'routine',
      status: 'pending',
      uploadedBy: req.user._id
    });

    // Create notification for patient
    await Notification.create({
      user: patient,
      type: 'LAB_TEST_ORDERED',
      title: 'New Lab Test Scheduled',
      message: `A ${testType} test has been scheduled for ${new Date(testDate).toLocaleDateString()}.`,
      relatedLabResult: labTest._id,
      priority: urgency === 'urgent' ? 'high' : 'medium'
    });

    // Notify doctor if assigned
    if (doctor) {
      await Notification.create({
        user: doctor,
        type: 'LAB_TEST_ORDERED',
        title: 'Lab Test Ordered',
        message: `A ${testType} test has been ordered for patient ${patientUser.name}.`,
        relatedLabResult: labTest._id,
        priority: 'medium'
      });
    }

    const populatedTest = await LabResult.findById(labTest._id)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');

    res.status(201).json({
      success: true,
      message: 'Lab test created successfully',
      test: populatedTest
    });
  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update lab test result
// @route   PUT /api/lab/tests/:id
// @access  Private/Lab
exports.updateTest = async (req, res) => {
  try {
    const {
      results,
      interpretation,
      isCritical,
      isAbnormal,
      notes,
      fileUrl,
      status
    } = req.body;

    const test = await LabResult.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ message: 'Lab test not found' });
    }

    // Update fields
    if (results) test.results = results;
    if (interpretation) test.interpretation = interpretation;
    if (isCritical !== undefined) test.isCritical = isCritical;
    if (isAbnormal !== undefined) test.isAbnormal = isAbnormal;
    if (notes) test.notes = notes;
    if (fileUrl) test.fileUrl = fileUrl;
    if (status) test.status = status;

    // If completing the test
    if (status === 'completed' && test.status !== 'completed') {
      test.completedDate = new Date();

      // Determine notification priority based on result criticality
      let priority = 'medium';
      let notificationType = 'LAB_RESULT_READY';

      if (isCritical) {
        priority = 'urgent';
        notificationType = 'LAB_RESULT_CRITICAL';
      } else if (isAbnormal) {
        priority = 'high';
        notificationType = 'LAB_RESULT_ABNORMAL';
      }

      // Notify patient
      await Notification.create({
        user: test.patient,
        type: notificationType,
        title: isCritical ? '⚠️ Critical Lab Result' : 'Lab Result Ready',
        message: isCritical
          ? `Your ${test.testType} results are ready and require immediate attention.`
          : `Your ${test.testType} results are now available.`,
        relatedLabResult: test._id,
        priority
      });

      // Notify doctor if assigned
      if (test.doctor) {
        await Notification.create({
          user: test.doctor,
          type: notificationType,
          title: isCritical ? '⚠️ Critical Lab Result' : 'Lab Result Ready',
          message: isCritical
            ? `Critical ${test.testType} results available for your patient.`
            : `${test.testType} results are ready for your patient.`,
          relatedLabResult: test._id,
          priority
        });
      }
    }

    test.uploadedBy = req.user._id;
    await test.save();

    const updatedTest = await LabResult.findById(test._id)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');

    res.json({
      success: true,
      message: 'Lab test updated successfully',
      test: updatedTest
    });
  } catch (error) {
    console.error('Update test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload lab result file
// @route   POST /api/lab/tests/:id/upload
// @access  Private/Lab
exports.uploadResultFile = async (req, res) => {
  try {
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ message: 'File URL is required' });
    }

    const test = await LabResult.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ message: 'Lab test not found' });
    }

    test.fileUrl = fileUrl;
    test.uploadedBy = req.user._id;
    await test.save();

    res.json({
      success: true,
      message: 'File uploaded successfully',
      test
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark critical result as acknowledged
// @route   PUT /api/lab/tests/:id/acknowledge
// @access  Private/Lab
exports.acknowledgeResult = async (req, res) => {
  try {
    const test = await LabResult.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ message: 'Lab test not found' });
    }

    test.isAcknowledged = true;
    test.acknowledgedBy = req.user._id;
    test.acknowledgedDate = new Date();
    await test.save();

    res.json({
      success: true,
      message: 'Result acknowledged successfully',
      test
    });
  } catch (error) {
    console.error('Acknowledge result error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete lab test
// @route   DELETE /api/lab/tests/:id
// @access  Private/Lab/Admin
exports.deleteTest = async (req, res) => {
  try {
    const test = await LabResult.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ message: 'Lab test not found' });
    }

    // Only allow deletion of pending tests
    if (test.status !== 'pending') {
      return res.status(400).json({
        message: 'Cannot delete lab test with completed or processing status'
      });
    }

    await LabResult.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Lab test deleted successfully'
    });
  } catch (error) {
    console.error('Delete test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get lab statistics
// @route   GET /api/lab/stats
// @access  Private/Lab
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
      testTypeBreakdown,
      urgencyBreakdown,
      dailyVolume
    ] = await Promise.all([
      // Total statistics
      LabResult.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            critical: {
              $sum: { $cond: ['$isCritical', 1, 0] }
            },
            abnormal: {
              $sum: { $cond: ['$isAbnormal', 1, 0] }
            }
          }
        }
      ]),
      // Status breakdown
      LabResult.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      // Test type breakdown
      LabResult.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$testType',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      // Urgency breakdown
      LabResult.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$urgency',
            count: { $sum: 1 }
          }
        }
      ]),
      // Daily test volume (last 30 days)
      LabResult.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
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
      ])
    ]);

    // Average turnaround time for completed tests
    const turnaroundTime = await LabResult.aggregate([
      {
        $match: {
          ...dateFilter,
          status: 'completed',
          completedDate: { $exists: true }
        }
      },
      {
        $project: {
          turnaroundDays: {
            $divide: [
              { $subtract: ['$completedDate', '$testDate'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTurnaroundDays: { $avg: '$turnaroundDays' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        overview: totalStats[0] || {
          total: 0,
          completed: 0,
          pending: 0,
          critical: 0,
          abnormal: 0
        },
        statusBreakdown,
        testTypeBreakdown,
        urgencyBreakdown,
        dailyVolume,
        avgTurnaroundDays: turnaroundTime[0]?.avgTurnaroundDays || 0
      }
    });
  } catch (error) {
    console.error('Get lab stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get pending tests
// @route   GET /api/lab/tests/pending
// @access  Private/Lab
exports.getPendingTests = async (req, res) => {
  try {
    const pendingTests = await LabResult.find({ status: 'pending' })
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization')
      .sort({ urgency: -1, createdAt: 1 });

    res.json({
      success: true,
      count: pendingTests.length,
      tests: pendingTests
    });
  } catch (error) {
    console.error('Get pending tests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get critical results
// @route   GET /api/lab/tests/critical
// @access  Private/Lab
exports.getCriticalResults = async (req, res) => {
  try {
    const criticalResults = await LabResult.find({
      status: 'completed',
      isCritical: true,
      isAcknowledged: false
    })
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization')
      .sort({ completedDate: -1 });

    res.json({
      success: true,
      count: criticalResults.length,
      tests: criticalResults
    });
  } catch (error) {
    console.error('Get critical results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get test types catalog
// @route   GET /api/lab/test-types
// @access  Private/Lab
exports.getTestTypes = async (req, res) => {
  try {
    // Common lab test types
    const testTypes = [
      {
        name: 'Complete Blood Count (CBC)',
        category: 'Hematology',
        description: 'Measures different components of blood',
        turnaroundTime: '24 hours'
      },
      {
        name: 'Basic Metabolic Panel',
        category: 'Chemistry',
        description: 'Tests kidney function, blood sugar, and electrolyte balance',
        turnaroundTime: '24 hours'
      },
      {
        name: 'Lipid Panel',
        category: 'Chemistry',
        description: 'Measures cholesterol and triglycerides',
        turnaroundTime: '24 hours'
      },
      {
        name: 'Liver Function Test',
        category: 'Chemistry',
        description: 'Evaluates liver health',
        turnaroundTime: '24 hours'
      },
      {
        name: 'Thyroid Function Test',
        category: 'Endocrinology',
        description: 'Measures thyroid hormone levels',
        turnaroundTime: '48 hours'
      },
      {
        name: 'Urinalysis',
        category: 'Urinalysis',
        description: 'Analyzes urine for various conditions',
        turnaroundTime: '24 hours'
      },
      {
        name: 'HbA1c',
        category: 'Diabetes',
        description: 'Measures average blood sugar over 3 months',
        turnaroundTime: '24 hours'
      },
      {
        name: 'Vitamin D',
        category: 'Vitamins',
        description: 'Measures vitamin D levels',
        turnaroundTime: '48 hours'
      },
      {
        name: 'COVID-19 PCR',
        category: 'Infectious Disease',
        description: 'Detects COVID-19 virus',
        turnaroundTime: '24-48 hours'
      },
      {
        name: 'X-Ray',
        category: 'Imaging',
        description: 'Medical imaging',
        turnaroundTime: '2-4 hours'
      }
    ];

    // Get usage statistics for each test type
    const usageStats = await LabResult.aggregate([
      {
        $group: {
          _id: '$testType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Merge usage stats with test types
    const testTypesWithStats = testTypes.map(test => {
      const stats = usageStats.find(s => s._id === test.name);
      return {
        ...test,
        totalOrdered: stats ? stats.count : 0
      };
    });

    res.json({
      success: true,
      testTypes: testTypesWithStats
    });
  } catch (error) {
    console.error('Get test types error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
