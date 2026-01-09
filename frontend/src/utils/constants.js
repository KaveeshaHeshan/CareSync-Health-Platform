/**
 * CareSync Global Constants & Configuration.
 * Defines immutable values used across the platform.
 *
 */

// 1. API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://api.caresync-med.v1',
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: '/auth',
    BOOKING: '/appointments',
    RESULTS: '/lab-results',
    USERS: '/users',
  }
};

// 2. Role Enums
/**
 * Standardized system roles for access control.
 * Used by useUserStore and useAuth.
 */
export const ROLES = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  ADMIN: 'ADMIN',
};

// 3. Persistent Storage Keys
/** Keys used by useLocalStorage and Zustand persistence. */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'cs_auth_token',
  USER_SESSION: 'cs_user_session',
  THEME_PREFERENCE: 'cs_theme',
};

// 4. Appointment Statuses
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};