const Prescription = require('../models/Prescription');
const User = require('../models/User');

/**
 * @desc    Get prescriptions for the logged-in patient
 * @route   GET /api/pharmacy/prescriptions
 * @access  Private (Patient only)
 */
exports.getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user.id })
      .populate('doctor', 'name specialization')
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to fetch prescriptions' 
    });
  }
};

/**
 * @desc    Update prescription status
 * @route   PATCH /api/pharmacy/prescriptions/:id
 * @access  Private (Pharmacy/Admin/Doctor only)
 */
exports.updatePrescriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'filled', 'out-for-delivery', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Invalid status value' 
      });
    }

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Prescription not found' 
      });
    }

    prescription.status = status;
    await prescription.save();

    const updatedPrescription = await Prescription.findById(prescription._id)
      .populate('doctor', 'name specialization')
      .populate('patient', 'name email');

    res.json({
      success: true,
      msg: 'Prescription status updated successfully',
      data: updatedPrescription
    });
  } catch (error) {
    console.error('Update prescription status error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to update prescription status' 
    });
  }
};

/**
 * @desc    Get prescriptions for a specific patient (Doctor view)
 * @route   GET /api/pharmacy/prescriptions/patient/:patientId
 * @access  Private (Doctor/Admin only)
 */
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.params.patientId })
      .populate('doctor', 'name specialization')
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (error) {
    console.error('Get patient prescriptions error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to fetch prescriptions' 
    });
  }
};

/**
 * @desc    Create a new prescription
 * @route   POST /api/pharmacy/prescriptions
 * @access  Private (Doctor only)
 */
exports.createPrescription = async (req, res) => {
  try {
    const { patientId, medications, diagnosis, instructions } = req.body;

    // Validate required fields
    if (!patientId || !medications || medications.length === 0) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Please provide patient ID and medications' 
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

    // Create prescription
    const prescription = await Prescription.create({
      patient: patientId,
      doctor: req.user.id,
      medications: medications,
      diagnosis: diagnosis || '',
      instructions: instructions || '',
      status: 'pending'
    });

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('doctor', 'name specialization')
      .populate('patient', 'name email');

    res.status(201).json({
      success: true,
      msg: 'Prescription created successfully',
      data: populatedPrescription
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to create prescription' 
    });
  }
};
