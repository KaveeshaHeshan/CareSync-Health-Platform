const mongoose = require('mongoose');

/**
 * USER MODEL
 * Centralized schema for all account types (Patient, Doctor, Admin)
 */
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Automatically excludes password from query results
  },
  role: {
    type: String,
    enum: ['PATIENT', 'DOCTOR', 'ADMIN', 'LAB', 'PHARMACY'],
    default: 'PATIENT'
  },
  // Specific fields for Patients/Doctors
  phone: {
    type: String
  },
  specialization: {
    type: String, // Used specifically if role is 'DOCTOR'
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);