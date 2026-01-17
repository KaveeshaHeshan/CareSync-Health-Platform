import { REGEX_PATTERNS } from './constants';

// ============================================
// BASIC VALIDATORS
// ============================================

/**
 * Check if value is empty
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Check if value is required
 * @param {*} value - Value to check
 * @returns {string|null} Error message or null
 */
export const required = (value) => {
  return isEmpty(value) ? 'This field is required' : null;
};

/**
 * Check minimum length
 * @param {number} min - Minimum length
 * @returns {function} Validator function
 */
export const minLength = (min) => (value) => {
  if (isEmpty(value)) return null;
  return value.length < min ? `Must be at least ${min} characters` : null;
};

/**
 * Check maximum length
 * @param {number} max - Maximum length
 * @returns {function} Validator function
 */
export const maxLength = (max) => (value) => {
  if (isEmpty(value)) return null;
  return value.length > max ? `Must be no more than ${max} characters` : null;
};

/**
 * Check minimum value
 * @param {number} min - Minimum value
 * @returns {function} Validator function
 */
export const minValue = (min) => (value) => {
  if (isEmpty(value)) return null;
  return Number(value) < min ? `Must be at least ${min}` : null;
};

/**
 * Check maximum value
 * @param {number} max - Maximum value
 * @returns {function} Validator function
 */
export const maxValue = (max) => (value) => {
  if (isEmpty(value)) return null;
  return Number(value) > max ? `Must be no more than ${max}` : null;
};

// ============================================
// EMAIL VALIDATORS
// ============================================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {string|null} Error message or null
 */
export const isValidEmail = (email) => {
  if (isEmpty(email)) return null;
  return REGEX_PATTERNS.EMAIL.test(email) ? null : 'Please enter a valid email address';
};

/**
 * Validate email is required
 * @param {string} email - Email to validate
 * @returns {string|null} Error message or null
 */
export const validateEmail = (email) => {
  return required(email) || isValidEmail(email);
};

// ============================================
// PASSWORD VALIDATORS
// ============================================

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {string|null} Error message or null
 */
export const isValidPassword = (password) => {
  if (isEmpty(password)) return null;
  
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  
  if (password.length < 8) {
    return 'For better security, use at least 8 characters';
  }
  
  // Check for at least one uppercase, one lowercase, and one number
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  
  if (!/\d/.test(password)) {
    return 'Password must contain at least one number';
  }
  
  return null;
};

/**
 * Validate password is required
 * @param {string} password - Password to validate
 * @returns {string|null} Error message or null
 */
export const validatePassword = (password) => {
  return required(password) || isValidPassword(password);
};

/**
 * Validate password confirmation matches
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {string|null} Error message or null
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (isEmpty(confirmPassword)) return 'Please confirm your password';
  return password === confirmPassword ? null : 'Passwords do not match';
};

// ============================================
// PHONE VALIDATORS
// ============================================

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {string|null} Error message or null
 */
export const isValidPhone = (phone) => {
  if (isEmpty(phone)) return null;
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's 10 digits (US format) or 10-15 digits (international)
  if (cleaned.length < 10) {
    return 'Phone number must be at least 10 digits';
  }
  
  if (cleaned.length > 15) {
    return 'Phone number must be no more than 15 digits';
  }
  
  return null;
};

/**
 * Validate phone number is required
 * @param {string} phone - Phone number to validate
 * @returns {string|null} Error message or null
 */
export const validatePhone = (phone) => {
  return required(phone) || isValidPhone(phone);
};

// ============================================
// AGE VALIDATORS
// ============================================

/**
 * Validate age is within range
 * @param {number|string} age - Age to validate
 * @returns {string|null} Error message or null
 */
export const isValidAge = (age) => {
  if (isEmpty(age)) return null;
  
  const numAge = Number(age);
  
  if (isNaN(numAge)) {
    return 'Age must be a number';
  }
  
  if (numAge < 0) {
    return 'Age cannot be negative';
  }
  
  if (numAge < 1) {
    return 'Age must be at least 1';
  }
  
  if (numAge > 150) {
    return 'Please enter a valid age';
  }
  
  return null;
};

/**
 * Validate age is required
 * @param {number|string} age - Age to validate
 * @returns {string|null} Error message or null
 */
export const validateAge = (age) => {
  return required(age) || isValidAge(age);
};

