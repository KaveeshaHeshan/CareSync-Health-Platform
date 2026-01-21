# CareSync Backend API Payloads

This document summarizes **request payloads** (JSON body), path params, common query params, and the typical JSON response shapes for backend endpoints.

Notes:
- Most endpoints require `Authorization: Bearer <JWT>` (because `protect` middleware is used). Exceptions are called out.
- Many responses follow `{ success: boolean, message?: string, ... }`.
- Some routes/controllers have minor naming mismatches (see **Known mismatches** at the bottom).

---

## Health

### GET /
Response:
- `{ message, status, version, timestamp }`

---

## Auth (`/api/auth`)

### POST /api/auth/register
Body:
- `name` (string, required)
- `email` (string, required)
- `password` (string, required)
- `role` (string, optional; default `PATIENT`; if `DOCTOR`, doctor fields below apply)
- `phone` (string, optional)
- `age` (number, optional)
- `gender` (string, optional)
- Doctor-only when `role="DOCTOR"`:
  - `specialization` (string, optional)
  - `experience` (number, optional)
  - `fees` (number, optional)
Response (201):
- `{ success, message, token, user: { id, name, email, role, phone, age, gender, specialization, experience, fees, isApproved, isActive } }`

### POST /api/auth/login
Body:
- `email` (string, required)
- `password` (string, required)
Response:
- `{ success, message, token, user: { id, name, email, role, phone, age, gender, specialization, experience, fees, rating, isApproved, isActive } }`

### POST /api/auth/forgot-password
Body:
- `email` (string, required)
Response:
- `{ success, message }`

### POST /api/auth/reset-password/:token
Path params:
- `token` (string)
Body:
- `newPassword` (string, required)
Response:
- `{ success, message }` (placeholder implementation)

### POST /api/auth/logout
Auth: required
Body: none
Response:
- `{ success, message }`

### GET /api/auth/profile
Auth: required
Response:
- `{ success, user: { id, name, email, role, phone, age, gender, specialization, experience, fees, rating, isApproved, isActive, createdAt } }`

### PUT /api/auth/profile
Auth: required
Body (all optional; only provided fields are updated):
- `name` (string)
- `phone` (string)
- `age` (number)
- `gender` (string)
- Doctor-only:
  - `specialization` (string)
  - `experience` (number)
  - `fees` (number)
Response:
- `{ success, message, user: { id, name, email, role, phone, age, gender, specialization, experience, fees, rating } }`

### PUT /api/auth/change-password
Auth: required
Body:
- `currentPassword` (string, required)
- `newPassword` (string, required; min length 6)
Response:
- `{ success, message }`

---

## Appointments (`/api/appointments`)

### POST /api/appointments/
Auth: required (PATIENT)
Body:
- `doctorId` (string, required)
- `date` (string/date, required)
- `time` (string, required)
- `reason` (string, required)
- `type` (string, optional; default `in-person`) 
- `notes` (string, optional)
Response (201):
- `{ success, message, appointment }`

### GET /api/appointments/
Auth: required (ADMIN in routes)
Query (optional):
- `status`, `type`, `startDate`, `endDate`
Response:
- `{ success, count, appointments: [...] }`

### GET /api/appointments/patient/:patientId
Auth: required (PATIENT/ADMIN)
Path params:
- `patientId`
Response:
- `{ success, count, appointments: [...] }`

### GET /api/appointments/doctor/:doctorId
Auth: required (DOCTOR/ADMIN)
Path params:
- `doctorId`
Response:
- `{ success, count, appointments: [...] }`

### GET /api/appointments/slots/:doctorId
Auth: required (because router uses `protect`)
Path params:
- `doctorId`
Query:
- `date` (required)
Response:
- `{ success, date, availableSlots: string[], bookedSlots: string[] }`

### GET /api/appointments/stats
Auth: required (DOCTOR/ADMIN)
Response:
- `{ success, stats: { total, pending, confirmed, completed, cancelled } }`

### GET /api/appointments/:id
Auth: required
Response:
- `{ success, appointment }`

### PUT /api/appointments/:id
Auth: required
Body (optional fields):
- `date`, `time`, `type`, `reason`, `notes`, `status`
Response:
- `{ success, message, appointment }`

### PUT /api/appointments/:id/cancel
Auth: required
Body:
- `reason` (string, optional)
Response:
- `{ success, message, appointment }`

### PUT /api/appointments/:id/complete
Auth: required (DOCTOR)
Body:
- `prescription` (any/embedded object, optional)
- `notes` (string, optional)
Response:
- `{ success, message, appointment }`

---

## Patients (`/api/patients`)

