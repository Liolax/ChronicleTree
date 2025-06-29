// src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// optional: interceptors for request/response logging or global error handling
api.interceptors.response.use(
  res => res,
  err => {
    // we can check for 401 here and auto-logout
    return Promise.reject(err);
  }
);

export default api;
