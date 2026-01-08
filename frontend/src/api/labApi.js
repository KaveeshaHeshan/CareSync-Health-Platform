import axiosInstance from './axiosInstance';

/**
 * Lab & Pharmacy API Service for CareSync
 * Manages test results, prescriptions, and medical records.
 */
const labApi = {
  // --- Lab Result Workflows ---

  /**
   * Fetch all lab results for the logged-in patient
   */
  getPatientResults: async () => {
    const response = await axiosInstance.get('/lab/my-results');
    return response.data;
  },

  /**
   * Fetch a specific lab report by ID
   * @param {string} reportId 
   */
  getReportById: async (reportId) => {
    const response = await axiosInstance.get(`/lab/reports/${reportId}`);
    return response.data;
  },

  /**
   * Upload a lab result (Role: Lab/Admin)
   * This typically sends a multipart form containing the PDF/Image
   * @param {FormData} formData - Contains patientId, testType, and the file
   */
  uploadLabResult: async (formData) => {
    const response = await axiosInstance.post('/lab/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Required for file uploads to Cloudinary
      },
    });
    return response.data;
  },

  // --- Pharmacy & Prescription Workflows ---

  /**
   * Fetch prescriptions for the logged-in patient
   */
  getMyPrescriptions: async () => {
    const response = await axiosInstance.get('/pharmacy/prescriptions');
    return response.data;
  },

  /**
   * Update prescription status (Role: Pharmacy/Admin)
   * Useful for marking a prescription as 'Fulfilled' or 'Out for Delivery'
   */
  updatePrescriptionStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/pharmacy/prescriptions/${id}`, { status });
    return response.data;
  },

  /**
   * Search for available medications or lab tests
   */
  searchMedicalServices: async (query) => {
    const response = await axiosInstance.get(`/lab/search?q=${query}`);
    return response.data;
  }
};

export default labApi;