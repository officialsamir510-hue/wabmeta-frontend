// src/services/api.ts

import axios from "axios";

// ------------------------------
// BASE URL
// ------------------------------
const rawUrl = (import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1").replace(/\/+$/, "");

const API_URL =
  rawUrl.endsWith("/api/v1")
    ? rawUrl
    : rawUrl.endsWith("/api")
      ? `${rawUrl}/v1`
      : `${rawUrl}/api/v1`;

console.log("🔗 API Base URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ------------------------------
// REQUEST INTERCEPTOR
// ------------------------------
api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    
    // Check for admin token first, then user token
    const adminToken = localStorage.getItem("wabmeta_admin_token");
    const userToken = localStorage.getItem("accessToken") || 
                      localStorage.getItem("token") || 
                      localStorage.getItem("wabmeta_token");

    // Use admin token for admin routes, user token otherwise
    const token = config.url?.includes('/admin') ? adminToken : userToken;

    if (token && token !== 'true') { // 'true' was the old hardcoded value
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      } as any;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ------------------------------
// RESPONSE INTERCEPTOR
// ------------------------------
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.response?.status || 'ERR'} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

// ------------------------------
// AUTH
// ------------------------------
export const auth = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: any, config?: any) => api.post("/auth/login", data, config),
  googleLogin: (data: { credential: string }) => api.post("/auth/google", data),
  me: () => api.get("/auth/me"),
  verifyEmail: (data: { token: string }) => api.post("/auth/verify-email", data),
  resendVerification: (data: { email: string }) => api.post("/auth/resend-verification", data),
  forgotPassword: (data: { email: string }) => api.post("/auth/forgot-password", data),
  resetPassword: (data: { token: string; password: string }) => api.post("/auth/reset-password", data),
  sendOTP: (data: { email: string }) => api.post("/auth/send-otp", data),
  verifyOTP: (data: { email: string; otp: string }) => api.post("/auth/verify-otp", data),
  refresh: () => api.post("/auth/refresh", {}),
  logout: () => api.post("/auth/logout"),
  logoutAll: () => api.post("/auth/logout-all"),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post("/auth/change-password", data),
};

// ------------------------------
// CONTACTS
// ------------------------------
export const contacts = {
  getAll: (params?: any) => api.get("/contacts", { params }),
  create: (data: any) => api.post("/contacts", data),
  delete: (id: string) => api.delete(`/contacts/${id}`),
  update: (id: string, data: any) => api.put(`/contacts/${id}`, data),
  getById: (id: string) => api.get(`/contacts/${id}`),
  stats: () => api.get("/contacts/stats"),
  tags: () => api.get("/contacts/tags"),
  import: (data: any) => api.post("/contacts/import", data),
};

// ------------------------------
// CAMPAIGNS
// ------------------------------
export const campaigns = {
  getAll: (params?: any) => api.get("/campaigns", { params }),
  create: (data: any) => api.post("/campaigns", data),
  getById: (id: string) => api.get(`/campaigns/${id}`),
  delete: (id: string) => api.delete(`/campaigns/${id}`),
  update: (id: string, data: any) => api.put(`/campaigns/${id}`, data),
  stats: () => api.get("/campaigns/stats"),
  pause: (id: string) => api.post(`/campaigns/${id}/pause`),
  start: (id: string) => api.post(`/campaigns/${id}/start`),
  resume: (id: string) => api.post(`/campaigns/${id}/resume`),
  cancel: (id: string) => api.post(`/campaigns/${id}/cancel`),
};

// ------------------------------
// TEMPLATES
// ------------------------------
export const templates = {
  getAll: (params?: any) => api.get("/templates", { params }),
  create: (data: any) => api.post("/templates", data),
  delete: (id: string) => api.delete(`/templates/${id}`),
  getById: (id: string) => api.get(`/templates/${id}`),
  update: (id: string, data: any) => api.put(`/templates/${id}`, data),
  stats: () => api.get("/templates/stats"),
  approved: () => api.get("/templates/approved"),
  preview: (data: any) => api.post("/templates/preview", data),
};

