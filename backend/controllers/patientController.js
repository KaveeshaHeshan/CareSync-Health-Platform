const User = require('../models/User');
const Appointment = require('../models/Appointment');
const LabResult = require('../models/LabResult');

/**
 * GET PATIENT PROFILE
 * GET /api/patients/profile
 */
exports.getProfile = async (req, res) => {
  try {
    // req.user.id comes from the authMiddleware
    const patient = await User.findById(req.user.id).select('-password');
    if (!patient) {
      return res.status(404).json({ msg: 'Patient profile not found' });
    }
    res.json(patient);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * GET MEDICAL HISTORY (Appointments)
 * GET /api/patients/history
 */
exports.getMedicalHistory = async (req, res) => {
  try {
    // Find all appointments for this patient and "populate" the doctor's name
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate('doctor', 'name email') // Gets doctor details from User model
      .sort({ date: -1 }); // Show newest first

    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * GET LAB RESULTS
 * GET /api/patients/lab-results
 */
exports.getLabResults = async (req, res) => {
  try {
    const results = await LabResult.find({ patient: req.user.id })
      .sort({ date: -1 });

    res.json(results);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * UPDATE PROFILE
 * PUT /api/patients/profile
 */
exports.updateProfile = async (req, res) => {
  const { name, phone, address } = req.body;

  try {
    let patient = await User.findById(req.user.id);
    if (!patient) return res.status(404).json({ msg: 'User not found' });

    // Update fields if they are provided
    if (name) patient.name = name;
    // Note: You can add phone/address fields to your User model if needed
    
    await patient.save();
    res.json({ msg: 'Profile updated successfully', patient });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};