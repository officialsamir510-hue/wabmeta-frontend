import axios from 'axios';

// ✅ CORRECT WAY FOR VITE
console.log("Current API URL:", import.meta.env.VITE_API_URL);
const API_URL = import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL}/api`;

console.log("🔗 Connecting to API:", API_URL);

const api = axios.create({
  baseURL: API_URL,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
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

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("🚫 Unauthorized! Token might be expired.");
      // Optional: Redirect to login logic here
    }
    return Promise.reject(error);
  }
);

// API Functions
export const auth = {
  login: (data: any, _p0: { headers: { 'x-platform': string; }; }) => api.post('/auth/login', data),
  signup: (data: any) => api.post('/auth/signup', data),
  verifyEmail: (data: any) => api.post('/auth/verify-email', data),
  updateProfile: (data: any) => api.put('/auth/profile', data), // Profile update added
};

export const contacts = {
  getAll: () => api.get('/contacts'),
  create: (data: any) => api.post('/contacts', data),
  delete: (id: string) => api.delete(`/contacts/${id}`),
  update: (id: string, data: any) => api.put(`/contacts/${id}`, data),
  getById: (id: string) => api.get(`/contacts/${id}`), 
  bulkCreate: (data: any[]) => api.post('/contacts/bulk', data),
};

export const campaigns = {
  getAll: () => api.get('/campaigns'),
  create: (data: any) => api.post('/campaigns', data),
  getById: (id: string) => api.get(`/campaigns/${id}`),
  delete: (id: string) => api.delete(`/campaigns/${id}`),
  pause: (id: string) => api.post(`/campaigns/${id}/pause`), // <-- Add this line
  start: (id: string) => api.post(`/campaigns/${id}/start`), // (if not already present)
};

export const templates = {
  getAll: () => api.get('/templates'),
  create: (data: any) => api.post('/templates', data),
  delete: (id: string) => api.delete(`/templates/${id}`),
   sync: () => api.post('/templates/sync')
};

export const meta = {
  connect: (data: any) => api.post('/meta/connect', data),
  sendTest: (data: any) => api.post('/meta/send-test', data),
};

export const dashboard = {
  getStats: () => api.get('/dashboard/stats'),
};

// Add to api.ts
export const admin = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params: { search: string }) => api.get('/admin/users', { params }),
  updateUserStatus: (id: string, status: string) => api.put(`/admin/users/${id}/status`, { status }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`), // <-- Add this line
};

export default api;