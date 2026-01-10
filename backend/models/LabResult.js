const mongoose = require('mongoose');

/**
 * LAB RESULT MODEL
 * Stores medical test data for patients.
 */
const LabResultSchema = new mongoose.Schema({
  // Reference to the Patient who owns this result
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Name of the test (e.g., "Full Blood Count", "COVID-19 PCR")
  testName: {
    type: String,
    required: true,
    trim: true
  },
  // Type of the test
  testType: {
    type: String,
    required: true,
    trim: true
  },
  // The category of the test for filtering
  category: {
    type: String,
    enum: ['Blood Work', 'Imaging', 'Pathology', 'General'],
    default: 'General'
  },
  // Date the test was performed
  date: {
    type: Date,
    default: Date.now
  },
  // Detailed result data (could be a summary or numeric value)
  resultSummary: {
    type: String
  },
  // Result field (alternative name for resultSummary)
  result: {
    type: String
  },
  // Additional notes
  notes: {
    type: String
  },
  // Status of the report
  status: {
    type: String,
    enum: ['pending', 'completed', 'Pending', 'Final', 'Corrected'],
    default: 'completed'
  },
  // URL to a PDF or image file (stored in cloud storage like AWS S3 or Cloudinary)
  fileUrl: {
    type: String
  },
  // Flag for critical results that need immediate attention
  isCritical: {
    type: Boolean,
    default: false
  },
  // Reference to who uploaded this result
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('LabResult', LabResultSchema);