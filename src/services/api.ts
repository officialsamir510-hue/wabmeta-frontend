// src/services/api.ts

import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// ------------------------------
// BASE URL CONFIGURATION
// ------------------------------

// Get API URL from environment or use default
const getApiBaseUrl = (): string => {
  // Check for environment variable first
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (envUrl) {
    // Clean up the URL - remove trailing slashes
    const cleanUrl = envUrl.replace(/\/+$/, "");
    
    // Ensure it ends with /api/v1
    if (cleanUrl.endsWith("/api/v1")) {
      return cleanUrl;
    } else if (cleanUrl.endsWith("/api")) {
      return `${cleanUrl}/v1`;
    } else {
      return `${cleanUrl}/api/v1`;
    }
  }
  
  // Default based on environment
  if (import.meta.env.PROD) {
    return "https://wabmeta-backend.onrender.com/api/v1";
  }
  
  return "http://localhost:5001/api/v1";
};

const API_URL = getApiBaseUrl();

// Log for debugging
console.log("🔗 API Base URL:", API_URL);
console.log("🌐 Environment:", import.meta.env.MODE);

// ------------------------------
// AXIOS INSTANCE
// ------------------------------

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true, // Important for CORS with cookies
});

// ------------------------------
// REQUEST INTERCEPTOR
// ------------------------------

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const method = config.method?.toUpperCase() || "GET";
    const url = config.url || "";
    
    console.log(`📤 ${method} ${url}`);

    // Determine which token to use
    const isAdminRoute = url.includes("/admin");
    
    // Get appropriate token
    let token: string | null = null;
    
    if (isAdminRoute) {
      token = localStorage.getItem("wabmeta_admin_token");
    } else {
      // Try multiple token keys for compatibility
      token = localStorage.getItem("accessToken") ||
              localStorage.getItem("token") ||
              localStorage.getItem("wabmeta_token");
    }

    // Add Authorization header if token exists and is valid
    if (token && token !== "true" && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("❌ Request Error:", error.message);
    return Promise.reject(error);
  }
);

// ------------------------------
// RESPONSE INTERCEPTOR
// ------------------------------

