import axios from 'axios';

// ✅ Clean URL Logic
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${rawUrl.replace(/\/$/, "")}/api`;

console.log("🔗 Connecting to API:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

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

export const auth = {
  // Fix: Login expects 2 args now (data + config)
  login: (data: any, config?: any) => api.post('/auth/login', data, config),
  signup: (data: any) => api.post('/auth/signup', data),
  verifyEmail: (data: any) => api.post('/auth/verify-email', data),
  resendOTP: (data: any) => api.post('/auth/resend-otp', data),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  logout: () => api.post('/auth/logout'),
  googleLogin: (data: { token: string }) => api.post('/auth/google', data),
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
  // ✅ Added Missing Methods
  pause: (id: string) => api.post(`/campaigns/${id}/pause`),
  start: (id: string) => api.post(`/campaigns/${id}/start`),
};

export const templates = {
  getAll: () => api.get('/templates'),
  create: (data: any) => api.post('/templates', data),
  delete: (id: string) => api.delete(`/templates/${id}`),
  // ✅ Added Missing Method
  sync: () => api.post('/templates/sync'),
};

export const meta = {
  connect: (data: any) => api.post('/meta/connect', data),
  sendTest: (data: any) => api.post('/meta/send-test', data),
};

export const dashboard = {
  getStats: () => api.get('/dashboard/stats'),
};

export const admin = {
  // Fix: Allow optional params
  getStats: (params?: any) => api.get('/admin/stats', { params }),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  updateUserStatus: (id: string, status: string) => api.put(`/admin/users/${id}/status`, { status }),
  // ✅ Added Missing Method
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
};

export default api;