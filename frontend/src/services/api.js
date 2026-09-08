import axios from 'axios';

// Get API Gateway base URL from environment variable or window location fallback
const getGatewayUrl = () => {
  if (import.meta.env.VITE_API_GATEWAY_URL) {
    return import.meta.env.VITE_API_GATEWAY_URL;
  }
  // Fallback to current host if relative
  return window.location.origin;
};

const API_BASE_URL = getGatewayUrl();

console.log(`Frontend API Client initialized targeting Gateway: ${API_BASE_URL}`);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Authorization header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('scrum_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const taskService = {
  getTasks: (params) => api.get('/api/tasks', { params }),
  getTaskById: (id) => api.get(`/api/tasks/${id}`),
  createTask: (data) => api.post('/api/tasks', data),
  updateTask: (id, data) => api.put(`/api/tasks/${id}`, data),
  updateTaskStatus: (id, status) => api.patch(`/api/tasks/${id}`, { status }),
  deleteTask: (id) => api.delete(`/api/tasks/${id}`),
};

export const userService = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getUsers: () => api.get('/api/users'),
};

export default api;
