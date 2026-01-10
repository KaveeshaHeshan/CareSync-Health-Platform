# 🏗️ CareSync System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                               │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   React Frontend (Vite)                       │  │
│  │                   http://localhost:5174                       │  │
│  │                                                                │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │  │
│  │  │  Patient │  │  Doctor  │  │  Admin   │  │   Lab    │    │  │
│  │  │   Pages  │  │   Pages  │  │   Pages  │  │  Pages   │    │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │  │
│  │       │             │             │             │            │  │
│  │       └─────────────┴─────────────┴─────────────┘            │  │
│  │                          │                                    │  │
│  │                    ┌─────▼─────┐                             │  │
│  │                    │   Axios   │                             │  │
│  │                    │  Instance │                             │  │
│  │                    └─────┬─────┘                             │  │
│  │                          │                                    │  │
│  │        ┌─────────────────┼─────────────────┐                │  │
│  │        │                 │                 │                │  │
│  │   ┌────▼────┐      ┌────▼────┐      ┌────▼────┐           │  │
│  │   │  Auth   │      │Appointment│     │  Lab    │           │  │
│  │   │   API   │      │    API    │     │   API   │    ...    │  │
│  │   └─────────┘      └───────────┘     └─────────┘           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                           HTTP/HTTPS
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                    Node.js Backend (Express)                         │
│                    http://localhost:5000/api                         │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                        Middleware Layer                         │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │ │
│  │  │  Morgan  │  │  Helmet  │  │   CORS   │  │   JWT    │      │ │
│  │  │ Logger   │  │ Security │  │  Config  │  │   Auth   │      │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                         Route Layer                             │ │
│  │                                                                  │ │
│  │  /auth      /appointments   /patients   /lab   /pharmacy       │ │
│  │  /payments      /admin         ...                              │ │
│  └─────────────────┬────────────────────────────────────────────┘  │
│                    │                                                 │
│  ┌─────────────────▼───────────────────────────────────────────┐   │
│  │                    Controller Layer                          │   │
│  │                                                               │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │   │
│  │  │  Auth   │  │Appointment│ │ Patient │  │   Lab   │       │   │
│  │  │Controller│ │Controller│  │Controller│ │Controller│  ...  │   │
│  │  └────┬────┘  └────┬─────┘  └────┬────┘  └────┬────┘       │   │
│  └───────┼────────────┼─────────────┼────────────┼────────────┘   │
│          │            │             │            │                  │
│  ┌───────▼────────────▼─────────────▼────────────▼────────────┐   │
│  │                     Mongoose ODM                             │   │
│  │                                                               │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │   │
│  │  │  User   │  │Appointment│ │LabResult│  │Prescription│    │   │
│  │  │  Model  │  │  Model   │  │  Model  │  │  Model   │     │   │
│  │  └─────────┘  └──────────┘  └─────────┘  └──────────┘     │   │
│  └───────────────────────────┬──────────────────────────────────┘  │
└────────────────────────────────┼────────────────────────────────────┘
                                 │
                            MongoDB Driver
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                       MongoDB Atlas Database                         │
│                    (Cloud-hosted MongoDB)                            │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │    users     │  │ appointments │  │  labresults  │             │
│  │  collection  │  │  collection  │  │  collection  │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                       │
│  ┌──────────────┐                                                   │
│  │prescriptions │                                                   │
│  │  collection  │                                                   │
│  └──────────────┘                                                   │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. User Authentication Flow

```
┌────────┐                  ┌────────┐                 ┌────────┐
│        │  1. POST /login  │        │  2. Query DB    │        │
│ Client ├─────────────────►│Backend ├────────────────►│MongoDB │
│        │  email/password  │        │  find user      │        │
└───┬────┘                  └───┬────┘                 └────┬───┘
    │                           │                           │
    │                           │  3. User found            │
    │                           │◄──────────────────────────┘
    │                           │
    │                           │  4. Compare password
    │                           │     (bcrypt.compare)
    │                           │
    │  5. JWT token             │  6. Generate token
    │◄──────────────────────────┤     (jwt.sign)
    │  + user data              │
    │                           │
    │  6. Store token           │
    │     (localStorage)        │
    └───────────────────────────┘
```

### 2. Appointment Booking Flow

