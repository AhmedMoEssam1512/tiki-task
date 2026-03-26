import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4000/api/v1', // ✅ Correct base URL
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration & global auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const message = error.response.data?.data?.message || error.response.data?.message;
      if (message === 'Token expired' || message === 'Invalid token') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;