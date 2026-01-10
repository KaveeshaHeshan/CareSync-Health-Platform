import axiosInstance from './axiosInstance';

/**
 * Admin API Service for CareSync
 * Manages admin-specific operations like user management
 */
const adminApi = {
  /**
   * Fetch all users (Admin only)
   */
  getAllUsers: async () => {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },

  /**
   * Get user by ID
   * @param {string} userId 
   */
  getUserById: async (userId) => {
    const response = await axiosInstance.get(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Update user role or status
   * @param {string} userId 
   * @param {Object} updates - { role, status, etc }
   */
  updateUser: async (userId, updates) => {
    const response = await axiosInstance.patch(`/admin/users/${userId}`, updates);
    return response.data;
  },

  /**
   * Delete a user (Admin only)
   * @param {string} userId 
   */
  deleteUser: async (userId) => {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Get platform statistics
   */
  getStats: async () => {
    const response = await axiosInstance.get('/admin/stats');
    return response.data;
  },

  /**
   * Get all doctors (public endpoint for booking)
   */
  getDoctors: async () => {
    const response = await axiosInstance.get('/admin/doctors');
    return response.data;
  }
};

export default adminApi;
