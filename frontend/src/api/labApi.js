import axiosInstance from './axiosInstance';

const labApi = {
  // ========== Lab Results ==========
  
  // Get all lab results
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axiosInstance.get(`/lab/results${params ? `?${params}` : ''}`);
    return response.data;
  },

  // Get lab result by ID
  getById: async (resultId) => {
    const response = await axiosInstance.get(`/lab/results/${resultId}`);
    return response.data;
  },

  // Upload lab result
  uploadResult: async (formData) => {
    const response = await axiosInstance.post('/lab/results/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update lab result
  updateResult: async (resultId, resultData) => {
    const response = await axiosInstance.put(`/lab/results/${resultId}`, resultData);
    return response.data;
  },

  // Delete lab result
  deleteResult: async (resultId) => {
    const response = await axiosInstance.delete(`/lab/results/${resultId}`);
    return response.data;
  },

  // Get lab results by patient ID
  getByPatient: async (patientId) => {
    const response = await axiosInstance.get(`/lab/results/patient/${patientId}`);
    return response.data;
  },

  // Get my lab results (current user)
  getMyResults: async () => {
    const response = await axiosInstance.get('/lab/results/my-results');
    return response.data;
  },

  // Download lab result file
  downloadResult: async (resultId) => {
    const response = await axiosInstance.get(`/lab/results/${resultId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // ========== Test Orders ==========
  
  // Get all test orders
  getAllOrders: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axiosInstance.get(`/lab/orders${params ? `?${params}` : ''}`);
    return response.data;
  },

  // Create test order
  createOrder: async (orderData) => {
    const response = await axiosInstance.post('/lab/orders', orderData);
    return response.data;
  },

  // Get test order by ID
  getOrderById: async (orderId) => {
    const response = await axiosInstance.get(`/lab/orders/${orderId}`);
    return response.data;
  },

  // Update test order
  updateOrder: async (orderId, orderData) => {
    const response = await axiosInstance.put(`/lab/orders/${orderId}`, orderData);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    const response = await axiosInstance.patch(`/lab/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Cancel test order
  cancelOrder: async (orderId) => {
    const response = await axiosInstance.delete(`/lab/orders/${orderId}`);
    return response.data;
  },

  // Get orders by patient
  getOrdersByPatient: async (patientId) => {
    const response = await axiosInstance.get(`/lab/orders/patient/${patientId}`);
    return response.data;
  },

  // Get my test orders
  getMyOrders: async () => {
    const response = await axiosInstance.get('/lab/orders/my-orders');
    return response.data;
  },

  // Get pending orders
  getPendingOrders: async () => {
    const response = await axiosInstance.get('/lab/orders/pending');
    return response.data;
  },

  // ========== Lab Tests Catalog ==========
  
  // Get all available lab tests
  getAllTests: async () => {
    const response = await axiosInstance.get('/lab/tests');
    return response.data;
  },

  // Get test by ID
  getTestById: async (testId) => {
    const response = await axiosInstance.get(`/lab/tests/${testId}`);
    return response.data;
  },

  // Search tests by name or category
  searchTests: async (query) => {
    const response = await axiosInstance.get('/lab/tests/search', {
      params: { q: query }
    });
    return response.data;
  },

  // Get tests by category
  getTestsByCategory: async (category) => {
    const response = await axiosInstance.get('/lab/tests/category', {
      params: { category }
    });
    return response.data;
  },

  // ========== Lab Appointments ==========
  
  // Book lab appointment
  bookAppointment: async (appointmentData) => {
    const response = await axiosInstance.post('/lab/appointments', appointmentData);
    return response.data;
  },

  // Get lab appointments
  getAppointments: async () => {
    const response = await axiosInstance.get('/lab/appointments');
    return response.data;
  },

  // Cancel lab appointment
  cancelAppointment: async (appointmentId) => {
    const response = await axiosInstance.delete(`/lab/appointments/${appointmentId}`);
    return response.data;
  },

  // Reschedule lab appointment
  rescheduleAppointment: async (appointmentId, newDateTime) => {
    const response = await axiosInstance.patch(`/lab/appointments/${appointmentId}/reschedule`, newDateTime);
    return response.data;
  },

  // ========== Reports & Analytics ==========
  
  // Get lab statistics
  getStats: async () => {
    const response = await axiosInstance.get('/lab/stats');
    return response.data;
  },

  // Generate lab report
  generateReport: async (reportData) => {
    const response = await axiosInstance.post('/lab/reports/generate', reportData);
    return response.data;
  },

  // Get result history for a specific test type
  getTestHistory: async (testType, patientId) => {
    const response = await axiosInstance.get('/lab/history', {
      params: { testType, patientId }
    });
    return response.data;
  },

  // ========== Notifications ==========
  
  // Get result notifications
  getNotifications: async () => {
    const response = await axiosInstance.get('/lab/notifications');
    return response.data;
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    const response = await axiosInstance.patch(`/lab/notifications/${notificationId}/read`);
    return response.data;
  },
};

export default labApi;
