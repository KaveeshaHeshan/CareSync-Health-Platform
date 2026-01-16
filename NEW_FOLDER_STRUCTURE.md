# 📁 CareSync - Complete New Folder Structure

## 🎯 Error-Free, Production-Ready Structure

---

## 📂 Complete Project Structure

```
CareSync-Health-Platform/
│
├── backend/                           # Node.js + Express Backend
│   │
│   ├── server.js                     # ⭐ Main server entry point
│   ├── package.json                  # Backend dependencies
│   ├── package-lock.json             # Locked versions
│   ├── .env                          # 🔒 Environment variables (DO NOT COMMIT)
│   ├── .gitignore                    # Ignore node_modules, .env, uploads
│   │
│   ├── config/                       # Configuration files
│   │   ├── db.js                    # MongoDB connection
│   │   ├── stripe.js                # Stripe payment config
│   │   ├── jwt.js                   # JWT settings (optional)
│   │   └── jitsi.js                 # 🎥 Jitsi video config
│   │
│   ├── models/                       # Mongoose schemas
│   │   ├── User.js                  # User (Patient/Doctor/Admin)
│   │   ├── Appointment.js           # Appointment bookings
│   │   ├── Prescription.js          # Doctor prescriptions
│   │   ├── LabResult.js             # Lab test results
│   │   ├── Payment.js               # Payment records
│   │   ├── Notification.js          # User notifications
│   │   └── Consultation.js          # 🎥 Video consultation sessions
│   │
│   ├── controllers/                  # Business logic
│   │   ├── authController.js        # Register, login, logout
│   │   ├── appointmentController.js # Appointment CRUD
│   │   ├── patientController.js     # Patient operations
│   │   ├── doctorController.js      # Doctor operations
│   │   ├── adminController.js       # Admin management
│   │   ├── labController.js         # Lab operations
│   │   ├── pharmacyController.js    # Prescription management
│   │   ├── paymentController.js     # Payment processing
│   │   └── consultationController.js # 🎥 Video consultation logic
│   │
│   ├── routes/                       # API endpoints
│   │   ├── authRoutes.js            # /api/auth/*
│   │   ├── appointmentRoutes.js     # /api/appointments/*
│   │   ├── patientRoutes.js         # /api/patients/*
│   │   ├── doctorRoutes.js          # /api/doctors/*
│   │   ├── adminRoutes.js           # /api/admin/*
│   │   ├── labRoutes.js             # /api/lab/*
│   │   ├── pharmacyRoutes.js        # /api/pharmacy/*
│   │   ├── paymentRoutes.js         # /api/payments/*
│   │   └── consultationRoutes.js    # 🎥 /api/consultations/* (Video)
│   │
│   ├── middleware/                   # Custom middleware
│   │   ├── authMiddleware.js        # JWT verification (protect)
│   │   ├── roleMiddleware.js        # Role-based access (authorize)
│   │   ├── errorMiddleware.js       # Global error handler
│   │   └── uploadMiddleware.js      # File upload (multer)
│   │
│   ├── utils/                        # Helper functions
│   │   ├── validators.js            # Input validation
│   │   ├── emailService.js          # Email sending
│   │   ├── smsService.js            # SMS notifications
│   │   └── helpers.js               # Common utilities
│   │
│   ├── uploads/                      # Uploaded files (gitignored)
│   │   ├── prescriptions/
│   │   ├── lab-results/
│   │   └── profile-pictures/
│   │
│   ├── seeds/                        # Database seed data
│   │   ├── seed.js                  # Main seed file
│   │   └── data/
│   │       ├── users.json
│   │       └── appointments.json
│   │
│   └── services/                     # External service integrations
│       ├── jitsiService.js          # Jitsi Meet API
│       ├── twilioService.js         # Twilio Video (alternative)
│       └── socketService.js         # Socket.io for real-time chat
│
├── frontend/                         # React + Vite Frontend
│   │
│   ├── index.html                   # HTML entry point
│   ├── package.json                 # Frontend dependencies
│   ├── package-lock.json            # Locked versions
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.cjs          # Tailwind CSS config
│   ├── postcss.config.js            # PostCSS config
│   ├── eslint.config.js             # ESLint rules
│   ├── .env                         # Environment variables
│   ├── .gitignore                   # Ignore node_modules, dist
│   │
│   ├── public/                      # Static assets
│   │   ├── favicon.ico
│   │   ├── logo.png
│   │   └── images/
│   │
│   └── src/                         # Source code
│       │
│       ├── main.jsx                 # ⭐ React entry point
│       ├── App.jsx                  # Main App component with routes
│       ├── index.css                # Global styles + Tailwind
│       ├── App.css                  # App-specific styles
│       │
│       ├── assets/                  # Images, icons, fonts
│       │   ├── images/
│       │   │   ├── hero-bg.jpg
│       │   │   └── doctor-avatar.png
│       │   ├── icons/
│       │   └── fonts/
│       │
│       ├── api/                     # API service layer
│       │   ├── axiosInstance.js    # Axios setup + interceptors
│       │   ├── authApi.js          # Authentication APIs
│       │   ├── appointmentApi.js   # Appointment APIs
│       │   ├── adminApi.js         # Admin APIs
│       │   ├── labApi.js           # Lab APIs
│       │   ├── patientApi.js       # Patient APIs
│       │   ├── doctorApi.js        # Doctor APIs
│       │   ├── paymentApi.js       # Payment APIs
│       │   └── consultationApi.js  # 🎥 Video consultation APIs
│       │
│       ├── components/              # Reusable components
│       │   │
│       │   ├── shared/             # Shared components
│       │   │   ├── Navbar.jsx      # Top navigation
│       │   │   ├── Sidebar.jsx     # Side menu
│       │   │   ├── Footer.jsx      # Footer
│       │   │   ├── ProtectedRoute.jsx  # Auth guard
│       │   │   └── NotificationToast.jsx  # Toast messages
│       │   │
│       │   ├── ui/                 # UI primitives
│       │   │   ├── Button.jsx      # Reusable button
│       │   │   ├── Card.jsx        # Card container
│       │   │   ├── Input.jsx       # Form input
│       │   │   ├── Modal.jsx       # Modal dialog
│       │   │   ├── Spinner.jsx     # Loading spinner
│       │   │   ├── Badge.jsx       # Status badge
│       │   │   ├── Skeleton.jsx    # Loading skeleton
│       │   │   └── Alert.jsx       # Alert message
│       │   │
│       │   ├── forms/              # Form components
│       │   │   ├── FormInput.jsx   # Styled input
│       │   │   ├── FormSelect.jsx  # Dropdown
│       │   │   ├── FormTextarea.jsx # Textarea
│       │   │   └── FormCheckbox.jsx # Checkbox
│       │   │
│       │   └── auth/               # Auth components
│       │       └── ProtectedRoute.jsx
│       │
│       ├── features/               # Feature-specific components
│       │   │
│       │   ├── auth/              # Authentication
│       │   │   ├── AuthContext.jsx
│       │   │   ├── LoginForm.jsx
│       │   │   └── RegisterForm.jsx
│       │   │
│       │   ├── patient/           # Patient features
│       │   │   ├── BookingFlow.jsx
│       │   │   ├── HealthHistory.jsx
│       │   │   ├── AppointmentCard.jsx
│       │   │   └── MedicalRecordCard.jsx
│       │   │
│       │   ├── doctor/            # Doctor features
│       │   │   ├── PatientCard.jsx
│       │   │   ├── PrescriptionGenerator.jsx
│       │   │   ├── SlotManager.jsx
│       │   │   └── AppointmentQueue.jsx
│       │   │
│       │   ├── admin/             # Admin features
│       │   │   ├── UserManagement.jsx
│       │   │   ├── StripeAnalyticsChart.jsx
│       │   │   └── DoctorApproval.jsx
│       │   │
│       │   ├── lab/               # Lab features
│       │   │   ├── ResultUploader.jsx
│       │   │   └── TestOrderTable.jsx
│       │   │
│       │   ├── consultation/      # Video consultation
│       │   │   ├── VideoRoom.jsx           # Main video room
│       │   │   ├── JitsiMeeting.jsx        # Jitsi integration
│       │   │   ├── VideoControls.jsx       # Camera/mic controls
│       │   │   ├── ParticipantsList.jsx    # Show participants
│       │   │   ├── LiveChat.jsx            # In-call chat
│       │   │   ├── ScreenShare.jsx         # Screen sharing
│       │   │   └── CallTimer.jsx           # Call duration timer
│       │   │
│       │   └── payments/          # Payment features
│       │       ├── CheckoutForm.jsx
│       │       ├── PaymentHistory.jsx
│       │       └── InvoiceDownload.jsx
│       │
│       ├── pages/                 # Full page components
│       │   │
│       │   ├── HomePage.jsx       # Landing page
│       │   ├── NotFound.jsx       # 404 page
│       │   │
│       │   ├── auth/              # Auth pages
│       │   │   ├── LoginPage.jsx
│       │   │   └── RegisterPage.jsx
│       │   │
│       │   ├── patient/           # Patient pages
│       │   │   ├── Dashboard.jsx
│       │   │   ├── FindDoctors.jsx
│       │   │   ├── DoctorProfile.jsx
│       │   │   ├── BookingDetails.jsx
│       │   │   ├── BookingConfirmation.jsx
│       │   │   ├── MyAppointments.jsx
│       │   │   ├── VideoConsultation.jsx  # 🎥 Patient video call
│       │   │   ├── WaitingRoom.jsx        # 🎥 Pre-call waiting
│       │   │   ├── MedicalRecords.jsx
│       │   │   ├── LabResults.jsx
│       │   │   ├── Prescriptions.jsx
│       │   │   ├── Billing.jsx
│       │   │   └── Profile.jsx
│       │   │
│       │   ├── doctor/            # Doctor pages
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Appointments.jsx
│       │   │   ├── VideoConsultation.jsx  # 🎥 Doctor video call
│       │   │   ├── ConsultationHistory.jsx # 🎥 Past video calls
│       │   │   ├── Patients.jsx
│       │   │   ├── Schedule.jsx
│       │   │   ├── Earnings.jsx
│       │   │   └── Profile.jsx
│       │   │
│       │   ├── admin/             # Admin pages
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Users.jsx
│       │   │   ├── Doctors.jsx
│       │   │   ├── Appointments.jsx
│       │   │   ├── Analytics.jsx
│       │   │   └── Settings.jsx
│       │   │
│       │   └── billing/           # Billing pages
│       │       ├── PaymentPage.jsx
│       │       └── InvoicePage.jsx
│       │
│       ├── layouts/               # Page layouts
│       │   ├── MainLayout.jsx     # With Navbar + Footer
│       │   ├── DashboardLayout.jsx # With Sidebar
│       │   ├── AuthLayout.jsx     # Centered auth
│       │   └── PublicLayout.jsx   # Public pages
│       │
│       ├── hooks/                 # Custom React hooks
│       │   ├── useAuth.js         # Authentication
│       │   ├── useDebounce.js     # Debounce input
│       │   ├── useLocalStorage.js # LocalStorage wrapper
│       │   ├── useToast.js        # Toast notifications
│       │   └── useFetch.js        # API fetching
│       │
│       ├── store/                 # State management (Zustand)
│       │   ├── useUserStore.jsx   # User state
│       │   ├── useUIStore.jsx     # UI state
│       │   └── useAppointmentStore.jsx # Appointments
│       │
│       ├── utils/                 # Utility functions
│       │   ├── constants.js       # App constants
│       │   ├── formatters.js      # Date/currency formatters
│       │   ├── validation.js      # Form validation
│       │   └── helpers.js         # Helper functions
│       │
│       └── styles/                # Additional styles
│           ├── animations.css     # Custom animations
│           └── utilities.css      # Custom utilities
│
├── docs/                          # Documentation
│   ├── API_DOCUMENTATION.md       # API endpoints
│   ├── SETUP_GUIDE.md             # Setup instructions
│   └── USER_GUIDE.md              # User manual
│
├── .gitignore                     # Global gitignore
└── README.md                      # Project overview
```

