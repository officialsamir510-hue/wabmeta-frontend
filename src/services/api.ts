import axios from 'axios';

// ✅ ROBUST URL LOGIC (Solves double slash issue)
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${rawUrl.replace(/\/$/, "")}/api`; // Removes trailing slash then adds /api

console.log("🔗 API Connected:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
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
  (error) => Promise.reject(error)
);

// API Methods
export const auth = {
  login: (data: any) => api.post('/auth/login', data, { headers: { 'x-platform': 'Web' } }),
  signup: (data: any) => api.post('/auth/signup', data),
  verifyEmail: (data: any) => api.post('/auth/verify-email', data),
  resendOTP: (data: any) => api.post('/auth/resend-otp', data),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  logout: () => api.post('/auth/logout'),
};

export const contacts = {
  getAll: () => api.get('/contacts'),
  create: (data: any) => api.post('/contacts', data),
  delete: (id: string) => api.delete(`/contacts/${id}`),
  update: (id: string, data: any) => api.put(`/contacts/${id}`, data),
  getById: (id: string) => api.get(`/contacts/${id}`),
};

export const campaigns = {
  getAll: () => api.get('/campaigns'),
  create: (data: any) => api.post('/campaigns', data),
  getById: (id: string) => api.get(`/campaigns/${id}`),
  delete: (id: string) => api.delete(`/campaigns/${id}`),
};

export const templates = {
  getAll: () => api.get('/templates'),
  create: (data: any) => api.post('/templates', data),
  delete: (id: string) => api.delete(`/templates/${id}`),
};

export const meta = {
  connect: (data: any) => api.post('/meta/connect', data),
};

export const dashboard = {
  getStats: () => api.get('/dashboard/stats'),
};

export const admin = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  updateUserStatus: (id: string, status: string) => api.put(`/admin/users/${id}/status`, { status }),
};

export default api;