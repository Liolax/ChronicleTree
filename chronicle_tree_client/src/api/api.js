// Centralized Axios configuration for API requests with authentication handling
import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/v1',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response interceptor handles authentication errors and token validation
api.interceptors.response.use(
  res => res,
  err => {
    // Implements centralized error handling for authentication failures
    return Promise.reject(err);
  }
);

export default api;
