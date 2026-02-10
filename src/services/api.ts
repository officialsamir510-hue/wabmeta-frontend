// src/services/api.ts

import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// ------------------------------
// BASE URL CONFIGURATION
// ------------------------------
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;

  if (envUrl) {
    const cleanUrl = envUrl.replace(/\/+$/, "");
    if (cleanUrl.endsWith("/api/v1")) return cleanUrl;
    if (cleanUrl.endsWith("/api")) return `${cleanUrl}/v1`;
    return `${cleanUrl}/api/v1`;
  }

  if (import.meta.env.PROD) {
    // ✅ Correct production API
    return "https://wabmeta-api.onrender.com/api/v1";
  }

  return "http://localhost:5001/api/v1";
};

const API_URL = getApiBaseUrl();

console.log("🔗 API Base URL:", API_URL);
console.log("🌐 Environment:", import.meta.env.MODE);

// ------------------------------
// HELPERS
// ------------------------------
const isJwtLike = (t: string) => typeof t === "string" && t.split(".").length === 3;

const cleanupInvalidTokens = () => {
  const maybeBad =
    localStorage.getItem("token") ||
    localStorage.getItem("wabmeta_token");

  // remove legacy keys if they are not JWT
  if (maybeBad && !isJwtLike(maybeBad)) {
    localStorage.removeItem("token");
    localStorage.removeItem("wabmeta_token");
  }
};

// ------------------------------
// AXIOS INSTANCE
// ------------------------------
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// ------------------------------
// REQUEST INTERCEPTOR
// ------------------------------
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const method = config.method?.toUpperCase() || "GET";
    const url = config.url || "";
    console.log(`📤 ${method} ${url}`);

    cleanupInvalidTokens();

    const isAdminRoute = url.includes("/admin");

    // Admin token
    const adminToken = localStorage.getItem("wabmeta_admin_token");

    // User token
    const userToken =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("wabmeta_token");

    const tokenToUse = isAdminRoute ? adminToken : userToken;

    if (tokenToUse && isJwtLike(tokenToUse)) {
      config.headers.Authorization = `Bearer ${tokenToUse}`;
    } else {
      // prevent "invalid signature" spam
      if (!isAdminRoute) {
        if (tokenToUse && !isJwtLike(tokenToUse)) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("token");
          localStorage.removeItem("wabmeta_token");
        }
      }
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
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    const status = error.response?.status || "ERR";
    const url = error.config?.url || "";
    const data = error.response?.data as any;

    console.error(`❌ ${status} ${url}`, data);

    // Network error
    if (error.code === "ERR_NETWORK") {
      console.error("🔴 Network Error - Backend down or CORS misconfigured");
    }

    // 401 handling (refresh)
    if (status === 401 && !url.includes("/auth/refresh")) {
      const isAdminRoute = url.includes("/admin");

      if (isAdminRoute) {
        localStorage.removeItem("wabmeta_admin_token");
        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin/login";
        }
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem("refreshToken");

      // If no refresh token => logout
      if (!refreshToken) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        localStorage.removeItem("wabmeta_token");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // ✅ IMPORTANT: backend expects refreshToken in body OR cookie (not Authorization header)
        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        const newRefreshToken = refreshResponse.data?.data?.refreshToken;

        if (!newAccessToken || !isJwtLike(newAccessToken)) {
          throw new Error("Refresh did not return valid access token");
        }

        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("token", newAccessToken);
        localStorage.setItem("wabmeta_token", newAccessToken);

        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        // retry original request
        if (error.config) {
          error.config.headers = error.config.headers || {};
          (error.config.headers as any).Authorization = `Bearer ${newAccessToken}`;
          return api.request(error.config);
        }
      } catch (refreshError) {
        console.error("🔴 Token refresh failed:", refreshError);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("token");
        localStorage.removeItem("wabmeta_token");
        window.location.href = "/login";
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
    organizationName?: string;
  }) => api.post("/auth/register", data),

  login: (data: { email: string; password: string }, config?: any) =>
    api.post("/auth/login", data, config),

  // ✅ Must send { credential } (ID token JWT)
  googleLogin: (data: { credential: string }) =>
    api.post("/auth/google", data),

  me: () => api.get("/auth/me"),

  verifyEmail: (data: { token: string }) => api.post("/auth/verify-email", data),

  resendVerification: (data: { email: string }) =>
    api.post("/auth/resend-verification", data),

  forgotPassword: (data: { email: string }) => api.post("/auth/forgot-password", data),

  resetPassword: (data: { token: string; password: string }) =>
    api.post("/auth/reset-password", data),

  sendOTP: (data: { email: string }) => api.post("/auth/send-otp", data),

  verifyOTP: (data: { email: string; otp: string }) =>
    api.post("/auth/verify-otp", data),

  refresh: (refreshToken?: string) =>
    api.post("/auth/refresh", refreshToken ? { refreshToken } : {}),

  logout: () => api.post("/auth/logout"),

  logoutAll: () => api.post("/auth/logout-all"),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post("/auth/change-password", data),
};

