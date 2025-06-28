// src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
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