api.interceptors.response.use(
  (response) => {
    const status = response.status;
    const url = response.config.url || "";
    console.log(`📥 ${status} ${url}`);
    return response;
  },
  async (error: AxiosError) => {
    const status = error.response?.status || "ERR";
    const url = error.config?.url || "";
    const data = error.response?.data as any;

    console.error(`❌ ${status} ${url}`, data);

    // Handle specific error cases
    if (error.code === "ERR_NETWORK") {
      console.error("🔴 Network Error - Check if backend is running and CORS is configured");
    }

    if (status === 401) {
      // Token expired or invalid
      const isAdminRoute = url.includes("/admin");
      
      if (isAdminRoute) {
        localStorage.removeItem("wabmeta_admin_token");
        // Redirect to admin login if on admin page
        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin/login";
        }
      } else {
        // Try to refresh token
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken && !url.includes("/auth/refresh")) {
          try {
            const refreshResponse = await axios.post(
              `${API_URL}/auth/refresh`,
              {},
              {
                headers: { Authorization: `Bearer ${refreshToken}` },
                withCredentials: true,
              }
            );

            if (refreshResponse.data?.data?.accessToken) {
              localStorage.setItem("accessToken", refreshResponse.data.data.accessToken);
              
              // Retry the original request
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${refreshResponse.data.data.accessToken}`;
                return api.request(error.config);
              }
            }
          } catch (refreshError) {
            console.error("🔴 Token refresh failed");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("token");
            localStorage.removeItem("wabmeta_token");
            window.location.href = "/login";
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

// ------------------------------
// AUTH API
// ------------------------------

export const auth = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    phone?: string;
  }) => api.post("/auth/register", data),

  login: (data: { email: string; password: string }, config?: any) =>
    api.post("/auth/login", data, config),

  googleLogin: (data: { credential: string }) =>
    api.post("/auth/google", data),

  me: () => api.get("/auth/me"),

  verifyEmail: (data: { token: string }) =>
    api.post("/auth/verify-email", data),

  resendVerification: (data: { email: string }) =>
    api.post("/auth/resend-verification", data),

  forgotPassword: (data: { email: string }) =>
    api.post("/auth/forgot-password", data),

  resetPassword: (data: { token: string; password: string }) =>
    api.post("/auth/reset-password", data),

  sendOTP: (data: { email: string }) =>
    api.post("/auth/send-otp", data),

  verifyOTP: (data: { email: string; otp: string }) =>
    api.post("/auth/verify-otp", data),

  refresh: () => api.post("/auth/refresh", {}),

  logout: () => api.post("/auth/logout"),

  logoutAll: () => api.post("/auth/logout-all"),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post("/auth/change-password", data),
};

// ------------------------------
// CONTACTS API
// ------------------------------

export const contacts = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    tags?: string;
    groupId?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => api.get("/contacts", { params }),

  create: (data: {
    phone: string;
    countryCode?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    tags?: string[];
    customFields?: Record<string, any>;
  }) => api.post("/contacts", data),

  getById: (id: string) => api.get(`/contacts/${id}`),

  update: (id: string, data: any) => api.put(`/contacts/${id}`, data),

  delete: (id: string) => api.delete(`/contacts/${id}`),

  stats: () => api.get("/contacts/stats"),

  tags: () => api.get("/contacts/tags"),

  import: (data: { contacts: any[]; groupId?: string; tags?: string[] }) =>
    api.post("/contacts/import", data),

  export: (params?: { groupId?: string }) =>
    api.get("/contacts/export", { params }),

  bulkUpdate: (data: { contactIds: string[]; updates: any }) =>
    api.put("/contacts/bulk", data),

  bulkDelete: (data: { contactIds: string[] }) =>
    api.delete("/contacts/bulk", { data }),

  // Groups
  getGroups: () => api.get("/contacts/groups"),
  
  createGroup: (data: { name: string; description?: string; color?: string }) =>
    api.post("/contacts/groups", data),
  
  updateGroup: (groupId: string, data: any) =>
    api.put(`/contacts/groups/${groupId}`, data),
  
  deleteGroup: (groupId: string) =>
    api.delete(`/contacts/groups/${groupId}`),
  
  getGroupContacts: (groupId: string, params?: any) =>
    api.get(`/contacts/groups/${groupId}/contacts`, { params }),
  
  addToGroup: (groupId: string, contactIds: string[]) =>
    api.post(`/contacts/groups/${groupId}/contacts`, { contactIds }),
  
  removeFromGroup: (groupId: string, contactIds: string[]) =>
    api.delete(`/contacts/groups/${groupId}/contacts`, { data: { contactIds } }),
};

// ------------------------------
// CAMPAIGNS API
// ------------------------------

export const campaigns = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => api.get("/campaigns", { params }),

  create: (data: any) => api.post("/campaigns", data),

  getById: (id: string) => api.get(`/campaigns/${id}`),

  update: (id: string, data: any) => api.put(`/campaigns/${id}`, data),

  delete: (id: string) => api.delete(`/campaigns/${id}`),

  stats: () => api.get("/campaigns/stats"),

  start: (id: string) => api.post(`/campaigns/${id}/start`),

  pause: (id: string) => api.post(`/campaigns/${id}/pause`),

  resume: (id: string) => api.post(`/campaigns/${id}/resume`),

  cancel: (id: string) => api.post(`/campaigns/${id}/cancel`),

  getContacts: (id: string, params?: any) =>
    api.get(`/campaigns/${id}/contacts`, { params }),
};

// ------------------------------
// TEMPLATES API
// ------------------------------

export const templates = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  }) => api.get("/templates", { params }),

  create: (data: any) => api.post("/templates", data),

  getById: (id: string) => api.get(`/templates/${id}`),

  update: (id: string, data: any) => api.put(`/templates/${id}`, data),

  delete: (id: string) => api.delete(`/templates/${id}`),

  stats: () => api.get("/templates/stats"),

  approved: () => api.get("/templates", { params: { status: "APPROVED" } }),

  preview: (data: any) => api.post("/templates/preview", data),

  sync: (whatsappAccountId: string) =>
    api.post("/templates/sync", { whatsappAccountId }),

  submitForApproval: (id: string) =>
    api.post(`/templates/${id}/submit`),
};

// ------------------------------
// WHATSAPP API
// ------------------------------

export const whatsapp = {
  connect: (data: { code: string; redirectUri: string }) =>
    api.post("/whatsapp/connect", data),

  accounts: () => api.get("/whatsapp/accounts"),

  getAccount: (id: string) => api.get(`/whatsapp/accounts/${id}`),

  disconnect: (id: string) => api.delete(`/whatsapp/accounts/${id}`),

  setDefault: (id: string) => api.post(`/whatsapp/accounts/${id}/default`),

  sendText: (data: {
    whatsappAccountId: string;
    to: string;
    message: string;
  }) => api.post("/whatsapp/send/text", data),

  sendTemplate: (data: {
    whatsappAccountId: string;
    to: string;
    templateName: string;
    templateLanguage: string;
    components?: any[];
  }) => api.post("/whatsapp/send/template", data),

  templatesSync: (data: { whatsappAccountId: string }) =>
    api.post("/whatsapp/templates/sync", data),

  getTemplates: (whatsappAccountId: string) =>
    api.get(`/whatsapp/accounts/${whatsappAccountId}/templates`),
};

// ------------------------------
// INBOX API
// ------------------------------

export const inbox = {
  conversations: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    assignedTo?: string;
    isArchived?: boolean;
  }) => api.get("/inbox/conversations", { params }),

  getConversation: (id: string) => api.get(`/inbox/conversations/${id}`),

  getMessages: (conversationId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/inbox/conversations/${conversationId}/messages`, { params }),

  sendMessage: (conversationId: string, data: { content: string; type?: string }) =>
    api.post(`/inbox/conversations/${conversationId}/messages`, data),

  markAsRead: (conversationId: string) =>
    api.post(`/inbox/conversations/${conversationId}/read`),

  archive: (conversationId: string) =>
    api.post(`/inbox/conversations/${conversationId}/archive`),

  unarchive: (conversationId: string) =>
    api.post(`/inbox/conversations/${conversationId}/unarchive`),

  assign: (conversationId: string, userId: string) =>
    api.post(`/inbox/conversations/${conversationId}/assign`, { userId }),

  addLabel: (conversationId: string, label: string) =>
    api.post(`/inbox/conversations/${conversationId}/labels`, { label }),

  removeLabel: (conversationId: string, label: string) =>
    api.delete(`/inbox/conversations/${conversationId}/labels/${label}`),

  stats: () => api.get("/inbox/stats"),

  quickReplies: () => api.get("/inbox/quick-replies"),

  createQuickReply: (data: { title: string; content: string }) =>
    api.post("/inbox/quick-replies", data),
};

// ------------------------------
// CHATBOT API
// ------------------------------

export const chatbot = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get("/chatbot", { params }),

  create: (data: any) => api.post("/chatbot", data),

  getById: (id: string) => api.get(`/chatbot/${id}`),

  update: (id: string, data: any) => api.put(`/chatbot/${id}`, data),

  delete: (id: string) => api.delete(`/chatbot/${id}`),

  activate: (id: string) => api.post(`/chatbot/${id}/activate`),

  deactivate: (id: string) => api.post(`/chatbot/${id}/deactivate`),

  duplicate: (id: string) => api.post(`/chatbot/${id}/duplicate`),

  stats: (id: string) => api.get(`/chatbot/${id}/stats`),
};

// ------------------------------
// ADMIN API
// ------------------------------

export const admin = {
  // Auth
  login: (data: { email: string; password: string }) =>
    api.post("/admin/login", data),

  getProfile: () => api.get("/admin/profile"),

  // Dashboard
  getDashboard: () => api.get("/admin/dashboard"),

  // Users Management
  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => api.get("/admin/users", { params }),

  getUserById: (id: string) => api.get(`/admin/users/${id}`),

  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),

  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

  suspendUser: (id: string) => api.post(`/admin/users/${id}/suspend`),

  activateUser: (id: string) => api.post(`/admin/users/${id}/activate`),

  // Organizations Management
  getOrganizations: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    planType?: string;
  }) => api.get("/admin/organizations", { params }),

  getOrganizationById: (id: string) => api.get(`/admin/organizations/${id}`),

  updateOrganization: (id: string, data: any) =>
    api.put(`/admin/organizations/${id}`, data),

  deleteOrganization: (id: string) => api.delete(`/admin/organizations/${id}`),

  updateSubscription: (orgId: string, data: any) =>
    api.put(`/admin/organizations/${orgId}/subscription`, data),

  // Plans Management
  getPlans: () => api.get("/admin/plans"),

  createPlan: (data: any) => api.post("/admin/plans", data),

  updatePlan: (id: string, data: any) => api.put(`/admin/plans/${id}`, data),

  // Admin Users Management (Super Admin only)
  getAdmins: () => api.get("/admin/admins"),

  createAdmin: (data: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }) => api.post("/admin/admins", data),

  updateAdmin: (id: string, data: any) => api.put(`/admin/admins/${id}`, data),

  deleteAdmin: (id: string) => api.delete(`/admin/admins/${id}`),

  // Activity Logs
  getActivityLogs: (params?: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
  }) => api.get("/admin/activity-logs", { params }),

  // System Settings
  getSettings: () => api.get("/admin/settings"),

  updateSettings: (data: any) => api.put("/admin/settings", data),
};