```
┌────────┐                  ┌────────┐                 ┌────────┐
│        │  1. GET /doctors │        │  2. Query DB    │        │
│ Client ├─────────────────►│Backend ├────────────────►│MongoDB │
│        │                  │        │                 │        │
└───┬────┘                  └───┬────┘                 └────┬───┘
    │                           │                           │
    │  3. Doctor list           │  4. Return doctors        │
    │◄──────────────────────────┤◄──────────────────────────┘
    │                           │
    │                           │
    │  5. GET /slots/:doctorId  │
    ├──────────────────────────►│  6. Query appointments
    │  ?date=2024-01-20         ├────────────────────────┐
    │                           │                        │
    │                           │  7. Calculate available│
    │  8. Available slots       │     slots (9AM-5PM)   │
    │◄──────────────────────────┤◄───────────────────────┘
    │  [09:00, 10:00, ...]      │
    │                           │
    │  9. POST /appointments    │
    ├──────────────────────────►│  10. Validate slot
    │  {doctorId, date, time}   ├────────────────────────┐
    │  + JWT token              │    Check conflicts     │
    │                           │◄───────────────────────┘
    │                           │
    │                           │  11. Create appointment
    │                           ├────────────────────────┐
    │  12. Confirmation         │                        │
    │◄──────────────────────────┤  12. Save to DB       │
    │  {appointmentId, ...}     │◄───────────────────────┘
    └───────────────────────────┘
```

### 3. Doctor Dashboard Flow

```
┌────────┐                  ┌────────┐                 ┌────────┐
│        │  1. GET /me      │        │  2. Verify JWT  │        │
│ Doctor ├─────────────────►│Backend ├────────────────►│JWT     │
│ Client │  + JWT token     │        │                 │Verify  │
└───┬────┘                  └───┬────┘                 └────┬───┘
    │                           │                           │
    │                           │  3. Token valid           │
    │  4. User data             │◄──────────────────────────┘
    │◄──────────────────────────┤
    │                           │
    │  5. GET /appointments     │
    ├──────────────────────────►│  6. Query DB
    │  + JWT token              ├────────────────────────┐
    │                           │  WHERE doctor = userId │
    │                           │  AND date = today      │
    │  7. Today's appointments  │◄───────────────────────┘
    │◄──────────────────────────┤
    │  [{id, patient, time}]    │
    │                           │
    │  8. Calculate stats       │
    │     (total, pending, etc.)│
    └───────────────────────────┘
```

---

## Component Architecture

### Frontend Component Hierarchy

```
App
├── AuthContext (Global state)
├── MainLayout
│   ├── Navbar
│   ├── Sidebar (role-based menu)
│   └── Outlet (child routes)
│
├── PublicRoutes
│   ├── LoginPage
│   │   └── LoginForm
│   ├── RegisterPage
│   │   └── RegisterForm
│   └── NotFound
│
├── PatientRoutes (Protected)
│   ├── PatientDashboard
│   │   ├── HealthHistory
│   │   │   └── AppointmentCard
│   │   └── UpcomingAppointments
│   ├── BookingFlow
│   │   ├── Step1: Specialty Selection
│   │   ├── Step2: Doctor Selection
│   │   ├── Step3: Date Selection
│   │   ├── Step4: Time Selection
│   │   └── Step5: Confirmation
│   ├── LabResults
│   │   └── ResultCard
│   └── HistoryPage
│       ├── AppointmentsTab
│       ├── LabResultsTab
│       └── PrescriptionsTab
│
├── DoctorRoutes (Protected)
│   ├── DoctorDashboard
│   │   ├── Statistics
│   │   └── PatientQueue
│   │       └── PatientCard
│   ├── SchedulePage
│   │   └── AppointmentList
│   └── PrescriptionGenerator
│       └── MedicationForm
│
├── AdminRoutes (Protected)
│   ├── AdminDashboard
│   │   ├── PlatformStats
│   │   └── QuickLinks
│   └── UserManagement
│       ├── UserTable
│       ├── EditUserModal
│       └── DeleteConfirmation
│
└── SharedComponents
    ├── Button
    ├── Card
    ├── Input
    ├── Modal
    ├── Spinner
    ├── Badge
    └── NotificationToast
```

### Backend File Structure