### GET /api/patients/dashboard
Auth: required
Response:
- `{ success, dashboard: { upcomingAppointments, recentPrescriptions, pendingLabResults, unreadNotifications, stats } }`

### GET /api/patients/appointments
Auth: required
Response:
- `{ success, count, appointments }`

### GET /api/patients/prescriptions
Auth: required
Query:
- `status` (optional)
Response:
- `{ success, count, prescriptions }`

### GET /api/patients/lab-results
Auth: required
Query:
- `status`, `testType` (optional)
Response:
- `{ success, count, labResults }`

### GET /api/patients/payments
Auth: required
Query:
- `status` (optional)
Response:
- `{ success, count, payments }`

### GET /api/patients/health-profile
Auth: required
Response:
- `{ success, healthProfile }`

### PUT /api/patients/health-profile
Auth: required
Body:
- `bloodType` (string)
- `allergies` (array|string)
- `chronicConditions` (array|string)
- `currentMedications` (array|string)
- `emergencyContact` (object)
Response:
- `{ success, message, healthProfile }`

### GET /api/patients/medical-history
Auth: required
Response:
- `{ success, medicalHistory: [] }`

### POST /api/patients/medical-history
Auth: required
Body:
- `historyItem` (object; any fields are accepted and pushed into `medicalHistory`)
Response:
- `{ success, message, medicalHistory }`

### PUT /api/patients/medical-history/:id
Auth: required
Path params:
- `id` (medicalHistory item id)
Body:
- `updateData` (object; replaces the matched `medicalHistory.$` subdocument)
Response:
- `{ success, message, medicalHistory }`

### DELETE /api/patients/medical-history/:id
Auth: required
Response:
- `{ success, message, medicalHistory }`

### GET /api/patients/notifications
Auth: required
Query:
- `isRead` ("true"|"false", optional)
Response:
- `{ success, count, unreadCount, notifications }`

### PUT /api/patients/notifications/:id/read
Auth: required
Body: none
Response:
- `{ success, message, notification }`

---

## Doctors (`/api/doctors`)

### GET /api/doctors/
Auth: optional (uses optional auth)
Query (optional):
- `specialization`, `minRating`, `maxFees`, `search`
Response:
- `{ success, count, doctors: [...] }`

### GET /api/doctors/:id
Auth: optional (uses optional auth)
Response:
- `{ success, doctor }`

### GET /api/doctors/dashboard
Auth: required
Response:
- `{ success, dashboard: { todayAppointments, upcomingAppointments, pendingAppointments, recentConsultations, unreadNotifications, stats } }`

### GET /api/doctors/appointments
Auth: required
Response:
- `{ success, count, appointments }`

### GET /api/doctors/patients
Auth: required
Query:
- `search` (optional)
Response:
- `{ success, count, patients: [...] }`

### GET /api/doctors/patients/:id
Auth: required
Response:
- `{ success, patient: { ...patientFields, appointments, prescriptions, labResults } }`

### POST /api/doctors/prescriptions
Auth: required
Body:
- `appointmentId` (string, required)
- `patientId` (string, required)
- `medications` (array, required; must be non-empty)
- `diagnosis` (string, optional)
- `notes` (string, optional)
- `followUpDate` (string/date, optional)
Response (201):
- `{ success, message, prescription }`

### GET /api/doctors/availability
Auth: required
Response:
- `{ success, availability: [], schedule: {} }`

### PUT /api/doctors/availability
Auth: required
Body:
- `availability` (array, required)
Response:
- `{ success, message, availability }`

### PUT /api/doctors/slots
Auth: required
Body:
- `slots` (any)
Response:
- `{ success, message, slots }`

### GET /api/doctors/earnings
Auth: required
Query:
- `startDate`, `endDate`, `status` (optional)
Response:
- `{ success, summary, count, payments }`

### GET /api/doctors/stats
Auth: required
Response:
- `{ success, stats }`

### GET /api/doctors/reviews
Auth: required
Response:
- `{ success, count: 0, reviews: [] }`

---

## Admin (`/api/admin`)

### GET /api/admin/dashboard
Auth: required (ADMIN)
Response:
- `{ success, dashboard: { overview, recentUsers, recentAppointments, monthlyRevenue, appointmentStats, userGrowth } }`

### GET /api/admin/users
Auth: required (ADMIN)
Query:
- `role`, `isActive`, `isApproved` (doctor only), `search`, `page`, `limit`
Response:
- `{ success, users, pagination }`

### GET /api/admin/users/:id
Auth: required (ADMIN)
Response:
- `{ success, user, stats }`

