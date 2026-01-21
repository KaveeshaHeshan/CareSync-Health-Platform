const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');
const {
  getDashboard,
  getAppointments,
  getPatients,
  getPatient,
  addPrescription,
  updateAvailability,
  getAvailability,
  getEarnings,
  getStats,
  updateSlots,
  getReviews
} = require('../controllers/doctorController');
const User = require('../models/User');

// Public route - Get all approved doctors
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { specialization, minRating, maxFees, search } = req.query;
    
    let query = { 
      role: 'DOCTOR',
      isActive: true,
      isApproved: true
    };

    // Filter by specialization
    if (specialization) {
      query.specialization = specialization;
    }

    // Filter by minimum rating
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Filter by maximum fees
    if (maxFees) {
      query.fees = { $lte: parseFloat(maxFees) };
    }

    // Search by name or specialization
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await User.find(query)
      .select('name email specialization experience fees rating isActive isApproved age gender phone')
      .sort({ rating: -1, name: 1 });

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
});

// Get single doctor profile (public)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const doctor = await User.findOne({
      _id: req.params.id,
      role: 'DOCTOR',
      isActive: true,
      isApproved: true
    }).select('-password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      doctor
    });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// All routes below require authentication and DOCTOR role
router.use(protect);
router.use(authorize('DOCTOR', 'ADMIN'));

// Dashboard
router.get('/dashboard', getDashboard);

// Appointments
router.get('/appointments', getAppointments);

// Patients
router.get('/patients', getPatients);
router.get('/patients/:id', getPatient);

// Prescriptions
router.post('/prescriptions', addPrescription);

// Availability & Slots
router.get('/availability', getAvailability);
router.put('/availability', updateAvailability);
router.put('/slots', updateSlots);

// Earnings
router.get('/earnings', getEarnings);

// Statistics
router.get('/stats', getStats);

// Reviews
router.get('/reviews', getReviews);

module.exports = router;