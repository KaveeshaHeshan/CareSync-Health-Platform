import axiosInstance from './axiosInstance';

const patientApi = {
  // ========== Patient Profile ==========
  
  // Get patient profile
  getProfile: async (patientId) => {
    const response = await axiosInstance.get(`/patients/${patientId}`);
    return response.data;
  },

  // Get my profile (current patient)
  getMyProfile: async () => {
    const response = await axiosInstance.get('/patients/me');
    return response.data;
  },

  // Update patient profile
  updateProfile: async (patientId, profileData) => {
    const response = await axiosInstance.put(`/patients/${patientId}`, profileData);
    return response.data;
  },

  // Upload profile picture
  uploadProfilePicture: async (formData) => {
    const response = await axiosInstance.post('/patients/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // ========== Medical Records ==========
  
  // Get medical records
  getMedicalRecords: async (patientId) => {
    const response = await axiosInstance.get(`/patients/${patientId}/medical-records`);
    return response.data;
  },

  // Get my medical records
  getMyMedicalRecords: async () => {
    const response = await axiosInstance.get('/patients/medical-records');
    return response.data;
  },

  // Add medical record
  addMedicalRecord: async (recordData) => {
    const response = await axiosInstance.post('/patients/medical-records', recordData);
    return response.data;
  },

  // Update medical record
  updateMedicalRecord: async (recordId, recordData) => {
    const response = await axiosInstance.put(`/patients/medical-records/${recordId}`, recordData);
    return response.data;
  },

  // Delete medical record
  deleteMedicalRecord: async (recordId) => {
    const response = await axiosInstance.delete(`/patients/medical-records/${recordId}`);
    return response.data;
  },

  // Upload medical document
  uploadMedicalDocument: async (formData) => {
    const response = await axiosInstance.post('/patients/medical-records/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // ========== Health History ==========
  
  // Get health history
  getHealthHistory: async (patientId) => {
    const response = await axiosInstance.get(`/patients/${patientId}/health-history`);
    return response.data;
  },

  // Update health history
  updateHealthHistory: async (patientId, healthData) => {
    const response = await axiosInstance.put(`/patients/${patientId}/health-history`, healthData);
    return response.data;
  },

  // Add allergy
  addAllergy: async (allergyData) => {
    const response = await axiosInstance.post('/patients/allergies', allergyData);
    return response.data;
  },

  // Remove allergy
  removeAllergy: async (allergyId) => {
    const response = await axiosInstance.delete(`/patients/allergies/${allergyId}`);
    return response.data;
  },

  // Add chronic condition
  addCondition: async (conditionData) => {
    const response = await axiosInstance.post('/patients/conditions', conditionData);
    return response.data;
  },

  // Remove chronic condition
  removeCondition: async (conditionId) => {
    const response = await axiosInstance.delete(`/patients/conditions/${conditionId}`);
    return response.data;
  },

  // Add medication
  addMedication: async (medicationData) => {
    const response = await axiosInstance.post('/patients/medications', medicationData);
    return response.data;
  },

  // Remove medication
  removeMedication: async (medicationId) => {
    const response = await axiosInstance.delete(`/patients/medications/${medicationId}`);
    return response.data;
  },

  // ========== Appointments ==========
  
  // Get patient appointments
  getAppointments: async (patientId) => {
    const response = await axiosInstance.get(`/patients/${patientId}/appointments`);
    return response.data;
  },

  // Get my appointments
  getMyAppointments: async () => {
    const response = await axiosInstance.get('/patients/appointments');
    return response.data;
  },

  // Book appointment
  bookAppointment: async (appointmentData) => {
    const response = await axiosInstance.post('/patients/appointments', appointmentData);
    return response.data;
  },

  // ========== Prescriptions ==========
  
  // Get prescriptions
  getPrescriptions: async (patientId) => {
    const response = await axiosInstance.get(`/patients/${patientId}/prescriptions`);
    return response.data;
  },

  // Get my prescriptions
  getMyPrescriptions: async () => {
    const response = await axiosInstance.get('/patients/prescriptions');
    return response.data;
  },

  // Get prescription by ID
  getPrescriptionById: async (prescriptionId) => {
    const response = await axiosInstance.get(`/patients/prescriptions/${prescriptionId}`);
    return response.data;
  },

  // Download prescription
  downloadPrescription: async (prescriptionId) => {
    const response = await axiosInstance.get(`/patients/prescriptions/${prescriptionId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // ========== Lab Results ==========
  
  // Get lab results
  getLabResults: async (patientId) => {
    const response = await axiosInstance.get(`/patients/${patientId}/lab-results`);
    return response.data;
  },

  // Get my lab results
  getMyLabResults: async () => {
    const response = await axiosInstance.get('/patients/lab-results');
    return response.data;
  },

  // ========== Doctors ==========
  
  // Search doctors
  searchDoctors: async (searchParams) => {
    const params = new URLSearchParams(searchParams).toString();
    const response = await axiosInstance.get(`/patients/doctors/search${params ? `?${params}` : ''}`);
    return response.data;
  },

  // Get doctor profile
  getDoctorProfile: async (doctorId) => {
    const response = await axiosInstance.get(`/patients/doctors/${doctorId}`);
    return response.data;
  },

  // Get doctor availability
  getDoctorAvailability: async (doctorId, date) => {
    const response = await axiosInstance.get(`/patients/doctors/${doctorId}/availability`, {
      params: { date }
    });
    return response.data;
  },

  // Get doctors by specialization
  getDoctorsBySpecialization: async (specialization) => {
    const response = await axiosInstance.get('/patients/doctors/specialization', {
      params: { specialization }
    });
    return response.data;
  },

  // Get all doctors
  getAllDoctors: async () => {
    const response = await axiosInstance.get('/patients/doctors');
    return response.data;
  },

  // ========== Billing ==========
  
  // Get billing history
  getBillingHistory: async (patientId) => {
    const response = await axiosInstance.get(`/patients/${patientId}/billing`);
    return response.data;
  },

  // Get my billing history
  getMyBilling: async () => {
    const response = await axiosInstance.get('/patients/billing');
    return response.data;
  },

  // Get invoice
  getInvoice: async (invoiceId) => {
    const response = await axiosInstance.get(`/patients/invoices/${invoiceId}`);
    return response.data;
  },

  // Download invoice
  downloadInvoice: async (invoiceId) => {
    const response = await axiosInstance.get(`/patients/invoices/${invoiceId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // ========== Notifications ==========
  
  // Get notifications
  getNotifications: async () => {
    const response = await axiosInstance.get('/patients/notifications');
    return response.data;
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    const response = await axiosInstance.patch(`/patients/notifications/${notificationId}/read`);
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await axiosInstance.delete(`/patients/notifications/${notificationId}`);
    return response.data;
  },

  // ========== Dashboard ==========
  
  // Get dashboard data
  getDashboard: async () => {
    const response = await axiosInstance.get('/patients/dashboard');
    return response.data;
  },

  // Get upcoming appointments
  getUpcomingAppointments: async () => {
    const response = await axiosInstance.get('/patients/appointments/upcoming');
    return response.data;
  },

  // Get recent activity
  getRecentActivity: async () => {
    const response = await axiosInstance.get('/patients/activity/recent');
    return response.data;
  },
};

export default patientApi;
