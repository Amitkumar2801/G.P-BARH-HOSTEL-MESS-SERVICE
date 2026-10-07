import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || 'https://gpbarh-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds to allow Render cold start
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global response interceptor for server wakeup alert
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      console.warn('Backend server is waking up, please wait...');
    }
    return Promise.reject(error);
  }
);

export default api;
