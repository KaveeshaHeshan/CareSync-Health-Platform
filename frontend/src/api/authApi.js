import axiosInstance from './axiosInstance';

/**
 * Authentication API Service for CareSync
 * Handles all user-related security requests
 */
const authApi = {
  /**
   * Register a new user (Patient, Doctor, or Lab)
   * @param {Object} userData - Contains name, email, password, and role
   */
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Log in an existing user
   * @param {Object} credentials - Contains email and password
   */
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    // Note: The axiosInstance interceptor will handle the token after this
    return response.data;
  },

  /**
   * Get the current logged-in user's profile
   * Useful for re-authenticating on page refresh
   */
  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  /**
   * Log out the user (optional backend cleanup)
   */
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  /**
   * Password Reset Request
   */
  forgotPassword: async (email) => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  }
};

export default authApi;