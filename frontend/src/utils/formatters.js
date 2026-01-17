import { format, parseISO, formatDistanceToNow, isValid, parse } from 'date-fns';

// ============================================
// DATE FORMATTERS
// ============================================

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} formatString - Format pattern (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid Date';
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date with time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date with time
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy hh:mm a');
};

/**
 * Format date for form inputs (yyyy-MM-dd)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date for input
 */
export const formatDateForInput = (date) => {
  return formatDate(date, 'yyyy-MM-dd');
};

/**
 * Format time only (12-hour format)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted time
 */
export const formatTime = (date) => {
  return formatDate(date, 'hh:mm a');
};

/**
 * Format time only (24-hour format)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted time
 */
export const formatTime24 = (date) => {
  return formatDate(date, 'HH:mm');
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid Date';
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Format day of week
 * @param {string|Date} date - Date to format
 * @returns {string} Day of week
 */
export const formatDayOfWeek = (date) => {
  return formatDate(date, 'EEEE');
};

/**
 * Format month and year
 * @param {string|Date} date - Date to format
 * @returns {string} Month and year
 */
export const formatMonthYear = (date) => {
  return formatDate(date, 'MMMM yyyy');
};

// ============================================
// CURRENCY FORMATTERS
// ============================================

/**
 * Format number as currency (USD)
 * @param {number|string} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
  
  try {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  } catch (error) {
    console.error('Currency formatting error:', error);
    return '$0.00';
  }
};

/**
 * Format number as Indian Rupees
 * @param {number|string} amount - Amount to format
 * @returns {string} Formatted INR string
 */
export const formatINR = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
  
  try {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  } catch (error) {
    console.error('INR formatting error:', error);
    return '₹0.00';
  }
};

/**
 * Format number with commas (no currency symbol)
 * @param {number|string} number - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) return '0';
  
  try {
    const num = typeof number === 'string' ? parseFloat(number) : number;
    return new Intl.NumberFormat('en-US').format(num);
  } catch (error) {
    console.error('Number formatting error:', error);
    return '0';
  }
};

/**
 * Format number as percentage
 * @param {number|string} value - Value to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  
  try {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num.toFixed(decimals)}%`;
  } catch (error) {
    console.error('Percentage formatting error:', error);
    return '0%';
  }
};

// ============================================
// PHONE NUMBER FORMATTERS
// ============================================

/**
 * Format phone number (US format)
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return 'N/A';
  
  // Remove all non-numeric characters
  const cleaned = phone.toString().replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    // US format: (123) 456-7890
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    // US format with country code: +1 (123) 456-7890
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length > 10) {
    // International format
    return `+${cleaned}`;
  }
  
  return phone;
};

/**
 * Format phone number (Indian format)
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumberIN = (phone) => {
  if (!phone) return 'N/A';
  
  const cleaned = phone.toString().replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    // Indian format: +91 12345 67890
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    // Already has country code
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
};

// ============================================
// TEXT FORMATTERS
// ============================================

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} Title case string
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  if (!bytes) return 'N/A';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// ============================================
// STATUS FORMATTERS
// ============================================

/**
 * Format appointment status with proper casing
 * @param {string} status - Status to format
 * @returns {string} Formatted status
 */
export const formatStatus = (status) => {
  if (!status) return 'N/A';
  return capitalize(status.replace(/-/g, ' '));
};

/**
 * Format user role for display
 * @param {string} role - Role to format
 * @returns {string} Formatted role
 */
export const formatRole = (role) => {
  if (!role) return 'N/A';
  
  const roleMap = {
    PATIENT: 'Patient',
    DOCTOR: 'Doctor',
    ADMIN: 'Administrator',
  };
  
  return roleMap[role.toUpperCase()] || capitalize(role);
};

// ============================================
// MEDICAL FORMATTERS
// ============================================

/**
 * Format blood pressure reading
 * @param {number} systolic - Systolic pressure
 * @param {number} diastolic - Diastolic pressure
 * @returns {string} Formatted blood pressure
 */
export const formatBloodPressure = (systolic, diastolic) => {
  if (!systolic || !diastolic) return 'N/A';
  return `${systolic}/${diastolic} mmHg`;
};

/**
 * Format temperature
 * @param {number} temp - Temperature value
 * @param {string} unit - Unit (C or F)
 * @returns {string} Formatted temperature
 */
export const formatTemperature = (temp, unit = 'F') => {
  if (!temp) return 'N/A';
  return `${temp.toFixed(1)}°${unit}`;
};

/**
 * Format weight
 * @param {number} weight - Weight value
 * @param {string} unit - Unit (kg or lbs)
 * @returns {string} Formatted weight
 */
export const formatWeight = (weight, unit = 'kg') => {
  if (!weight) return 'N/A';
  return `${weight} ${unit}`;
};

/**
 * Format height
 * @param {number} height - Height in cm
 * @returns {string} Formatted height
 */
export const formatHeight = (height) => {
  if (!height) return 'N/A';
  
  // Convert cm to feet and inches
  const totalInches = height / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  
  return `${height} cm (${feet}'${inches}")`;
};

// ============================================
// ADDRESS FORMATTER
// ============================================

/**
 * Format address object to string
 * @param {Object} address - Address object
 * @returns {string} Formatted address
 */
export const formatAddress = (address) => {
  if (!address) return 'N/A';
  
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country,
  ].filter(Boolean);
  
  return parts.join(', ') || 'N/A';
};

// ============================================
// DURATION FORMATTER
// ============================================

/**
 * Format duration in minutes to readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return '0 min';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
};

// ============================================
// CREDIT CARD FORMATTER
// ============================================

/**
 * Format credit card number with masking
 * @param {string} cardNumber - Card number
 * @param {boolean} showLast4 - Show last 4 digits (default: true)
 * @returns {string} Formatted card number
 */
export const formatCardNumber = (cardNumber, showLast4 = true) => {
  if (!cardNumber) return 'N/A';
  
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (showLast4 && cleaned.length >= 4) {
    const last4 = cleaned.slice(-4);
    return `**** **** **** ${last4}`;
  }
  
  return '**** **** **** ****';
};

/**
 * Format expiry date (MM/YY)
 * @param {string} month - Month (2 digits)
 * @param {string} year - Year (2 or 4 digits)
 * @returns {string} Formatted expiry
 */
export const formatCardExpiry = (month, year) => {
  if (!month || !year) return 'N/A';
  
  const shortYear = year.length === 4 ? year.slice(-2) : year;
  return `${month.padStart(2, '0')}/${shortYear}`;
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  formatDate,
  formatDateTime,
  formatDateForInput,
  formatTime,
  formatTime24,
  formatRelativeTime,
  formatDayOfWeek,
  formatMonthYear,
  formatCurrency,
  formatINR,
  formatNumber,
  formatPercentage,
  formatPhoneNumber,
  formatPhoneNumberIN,
  capitalize,
  toTitleCase,
  truncateText,
  formatFileSize,
  formatStatus,
  formatRole,
  formatBloodPressure,
  formatTemperature,
  formatWeight,
  formatHeight,
  formatAddress,
  formatDuration,
  formatCardNumber,
  formatCardExpiry,
};
