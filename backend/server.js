require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

// 1. Initialize Express
const app = express();

// 2. Connect to Database (before starting the server)

// 3. Essential Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable Cross-Origin Resource Sharing for React
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Log requests to the terminal

// 4. Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/lab', require('./routes/labRoutes'));
app.use('/api/pharmacy', require('./routes/pharmacyRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 5. Root Health Check
app.get('/', (req, res) => {
  res.send('CareSync API is running...');
});

// 6. Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Something went wrong on the server' });
});

// 7. Start Server
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

start().catch((err) => {
  console.error('❌ Server failed to start:', err?.message || err);
  process.exit(1);
});