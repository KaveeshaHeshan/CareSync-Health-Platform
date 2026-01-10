const LabResult = require('../models/LabResult');
const User = require('../models/User');

/**
 * @desc    Get all lab results for the logged-in patient
 * @route   GET /api/lab/my-results
 * @access  Private (Patient only)
 */
exports.getPatientResults = async (req, res) => {
  try {
    const labResults = await LabResult.find({ patient: req.user.id })
      .populate('uploadedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: labResults.length,
      data: labResults
    });
  } catch (error) {
    console.error('Get patient results error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to fetch lab results' 
    });
  }
};

/**
 * @desc    Get a specific lab report by ID
 * @route   GET /api/lab/reports/:reportId
 * @access  Private
 */
exports.getReportById = async (req, res) => {
  try {
    const labResult = await LabResult.findById(req.params.reportId)
      .populate('patient', 'name email phone')
      .populate('uploadedBy', 'name role');

    if (!labResult) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Lab result not found' 
      });
    }

    // Check if user has permission to view this report
    const isPatient = req.user.id === labResult.patient._id.toString();
    const isDoctor = req.user.role === 'DOCTOR';
    const isLab = req.user.role === 'LAB';
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatient && !isDoctor && !isLab && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        msg: 'Not authorized to view this report' 
      });
    }

    res.json({
      success: true,
      data: labResult
    });
  } catch (error) {
    console.error('Get report by ID error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to fetch lab report' 
    });
  }
};

/**
 * @desc    Upload a lab result (with file)
 * @route   POST /api/lab/upload
 * @access  Private (Lab/Admin/Doctor only)
 */
exports.uploadLabResult = async (req, res) => {
  try {
    const { patientId, testType, testName, result, notes, fileUrl } = req.body;

    // Validate required fields
    if (!patientId || !testType) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Please provide patient ID and test type' 
      });
    }

    // Check if patient exists
    const patient = await User.findOne({ _id: patientId, role: 'PATIENT' });
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Patient not found' 
      });
    }

    // Create lab result
    const labResult = await LabResult.create({
      patient: patientId,
      testType: testType,
      testName: testName || testType,
      result: result || 'Pending',
      notes: notes || '',
      fileUrl: fileUrl || null,
      uploadedBy: req.user.id,
      status: 'completed'
    });

    const populatedResult = await LabResult.findById(labResult._id)
      .populate('patient', 'name email phone')
      .populate('uploadedBy', 'name role');

    res.status(201).json({
      success: true,
      msg: 'Lab result uploaded successfully',
      data: populatedResult
    });
  } catch (error) {
    console.error('Upload lab result error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to upload lab result' 
    });
  }
};

/**
 * @desc    Search for available medications or lab tests
 * @route   GET /api/lab/search
 * @access  Public
 */
exports.searchMedicalServices = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Please provide a search query' 
      });
    }

    // Mock data for common lab tests and services
    const commonTests = [
      { id: 1, name: 'Complete Blood Count (CBC)', category: 'Hematology', price: 25 },
      { id: 2, name: 'Lipid Profile', category: 'Chemistry', price: 35 },
      { id: 3, name: 'Blood Glucose', category: 'Chemistry', price: 15 },
      { id: 4, name: 'Thyroid Function Test', category: 'Endocrinology', price: 45 },
      { id: 5, name: 'Liver Function Test', category: 'Chemistry', price: 40 },
      { id: 6, name: 'Kidney Function Test', category: 'Chemistry', price: 40 },
      { id: 7, name: 'Urine Analysis', category: 'Clinical Pathology', price: 20 },
      { id: 8, name: 'X-Ray Chest', category: 'Radiology', price: 50 },
      { id: 9, name: 'ECG', category: 'Cardiology', price: 30 },
      { id: 10, name: 'Vitamin D Test', category: 'Endocrinology', price: 55 }
    ];

    // Filter based on search query
    const results = commonTests.filter(test => 
      test.name.toLowerCase().includes(q.toLowerCase()) ||
      test.category.toLowerCase().includes(q.toLowerCase())
    );

    res.json({
      success: true,
      query: q,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Search medical services error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to search medical services' 
    });
  }
};
