const mongoose = require('mongoose');

const labResultSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  testName: { type: String, required: true },
  testType: { 
    type: String, 
    enum: ['blood', 'urine', 'xray', 'mri', 'ct-scan', 'ultrasound', 'other'],
    required: true 
  },
  result: { type: String, required: true },
  normalRange: String,
  unit: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'abnormal', 'critical'],
    default: 'pending'
  },
  notes: String,
  fileUrl: String,
  testDate: { type: Date, default: Date.now },
  reportedBy: String,
  labName: String
}, { timestamps: true });

module.exports = mongoose.model('LabResult', labResultSchema);
