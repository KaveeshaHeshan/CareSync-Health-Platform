const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  doctor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['in-person', 'online'], 
    default: 'in-person' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  reason: { type: String, required: true },
  notes: String,
  prescription: String,
  isPaid: { type: Boolean, default: false },
  amount: Number,
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
