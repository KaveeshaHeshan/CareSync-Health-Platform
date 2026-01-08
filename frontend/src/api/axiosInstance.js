import axios from 'axios';

// 1. Create the instance with a base URL from your .env file
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor: Automatically attach the JWT token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    // We get the token from localStorage (managed by your Auth feature)
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor: Handle errors like 401 (Unauthorized) globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend returns 401, the token is likely expired or invalid
    if (error.response && error.response.status === 401) {
      console.error('Session expired. Redirecting to login...');
      
      // Clear local storage and redirect user to login
      localStorage.removeItem('token');
      localStorage.removeItem('user-storage'); // Clears Zustand state if used
      
      // Only redirect if we aren't already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;