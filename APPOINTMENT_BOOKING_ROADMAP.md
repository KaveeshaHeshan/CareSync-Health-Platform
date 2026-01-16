# 📅 Complete Appointment Booking System - Implementation Roadmap

## 🎯 Overview
This document provides a comprehensive guide to the complete appointment booking system in CareSync Health Platform, from initial search to confirmation.

---

## 📋 Table of Contents
1. [System Architecture](#system-architecture)
2. [Complete User Flow](#complete-user-flow)
3. [Frontend Implementation](#frontend-implementation)
4. [Backend Implementation](#backend-implementation)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [State Management](#state-management)
8. [Validation & Error Handling](#validation--error-handling)
9. [Testing Checklist](#testing-checklist)
10. [Future Enhancements](#future-enhancements)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                      │
├─────────────────────────────────────────────────────────────┤
│  Patient Dashboard → Find Doctors → Booking Flow → Success  │
│         ↓               ↓               ↓            ↓       │
│    Dashboard.jsx   BookingPage.jsx  BookingFlow.jsx  ✓      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      API SERVICE LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  appointmentApi.js → axiosInstance → HTTP Requests          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND API LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  appointmentRoutes → authMiddleware → appointmentController │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                          │
├─────────────────────────────────────────────────────────────┤
│        MongoDB: Appointments, Users, Doctors Collections     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete User Flow

### Step-by-Step Booking Process

```
START: Patient Dashboard
    ↓
[1] Click "Book Appointment" / "Find Doctors"
    ↓
[2] SEARCH & FILTER PAGE
    │   - Search by doctor name
    │   - Filter by specialization
    │   - Filter by location
    │   - Filter by availability (online/physical)
    │   - Filter by ratings
    │   - Filter by fees
    ↓
[3] DOCTOR SELECTION
    │   - View doctor cards
    │   - See ratings & reviews
    │   - Check online consultation availability
    │   - View fees
    │   - Click "Book Now"
    ↓
[4] BOOKING FLOW - STEP 1: Choose Specialty
    │   - Select medical department
    │   - System auto-matches best available doctor
    ↓
[5] BOOKING FLOW - STEP 2: Select Schedule
    │   - Pick preferred date
    │   - View available time slots (fetched from backend)
    │   - Select time slot
    ↓
[6] BOOKING FLOW - STEP 3: Visit Details
    │   - Enter reason for consultation
    │   - Add symptoms/notes
    │   - Choose visit type (Physical/Online)
    ↓
[7] REVIEW & CONFIRM
    │   - Review all details
    │   - Submit appointment request
    ↓
[8] SUCCESS CONFIRMATION
    │   - Display confirmation message
    │   - Show appointment ID
    │   - Send email notification
    │   - Option: View Appointments / Back to Dashboard
    ↓
END: Appointment Created → Doctor Dashboard (for approval)
```

---

## 💻 Frontend Implementation

### Component Structure

```
frontend/src/
├── pages/patient/
│   ├── Dashboard.jsx           ← Entry point (Book Appointment button)
│   ├── BookingPage.jsx         ← Search & filter doctors
│   └── AppointmentsPage.jsx    ← View all appointments
├── features/patient/
│   └── BookingFlow.jsx         ← 3-step booking wizard
├── components/
│   ├── forms/
│   │   ├── FormInput.jsx       ← Date/time inputs
│   │   └── FormSelect.jsx      ← Specialty dropdown
│   └── ui/
│       ├── Card.jsx            ← Container component
│       └── Button.jsx          ← Action buttons
└── api/
    └── appointmentApi.js       ← API service layer
```

### Key Components Implementation

#### 1️⃣ **Patient Dashboard (Entry Point)**
**File:** `frontend/src/pages/patient/Dashboard.jsx`

```jsx
// Quick Actions Card
<button
  onClick={() => navigate('/patient/booking')}
  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl"
>
  <Plus size={18} /> Book Appointment
</button>

// OR

<div className="quick-actions">
  {quickActions.map((action) => (
    <button onClick={action.action}>
      {action.title}
    </button>
  ))}
</div>
```

**Features:**
- ✅ "Book Appointment" button in header
- ✅ Quick access card in dashboard
- ✅ Upcoming appointments display
- ✅ Badge showing appointment count

---

#### 2️⃣ **Search & Filter Page**
**File:** `frontend/src/pages/patient/BookingPage.jsx`

```jsx
const BookingPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    specialty: "All",
    location: "",
    availableToday: false,
    onlineConsultation: false,
    minRating: 0,
    maxFees: 1000
  });

  const debouncedSearch = useDebounce(searchTerm, 500);

  return (
    <div>
      {/* Search Bar */}
      <input 
        placeholder="Search by doctor name or specialty..."
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Filters Sidebar */}
      <aside>
        <select onChange={handleSpecialtyFilter}>
          <option>All Specialties</option>
          <option>Cardiology</option>
          <option>Dermatology</option>
        </select>
        
        <input type="checkbox" name="onlineOnly" />
        <label>Online Consultation Only</label>
        
        <input type="checkbox" name="availableToday" />
        <label>Available Today</label>
        
        <input type="range" min="0" max="5" step="0.5" />
        <label>Minimum Rating</label>
      </aside>

      {/* Doctor Cards */}
      <div className="doctor-grid">
        {doctors.map(doctor => (
          <DoctorCard 
            key={doctor.id}
            doctor={doctor}
            onBookNow={() => navigate(`/patient/booking/${doctor.id}`)}
          />
        ))}
      </div>
    </div>
  );
};
```

**Features:**
- ✅ Real-time search with debouncing
- ✅ Multiple filter options
- ✅ Doctor cards with ratings
- ✅ Online consultation badge
- ✅ "Book Now" CTA button

---

#### 3️⃣ **Booking Flow (3-Step Wizard)**
**File:** `frontend/src/features/patient/BookingFlow.jsx`

```jsx
const BookingFlow = () => {
  const [step, setStep] = useState(1); // Current step (1, 2, or 3)
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const { register, getValues } = useForm();

  // Fetch doctors on mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Fetch available slots when date/doctor changes
  useEffect(() => {
    if (watchedDate && selectedDoctor) {
      fetchAvailableSlots(selectedDoctor, watchedDate);
    }
  }, [watchedDate, selectedDoctor]);

  // STEP 1: Choose Specialty
  const renderStep1 = () => (
    <FormSelect 
      label="What do you need help with?"
      options={specialties}
      onChange={handleSpecialtyChange}
    />
  );

  // STEP 2: Select Date & Time
  const renderStep2 = () => (
    <>
      <FormInput 
        type="date"
        name="date"
        label="Preferred Date"
      />
      
      <div className="time-slots">
        {availableSlots.map(time => (
          <button 
            key={time}
            onClick={() => setSelectedSlot(time)}
            className={selectedSlot === time ? 'selected' : ''}
          >
            {time}
          </button>
        ))}
      </div>
    </>
  );

  // STEP 3: Visit Details
  const renderStep3 = () => (
    <textarea 
      placeholder="Describe your symptoms..."
      {...register('notes')}
    />
  );

  // Submit appointment
  const handleFinalSubmit = async () => {
    const formData = getValues();
    const appointmentData = {
      doctorId: selectedDoctor,
      date: formData.date,
      time: selectedSlot,
      reason: formData.notes || 'General consultation',
      type: 'in-person' // or 'online'
    };
    
    await appointmentApi.bookAppointment(appointmentData);
    setIsSuccess(true);
  };

  return (
    <div>
      {/* Step Indicator */}
      <StepIndicator currentStep={step} totalSteps={3} />
      
      {/* Step Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      
      {/* Navigation */}
      <div>
        {step > 1 && <Button onClick={() => setStep(step - 1)}>Back</Button>}
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)}>Next</Button>
        ) : (
          <Button onClick={handleFinalSubmit}>Confirm Appointment</Button>
        )}
      </div>
    </div>
  );
};
```

**Features:**
- ✅ Progressive 3-step wizard
- ✅ Step indicator with visual progress
- ✅ Form validation before proceeding
- ✅ Dynamic slot fetching based on doctor/date
- ✅ Back/Next navigation
- ✅ Final confirmation step
- ✅ Success screen with actions

---

## 🔧 Backend Implementation

### API Routes Configuration
**File:** `backend/routes/appointmentRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const { 
  getAppointments, 
  bookAppointment, 
  getAvailableSlots,
  updateStatus,
  getAppointmentDetails
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// GET /api/appointments - Get all appointments (filtered by role)
router.get('/', getAppointments);

// GET /api/appointments/:id - Get specific appointment details
router.get('/:id', getAppointmentDetails);

// POST /api/appointments - Book new appointment (Patient only)
router.post('/', bookAppointment);

// GET /api/appointments/slots/:doctorId/:date - Get available slots
router.get('/slots/:doctorId/:date', getAvailableSlots);

// PATCH /api/appointments/:id/status - Update appointment status
router.patch('/:id/status', updateStatus);

module.exports = router;
```

---

### Controller Implementation
**File:** `backend/controllers/appointmentController.js`

```javascript
const Appointment = require('../models/Appointment');
const User = require('../models/User');

/**
 * @desc    Book a new appointment
 * @route   POST /api/appointments
 * @access  Private (Patient only)
 */
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason, type } = req.body;

    // Validate required fields
    if (!doctorId || !date || !time) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Please provide doctor, date, and time' 
      });
    }

    // Check if doctor exists and is available
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'DOCTOR') {
      return res.status(404).json({ 
        success: false, 
        msg: 'Doctor not found' 
      });
    }

    // Check for conflicting appointments
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      time: time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(409).json({ 
        success: false, 
        msg: 'This time slot is already booked' 
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      date: new Date(date),
      time: time,
      reason: reason || 'General consultation',
      type: type || 'in-person',
      status: 'pending' // Requires doctor confirmation
    });

    // Populate for response
    await appointment.populate('doctor', 'name specialization');

    res.status(201).json({
      success: true,
      msg: 'Appointment booked successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to book appointment' 
    });
  }
};

/**
 * @desc    Get available time slots for a doctor on a specific date
 * @route   GET /api/appointments/slots/:doctorId/:date
 * @access  Private
 */
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    // Define clinic working hours (9 AM - 5 PM, 30-min slots)
    const workingHours = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00'
    ];

    // Get already booked slots
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] }
    }).select('time');

    const bookedTimes = bookedAppointments.map(apt => apt.time);

    // Filter out booked slots
    const availableSlots = workingHours.filter(
      time => !bookedTimes.includes(time)
    );

    res.json({
      success: true,
      availableSlots: availableSlots
    });

  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to fetch available slots' 
    });
  }
};

/**
 * @desc    Update appointment status
 * @route   PATCH /api/appointments/:id/status
 * @access  Private (Doctor/Admin)
 */
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Appointment not found' 
      });
    }

    // Update status
    appointment.status = status;
    await appointment.save();

    res.json({
      success: true,
      msg: `Appointment ${status} successfully`,
      data: appointment
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to update appointment status' 
    });
  }
};
```

---

## 📊 Database Schema

### Appointment Model
**File:** `backend/models/Appointment.js`

```javascript
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
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    default: 'General consultation'
  },
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
  notes: {
    type: String
  },
  prescription: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ doctor: 1, date: 1, time: 1 });
appointmentSchema.index({ patient: 1, date: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
```

---

## 🔌 API Endpoints

### Complete API Reference

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/appointments` | Get all appointments (filtered by role) | Private |
| `GET` | `/api/appointments/:id` | Get appointment details | Private |
| `POST` | `/api/appointments` | Book new appointment | Patient |
| `GET` | `/api/appointments/slots/:doctorId/:date` | Get available time slots | Private |
| `PATCH` | `/api/appointments/:id/status` | Update appointment status | Doctor/Admin |
| `DELETE` | `/api/appointments/:id` | Cancel appointment | Patient/Doctor |

### Request/Response Examples

#### 1. Book Appointment
```http
POST /api/appointments
Content-Type: application/json
Authorization: Bearer <token>

{
  "doctorId": "507f1f77bcf86cd799439011",
  "date": "2026-01-20",
  "time": "10:30",
  "reason": "Persistent headache for 3 days",
  "type": "in-person"
}
```

**Response:**
```json
{
  "success": true,
  "msg": "Appointment booked successfully",
  "data": {
    "_id": "507f191e810c19729de860ea",
    "patient": "507f1f77bcf86cd799439012",
    "doctor": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Dr. Sarah Chen",
      "specialization": "Cardiology"
    },
    "date": "2026-01-20T00:00:00.000Z",
    "time": "10:30",
    "reason": "Persistent headache for 3 days",
    "type": "in-person",
    "status": "pending",
    "createdAt": "2026-01-16T10:30:00.000Z"
  }
}
```

#### 2. Get Available Slots
```http
GET /api/appointments/slots/507f1f77bcf86cd799439011/2026-01-20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "availableSlots": [
    "09:00", "09:30", "10:00", "11:00", "11:30",
    "14:00", "14:30", "15:00", "16:00"
  ]
}
```

---

## 🎨 State Management

### Using React Hooks

```jsx
// Local component state
const [step, setStep] = useState(1);
const [selectedDoctor, setSelectedDoctor] = useState('');
const [selectedSlot, setSelectedSlot] = useState('');
const [availableSlots, setAvailableSlots] = useState([]);
const [isSubmitting, setIsSubmitting] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);

// Form state (using react-hook-form)
const { register, watch, getValues, formState: { errors } } = useForm();

// Watched values for real-time updates
const watchedDate = watch('date');
const watchedSpecialty = watch('specialty');
```

### Optional: Zustand Global Store

```javascript
// store/useAppointmentStore.jsx
import create from 'zustand';

export const useAppointmentStore = create((set) => ({
  appointments: [],
  currentAppointment: null,
  
  setAppointments: (appointments) => set({ appointments }),
  
  addAppointment: (appointment) => set((state) => ({
    appointments: [...state.appointments, appointment]
  })),
  
  updateAppointmentStatus: (id, status) => set((state) => ({
    appointments: state.appointments.map(apt =>
      apt._id === id ? { ...apt, status } : apt
    )
  }))
}));
```

---

## ✅ Validation & Error Handling

### Frontend Validation

```jsx
// Form validation rules
const validationRules = {
  specialty: { required: "Please select a specialty" },
  date: { 
    required: "Please select a date",
    validate: (value) => {
      const selectedDate = new Date(value);
      const today = new Date();
      return selectedDate >= today || "Cannot book appointments in the past";
    }
  },
  notes: {
    maxLength: {
      value: 500,
      message: "Notes cannot exceed 500 characters"
    }
  }
};

// Manual validation before step change
const nextStep = async () => {
  if (step === 1 && !selectedDoctor) {
    alert('Please select a specialty');
    return;
  }
  if (step === 2 && !selectedSlot) {
    alert('Please select a time slot');
    return;
  }
  setStep(s => s + 1);
};
```

### Backend Validation

```javascript
// Validate appointment data
if (!doctorId || !date || !time) {
  return res.status(400).json({ 
    success: false, 
    msg: 'Please provide doctor, date, and time' 
  });
}

// Check for conflicts
const existingAppointment = await Appointment.findOne({
  doctor: doctorId,
  date: new Date(date),
  time: time,
  status: { $in: ['pending', 'confirmed'] }
});

if (existingAppointment) {
  return res.status(409).json({ 
    success: false, 
    msg: 'This time slot is already booked' 
  });
}
```

### Error Display

```jsx
// Show error toast
const { showNotification } = useUIStore();

try {
  await appointmentApi.bookAppointment(data);
} catch (error) {
  showNotification({
    type: 'error',
    message: error.response?.data?.msg || 'Failed to book appointment'
  });
}
```

---

## 🧪 Testing Checklist

### Frontend Testing

- [ ] **Search Functionality**
  - [ ] Search by doctor name works
  - [ ] Search by specialty works
  - [ ] Debouncing prevents excessive API calls
  - [ ] Results update in real-time

- [ ] **Filter Functionality**
  - [ ] Specialty filter works
  - [ ] Location filter works
  - [ ] Online consultation filter works
  - [ ] Available today filter works
  - [ ] Rating filter works
  - [ ] Fees filter works
  - [ ] Multiple filters work together

- [ ] **Booking Flow**
  - [ ] Step 1: Specialty selection works
  - [ ] Step 2: Date picker works (no past dates)
  - [ ] Step 2: Time slots load correctly
  - [ ] Step 2: Selected slot is highlighted
  - [ ] Step 3: Reason field accepts input
  - [ ] Navigation (Back/Next) works
  - [ ] Form validation prevents progression
  - [ ] Final submission works
  - [ ] Success screen displays

- [ ] **Responsive Design**
  - [ ] Mobile view works
  - [ ] Tablet view works
  - [ ] Desktop view works

### Backend Testing

- [ ] **API Endpoints**
  - [ ] POST /api/appointments creates appointment
  - [ ] GET /api/appointments returns user's appointments
  - [ ] GET /api/appointments/:id returns specific appointment
  - [ ] GET /api/appointments/slots/:doctorId/:date returns available slots
  - [ ] PATCH /api/appointments/:id/status updates status
  - [ ] Proper error responses for invalid data

- [ ] **Authentication**
  - [ ] Unauthenticated requests are rejected
  - [ ] Patients can only book appointments
  - [ ] Doctors can only view their appointments
  - [ ] Admins can view all appointments

- [ ] **Validation**
  - [ ] Required fields are enforced
  - [ ] Date cannot be in the past
  - [ ] Slot conflicts are detected
  - [ ] Invalid doctor IDs are rejected

- [ ] **Database**
  - [ ] Appointments are saved correctly
  - [ ] Relationships (patient, doctor) work
  - [ ] Indexes improve query performance

---

## 🚀 Future Enhancements

### Phase 2 Features

1. **Real-time Availability**
   - WebSocket integration for live slot updates
   - Instant notification when preferred slot becomes available

2. **Payment Integration**
   - Consultation fee payment during booking
   - Stripe/PayPal integration
   - Payment confirmation before appointment

3. **Cancellation & Rescheduling**
   - Patient can cancel/reschedule
   - Automatic refund processing
   - Cancellation policy enforcement

4. **Reminders & Notifications**
   - Email reminders 24h before appointment
   - SMS reminders
   - WhatsApp integration
   - Push notifications

5. **Video Consultation**
   - Integrated video call (Jitsi/Twilio)
   - Pre-consultation forms
   - Post-consultation notes
   - E-prescription generation

6. **Smart Recommendations**
   - AI-based doctor matching
   - Symptom checker
   - Urgency assessment
   - Alternative time slot suggestions

7. **Multi-language Support**
   - English, Sinhala, Tamil
   - RTL support for Tamil
   - Localized date/time formats

8. **Advanced Features**
   - Recurring appointments
   - Family member appointments
   - Group appointments
   - Queue management
   - Wait list for popular doctors
   - Rating & review after consultation

---

## 📝 Implementation Steps

### For New Developers

1. **Setup Phase**
   ```bash
   # Install dependencies
   cd frontend && npm install
   cd backend && npm install
   
   # Setup environment variables
   cp .env.example .env
   ```

2. **Database Phase**
   - Create MongoDB database
   - Run seed script to populate test data
   ```bash
   cd backend && node seed.js
   ```

3. **Backend Phase**
   - Implement appointment model ✅ (Already done)
   - Implement appointment controller ✅ (Already done)
   - Implement appointment routes ✅ (Already done)
   - Test APIs using Postman

4. **Frontend Phase**
   - Create BookingPage.jsx ✅ (Already done)
   - Create BookingFlow.jsx ✅ (Already done)
   - Create appointmentApi.js ✅ (Already done)
   - Integrate with backend
   - Test user flow

5. **Testing Phase**
   - Unit tests for backend
   - Integration tests for API
   - E2E tests for booking flow
   - Load testing for concurrent bookings

6. **Deployment Phase**
   - Deploy backend to Heroku/AWS
   - Deploy frontend to Vercel/Netlify
   - Configure CORS
   - Setup monitoring

---

## 🎓 Key Concepts

### 1. Optimistic UI Updates
```jsx
// Update UI immediately, rollback if API fails
const bookAppointment = async (data) => {
  // Add to UI immediately
  const tempId = Date.now();
  addLocalAppointment({ ...data, id: tempId, status: 'pending' });
  
  try {
    const result = await appointmentApi.bookAppointment(data);
    // Replace temp with real data
    replaceLocalAppointment(tempId, result.data);
  } catch (error) {
    // Rollback on error
    removeLocalAppointment(tempId);
    showError('Failed to book appointment');
  }
};
```

### 2. Debouncing for Search
```jsx
// Prevent excessive API calls during typing
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearch) {
    searchDoctors(debouncedSearch);
  }
}, [debouncedSearch]);
```

### 3. Slot Management Algorithm
```javascript
// Generate time slots, exclude booked ones
const generateAvailableSlots = (workingHours, bookedSlots) => {
  return workingHours.filter(time => !bookedSlots.includes(time));
};
```

---

## 📚 Resources

- **React Hook Form:** https://react-hook-form.com/
- **Mongoose Documentation:** https://mongoosejs.com/
- **Express.js Guide:** https://expressjs.com/
- **Tailwind CSS:** https://tailwindcss.com/

---

## 📧 Support

For questions or issues:
- Check existing appointments implementation
- Review API documentation
- Test with Postman
- Check browser console for errors
- Review backend logs

---

**Last Updated:** January 16, 2026  
**Version:** 1.0.0  
**Status:** ✅ Core Implementation Complete
