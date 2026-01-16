import axiosInstance from './axiosInstance';

const doctorApi = {
  // ========== Doctor Profile ==========
  
  // Get doctor profile
  getProfile: async (doctorId) => {
    const response = await axiosInstance.get(`/doctors/${doctorId}`);
    return response.data;
  },

  // Get my profile (current doctor)
  getMyProfile: async () => {
    const response = await axiosInstance.get('/doctors/me');
    return response.data;
  },

  // Update doctor profile
  updateProfile: async (doctorId, profileData) => {
    const response = await axiosInstance.put(`/doctors/${doctorId}`, profileData);
    return response.data;
  },

  // Upload profile picture
  uploadProfilePicture: async (formData) => {
    const response = await axiosInstance.post('/doctors/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update specialization
  updateSpecialization: async (doctorId, specializationData) => {
    const response = await axiosInstance.put(`/doctors/${doctorId}/specialization`, specializationData);
    return response.data;
  },

  // ========== Appointments ==========
  
  // Get all appointments for doctor
  getAppointments: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axiosInstance.get(`/doctors/appointments${params ? `?${params}` : ''}`);
    return response.data;
  },

  // Get my appointments
  getMyAppointments: async () => {
    const response = await axiosInstance.get('/doctors/my-appointments');
    return response.data;
  },

  // Get appointment by ID
  getAppointmentById: async (appointmentId) => {
    const response = await axiosInstance.get(`/doctors/appointments/${appointmentId}`);
    return response.data;
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId, status) => {
    const response = await axiosInstance.patch(`/doctors/appointments/${appointmentId}/status`, { status });
    return response.data;
  },

  // Get today's appointments
  getTodayAppointments: async () => {
    const response = await axiosInstance.get('/doctors/appointments/today');
    return response.data;
  },

  // Get upcoming appointments
  getUpcomingAppointments: async () => {
    const response = await axiosInstance.get('/doctors/appointments/upcoming');
    return response.data;
  },

  // Get appointment history
  getAppointmentHistory: async () => {
    const response = await axiosInstance.get('/doctors/appointments/history');
    return response.data;
  },

  // Confirm appointment
  confirmAppointment: async (appointmentId) => {
    const response = await axiosInstance.patch(`/doctors/appointments/${appointmentId}/confirm`);
    return response.data;
  },

  // Complete appointment
  completeAppointment: async (appointmentId, completionData) => {
    const response = await axiosInstance.patch(`/doctors/appointments/${appointmentId}/complete`, completionData);
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId, reason) => {
    const response = await axiosInstance.patch(`/doctors/appointments/${appointmentId}/cancel`, { reason });
    return response.data;
  },

  // ========== Schedule Management ==========
  
  // Get schedule/availability
  getSchedule: async (doctorId) => {
    const response = await axiosInstance.get(`/doctors/${doctorId}/schedule`);
    return response.data;
  },

  // Get my schedule
  getMySchedule: async () => {
    const response = await axiosInstance.get('/doctors/schedule');
    return response.data;
  },

  // Update schedule
  updateSchedule: async (scheduleData) => {
    const response = await axiosInstance.put('/doctors/schedule', scheduleData);
    return response.data;
  },

  // Add time slot
  addTimeSlot: async (slotData) => {
    const response = await axiosInstance.post('/doctors/schedule/slots', slotData);
    return response.data;
  },

  // Remove time slot
  removeTimeSlot: async (slotId) => {
    const response = await axiosInstance.delete(`/doctors/schedule/slots/${slotId}`);
    return response.data;
  },

  // Block time slot (for holidays/breaks)
  blockTimeSlot: async (blockData) => {
    const response = await axiosInstance.post('/doctors/schedule/block', blockData);
    return response.data;
  },

  // Unblock time slot
  unblockTimeSlot: async (blockId) => {
    const response = await axiosInstance.delete(`/doctors/schedule/block/${blockId}`);
    return response.data;
  },

  // Get available slots for a date
  getAvailableSlots: async (date) => {
    const response = await axiosInstance.get('/doctors/schedule/available', {
      params: { date }
    });
    return response.data;
  },

  // ========== Patients ==========
  
  // Get all patients
  getPatients: async () => {
    const response = await axiosInstance.get('/doctors/patients');
    return response.data;
  },

  // Get patient by ID
  getPatientById: async (patientId) => {
    const response = await axiosInstance.get(`/doctors/patients/${patientId}`);
    return response.data;
  },

  // Get patient medical history
  getPatientHistory: async (patientId) => {
    const response = await axiosInstance.get(`/doctors/patients/${patientId}/history`);
    return response.data;
  },

  // Get patient appointments
  getPatientAppointments: async (patientId) => {
    const response = await axiosInstance.get(`/doctors/patients/${patientId}/appointments`);
    return response.data;
  },

  // Search patients
  searchPatients: async (query) => {
    const response = await axiosInstance.get('/doctors/patients/search', {
      params: { q: query }
    });
    return response.data;
  },

  // ========== Prescriptions ==========
  
  // Create prescription
  createPrescription: async (prescriptionData) => {
    const response = await axiosInstance.post('/doctors/prescriptions', prescriptionData);
    return response.data;
  },

  // Get prescription by ID
  getPrescriptionById: async (prescriptionId) => {
    const response = await axiosInstance.get(`/doctors/prescriptions/${prescriptionId}`);
    return response.data;
  },

  // Update prescription
  updatePrescription: async (prescriptionId, prescriptionData) => {
    const response = await axiosInstance.put(`/doctors/prescriptions/${prescriptionId}`, prescriptionData);
    return response.data;
  },

  // Delete prescription
  deletePrescription: async (prescriptionId) => {
    const response = await axiosInstance.delete(`/doctors/prescriptions/${prescriptionId}`);
    return response.data;
  },

  // Get prescriptions for patient
  getPatientPrescriptions: async (patientId) => {
    const response = await axiosInstance.get(`/doctors/patients/${patientId}/prescriptions`);
    return response.data;
  },

  // Get all my prescriptions
  getMyPrescriptions: async () => {
    const response = await axiosInstance.get('/doctors/prescriptions');
    return response.data;
  },

  // ========== Medical Notes ==========
  
  // Add medical note to appointment
  addMedicalNote: async (appointmentId, noteData) => {
    const response = await axiosInstance.post(`/doctors/appointments/${appointmentId}/notes`, noteData);
    return response.data;
  },

  // Update medical note
  updateMedicalNote: async (noteId, noteData) => {
    const response = await axiosInstance.put(`/doctors/notes/${noteId}`, noteData);
    return response.data;
  },

  // Get medical notes for patient
  getPatientNotes: async (patientId) => {
    const response = await axiosInstance.get(`/doctors/patients/${patientId}/notes`);
    return response.data;
  },

  // ========== Lab Orders ==========
  
  // Order lab test
  orderLabTest: async (orderData) => {
    const response = await axiosInstance.post('/doctors/lab-orders', orderData);
    return response.data;
  },

  // Get lab orders
  getLabOrders: async () => {
    const response = await axiosInstance.get('/doctors/lab-orders');
    return response.data;
  },

  // Get patient lab results
  getPatientLabResults: async (patientId) => {
    const response = await axiosInstance.get(`/doctors/patients/${patientId}/lab-results`);
    return response.data;
  },

  // ========== Earnings & Statistics ==========
  
  // Get earnings summary
  getEarnings: async (period = 'month') => {
    const response = await axiosInstance.get('/doctors/earnings', {
      params: { period }
    });
    return response.data;
  },

  // Get detailed earnings
  getEarningsDetails: async (startDate, endDate) => {
    const response = await axiosInstance.get('/doctors/earnings/details', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get statistics
  getStats: async () => {
    const response = await axiosInstance.get('/doctors/stats');
    return response.data;
  },

  // Get dashboard data
  getDashboard: async () => {
    const response = await axiosInstance.get('/doctors/dashboard');
    return response.data;
  },

  // ========== Reviews & Ratings ==========
  
  // Get reviews
  getReviews: async (doctorId) => {
    const response = await axiosInstance.get(`/doctors/${doctorId}/reviews`);
    return response.data;
  },

  // Get my reviews
  getMyReviews: async () => {
    const response = await axiosInstance.get('/doctors/reviews');
    return response.data;
  },

  // Respond to review
  respondToReview: async (reviewId, response) => {
    const responseData = await axiosInstance.post(`/doctors/reviews/${reviewId}/respond`, { response });
    return responseData.data;
  },

  // ========== Notifications ==========
  
  // Get notifications
  getNotifications: async () => {
    const response = await axiosInstance.get('/doctors/notifications');
    return response.data;
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    const response = await axiosInstance.patch(`/doctors/notifications/${notificationId}/read`);
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await axiosInstance.delete(`/doctors/notifications/${notificationId}`);
    return response.data;
  },

  // ========== Settings ==========
  
  // Update consultation fees
  updateFees: async (fees) => {
    const response = await axiosInstance.put('/doctors/settings/fees', { fees });
    return response.data;
  },

  // Update availability status
  updateAvailability: async (isAvailable) => {
    const response = await axiosInstance.patch('/doctors/settings/availability', { isAvailable });
    return response.data;
  },

  // Get settings
  getSettings: async () => {
    const response = await axiosInstance.get('/doctors/settings');
    return response.data;
  },

  // Update settings
  updateSettings: async (settings) => {
    const response = await axiosInstance.put('/doctors/settings', settings);
    return response.data;
  },
};

export default doctorApi;
