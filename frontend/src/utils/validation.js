import { z } from 'zod';

/**
 * CareSync Centralized Validation Schemas
 * Used for form validation and API payload verification.
 *
 */

// 1. Authentication Schema
export const loginSchema = z.object({
  email: z.string().email("A valid institutional or personal email is required."),
  password: z.string().min(8, "Security requirement: Password must be at least 8 characters."),
});

// 2. Appointment Booking Schema
export const bookingSchema = z.object({
  doctorId: z.string().min(1, "Please select a healthcare provider."),
  appointmentDate: z.date().min(new Date(), "Appointments must be scheduled for a future date."),
  timeSlot: z.string().min(1, "Please select an available time window."),
  reason: z.string().min(5, "Please provide a brief reason for the visit (min 5 chars).").max(500),
});

// 3. Laboratory Results Schema
export const resultsSchema = z.object({
  testType: z.string().min(1, "Diagnostic test category is required."),
  value: z.number().positive("Result values must be a positive numerical figure."),
  unit: z.string().min(1, "Standard unit of measurement (e.g., mg/dL) is required."),
  status: z.enum(['Normal', 'Abnormal', 'Critical'], {
    errorMap: () => ({ message: "Please select a valid clinical status." }),
  }),
});

// 4. User Role Management
export const userRoleSchema = z.object({
  role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN'], {
    errorMap: () => ({ message: "Invalid system role assigned." }),
  }),
});