// ============================================
// DATE VALIDATORS
// ============================================

/**
 * Validate date is not in the past
 * @param {string|Date} date - Date to validate
 * @returns {string|null} Error message or null
 */
export const isFutureDate = (date) => {
  if (isEmpty(date)) return null;
  
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return selectedDate >= today ? null : 'Date cannot be in the past';
};

/**
 * Validate date is not too far in future
 * @param {string|Date} date - Date to validate
 * @param {number} maxMonths - Maximum months in future (default: 12)
 * @returns {string|null} Error message or null
 */
export const isWithinMaxFuture = (maxMonths = 12) => (date) => {
  if (isEmpty(date)) return null;
  
  const selectedDate = new Date(date);
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + maxMonths);
  
  return selectedDate <= maxDate ? null : `Date must be within ${maxMonths} months`;
};

/**
 * Validate date is required and in future
 * @param {string|Date} date - Date to validate
 * @returns {string|null} Error message or null
 */
export const validateFutureDate = (date) => {
  return required(date) || isFutureDate(date);
};

// ============================================
// CARD VALIDATORS
// ============================================

/**
 * Validate credit card number using Luhn algorithm
 * @param {string} cardNumber - Card number to validate
 * @returns {string|null} Error message or null
 */
export const isValidCardNumber = (cardNumber) => {
  if (isEmpty(cardNumber)) return null;
  
  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  
  // Check if only digits
  if (!/^\d+$/.test(cleaned)) {
    return 'Card number must contain only digits';
  }
  
  // Check length (13-19 digits for most cards)
  if (cleaned.length < 13 || cleaned.length > 19) {
    return 'Invalid card number length';
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0 ? null : 'Invalid card number';
};

/**
 * Validate CVV code
 * @param {string} cvv - CVV to validate
 * @returns {string|null} Error message or null
 */
export const isValidCVV = (cvv) => {
  if (isEmpty(cvv)) return null;
  
  const cleaned = cvv.replace(/\s/g, '');
  
  if (!/^\d{3,4}$/.test(cleaned)) {
    return 'CVV must be 3 or 4 digits';
  }
  
  return null;
};

/**
 * Validate card expiry date
 * @param {string} month - Expiry month (MM)
 * @param {string} year - Expiry year (YY or YYYY)
 * @returns {string|null} Error message or null
 */
export const isValidCardExpiry = (month, year) => {
  if (isEmpty(month) || isEmpty(year)) return null;
  
  const numMonth = parseInt(month, 10);
  const numYear = parseInt(year, 10);
  
  // Validate month
  if (numMonth < 1 || numMonth > 12) {
    return 'Invalid expiry month';
  }
  
  // Convert 2-digit year to 4-digit
  const fullYear = numYear < 100 ? 2000 + numYear : numYear;
  
  // Check if expired
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  if (fullYear < currentYear || (fullYear === currentYear && numMonth < currentMonth)) {
    return 'Card has expired';
  }
  
  // Check if too far in future (10 years)
  if (fullYear > currentYear + 10) {
    return 'Invalid expiry year';
  }
  
  return null;
};

// ============================================
// FILE VALIDATORS
// ============================================

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSize - Maximum size in bytes
 * @returns {string|null} Error message or null
 */
export const isValidFileSize = (maxSize) => (file) => {
  if (!file) return null;
  
  return file.size <= maxSize
    ? null
    : `File size must be less than ${(maxSize / 1024 / 1024).toFixed(2)} MB`;
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {string[]} allowedTypes - Allowed MIME types
 * @returns {string|null} Error message or null
 */
export const isValidFileType = (allowedTypes) => (file) => {
  if (!file) return null;
  
  return allowedTypes.includes(file.type)
    ? null
    : `File type must be one of: ${allowedTypes.join(', ')}`;
};

// ============================================
// MEDICAL VALIDATORS
// ============================================

/**
 * Validate blood pressure values
 * @param {number} systolic - Systolic pressure
 * @param {number} diastolic - Diastolic pressure
 * @returns {string|null} Error message or null
 */
export const isValidBloodPressure = (systolic, diastolic) => {
  if (isEmpty(systolic) || isEmpty(diastolic)) return null;
  
  const sys = Number(systolic);
  const dia = Number(diastolic);
  
  if (isNaN(sys) || isNaN(dia)) {
    return 'Blood pressure values must be numbers';
  }
  
  if (sys < 70 || sys > 250) {
    return 'Systolic pressure must be between 70 and 250';
  }
  
  if (dia < 40 || dia > 150) {
    return 'Diastolic pressure must be between 40 and 150';
  }
  
  if (sys <= dia) {
    return 'Systolic must be greater than diastolic';
  }
  
  return null;
};

/**
 * Validate temperature
 * @param {number} temp - Temperature value
 * @param {string} unit - Unit (C or F)
 * @returns {string|null} Error message or null
 */
export const isValidTemperature = (temp, unit = 'F') => {
  if (isEmpty(temp)) return null;
  
  const numTemp = Number(temp);
  
  if (isNaN(numTemp)) {
    return 'Temperature must be a number';
  }
  
  if (unit === 'F') {
    if (numTemp < 95 || numTemp > 108) {
      return 'Temperature must be between 95°F and 108°F';
    }
  } else if (unit === 'C') {
    if (numTemp < 35 || numTemp > 42) {
      return 'Temperature must be between 35°C and 42°C';
    }
  }
  
  return null;
};

// ============================================
// FORM VALIDATORS
// ============================================

/**
 * Validate entire form object
 * @param {Object} formData - Form data object
 * @param {Object} rules - Validation rules object
 * @returns {Object} Errors object
 */
export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach((field) => {
    const validators = Array.isArray(rules[field]) ? rules[field] : [rules[field]];
    
    for (const validator of validators) {
      const error = validator(formData[field]);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return errors;
};

/**
 * Check if form has any errors
 * @param {Object} errors - Errors object
 * @returns {boolean}
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).some((key) => errors[key] !== null && errors[key] !== undefined);
};

// ============================================
// COMPOSITE VALIDATORS
// ============================================

/**
 * Validate login form
 * @param {Object} formData - Form data {email, password}
 * @returns {Object} Errors object
 */
export const validateLoginForm = (formData) => {
  return validateForm(formData, {
    email: [required, isValidEmail],
    password: [required],
  });
};

/**
 * Validate registration form
 * @param {Object} formData - Form data {name, email, password, confirmPassword, phone}
 * @returns {Object} Errors object
 */
export const validateRegistrationForm = (formData) => {
  const errors = validateForm(formData, {
    name: [required, minLength(2)],
    email: [required, isValidEmail],
    password: [required, isValidPassword],
    phone: [required, isValidPhone],
  });
  
  // Validate password confirmation separately
  const confirmError = validatePasswordConfirmation(formData.password, formData.confirmPassword);
  if (confirmError) {
    errors.confirmPassword = confirmError;
  }
  
  return errors;
};

/**
 * Validate appointment booking form
 * @param {Object} formData - Form data {doctor, date, time, reason}
 * @returns {Object} Errors object
 */
export const validateAppointmentForm = (formData) => {
  return validateForm(formData, {
    doctor: [required],
    date: [required, isFutureDate],
    time: [required],
    reason: [required, minLength(10), maxLength(500)],
  });
};

/**
 * Validate profile update form
 * @param {Object} formData - Form data {name, email, phone, age, gender}
 * @returns {Object} Errors object
 */
export const validateProfileForm = (formData) => {
  return validateForm(formData, {
    name: [required, minLength(2)],
    email: [required, isValidEmail],
    phone: [isValidPhone],
    age: [isValidAge],
  });
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  // Basic validators
  isEmpty,
  required,
  minLength,
  maxLength,
  minValue,
  maxValue,
  
  // Email validators
  isValidEmail,
  validateEmail,
  
  // Password validators
  isValidPassword,
  validatePassword,
  validatePasswordConfirmation,
  
  // Phone validators
  isValidPhone,
  validatePhone,
  
  // Age validators
  isValidAge,
  validateAge,
  
  // Date validators
  isFutureDate,
  isWithinMaxFuture,
  validateFutureDate,
  
  // Card validators
  isValidCardNumber,
  isValidCVV,
  isValidCardExpiry,
  
  // File validators
  isValidFileSize,
  isValidFileType,
  
  // Medical validators
  isValidBloodPressure,
  isValidTemperature,
  
  // Form validators
  validateForm,
  hasErrors,
  validateLoginForm,
  validateRegistrationForm,
  validateAppointmentForm,
  validateProfileForm,
};