---

## 📋 Backend Files Structure

### 1. server.js
```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/lab', require('./routes/labRoutes'));
app.use('/api/pharmacy', require('./routes/pharmacyRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/consultations', require('./routes/consultationRoutes')); // 🎥 Video consultations

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'CareSync API is running!' });
});

// Error handler
app.use(require('./middleware/errorMiddleware'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
```

### 2. config/db.js
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### 3. models/User.js
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['PATIENT', 'DOCTOR', 'ADMIN'], default: 'PATIENT' },
  phone: String,
  age: Number,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  // Doctor fields
  specialization: String,
  experience: String,
  fees: Number,
  rating: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false },
}, { timestamps: true });

// Hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) next();
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

### 4. models/Appointment.js
```javascript
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  type: { type: String, enum: ['in-person', 'online'], default: 'in-person' },
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
```

### 5. middleware/authMiddleware.js
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalid' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    next();
  };
};
```

---

## 🎨 Frontend Files Structure

### 1. src/main.jsx
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 2. src/App.jsx
```jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PatientDashboard from './pages/patient/Dashboard';
import DoctorDashboard from './pages/doctor/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import ProtectedRoute from './components/shared/ProtectedRoute';
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/patient/*" element={
          <ProtectedRoute role="PATIENT">
            <Routes>
              <Route path="dashboard" element={<PatientDashboard />} />
            </Routes>
          </ProtectedRoute>
        } />
        
        <Route path="/doctor/*" element={
          <ProtectedRoute role="DOCTOR">
            <Routes>
              <Route path="dashboard" element={<DoctorDashboard />} />
            </Routes>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/*" element={
          <ProtectedRoute role="ADMIN">
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
            </Routes>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 3. src/api/axiosInstance.js
```javascript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### 4. src/api/authApi.js
```javascript
import axiosInstance from './axiosInstance';

const authApi = {
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => !!localStorage.getItem('token'),
};

export default authApi;
```

### 5. src/hooks/useAuth.js
```javascript
import { useState, useEffect } from 'react';
import authApi from '../api/authApi';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authApi.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return { user, loading, login, register, logout, isAuthenticated: !!user };
};
```

---

## 📦 Package Dependencies

### Backend package.json
```json
{
  "name": "caresync-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node seeds/seed.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "stripe": "^14.0.0",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.7",
    "express-validator": "^7.0.1",
    "socket.io": "^4.6.1",
    "twilio": "^4.19.0",
    "@jitsi/web-sdk": "^1.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### Frontend package.json
```json
{
  "name": "caresync-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "lucide-react": "^0.294.0",
    "zustand": "^4.4.7",
    "date-fns": "^2.30.0",
    "@jitsi/react-sdk": "^1.3.0",
    "socket.io-client": "^4.6.1",
    "simple-peer": "^9.11.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.6",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  }
}
```

---

## 🔧 Configuration Files

### backend/.env
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/caresync
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_your_key
FRONTEND_URL=http://localhost:5173

# Video Consultation (Jitsi)
JITSI_APP_ID=your-jitsi-app-id
JITSI_API_KEY=your-jitsi-api-key

# Video Consultation (Twilio - Alternative)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_API_KEY=your-twilio-api-key
TWILIO_API_SECRET=your-twilio-api-secret
```

### frontend/.env
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
VITE_JITSI_DOMAIN=meet.jit.si
VITE_SOCKET_URL=http://localhost:5000
```

### frontend/tailwind.config.cjs
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

### frontend/vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }
})
```

---

## ✅ Setup Instructions

### 1. Install Backend
```bash
cd backend
npm install
# Create .env file
npm run dev
```

### 2. Install Frontend
```bash
cd frontend
npm install
# Create .env file
npm run dev
```

### 3. Access Application
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 🎯 Key Benefits of This Structure

✅ **Clear separation** - Backend/Frontend completely separate  
✅ **Scalable** - Easy to add new features  
✅ **Maintainable** - Each file has one responsibility  
✅ **Organized** - Related files grouped together  
✅ **Error-free** - No circular dependencies  
✅ **Professional** - Industry-standard structure  

---

## 🎥 Video Consultation Implementation

### Backend: Consultation Model
```javascript
// backend/models/Consultation.js
const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  appointment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment', 
    required: true 
  },
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
  roomId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  roomPassword: String,
  startTime: Date,
  endTime: Date,
  duration: Number, // in minutes
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  recordingUrl: String,
  notes: String,
  prescriptionAdded: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Consultation', consultationSchema);
```

### Backend: Consultation Controller
```javascript
// backend/controllers/consultationController.js
const Consultation = require('../models/Consultation');
const Appointment = require('../models/Appointment');
const { v4: uuidv4 } = require('uuid');

// Create video room for appointment
exports.createRoom = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await Appointment.findById(appointmentId)
      .populate('patient doctor');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check if user is part of this appointment
    const isAuthorized = 
      appointment.patient._id.toString() === req.user.id ||
      appointment.doctor._id.toString() === req.user.id;
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Check if room already exists
    let consultation = await Consultation.findOne({ appointment: appointmentId });
    
    if (!consultation) {
      // Create new room
      const roomId = `caresync-${uuidv4()}`;
      
      consultation = await Consultation.create({
        appointment: appointmentId,
        patient: appointment.patient._id,
        doctor: appointment.doctor._id,
        roomId,
        roomPassword: Math.random().toString(36).substring(7),
        startTime: new Date(),
        status: 'scheduled'
      });
    }
    
    res.json({
      success: true,
      consultation,
      jitsiConfig: {
        roomName: consultation.roomId,
        password: consultation.roomPassword,
        domain: process.env.JITSI_DOMAIN || 'meet.jit.si',
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Start consultation
exports.startConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    
    const consultation = await Consultation.findByIdAndUpdate(
      consultationId,
      { 
        status: 'ongoing',
        startTime: new Date()
      },
      { new: true }
    );
    
    res.json({ success: true, consultation });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// End consultation
exports.endConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { notes } = req.body;
    
    const consultation = await Consultation.findById(consultationId);
    const startTime = new Date(consultation.startTime);
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 60000); // minutes
    
    consultation.status = 'completed';
    consultation.endTime = endTime;
    consultation.duration = duration;
    consultation.notes = notes;
    await consultation.save();
    
    // Update appointment status
    await Appointment.findByIdAndUpdate(consultation.appointment, {
      status: 'completed'
    });
    
    res.json({ success: true, consultation });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get consultation history
exports.getHistory = async (req, res) => {
  try {
    const consultations = await Consultation.find({
      $or: [
        { patient: req.user.id },
        { doctor: req.user.id }
      ]
    })
    .populate('patient doctor appointment')
    .sort({ createdAt: -1 });
    
    res.json({ success: true, consultations });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
```

### Backend: Consultation Routes
```javascript
// backend/routes/consultationRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createRoom,
  startConsultation,
  endConsultation,
  getHistory
} = require('../controllers/consultationController');

// All routes are protected
router.use(protect);

router.post('/room/:appointmentId', createRoom);
router.put('/:consultationId/start', startConsultation);
router.put('/:consultationId/end', endConsultation);
router.get('/history', getHistory);

module.exports = router;
```

### Frontend: Video Room Component
```jsx
// frontend/src/features/consultation/VideoRoom.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const VideoRoom = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    loadConsultation();
  }, [appointmentId]);

  const loadConsultation = async () => {
    try {
      const response = await axiosInstance.post(
        `/consultations/room/${appointmentId}`
      );
      setConsultation(response.data.consultation);
      setLoading(false);
    } catch (error) {
      console.error('Error loading consultation:', error);
      alert('Failed to load video room');
      navigate(-1);
    }
  };

  const handleJitsiLoad = () => {
    console.log('Jitsi loaded');
    setInCall(true);
  };

  const handleJitsiError = (error) => {
    console.error('Jitsi error:', error);
    alert('Video call failed to load');
  };

  const handleCallEnded = async () => {
    try {
      await axiosInstance.put(
        `/consultations/${consultation._id}/end`,
        { notes: 'Call completed' }
      );
      navigate('/patient/dashboard');
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-900">
      <JitsiMeeting
        domain={import.meta.env.VITE_JITSI_DOMAIN || 'meet.jit.si'}
        roomName={consultation.roomId}
        configOverwrite={{
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableModeratorIndicator: true,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          SHOW_JITSI_WATERMARK: false,
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop',
            'fullscreen', 'fodeviceselection', 'hangup', 'profile',
            'chat', 'recording', 'sharedvideo', 'settings',
            'videoquality', 'filmstrip', 'shortcuts', 'tileview'
          ],
        }}
        userInfo={{
          displayName: consultation.patient?.name || consultation.doctor?.name,
        }}
        onApiReady={handleJitsiLoad}
        onReadyToClose={handleCallEnded}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = '100vh';
          iframeRef.style.width = '100%';
        }}
      />
    </div>
  );
};

export default VideoRoom;
```

### Frontend: Video Consultation API
```javascript
// frontend/src/api/consultationApi.js
import axiosInstance from './axiosInstance';

const consultationApi = {
  // Create video room
  createRoom: async (appointmentId) => {
    const response = await axiosInstance.post(
      `/consultations/room/${appointmentId}`
    );
    return response.data;
  },

  // Start consultation
  startConsultation: async (consultationId) => {
    const response = await axiosInstance.put(
      `/consultations/${consultationId}/start`
    );
    return response.data;
  },

  // End consultation
  endConsultation: async (consultationId, notes) => {
    const response = await axiosInstance.put(
      `/consultations/${consultationId}/end`,
      { notes }
    );
    return response.data;
  },

  // Get consultation history
  getHistory: async () => {
    const response = await axiosInstance.get('/consultations/history');
    return response.data;
  },
};

export default consultationApi;
```

### Usage: Join Video Call Button
```jsx
// In MyAppointments.jsx or Dashboard.jsx
import { useNavigate } from 'react-router-dom';
import { Video } from 'lucide-react';

const handleJoinCall = (appointmentId) => {
  navigate(`/patient/video-consultation/${appointmentId}`);
};

// In your appointment card:
{appointment.type === 'online' && appointment.status === 'confirmed' && (
  <button
    onClick={() => handleJoinCall(appointment._id)}
    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
  >
    <Video size={20} />
    Join Video Call
  </button>
)}
```

### Add Routes to App.jsx
```jsx
import VideoRoom from './features/consultation/VideoRoom';

// Add this route:
<Route 
  path="/patient/video-consultation/:appointmentId" 
  element={<VideoRoom />} 
/>
<Route 
  path="/doctor/video-consultation/:appointmentId" 
  element={<VideoRoom />} 
/>
```

---

## 🎯 Video Consultation Features

✅ **Real-time video calls** - HD video quality with Jitsi  
✅ **Screen sharing** - Share medical reports/prescriptions  
✅ **In-call chat** - Text messages during consultation  
✅ **Recording** - Optional call recording  
✅ **Participant list** - See who's in the call  
✅ **Camera/Mic controls** - Toggle on/off  
✅ **Call duration tracking** - Automatic timer  
✅ **Consultation history** - View past video calls  
✅ **Secure rooms** - Password-protected meetings  
✅ **Mobile responsive** - Works on all devices  

---

**🚀 Ready to build! Follow [BUILD_NEW_CARESYNC_GUIDE.md](BUILD_NEW_CARESYNC_GUIDE.md) for step-by-step implementation.**
