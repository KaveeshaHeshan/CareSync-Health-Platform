const User = require('../models/User');
const Appointment = require('../models/Appointment');
const LabResult = require('../models/LabResult');
const Prescription = require('../models/Prescription');

/**
 * @desc    Get all users in the system
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to fetch users' 
    });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin only)
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        msg: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to fetch user' 
    });
  }
};

/**
 * @desc    Update user details
 * @route   PATCH /api/admin/users/:id
 * @access  Private (Admin only)
 */
exports.updateUser = async (req, res) => {
  try {
    const { role, name, email, phone, specialization } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        msg: 'User not found' 
      });
    }

    // Update fields
    if (role) user.role = role;
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (specialization) user.specialization = specialization;

    await user.save();

    res.json({
      success: true,
      msg: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to update user' 
    });
  }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin only)
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        msg: 'User not found' 
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      msg: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to delete user' 
    });
  }
};

/**
 * @desc    Get all doctors
 * @route   GET /api/admin/doctors
 * @access  Public
 */
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'DOCTOR' })
      .select('-password')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to fetch doctors' 
    });
  }
};

/**
 * @desc    Get platform statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
exports.getStats = async (req, res) => {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      completedAppointments,
      totalLabResults,
      totalPrescriptions
    ] = await Promise.all([
      User.countDocuments({ role: 'PATIENT' }),
      User.countDocuments({ role: 'DOCTOR' }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'completed' }),
      LabResult.countDocuments(),
      Prescription.countDocuments()
    ]);

    // Calculate monthly revenue (mock calculation - would be based on payment records)
    const monthlyRevenue = completedAppointments * 50; // Assuming $50 per appointment

    res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        completedAppointments,
        totalLabResults,
        totalPrescriptions,
        monthlyRevenue,
        activeUsers: totalPatients + totalDoctors,
        pendingVerifications: 0 // Would check verification status if implemented
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to fetch statistics' 
    });
  }
};