### PUT /api/admin/users/:id/status
Auth: required (ADMIN)
Body:
- `isActive` (boolean, required)
Response:
- `{ success, message, user }`

### DELETE /api/admin/users/:id
Auth: required (ADMIN)
Response:
- `{ success, message }`

### GET /api/admin/doctors/pending
Auth: required (ADMIN)
Response:
- `{ success, count, doctors }`

### PUT /api/admin/doctors/:id/approval
Auth: required (ADMIN)
Body:
- `isApproved` (boolean, required)
- `rejectionReason` (string, optional)
Response:
- `{ success, message, doctor }`

### GET /api/admin/appointments
Auth: required (ADMIN)
Query:
- `status`, `type`, `date`, `page`, `limit`
Response:
- `{ success, appointments, pagination }`

### GET /api/admin/analytics
Auth: required (ADMIN)
Query:
- `startDate`, `endDate` (optional)
Response:
- `{ success, analytics, period: { start, end } }`

### GET /api/admin/stats
Auth: required (ADMIN)
Response:
- `{ success, stats: { users, appointments, payments, consultations } }`

### POST /api/admin/notifications
Auth: required (ADMIN)
Body:
- `title` (string, required)
- `message` (string, required)
- Targeting (choose one):
  - `userIds` (string[], optional)
  - `role` (string, optional)
- `priority` (string, optional; default `medium`)
Response:
- `{ success, message, count }`

---

## Lab (`/api/lab`)

### GET /api/lab/dashboard
Auth: required
Response:
- `{ success, dashboard: { overview, testsByStatus, testTypeStats, recentTests } }`

### GET /api/lab/test-types
Auth: required
Response:
- `{ success, testTypes: [...] }`

### GET /api/lab/tests
Auth: required
Query (all optional):
- `status`, `testType`, `isCritical`, `isAbnormal`, `startDate`, `endDate`, `search`, `page`, `limit`
Response:
- `{ success, tests, pagination }`

### GET /api/lab/tests/pending
Auth: required
Response:
- `{ success, count, tests }`

### GET /api/lab/tests/critical
Auth: required
Response:
- `{ success, count, tests }`

### GET /api/lab/tests/:id
Auth: required
Response:
- `{ success, test }`

### POST /api/lab/tests
Auth: required
Body:
- `patient` (string, required)
- `testType` (string, required)
- `testDate` (string/date, required)
- `doctor` (string, optional)
- `description` (string, optional)
- `urgency` (string, optional; default `routine`)
Response (201):
- `{ success, message, test }`

### PUT /api/lab/tests/:id
Auth: required
Body (all optional):
- `results` (any)
- `interpretation` (string)
- `isCritical` (boolean)
- `isAbnormal` (boolean)
- `notes` (string)
- `fileUrl` (string)
- `status` (string)
Response:
- `{ success, message, test }`

### POST /api/lab/tests/:id/upload
Auth: required
Body:
- `fileUrl` (string, required)
Response:
- `{ success, message, test }`

### PUT /api/lab/tests/:id/acknowledge
Auth: required
Body: none
Response:
- `{ success, message, test }`

### DELETE /api/lab/tests/:id
Auth: required
Response:
- `{ success, message }`

### GET /api/lab/stats
Auth: required
Query:
- `startDate`, `endDate` (optional)
Response:
- `{ success, stats }`

---

## Pharmacy (`/api/pharmacy`)

### GET /api/pharmacy/dashboard
Auth: required
Response:
- `{ success, dashboard }`

### GET /api/pharmacy/medications/search
Auth: required
Query:
- `query` (string, required)
Response:
- `{ success, medications: [...] }`

### GET /api/pharmacy/prescriptions
Auth: required
Query (optional):
- `status`, `startDate`, `endDate`, `search`, `page`, `limit`
Response:
- `{ success, prescriptions, pagination }`

### GET /api/pharmacy/prescriptions/active
Auth: required
Response:
- `{ success, count, prescriptions }`

### GET /api/pharmacy/stats
Auth: required
Query:
- `startDate`, `endDate` (optional)
Response:
- `{ success, stats }`

### GET /api/pharmacy/prescriptions/:id
Auth: required
Response:
- `{ success, prescription }`

### PUT /api/pharmacy/prescriptions/:id/dispense
Auth: required
Body:
- `notes` (string, optional)
- `dispensedBy` (string, optional; default `req.user.name`)
Response:
- `{ success, message, prescription }`

### PUT /api/pharmacy/prescriptions/:id/complete
Auth: required
Body:
- `notes` (string, optional)
Response:
- `{ success, message, prescription }`

### PUT /api/pharmacy/prescriptions/:id/cancel
Auth: required
Body:
- `reason` (string, required)
Response:
- `{ success, message, prescription }`

