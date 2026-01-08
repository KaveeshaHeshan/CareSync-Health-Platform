import axiosInstance from './axiosInstance';

/**
 * Appointment API Service for CareSync
 * Manages the scheduling lifecycle for Patients and Doctors.
 */
const appointmentApi = {
  /**
   * Fetch all appointments (Filtered by user role on the backend)
   */
  getAppointments: async () => {
    const response = await axiosInstance.get('/appointments');
    return response.data;
  },

  /**
   * Get detailed information for a specific appointment
   * (Used for tele-consultation rooms and summary views)
   * @param {string} id - Appointment ID
   */
  getAppointmentDetails: async (id) => {
    const response = await axiosInstance.get(`/appointments/${id}`);
    return response.data;
  },

  /**
   * Book a new appointment
   * @param {Object} appointmentData - { doctorId, date, time, reason, type }
   */
  bookAppointment: async (appointmentData) => {
    const response = await axiosInstance.post('/appointments', appointmentData);
    return response.data;
  },

  /**
   * Update appointment status (Confirm, Cancel, or Complete)
   * @param {string} id - Appointment ID
   * @param {string} status - 'confirmed', 'cancelled', or 'completed'
   */
  updateStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/appointments/${id}/status`, { status });
    return response.data;
  },

  /**
   * Get available time slots for a specific doctor
   * @param {string} doctorId 
   * @param {string} date - Format: YYYY-MM-DD
   */
  getAvailableSlots: async (doctorId, date) => {
    const response = await axiosInstance.get(`/appointments/slots/${doctorId}?date=${date}`);
    return response.data;
  },

  /**
   * Cancel an appointment (Patient or Doctor)
   * @param {string} id - Appointment ID
   * @param {string} reason - Optional reason for cancellation
   */
  cancelAppointment: async (id, reason) => {
    const response = await axiosInstance.delete(`/appointments/${id}`, { data: { reason } });
    return response.data;
  }
};

export default appointmentApi;