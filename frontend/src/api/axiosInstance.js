import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor - Add auth token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development mode
    if (import.meta.env.DEV) {
      console.log('🚀 Request:', config.method.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response in development mode
    if (import.meta.env.DEV) {
      console.log('✅ Response:', response.config.url, response.status);
    }
    
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          console.error('❌ Unauthorized - Logging out');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
          
        case 403:
          // Forbidden - user doesn't have permission
          console.error('❌ Forbidden:', data.message || 'Access denied');
          break;
          
        case 404:
          // Not found
          console.error('❌ Not Found:', data.message || 'Resource not found');
          break;
          
        case 500:
          // Server error
          console.error('❌ Server Error:', data.message || 'Internal server error');
          break;
          
        default:
          console.error(`❌ Error ${status}:`, data.message || 'An error occurred');
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('❌ Network Error:', 'No response from server');
    } else {
      // Something else happened
      console.error('❌ Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;