### PUT /api/pharmacy/prescriptions/:id/notes
Auth: required
Body:
- `notes` (string, required)
Response:
- `{ success, message, prescription }`

### PUT /api/pharmacy/prescriptions/:id/verify
Auth: required
Body:
- `verified` (boolean)
- `verificationNotes` (string, optional)
Response:
- `{ success, message, prescription }`

---

## Payments (`/api/payments`)

### POST /api/payments/webhook
Auth: none (Stripe)
Body:
- Raw Stripe webhook payload (not JSON-parsed; uses `express.raw`)
Response:
- `{ received: true }`

### POST /api/payments/create-intent
Auth: required (PATIENT)
Body:
- `appointmentId` (string, required)
Response:
- `{ success, clientSecret, paymentId, amount }`

### POST /api/payments/confirm
Auth: required (PATIENT)
Body:
- `paymentIntentId` (string, required)
- `paymentId` (string, required)
Response (success):
- `{ success, message, payment }`
Response (not succeeded):
- `{ success: false, message, status }`

### POST /api/payments/refund/:paymentId
Auth: required (ADMIN)
Body:
- `reason` (string, optional)
- `amount` (number, optional)
Response:
- `{ success, message, payment }`

### GET /api/payments/history
Auth: required
Query:
- `status`, `startDate`, `endDate`, `page`, `limit` (optional)
Response:
- `{ success, payments, totals, pagination }`

### GET /api/payments/:id
Auth: required
Response:
- `{ success, payment }`

### GET /api/payments/stats/overview
Auth: required (DOCTOR/ADMIN)
Query:
- `startDate`, `endDate` (optional)
Response:
- `{ success, stats }`

### GET /api/payments/earnings/doctor
Auth: required (DOCTOR)
Query:
- `startDate`, `endDate` (optional)
Response:
- `{ success, earnings, monthlyEarnings }`

---

## Consultations (`/api/consultations`)

### POST /api/consultations/room/:appointmentId
Auth: required
Path params:
- `appointmentId`
Body: none
Response:
- `{ success, consultation, jitsiConfig: { roomName, password, domain } }`

### GET /api/consultations/history
Auth: required
Query:
- `status`, `startDate`, `endDate`, `page`, `limit` (optional)
Response:
- `{ success, consultations, pagination }`

### GET /api/consultations/stats
Auth: required
Query:
- `startDate`, `endDate` (optional)
Response:
- `{ success, stats }`

### GET /api/consultations/:id
Auth: required
Response:
- `{ success, consultation }`

### PUT /api/consultations/:id/start
Auth: required
Body: none
Response:
- `{ success, message, consultation }`

### PUT /api/consultations/:id/end
Auth: required
Body:
- `notes` (string, optional)
- `symptoms` (string, optional)
- `diagnosis` (string, optional)
Response:
- `{ success, message, consultation }`

### PUT /api/consultations/:id/cancel
Auth: required
Body:
- `reason` (string, optional)
Response:
- `{ success, message }`

### POST /api/consultations/:id/participants
Auth: required (DOCTOR)
Body:
- `userId` (string, required)
- `role` (string, optional; default `observer`)
Response:
- `{ success, message, consultation }`

### DELETE /api/consultations/:id/participants/:userId
Auth: required
Response:
- `{ success, message }`

### POST /api/consultations/:id/chat
Auth: required
Body:
- `message` (string, required)
Response:
- `{ success, message, chatMessages }`

### GET /api/consultations/:id/chat
Auth: required
Response:
- `{ success, chatMessages }`

### PUT /api/consultations/:id/quality
Auth: required
Body:
- `videoQuality` (number|string, optional)
- `audioQuality` (number|string, optional)
- `connectionStability` (number|string, optional)
Response:
- `{ success, message, qualityMetrics }`

### POST /api/consultations/:id/feedback
Auth: required
Body:
- `rating` (number 1..5, required)
- `comment` (string, optional)
Response:
- `{ success, message, feedback }`

---

## Known mismatches / gotchas

1) Payment refund route param name
- Route: `POST /api/payments/refund/:paymentId` (see routes)
- Controller uses `Payment.findById(req.params.id)` (expects `:id`)
- If refunds don’t work, align route param name or controller param usage.

2) Consultations controller param name
- Controller uses `consultationId` but routes pass `:id`; it still works because Express maps by position, but it’s easy to confuse when reading.

3) Doctors route ordering
- In `doctorRoutes`, `GET '/:id'` appears before some static paths (like `/dashboard`) which can accidentally treat `dashboard` as an id.
