// Email validation
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (international format)
exports.isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

// Password validation (min 6 chars, at least 1 letter and 1 number)
exports.isValidPassword = (password) => {
  if (password.length < 6) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
};

// Strong password validation (min 8 chars, uppercase, lowercase, number, special char)
exports.isStrongPassword = (password) => {
  if (password.length < 8) return false;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
};

// Name validation (2-50 chars, letters and spaces only)
exports.isValidName = (name) => {
  if (!name || name.length < 2 || name.length > 50) return false;
  const nameRegex = /^[a-zA-Z\s]+$/;
  return nameRegex.test(name);
};

// Age validation (must be between 0 and 150)
exports.isValidAge = (age) => {
  const ageNum = parseInt(age);
  return !isNaN(ageNum) && ageNum >= 0 && ageNum <= 150;
};

// Date validation (must be valid date)
exports.isValidDate = (date) => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

// Future date validation
exports.isFutureDate = (date) => {
  const dateObj = new Date(date);
  const now = new Date();
  return dateObj > now;
};

// Past date validation
exports.isPastDate = (date) => {
  const dateObj = new Date(date);
  const now = new Date();
  return dateObj < now;
};

// Time validation (HH:MM format)
exports.isValidTime = (time) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

// MongoDB ObjectId validation
exports.isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

// URL validation
exports.isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Amount validation (positive number with max 2 decimal places)
exports.isValidAmount = (amount) => {
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum < 0) return false;
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  return decimalPlaces <= 2;
};

// Appointment date validation (not in the past, not too far in future)
exports.isValidAppointmentDate = (date) => {
  const appointmentDate = new Date(date);
  const now = new Date();
  const maxFutureDate = new Date();
  maxFutureDate.setMonth(maxFutureDate.getMonth() + 6); // Max 6 months ahead
  
  return appointmentDate > now && appointmentDate < maxFutureDate;
};

// Prescription validation
exports.isValidPrescription = (prescription) => {
  const required = ['medication', 'dosage', 'frequency', 'duration'];
  return required.every(field => prescription[field] && prescription[field].trim() !== '');
};

// Medical record number validation
exports.isValidMedicalRecordNumber = (mrn) => {
  const mrnRegex = /^MRN-[0-9]{6,10}$/;
  return mrnRegex.test(mrn);
};

// Blood pressure validation (format: 120/80)
exports.isValidBloodPressure = (bp) => {
  const bpRegex = /^[0-9]{2,3}\/[0-9]{2,3}$/;
  if (!bpRegex.test(bp)) return false;
  
  const [systolic, diastolic] = bp.split('/').map(Number);
  return systolic >= 70 && systolic <= 250 && diastolic >= 40 && diastolic <= 150;
};

// Temperature validation (in Celsius)
exports.isValidTemperature = (temp) => {
  const tempNum = parseFloat(temp);
  return !isNaN(tempNum) && tempNum >= 35 && tempNum <= 42;
};

// Heart rate validation (bpm)
exports.isValidHeartRate = (hr) => {
  const hrNum = parseInt(hr);
  return !isNaN(hrNum) && hrNum >= 30 && hrNum <= 250;
};

// Weight validation (in kg)
exports.isValidWeight = (weight) => {
  const weightNum = parseFloat(weight);
  return !isNaN(weightNum) && weightNum > 0 && weightNum < 500;
};

// Height validation (in cm)
exports.isValidHeight = (height) => {
  const heightNum = parseFloat(height);
  return !isNaN(heightNum) && heightNum > 0 && heightNum < 300;
};

// Sanitize input (remove HTML tags and trim)
exports.sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/<[^>]*>/g, '').trim();
};

// Validate required fields
exports.validateRequiredFields = (data, requiredFields) => {
  const missingFields = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missingFields.push(field);
    }
  });
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

// Comprehensive user registration validation
exports.validateUserRegistration = (userData) => {
  const errors = [];
  
  if (!userData.name || !exports.isValidName(userData.name)) {
    errors.push('Invalid name. Must be 2-50 characters, letters and spaces only.');
  }
  
  if (!userData.email || !exports.isValidEmail(userData.email)) {
    errors.push('Invalid email address.');
  }
  
  if (!userData.password || !exports.isValidPassword(userData.password)) {
    errors.push('Invalid password. Must be at least 6 characters with letters and numbers.');
  }
  
  if (userData.phone && !exports.isValidPhone(userData.phone)) {
    errors.push('Invalid phone number.');
  }
  
  if (userData.age && !exports.isValidAge(userData.age)) {
    errors.push('Invalid age. Must be between 0 and 150.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Comprehensive appointment validation
exports.validateAppointment = (appointmentData) => {
  const errors = [];
  
  if (!appointmentData.doctor || !exports.isValidObjectId(appointmentData.doctor)) {
    errors.push('Invalid doctor ID.');
  }
  
  if (!appointmentData.date || !exports.isValidAppointmentDate(appointmentData.date)) {
    errors.push('Invalid appointment date. Must be in the future and within 6 months.');
  }
  
  if (!appointmentData.time || !exports.isValidTime(appointmentData.time)) {
    errors.push('Invalid time format. Use HH:MM format.');
  }
  
  if (!appointmentData.reason || appointmentData.reason.trim() === '') {
    errors.push('Appointment reason is required.');
  }
  
  if (appointmentData.type && !['in-person', 'online'].includes(appointmentData.type)) {
    errors.push('Invalid appointment type. Must be "in-person" or "online".');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};