// ------------------------------
// WHATSAPP
// ------------------------------
export const whatsapp = {
  connect: (data: { code: string; redirectUri: string }) => api.post("/whatsapp/connect", data),
  accounts: () => api.get("/whatsapp/accounts"),
  disconnect: (id: string) => api.delete(`/whatsapp/accounts/${id}`),
  setDefault: (id: string) => api.post(`/whatsapp/accounts/${id}/default`),
  sendText: (data: any) => api.post("/whatsapp/send/text", data),
  templatesSync: (data: { whatsappAccountId: string }) => api.post("/whatsapp/templates/sync", data),
};

// ------------------------------
// INBOX
// ------------------------------
export const inbox = {
  conversations: (params?: any) => api.get("/inbox/conversations", { params }),
  stats: () => api.get("/inbox/stats"),
};

// ------------------------------
// ✅ COMPLETE ADMIN API
// ------------------------------
export const admin = {
  // Auth
  login: (data: { email: string; password: string }) => 
    api.post("/admin/login", data),
  
  getProfile: () => 
    api.get("/admin/profile"),

  // Dashboard
  getDashboard: () => 
    api.get("/admin/dashboard"),

  // Users Management
  getUsers: (params?: { page?: number; limit?: number; search?: string; status?: string }) => 
    api.get("/admin/users", { params }),
  
  getUserById: (id: string) => 
    api.get(`/admin/users/${id}`),
  
  updateUser: (id: string, data: any) => 
    api.put(`/admin/users/${id}`, data),
  
  deleteUser: (id: string) => 
    api.delete(`/admin/users/${id}`),
  
  suspendUser: (id: string) => 
    api.post(`/admin/users/${id}/suspend`),
  
  activateUser: (id: string) => 
    api.post(`/admin/users/${id}/activate`),

  // Organizations Management
  getOrganizations: (params?: { page?: number; limit?: number; search?: string; planType?: string }) => 
    api.get("/admin/organizations", { params }),
  
  getOrganizationById: (id: string) => 
    api.get(`/admin/organizations/${id}`),
  
  updateOrganization: (id: string, data: any) => 
    api.put(`/admin/organizations/${id}`, data),
  
  deleteOrganization: (id: string) => 
    api.delete(`/admin/organizations/${id}`),
  
  updateSubscription: (orgId: string, data: any) => 
    api.put(`/admin/organizations/${orgId}/subscription`, data),

  // Plans Management
  getPlans: () => 
    api.get("/admin/plans"),
  
  createPlan: (data: any) => 
    api.post("/admin/plans", data),
  
  updatePlan: (id: string, data: any) => 
    api.put(`/admin/plans/${id}`, data),

  // Admin Users Management (Super Admin only)
  getAdmins: () => 
    api.get("/admin/admins"),
  
  createAdmin: (data: { email: string; password: string; name: string; role?: string }) => 
    api.post("/admin/admins", data),
  
  updateAdmin: (id: string, data: any) => 
    api.put(`/admin/admins/${id}`, data),
  
  deleteAdmin: (id: string) => 
    api.delete(`/admin/admins/${id}`),

  // Activity Logs
  getActivityLogs: (params?: { page?: number; limit?: number; action?: string; userId?: string }) => 
    api.get("/admin/activity-logs", { params }),

  // System Settings
  getSettings: () => 
    api.get("/admin/settings"),
  
  updateSettings: (data: any) => 
    api.put("/admin/settings", data),
};

// ------------------------------
// TEAM / ORGANIZATIONS
// ------------------------------
export const team = {
  // Get current organization with members
  getCurrent: () => api.get('/organizations/current'),
  
  // Get organization by ID
  getById: (id: string) => api.get(`/organizations/${id}`),
  
  // Get organization stats
  getStats: (id: string) => api.get(`/organizations/${id}/stats`),
  
  // Invite member
  inviteMember: (orgId: string, data: { email: string; role: string }) => 
    api.post(`/organizations/${orgId}/members`, data),
  
  // Update member role
  updateMemberRole: (orgId: string, memberId: string, role: string) => 
    api.put(`/organizations/${orgId}/members/${memberId}`, { role }),
  
  // Remove member
  removeMember: (orgId: string, memberId: string) => 
    api.delete(`/organizations/${orgId}/members/${memberId}`),
  
  // Leave organization
  leave: (orgId: string) => 
    api.post(`/organizations/${orgId}/leave`),
  
  // Transfer ownership
  transferOwnership: (orgId: string, data: { newOwnerId: string; password: string }) => 
    api.post(`/organizations/${orgId}/transfer`, data),
  
  // Update organization
  update: (orgId: string, data: any) => 
    api.put(`/organizations/${orgId}`, data),
  
  // Delete organization
  delete: (orgId: string, password: string) => 
    api.delete(`/organizations/${orgId}`, { data: { password } }),
};

