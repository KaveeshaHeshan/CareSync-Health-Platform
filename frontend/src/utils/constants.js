// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
export const JITSI_DOMAIN = import.meta.env.VITE_JITSI_DOMAIN || 'meet.jit.si';

// User Roles
export const USER_ROLES = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  ADMIN: 'ADMIN',
};

// Appointment Status
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Appointment Types
export const APPOINTMENT_TYPES = {
  IN_PERSON: 'in-person',
  ONLINE: 'online',
};

// Consultation Status
export const CONSULTATION_STATUS = {
  SCHEDULED: 'scheduled',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  UPI: 'upi',
  NET_BANKING: 'net_banking',
  WALLET: 'wallet',
};

// Gender Options
export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

// Medical Specializations
export const SPECIALIZATIONS = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'General Medicine',
  'Gynecology',
  'Neurology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Urology',
];

// Time Slots
export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00',
];

// Status Colors (for badges and indicators)
export const STATUS_COLORS = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  completed: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  scheduled: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
  ongoing: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  failed: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  refunded: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
};

// Theme Colors
export const THEME_COLORS = {
  primary: '#4f46e5', // indigo-600
  secondary: '#7c3aed', // purple-600
  success: '#10b981', // green-500
  danger: '#ef4444', // red-500
  warning: '#f59e0b', // amber-500
  info: '#3b82f6', // blue-500
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Toast Duration
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
};

// Pagination
export const ITEMS_PER_PAGE = {
  DEFAULT: 10,
  SMALL: 5,
  MEDIUM: 15,
  LARGE: 25,
};

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALL: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy hh:mm a',
  FORM_INPUT: 'yyyy-MM-dd',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  TIME: 'hh:mm a',
};

// Navigation Links
export const PATIENT_NAV_LINKS = [
  { path: '/patient/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/patient/find-doctors', label: 'Find Doctors', icon: 'Search' },
  { path: '/patient/appointments', label: 'My Appointments', icon: 'Calendar' },
  { path: '/patient/medical-records', label: 'Medical Records', icon: 'FileText' },
  { path: '/patient/prescriptions', label: 'Prescriptions', icon: 'Pill' },
  { path: '/patient/lab-results', label: 'Lab Results', icon: 'TestTube' },
  { path: '/patient/billing', label: 'Billing', icon: 'CreditCard' },
  { path: '/patient/profile', label: 'Profile', icon: 'User' },
];

export const DOCTOR_NAV_LINKS = [
  { path: '/doctor/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/doctor/appointments', label: 'Appointments', icon: 'Calendar' },
  { path: '/doctor/patients', label: 'Patients', icon: 'Users' },
  { path: '/doctor/schedule', label: 'Schedule', icon: 'Clock' },
  { path: '/doctor/consultation-history', label: 'Consultations', icon: 'Video' },
  { path: '/doctor/earnings', label: 'Earnings', icon: 'DollarSign' },
  { path: '/doctor/profile', label: 'Profile', icon: 'User' },
];

export const ADMIN_NAV_LINKS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/admin/users', label: 'Users', icon: 'Users' },
  { path: '/admin/doctors', label: 'Doctors', icon: 'Stethoscope' },
  { path: '/admin/appointments', label: 'Appointments', icon: 'Calendar' },
  { path: '/admin/analytics', label: 'Analytics', icon: 'BarChart' },
  { path: '/admin/settings', label: 'Settings', icon: 'Settings' },
];

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTER_SUCCESS: 'Registration successful!',
  APPOINTMENT_BOOKED: 'Appointment booked successfully!',
  APPOINTMENT_CANCELLED: 'Appointment cancelled successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  PAYMENT_SUCCESS: 'Payment completed successfully!',
  FILE_UPLOADED: 'File uploaded successfully!',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_STATE: 'sidebarOpen',
  LAST_ROUTE: 'lastRoute',
};

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{10}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  NUMERIC: /^[0-9]+$/,
};

// Chart Colors (for analytics)
export const CHART_COLORS = [
  '#4f46e5', // indigo
  '#7c3aed', // purple
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#3b82f6', // blue
  '#ec4899', // pink
  '#14b8a6', // teal
];

// Dashboard Stats Icons
export const STATS_ICONS = {
  appointments: 'Calendar',
  patients: 'Users',
  revenue: 'DollarSign',
  doctors: 'Stethoscope',
  consultations: 'Video',
  pending: 'Clock',
  completed: 'CheckCircle',
  cancelled: 'XCircle',
};

// Empty State Messages
export const EMPTY_STATE_MESSAGES = {
  NO_APPOINTMENTS: 'No appointments found.',
  NO_PATIENTS: 'No patients found.',
  NO_DOCTORS: 'No doctors found.',
  NO_RECORDS: 'No records found.',
  NO_PRESCRIPTIONS: 'No prescriptions found.',
  NO_LAB_RESULTS: 'No lab results found.',
  NO_NOTIFICATIONS: 'No notifications.',
  NO_SEARCH_RESULTS: 'No results found for your search.',
};

// Breakpoints (for responsive design)
export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

export default {
  API_BASE_URL,
  SOCKET_URL,
  USER_ROLES,
  APPOINTMENT_STATUS,
  APPOINTMENT_TYPES,
  CONSULTATION_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  GENDER_OPTIONS,
  SPECIALIZATIONS,
  TIME_SLOTS,
  STATUS_COLORS,
  THEME_COLORS,
  NOTIFICATION_TYPES,
  TOAST_DURATION,
  ITEMS_PER_PAGE,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  DATE_FORMATS,
  PATIENT_NAV_LINKS,
  DOCTOR_NAV_LINKS,
  ADMIN_NAV_LINKS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  REGEX_PATTERNS,
  CHART_COLORS,
  STATS_ICONS,
  EMPTY_STATE_MESSAGES,
  BREAKPOINTS,
  ANIMATION_DURATION,
};