// ------------------------------
// TEAM / ORGANIZATIONS API
// ------------------------------

export const team = {
  // Get current organization with members
  getCurrent: () => api.get("/organizations/current"),

  // Get organization by ID
  getById: (id: string) => api.get(`/organizations/${id}`),

  // Get organization stats
  getStats: (id: string) => api.get(`/organizations/${id}/stats`),

  // Create organization
  create: (data: { name: string; slug?: string }) =>
    api.post("/organizations", data),

  // Update organization
  update: (orgId: string, data: any) => api.put(`/organizations/${orgId}`, data),

  // Delete organization
  delete: (orgId: string, password: string) =>
    api.delete(`/organizations/${orgId}`, { data: { password } }),

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
  leave: (orgId: string) => api.post(`/organizations/${orgId}/leave`),

  // Transfer ownership
  transferOwnership: (
    orgId: string,
    data: { newOwnerId: string; password: string }
  ) => api.post(`/organizations/${orgId}/transfer`, data),

  // Switch organization
  switch: (orgId: string) => api.post(`/organizations/${orgId}/switch`),

  // Get all user's organizations
  getAll: () => api.get("/organizations"),
};

// ------------------------------
// BILLING API
// ------------------------------

export const billing = {
  // Current plan & usage
  getCurrentPlan: () => api.get("/billing/plan"),

  getUsage: () => api.get("/billing/usage"),

  // Plans
  getPlans: () => api.get("/billing/plans"),

  // Subscription
  upgrade: (data: { planType: string; billingCycle: "monthly" | "yearly" }) =>
    api.post("/billing/upgrade", data),

  cancel: () => api.post("/billing/cancel"),

  // Invoices
  getInvoices: (params?: { page?: number; limit?: number }) =>
    api.get("/billing/invoices", { params }),

  downloadInvoice: (invoiceId: string) =>
    api.get(`/billing/invoices/${invoiceId}/download`, { responseType: "blob" }),

  // Payment Methods
  getPaymentMethods: () => api.get("/billing/payment-methods"),

  addPaymentMethod: (data: any) => api.post("/billing/payment-methods", data),

  deletePaymentMethod: (id: string) =>
    api.delete(`/billing/payment-methods/${id}`),

  setDefaultPaymentMethod: (id: string) =>
    api.post(`/billing/payment-methods/${id}/default`),

  // Razorpay
  createRazorpayOrder: (data: { planKey: string; billingCycle?: string }) =>
    api.post("/billing/razorpay/create-order", data),

  verifyRazorpayPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => api.post("/billing/razorpay/verify", data),
};