// ------------------------------
// CONTACTS API
// ------------------------------
export const contacts = {
  getAll: (params?: any) => api.get("/contacts", { params }),
  create: (data: any) => api.post("/contacts", data),
  getById: (id: string) => api.get(`/contacts/${id}`),
  update: (id: string, data: any) => api.put(`/contacts/${id}`, data),
  delete: (id: string) => api.delete(`/contacts/${id}`),
  stats: () => api.get("/contacts/stats"),
  tags: () => api.get("/contacts/tags"),
  import: (data: any) => api.post("/contacts/import", data),
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
// META API ✅ COMPLETE WITH MODE SUPPORT
// ------------------------------
export const meta = {
  /**
   * Get Meta OAuth URL with mode selection
   * @param mode - 'new' (Embedded Signup), 'existing' (Standard OAuth), or 'both' (default)
   */
  getAuthUrl: (mode: 'new' | 'existing' | 'both' = 'both') => 
    api.get("/meta/auth/url", { params: { mode } }),

  /**
   * Connect Meta account with authorization code
   */
  connect: (data: { code: string; state?: string }) => 
    api.post("/meta/connect", data),

  /**
   * Alternative callback endpoint
   */
  callback: (data: { code: string; state?: string }) =>
    api.post("/meta/auth/callback", data),

  /**
   * Get connection status
   */
  getStatus: () => api.get("/meta/status"),

  /**
   * Get WhatsApp Business connection status (with fallback)
   */
  getConnectionStatus: async () => {
    try {
      return await api.get("/meta/status");
    } catch (error) {
      // Fallback for direct fetch
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const apiUrl = API_URL;
      
      const response = await fetch(`${apiUrl}/meta/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    }
  },

  /**
   * Refresh connection data (sync phone numbers, etc.)
   */
  refresh: () => api.post("/meta/refresh"),

  /**
   * Disconnect Meta account
   */
  disconnect: () => api.post("/meta/disconnect"),

  /**
   * Get connected phone numbers
   */
  getPhoneNumbers: () => api.get("/meta/phone-numbers"),

  /**
   * Register a phone number for messaging
   */
  registerPhoneNumber: (phoneNumberId: string, pin?: string) =>
    api.post(`/meta/phone-numbers/${phoneNumberId}/register`, { pin }),

  /**
   * Get linked business accounts
   */
  getBusinessAccounts: () => api.get("/meta/business-accounts"),

  /**
   * Send test message
   */
  sendTestMessage: (data: {
    phoneNumberId: string;
    to: string;
    message: string;
  }) => api.post("/meta/test-message", data),

  /**
   * @deprecated Use whatsapp.sendText instead
   */
  sendTest: (data: any) => meta.sendTestMessage(data),
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
// DASHBOARD API
// ------------------------------
export const dashboard = {
  // Get basic stats (backward compatibility)
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

  // Get dashboard widgets data with time range
  getWidgets: (days: number = 7) => 
    api.get("/dashboard/widgets", { params: { days } }),

  // Additional dashboard methods
  getRecentActivity: (limit: number = 10) =>
    api.get("/dashboard/activity", { params: { limit } }),

  getQuickStats: () =>
    api.get("/dashboard/quick-stats"),

  getChartData: (type: string, range: string = "week") =>
    api.get(`/dashboard/charts/${type}`, { params: { range } }),
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