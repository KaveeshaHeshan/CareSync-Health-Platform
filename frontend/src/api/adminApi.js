import axiosInstance from './axiosInstance';

const adminApi = {
  // ========== User Management ==========
  
  // Get all users
  getAllUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axiosInstance.get(`/admin/users${params ? `?${params}` : ''}`);
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await axiosInstance.get(`/admin/users/${userId}`);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await axiosInstance.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Activate/Deactivate user
  toggleUserStatus: async (userId, isActive) => {
    const response = await axiosInstance.patch(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  },

  // ========== Doctor Management ==========
  
  // Get all doctors
  getAllDoctors: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axiosInstance.get(`/admin/doctors${params ? `?${params}` : ''}`);
    return response.data;
  },

  // Get pending doctor approvals
  getPendingDoctors: async () => {
    const response = await axiosInstance.get('/admin/doctors/pending');
    return response.data;
  },

  // Approve doctor
  approveDoctor: async (doctorId) => {
    const response = await axiosInstance.patch(`/admin/doctors/${doctorId}/approve`);
    return response.data;
  },

  // Reject doctor
  rejectDoctor: async (doctorId, reason) => {
    const response = await axiosInstance.patch(`/admin/doctors/${doctorId}/reject`, { reason });
    return response.data;
  },

  // Update doctor profile
  updateDoctor: async (doctorId, doctorData) => {
    const response = await axiosInstance.put(`/admin/doctors/${doctorId}`, doctorData);
    return response.data;
  },

  // ========== Appointment Management ==========
  
  // Get all appointments
  getAllAppointments: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axiosInstance.get(`/admin/appointments${params ? `?${params}` : ''}`);
    return response.data;
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId, status) => {
    const response = await axiosInstance.patch(`/admin/appointments/${appointmentId}/status`, { status });
    return response.data;
  },

  // Delete appointment
  deleteAppointment: async (appointmentId) => {
    const response = await axiosInstance.delete(`/admin/appointments/${appointmentId}`);
    return response.data;
  },

  // ========== Analytics & Statistics ==========
  
  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/admin/stats/dashboard');
    return response.data;
  },

  // Get user statistics
  getUserStats: async (period = 'month') => {
    const response = await axiosInstance.get('/admin/stats/users', {
      params: { period }
    });
    return response.data;
  },

  // Get appointment statistics
  getAppointmentStats: async (period = 'month') => {
    const response = await axiosInstance.get('/admin/stats/appointments', {
      params: { period }
    });
    return response.data;
  },

  // Get revenue statistics
  getRevenueStats: async (period = 'month') => {
    const response = await axiosInstance.get('/admin/stats/revenue', {
      params: { period }
    });
    return response.data;
  },

  // Get analytics data
  getAnalytics: async (startDate, endDate) => {
    const response = await axiosInstance.get('/admin/analytics', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // ========== Payment Management ==========
  
  // Get all payments
  getAllPayments: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axiosInstance.get(`/admin/payments${params ? `?${params}` : ''}`);
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (paymentId) => {
    const response = await axiosInstance.get(`/admin/payments/${paymentId}`);
    return response.data;
  },

  // Process refund
  processRefund: async (paymentId, amount, reason) => {
    const response = await axiosInstance.post(`/admin/payments/${paymentId}/refund`, {
      amount,
      reason
    });
    return response.data;
  },

  // ========== System Settings ==========
  
  // Get system settings
  getSettings: async () => {
    const response = await axiosInstance.get('/admin/settings');
    return response.data;
  },

  // Update system settings
  updateSettings: async (settings) => {
    const response = await axiosInstance.put('/admin/settings', settings);
    return response.data;
  },

  // ========== Reports ==========
  
  // Generate report
  generateReport: async (reportType, params = {}) => {
    const response = await axiosInstance.post('/admin/reports/generate', {
      reportType,
      ...params
    });
    return response.data;
  },

  // Export data
  exportData: async (dataType, format = 'csv') => {
    const response = await axiosInstance.get(`/admin/export/${dataType}`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  // ========== Notifications ==========
  
  // Send notification to users
  sendNotification: async (notificationData) => {
    const response = await axiosInstance.post('/admin/notifications/send', notificationData);
    return response.data;
  },

  // Get all notifications
  getAllNotifications: async () => {
    const response = await axiosInstance.get('/admin/notifications');
    return response.data;
  },
};

export default adminApi;
