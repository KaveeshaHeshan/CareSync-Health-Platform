import axiosInstance from './axiosInstance';

const appointmentApi = {
  // Get all appointments (with optional filters)
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axiosInstance.get(`/appointments${params ? `?${params}` : ''}`);
    return response.data;
  },

  // Get appointment by ID
  getById: async (appointmentId) => {
    const response = await axiosInstance.get(`/appointments/${appointmentId}`);
    return response.data;
  },

  // Create new appointment
  create: async (appointmentData) => {
    const response = await axiosInstance.post('/appointments', appointmentData);
    return response.data;
  },

  // Update appointment
  update: async (appointmentId, appointmentData) => {
    const response = await axiosInstance.put(`/appointments/${appointmentId}`, appointmentData);
    return response.data;
  },

  // Delete/Cancel appointment
  cancel: async (appointmentId) => {
    const response = await axiosInstance.delete(`/appointments/${appointmentId}`);
    return response.data;
  },

  // Update appointment status
  updateStatus: async (appointmentId, status) => {
    const response = await axiosInstance.patch(`/appointments/${appointmentId}/status`, { status });
    return response.data;
  },

  // Get appointments by patient ID
  getByPatient: async (patientId) => {
    const response = await axiosInstance.get(`/appointments/patient/${patientId}`);
    return response.data;
  },

  // Get appointments by doctor ID
  getByDoctor: async (doctorId) => {
    const response = await axiosInstance.get(`/appointments/doctor/${doctorId}`);
    return response.data;
  },

  // Get my appointments (current user)
  getMyAppointments: async () => {
    const response = await axiosInstance.get('/appointments/my-appointments');
    return response.data;
  },

  // Get available time slots for a doctor
  getAvailableSlots: async (doctorId, date) => {
    const response = await axiosInstance.get(`/appointments/slots/${doctorId}`, {
      params: { date }
    });
    return response.data;
  },

  // Confirm appointment
  confirm: async (appointmentId) => {
    const response = await axiosInstance.patch(`/appointments/${appointmentId}/confirm`);
    return response.data;
  },

  // Complete appointment
  complete: async (appointmentId, completionData) => {
    const response = await axiosInstance.patch(`/appointments/${appointmentId}/complete`, completionData);
    return response.data;
  },

  // Add prescription to appointment
  addPrescription: async (appointmentId, prescriptionData) => {
    const response = await axiosInstance.post(`/appointments/${appointmentId}/prescription`, prescriptionData);
    return response.data;
  },

  // Get upcoming appointments
  getUpcoming: async () => {
    const response = await axiosInstance.get('/appointments/upcoming');
    return response.data;
  },

  // Get past appointments
  getPast: async () => {
    const response = await axiosInstance.get('/appointments/past');
    return response.data;
  },

  // Reschedule appointment
  reschedule: async (appointmentId, newDateTime) => {
    const response = await axiosInstance.patch(`/appointments/${appointmentId}/reschedule`, newDateTime);
    return response.data;
  },

  // Get patient's appointments (alias for getByPatient)
  getPatientAppointments: async (patientId) => {
    const response = await axiosInstance.get(`/appointments/patient/${patientId}`);
    return response.data;
  },

  // Get doctor's appointments (alias for getByDoctor)
  getDoctorAppointments: async (doctorId) => {
    const response = await axiosInstance.get(`/appointments/doctor/${doctorId}`);
    return response.data;
  },

  // Get appointment statistics
  getStats: async () => {
    const response = await axiosInstance.get('/appointments/stats');
    return response.data;
  },
};

export default appointmentApi;
