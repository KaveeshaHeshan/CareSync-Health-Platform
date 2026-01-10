const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * REGISTER USER
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const normalizedEmail = (email || '').toLowerCase().trim();

    // 1. Check if user already exists
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // 2. Create new user instance
    user = new User({ name, email: normalizedEmail, password, role });

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 4. Save to Database
    await user.save();

    // 5. Generate JWT for immediate login
    const payload = {
      user: { id: user.id, role: user.role }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ 
          token, 
          user: { id: user.id, name, email, role: user.role } 
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * LOGIN USER
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const normalizedEmail = (email || '').toLowerCase().trim();

    // 1. Find user by email
    // IMPORTANT: password is `select:false` in schema, so we must include it here.
    let user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 2. Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 3. Generate JWT
    const payload = {
      user: { id: user.id, role: user.role }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: { id: user.id, name: user.name, role: user.role } 
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * GET CURRENT USER
 * GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
};

/**
 * LOGOUT USER
 * POST /api/auth/logout
 * Stateless for JWT auth; provided for client convenience.
 */
exports.logout = async (req, res) => {
  return res.json({ success: true });
};

/**
 * FORGOT PASSWORD
 * POST /api/auth/forgot-password
 * Send password reset email (mock implementation for now)
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const normalizedEmail = (email || '').toLowerCase().trim();

    // 1. Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // For security, don't reveal if email exists or not
      return res.json({ 
        success: true, 
        msg: 'If the email exists, a password reset link will be sent.' 
      });
    }

    // 2. TODO: Generate reset token and send email
    // For now, just return success message
    // In production, you would:
    // - Generate a unique reset token
    // - Store it in database with expiry
    // - Send email with reset link containing the token
    
    console.log(`Password reset requested for: ${normalizedEmail}`);
    
    res.json({ 
      success: true, 
      msg: 'If the email exists, a password reset link will be sent.' 
    });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ 
      success: false, 
      msg: 'Server Error' 
    });
  }
};