```
backend/
├── server.js (Entry point)
│   ├── Initialize Express
│   ├── Load middleware
│   ├── Register routes
│   └── Start server
│
├── config/
│   ├── db.js (MongoDB connection)
│   └── stripe.js (Stripe config)
│
├── middleware/
│   ├── authMiddleware.js
│   │   └── verifyToken() → req.user
│   └── rolemiddleware.js
│       └── checkRole([roles]) → authorize
│
├── routes/
│   ├── authRoutes.js → /api/auth/*
│   ├── appointmentRoutes.js → /api/appointments/*
│   ├── patientRoutes.js → /api/patients/*
│   ├── labRoutes.js → /api/lab/*
│   ├── pharmacyRoutes.js → /api/pharmacy/*
│   ├── paymentRoutes.js → /api/payments/*
│   └── adminRoutes.js → /api/admin/*
│
├── controllers/
│   ├── authController.js
│   │   ├── register()
│   │   ├── login()
│   │   ├── getCurrentUser()
│   │   └── logout()
│   ├── appointmentController.js
│   │   ├── getAppointments()
│   │   ├── bookAppointment()
│   │   ├── getAvailableSlots()
│   │   ├── updateStatus()
│   │   └── cancelAppointment()
│   └── ... (other controllers)
│
└── models/
    ├── User.js (Schema + methods)
    ├── Appointment.js
    ├── LabResult.js
    └── Prescription.js
```

---

## Database Schema

### Users Collection

```javascript
{
  _id: ObjectId("..."),
  name: "Dr. Sarah Johnson",
  email: "sarah.johnson@caresync.com",
  password: "$2a$10$hashed...", // bcrypt hash
  role: "DOCTOR",
  phone: "555-0101",
  address: "123 Medical Center",
  dateOfBirth: ISODate("1985-03-15"),
  gender: "Female",
  specialization: "Cardiology", // Only for doctors
  licenseNumber: "MD12345", // Only for doctors
  createdAt: ISODate("2024-01-01"),
  updatedAt: ISODate("2024-01-01")
}
```

### Appointments Collection

```javascript
{
  _id: ObjectId("..."),
  patient: ObjectId("..."), // ref: User
  doctor: ObjectId("..."), // ref: User
  date: ISODate("2024-01-20"),
  time: "10:00",
  type: "in-person", // or "tele-consultation", "video-call"
  status: "pending", // or "confirmed", "completed", "cancelled"
  reasonForVisit: "Regular checkup",
  symptoms: "Chest pain",
  notes: "Patient reports...",
  cancellationReason: null,
  cancelledBy: null,
  cancelledAt: null,
  createdAt: ISODate("2024-01-15"),
  updatedAt: ISODate("2024-01-15")
}
```

### LabResults Collection

```javascript
{
  _id: ObjectId("..."),
  patient: ObjectId("..."), // ref: User
  testName: "Complete Blood Count",
  testType: "Blood Test",
  result: "Normal",
  fileUrl: "https://cloudinary.com/...",
  status: "completed", // or "pending", "reviewed"
  uploadedBy: ObjectId("..."), // ref: User (lab tech)
  notes: "All values within normal range",
  createdAt: ISODate("2024-01-10"),
  updatedAt: ISODate("2024-01-10")
}
```

### Prescriptions Collection

```javascript
{
  _id: ObjectId("..."),
  patient: ObjectId("..."), // ref: User
  doctor: ObjectId("..."), // ref: User
  medications: [
    {
      name: "Amoxicillin",
      dosage: "500mg",
      frequency: "3 times daily",
      duration: "7 days",
      instructions: "Take with food"
    }
  ],
  diagnosis: "Bacterial infection",
  instructions: "Complete full course",
  status: "pending", // or "filled", "out-for-delivery", "delivered", "cancelled"
  createdAt: ISODate("2024-01-15"),
  updatedAt: ISODate("2024-01-15")
}
```

---

## API Request/Response Flow

### Example: Book Appointment

**Request:**
```http
POST /api/appointments HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "doctorId": "679abc123def456789012345",
  "date": "2024-01-20",
  "time": "10:00",
  "type": "in-person",
  "reasonForVisit": "Regular checkup",
  "symptoms": "None"
}
```