// ------------------------------
// SETTINGS API
// ------------------------------

export const settings = {
  // Profile
  getProfile: () => api.get("/users/profile"),

  getProfileFull: () => api.get("/users/profile/full"),

  updateProfile: (data: {
    firstName?: string;
    lastName?: string | null;
    phone?: string | null;
    avatar?: string | null;
  }) => api.put("/users/profile", data),

  updateAvatar: (avatar: string) => api.put("/users/avatar", { avatar }),

  // User Stats
  getStats: () => api.get("/users/stats"),

  // Sessions
  getSessions: () => api.get("/users/sessions"),

  revokeSession: (sessionId: string) =>
    api.delete(`/users/sessions/${sessionId}`),

  revokeAllSessions: () => api.delete("/users/sessions"),

  // Password
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post("/auth/change-password", data),

  // Delete Account
  deleteAccount: (data: { password: string; reason?: string }) =>
    api.delete("/users/account", { data }),

  // Notifications
  getNotifications: () =>
    api.get("/settings/notifications").catch(() => ({ data: { data: {} } })),

  updateNotifications: (data: any) => api.put("/settings/notifications", data),

  // API Keys
  getApiKeys: () =>
    api.get("/settings/api-keys").catch(() => ({ data: { data: [] } })),

  createApiKey: (data: { name: string; permissions?: string[] }) =>
    api.post("/settings/api-keys", data),

  deleteApiKey: (id: string) => api.delete(`/settings/api-keys/${id}`),

  // Webhooks
  getWebhooks: () =>
    api.get("/settings/webhooks").catch(() => ({ data: { data: [] } })),

  createWebhook: (data: { url: string; events: string[]; secret?: string }) =>
    api.post("/settings/webhooks", data),

  updateWebhook: (id: string, data: any) =>
    api.put(`/settings/webhooks/${id}`, data),

  deleteWebhook: (id: string) => api.delete(`/settings/webhooks/${id}`),

  testWebhook: (id: string) => api.post(`/settings/webhooks/${id}/test`),
};