// ------------------------------
// BILLING
// ------------------------------
export const billing = {
  // existing...
  getCurrentPlan: () => api.get('/billing/plan'),
  getUsage: () => api.get('/billing/usage'),
  getPlans: () => api.get('/billing/plans'),
  upgrade: (data: { planType: string; billingCycle: 'monthly' | 'yearly' }) => api.post('/billing/upgrade', data),
  cancel: () => api.post('/billing/cancel'),
  getInvoices: (params?: { page?: number; limit?: number }) => api.get('/billing/invoices', { params }),
  getPaymentMethods: () => api.get('/billing/payment-methods'),
  addPaymentMethod: (data: any) => api.post('/billing/payment-methods', data),
  deletePaymentMethod: (id: string) => api.delete(`/billing/payment-methods/${id}`),
  setDefaultPaymentMethod: (id: string) => api.post(`/billing/payment-methods/${id}/default`),

  // ✅ Razorpay
  createRazorpayOrder: (data: { planKey: string }) =>
    api.post("/billing/razorpay/create-order", data),

  verifyRazorpayPayment: (data: any) =>
    api.post("/billing/razorpay/verify", data),
};


// ------------------------------
// SETTINGS
// ------------------------------
export const settings = {
  // Profile - Use /users/profile endpoint
  getProfile: () => api.get('/users/profile'),
  getProfileFull: () => api.get('/users/profile/full'),
  updateProfile: (data: { firstName?: string; lastName?: string | null; phone?: string | null; avatar?: string | null }) => 
    api.put('/users/profile', data),
  updateAvatar: (avatar: string) => api.put('/users/avatar', { avatar }),
  
  // User Stats
  getStats: () => api.get('/users/stats'),
  
  // Sessions
  getSessions: () => api.get('/users/sessions'),
  revokeSession: (sessionId: string) => api.delete(`/users/sessions/${sessionId}`),
  revokeAllSessions: () => api.delete('/users/sessions'),
  
  // Password
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    api.post('/auth/change-password', data),
  
  // Delete Account
  deleteAccount: (data: { password: string; reason?: string }) => 
    api.delete('/users/account', { data }),
  
  // Notifications
  getNotifications: () => api.get('/settings/notifications').catch(() => ({ data: {} })),
  updateNotifications: (data: any) => api.put('/settings/notifications', data),
  
  // API Keys
  getApiKeys: () => api.get('/settings/api-keys').catch(() => ({ data: [] })),
  createApiKey: (data: any) => api.post('/settings/api-keys', data),
  deleteApiKey: (id: string) => api.delete(`/settings/api-keys/${id}`),
  
  // Webhooks
  getWebhooks: () => api.get('/settings/webhooks').catch(() => ({ data: [] })),
  createWebhook: (data: any) => api.post('/settings/webhooks', data),
  updateWebhook: (id: string, data: any) => api.put(`/settings/webhooks/${id}`, data),
  deleteWebhook: (id: string) => api.delete(`/settings/webhooks/${id}`),
};

// ------------------------------
// COMPAT EXPORTS
// ------------------------------
export const meta = {
  connect: (data: any) => {
    if (data?.code) {
      const redirectUri = data.redirectUri || `${window.location.origin}/meta-callback`;
      return api.post("/whatsapp/connect", { code: data.code, redirectUri });
    }
    return Promise.reject({
      response: { data: { message: "Manual setup not supported." } },
    });
  },
  sendTest: (data: any) => api.post("/whatsapp/send/text", data),
};

export const dashboard = {
  getStats: async () => {
    const [contactsRes, campaignsRes, inboxRes] = await Promise.all([
      api.get("/contacts/stats"),
      api.get("/campaigns/stats"),
      api.get("/inbox/stats"),
    ]);
    return {
      data: {
        contacts: contactsRes.data?.data?.total ?? 0,
        messagesSent: campaignsRes.data?.data?.totalMessagesSent ?? 0,
        deliveryRate: campaignsRes.data?.data?.averageDeliveryRate ?? 0,
        responseRate: inboxRes.data?.data?.responseRate ?? 0,
      },
    };
  },
};

export default api;