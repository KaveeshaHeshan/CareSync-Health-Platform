import axiosInstance from './axiosInstance';

const authApi = {
  // Register new user
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current logged-in user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get current user from API (fresh data)
  fetchCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Update user profile
  updateProfile: async (userId, profileData) => {
    const response = await axiosInstance.put(`/auth/profile/${userId}`, profileData);
    
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await axiosInstance.put('/auth/change-password', passwordData);
    return response.data;
  },
};

export default authApi;