// ------------------------------
// NOTIFICATIONS API
// ------------------------------

export const notifications = {
  getAll: (params?: { page?: number; limit?: number; read?: boolean }) =>
    api.get("/notifications", { params }),

  markAsRead: (id: string) => api.post(`/notifications/${id}/read`),

  markAllAsRead: () => api.post("/notifications/read-all"),

  delete: (id: string) => api.delete(`/notifications/${id}`),

  getUnreadCount: () => api.get("/notifications/unread-count"),
};

// ------------------------------
// ANALYTICS / REPORTS API
// ------------------------------

export const analytics = {
  getOverview: (params?: { startDate?: string; endDate?: string }) =>
    api.get("/analytics/overview", { params }),

  getMessageStats: (params?: { startDate?: string; endDate?: string }) =>
    api.get("/analytics/messages", { params }),

  getCampaignStats: (params?: { startDate?: string; endDate?: string }) =>
    api.get("/analytics/campaigns", { params }),

  getContactGrowth: (params?: { startDate?: string; endDate?: string }) =>
    api.get("/analytics/contacts", { params }),

  export: (params: { type: string; startDate?: string; endDate?: string }) =>
    api.get("/analytics/export", { params, responseType: "blob" }),
};

// ------------------------------
// COMPATIBILITY EXPORTS
// ------------------------------

export const meta = {
  connect: (data: { code?: string; redirectUri?: string }) => {
    if (data?.code) {
      const redirectUri =
        data.redirectUri || `${window.location.origin}/meta-callback`;
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
    try {
      const [contactsRes, campaignsRes, inboxRes] = await Promise.all([
        api.get("/contacts/stats").catch(() => ({ data: { data: {} } })),
        api.get("/campaigns/stats").catch(() => ({ data: { data: {} } })),
        api.get("/inbox/stats").catch(() => ({ data: { data: {} } })),
      ]);

      return {
        data: {
          contacts: contactsRes.data?.data?.total ?? 0,
          messagesSent: campaignsRes.data?.data?.totalMessagesSent ?? 0,
          deliveryRate: campaignsRes.data?.data?.averageDeliveryRate ?? 0,
          responseRate: inboxRes.data?.data?.responseRate ?? 0,
        },
      };
    } catch (error) {
      console.error("Dashboard stats error:", error);
      return {
        data: {
          contacts: 0,
          messagesSent: 0,
          deliveryRate: 0,
          responseRate: 0,
        },
      };
    }
  },
};

// ------------------------------
// HEALTH CHECK
// ------------------------------

export const health = {
  check: () => api.get("/health").catch(() => axios.get(`${API_URL.replace('/api/v1', '')}/health`)),
  
  ping: async (): Promise<boolean> => {
    try {
      await api.get("/health");
      return true;
    } catch {
      return false;
    }
  },
};

// ------------------------------
// DEFAULT EXPORT
// ------------------------------

export default api;