**Backend Processing:**
1. `authMiddleware` validates JWT token → extracts userId
2. `appointmentController.bookAppointment()` called
3. Validates input data (Mongoose validation)
4. Checks slot availability (query existing appointments)
5. Creates new appointment document
6. Saves to MongoDB
7. Returns response

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "msg": "Appointment booked successfully",
  "data": {
    "_id": "679def123abc456789012345",
    "patient": "679abc123def456789012345",
    "doctor": "679xyz123def456789012345",
    "date": "2024-01-20T00:00:00.000Z",
    "time": "10:00",
    "type": "in-person",
    "status": "pending",
    "reasonForVisit": "Regular checkup",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Security Flow

### JWT Authentication Process

```
1. User Login:
   ┌──────────┐
   │  Client  │  email + password
   └────┬─────┘
        │
        ▼
   ┌──────────┐
   │ Backend  │  Verify credentials
   │ (bcrypt) │  Compare password hash
   └────┬─────┘
        │
        ▼
   ┌──────────┐
   │   JWT    │  Generate token
   │  Sign    │  jwt.sign({userId, role}, secret, {expiresIn: '24h'})
   └────┬─────┘
        │
        ▼
   ┌──────────┐
   │  Client  │  Store token in localStorage
   └──────────┘

2. Authenticated Request:
   ┌──────────┐
   │  Client  │  Request + Authorization: Bearer <token>
   └────┬─────┘
        │
        ▼
   ┌──────────┐
   │Middleware│  Extract token from header
   │  Auth    │  jwt.verify(token, secret)
   └────┬─────┘
        │
        ▼
   ┌──────────┐
   │  Valid?  │──Yes──► Decode payload → req.user
   └────┬─────┘
        │
        No
        │
        ▼
   401 Unauthorized
```

---

## Deployment Architecture

### Production Setup (Recommended)

```
┌─────────────────────────────────────────────────────────────┐
│                      Internet/Users                          │
└──────────────────┬──────────────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
┌─────────────────┐  ┌─────────────────┐
│     Vercel      │  │    Railway      │
│   (Frontend)    │  │   (Backend)     │
│                 │  │                 │
│ React Build     │  │ Node.js Server  │
│ Static Assets   │  │ Express API     │
│ CDN Cached      │  │ Environment     │
│                 │  │ Variables       │
└─────────────────┘  └────────┬────────┘
                              │
                              │ MongoDB
                              │ Connection
                              ▼
                     ┌─────────────────┐
                     │  MongoDB Atlas  │
                     │  (Database)     │
                     │                 │
                     │ Cloud-hosted    │
                     │ Auto-scaling    │
                     │ Backups         │
                     └─────────────────┘
```

### Environment Variables

**Backend (.env):**
```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=production_secret_key
STRIPE_SECRET_KEY=sk_live_...
CLIENT_URL=https://caresync.vercel.app
NODE_ENV=production
```

**Frontend (.env):**
```env
VITE_API_URL=https://caresync-api.railway.app/api
```

---

## Monitoring & Logging

### Request Lifecycle with Logging

```
1. Client Request
   │
   ▼
2. Morgan Logger
   │ Logs: "POST /api/appointments 200 150ms"
   ▼
3. Middleware Chain
   │ ├─ CORS
   │ ├─ Helmet (security headers)
   │ └─ JWT Auth
   ▼
4. Route Handler
   │ Executes controller
   ▼
5. Controller
   │ Business logic
   │ Database operations
   ▼
6. Response
   │ Send JSON
   ▼
7. Client Receives
   │ Update UI
   └─ Toast notification
```

---

## Performance Optimization

### Caching Strategy

```
┌──────────────┐
│   Client     │
│  (Browser)   │  1. Cache static assets (images, CSS, JS)
└──────┬───────┘     LocalStorage for user data
       │
       ▼
┌──────────────┐
│   Backend    │  2. API response caching (Redis)
│   (Express)  │     Cache doctor list, specialties
└──────┬───────┘     Rate limiting per IP
       │
       ▼
┌──────────────┐
│   Database   │  3. MongoDB indexes on:
│  (MongoDB)   │     - user.email
│              │     - appointment.doctor + date
│              │     - appointment.patient + status
└──────────────┘     Query optimization with .lean()
```

---

**📚 This architecture supports:**
- ✅ Scalability (horizontal scaling)
- ✅ Security (JWT + RBAC + HTTPS)
- ✅ Maintainability (separation of concerns)
- ✅ Testability (modular controllers)
- ✅ Performance (caching + indexing)
- ✅ Reliability (error handling + validation)

---

**Built with industry best practices and modern design patterns.**
