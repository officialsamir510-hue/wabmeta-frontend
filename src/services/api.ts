// src/services/api.ts

import axios, { 
  AxiosError, 
  type AxiosInstance, 
  type InternalAxiosRequestConfig 
} from 'axios';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

interface ApiError {
  success: false;
  message: string;
  code?: string;
  details?: any;
  stack?: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// ============================================
// CONFIGURATION
// ============================================

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;

  if (envUrl) {
    const cleanUrl = envUrl.replace(/\/+$/, '');
    
    // If already has /api/v1, use as-is
    if (cleanUrl.endsWith('/api/v1')) {
      return cleanUrl;
    }
    
    // If has /api but not version, add version
    if (cleanUrl.endsWith('/api')) {
      return `${cleanUrl}/v1`;
    }
    
    // Otherwise add full path
    return `${cleanUrl}/api/v1`;
  }

  // Default to production in production build
  if (import.meta.env.PROD) {
    return 'https://wabmeta-api.onrender.com/api/v1';
  }

  // Development default
  return 'http://localhost:10000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

// Log configuration
console.log('🔗 API Configuration:', {
  baseUrl: API_BASE_URL,
  environment: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
});

// ============================================
// TOKEN MANAGEMENT
// ============================================

const TOKEN_KEYS = {
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
  USER: 'user',
  ADMIN: 'wabmeta_admin_token',
  LEGACY_TOKEN: 'token',
  LEGACY_WABMETA: 'wabmeta_token',
} as const;

/**
 * Check if a string is a valid JWT token
 */
const isValidJWT = (token: string): boolean => {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3;
};

/**
 * Get access token from storage
 */
const getAccessToken = (): string | null => {
  // Try modern token first
  let token = localStorage.getItem(TOKEN_KEYS.ACCESS);
  
  // Fallback to legacy tokens
  if (!token || !isValidJWT(token)) {
    token = localStorage.getItem(TOKEN_KEYS.LEGACY_TOKEN) || 
            localStorage.getItem(TOKEN_KEYS.LEGACY_WABMETA);
  }
  
  return token && isValidJWT(token) ? token : null;
};

/**
 * Get refresh token from storage
 */
const getRefreshToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEYS.REFRESH);
  return token && isValidJWT(token) ? token : null;
};

/**
 * Get admin token from storage
 */
const getAdminToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEYS.ADMIN);
  return token && isValidJWT(token) ? token : null;
};

/**
 * Set authentication tokens
 */
const setAuthTokens = (accessToken: string, refreshToken?: string) => {
  if (accessToken && isValidJWT(accessToken)) {
    localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
    // Keep legacy tokens in sync
    localStorage.setItem(TOKEN_KEYS.LEGACY_TOKEN, accessToken);
    localStorage.setItem(TOKEN_KEYS.LEGACY_WABMETA, accessToken);
  }
  
  if (refreshToken && isValidJWT(refreshToken)) {
    localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
  }
};

/**
 * Clear all authentication data
 */
const clearAuthData = () => {
  Object.values(TOKEN_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

/**
 * Clean up invalid tokens
 */
const cleanupInvalidTokens = () => {
  Object.values(TOKEN_KEYS).forEach(key => {
    const value = localStorage.getItem(key);
    if (value && !isValidJWT(value)) {
      localStorage.removeItem(key);
      console.warn(`⚠️ Removed invalid token: ${key}`);
    }
  });
};

// ============================================
// AXIOS INSTANCE
// ============================================

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const method = config.method?.toUpperCase() || 'GET';
    const url = config.url || '';
    
    if (import.meta.env.DEV) {
      console.log(`📤 ${method} ${url}`);
    }

    // Clean up invalid tokens before each request
    cleanupInvalidTokens();

    // Determine if this is an admin route
    const isAdminRoute = url.includes('/admin');

    // Get appropriate token
    const token = isAdminRoute 
      ? getAdminToken() 
      : getAccessToken();

    // Add authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error.message);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    const status = response.status;
    const url = response.config.url || '';
    
    if (import.meta.env.DEV) {
      console.log(`📥 ${status} ${url}`);
    }
    
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { 
      _retry?: boolean 
    };
    
    const status = error.response?.status;
    const url = originalRequest?.url || '';
    const errorData = error.response?.data;

    console.error(`❌ ${status} ${url}`, errorData?.message || error.message);

    // Network error
    if (error.code === 'ERR_NETWORK') {
      console.error('🔴 Network Error - Backend may be down or CORS misconfigured');
      return Promise.reject({
        message: 'Cannot connect to server. Please check your internet connection.',
        code: 'NETWORK_ERROR',
      });
    }

    // Timeout error
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request Timeout');
      return Promise.reject({
        message: 'Request timed out. Please try again.',
        code: 'TIMEOUT',
      });
    }

    // Handle 401 Unauthorized
    if (status === 401 && originalRequest && !originalRequest._retry) {
      // Determine if admin or user route
      const isAdminRoute = url.includes('/admin');

      // For admin routes, just redirect to admin login
      if (isAdminRoute) {
        localStorage.removeItem(TOKEN_KEYS.ADMIN);
        
        // Only redirect if we're on an admin page
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        }
        
        return Promise.reject(error);
      }

      // For user routes, try to refresh token
      // But skip refresh for login, register, and refresh endpoints
      const skipRefresh = 
        url.includes('/auth/login') || 
        url.includes('/auth/register') ||
        url.includes('/auth/refresh') ||
        url.includes('/auth/google');

      if (skipRefresh) {
        clearAuthData();
        return Promise.reject(error);
      }

      // Check if we have a refresh token
      const refreshToken = getRefreshToken();
      
      if (!refreshToken) {
        console.warn('⚠️ No refresh token available');
        clearAuthData();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      // Mark as retrying
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('🔄 Attempting token refresh...');
        
        // Call refresh endpoint
        const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        const newAccessToken = response.data?.data?.accessToken;
        const newRefreshToken = response.data?.data?.refreshToken;

        if (!newAccessToken || !isValidJWT(newAccessToken)) {
          throw new Error('Invalid access token received from refresh');
        }

        console.log('✅ Token refreshed successfully');

        // Store new tokens
        setAuthTokens(newAccessToken, newRefreshToken);

        // Process queued requests
        processQueue(null, newAccessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);

      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        
        // Clear auth data
        clearAuthData();
        
        // Process queued requests with error
        processQueue(refreshError as AxiosError, null);
        
        // Redirect to login
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      console.error('🚫 Access Forbidden');
    }

    // Handle 429 Too Many Requests
    if (status === 429) {
      console.error('⏸️ Rate Limited');
    }

    // Handle 500+ Server Errors
    if (status && status >= 500) {
      console.error('💥 Server Error');
    }

    return Promise.reject(error);
  }
);

// ============================================
// API MODULES
// ============================================

// ---------- AUTH ----------
export const auth = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    phone?: string;
    organizationName?: string;
  }) => api.post<ApiResponse>('/auth/register', data),

  login: (data: { email: string; password: string; }, p0: { headers: { "x-platform": string; }; }) => 
    api.post<ApiResponse<{
      organization: any;
      tokens: any; accessToken: string; refreshToken: string; user: any 
}>>('/auth/login', data),

  googleLogin: (data: { credential: string }) => 
    api.post<ApiResponse<{ accessToken: string; refreshToken: string; user: any }>>('/auth/google', data),

  me: () => api.get<ApiResponse>('/auth/me'),

  verifyEmail: (data: { token: string }) => api.post<ApiResponse>('/auth/verify-email', data),

  resendVerification: (data: { email: string }) => api.post<ApiResponse>('/auth/resend-verification', data),

  forgotPassword: (data: { email: string }) => api.post<ApiResponse>('/auth/forgot-password', data),

  resetPassword: (data: { token: string; password: string }) => api.post<ApiResponse>('/auth/reset-password', data),

  refresh: (refreshToken?: string) => 
    api.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', { refreshToken }),

  logout: () => api.post<ApiResponse>('/auth/logout'),

  logoutAll: () => api.post<ApiResponse>('/auth/logout-all'),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post<ApiResponse>('/auth/change-password', data),
};

// ---------- USERS ----------
export const users = {
  getProfile: () => api.get<ApiResponse>('/users/profile'),

  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
  }) => api.put<ApiResponse>('/users/profile', data),

  updateAvatar: (avatar: string) => api.put<ApiResponse>('/users/avatar', { avatar }),

  getStats: () => api.get<ApiResponse>('/users/stats'),

  getSessions: () => api.get<ApiResponse>('/users/sessions'),

  revokeSession: (sessionId: string) => api.delete<ApiResponse>(`/users/sessions/${sessionId}`),

  revokeAllSessions: () => api.delete<ApiResponse>('/users/sessions'),

  deleteAccount: (data: { password: string; reason?: string }) =>
    api.delete<ApiResponse>('/users/account', { data }),
};

// ---------- ORGANIZATIONS ----------
export const organizations = {
  getAll: () => api.get<ApiResponse>('/organizations'),

  getCurrent: () => api.get<ApiResponse>('/organizations/current'),

  getById: (id: string) => api.get<ApiResponse>(`/organizations/${id}`),

  create: (data: { name: string; slug?: string }) => api.post<ApiResponse>('/organizations', data),

  update: (id: string, data: any) => api.put<ApiResponse>(`/organizations/${id}`, data),

  delete: (id: string, password: string) => 
    api.delete<ApiResponse>(`/organizations/${id}`, { data: { password } }),

  inviteMember: (orgId: string, data: { email: string; role: string }) =>
    api.post<ApiResponse>(`/organizations/${orgId}/members`, data),

  updateMemberRole: (orgId: string, memberId: string, role: string) =>
    api.put<ApiResponse>(`/organizations/${orgId}/members/${memberId}`, { role }),

  removeMember: (orgId: string, memberId: string) =>
    api.delete<ApiResponse>(`/organizations/${orgId}/members/${memberId}`),

  switch: (orgId: string) => api.post<ApiResponse>(`/organizations/${orgId}/switch`),
};

// ---------- CONTACTS ----------
export const contacts = {
  getAll: (params?: any) => api.get<ApiResponse>('/contacts', { params }),

  create: (data: any) => api.post<ApiResponse>('/contacts', data),

  getById: (id: string) => api.get<ApiResponse>(`/contacts/${id}`),

  update: (id: string, data: any) => api.put<ApiResponse>(`/contacts/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse>(`/contacts/${id}`),

  import: (data: any) => api.post<ApiResponse>('/contacts/import', data),

  export: (format: string = 'csv') => 
    api.get(`/contacts/export?format=${format}`, { responseType: 'blob' }),

  stats: () => api.get<ApiResponse>('/contacts/stats'),

  getTags: () => api.get<ApiResponse>('/contacts/tags'),
};

// ---------- TEMPLATES ----------
export const templates = {
  getAll: (params?: any) => api.get<ApiResponse>('/templates', { params }),

  create: (data: any) => api.post<ApiResponse>('/templates', data),

  getById: (id: string) => api.get<ApiResponse>(`/templates/${id}`),

  update: (id: string, data: any) => api.put<ApiResponse>(`/templates/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse>(`/templates/${id}`),

  sync: (whatsappAccountId: string) => 
    api.post<ApiResponse>('/templates/sync', { whatsappAccountId }),

  submitForApproval: (id: string) => api.post<ApiResponse>(`/templates/${id}/submit`),

  stats: () => api.get<ApiResponse>('/templates/stats'),
};

// ---------- CAMPAIGNS ----------
export const campaigns = {
  getAll: (params?: any) => api.get<ApiResponse>('/campaigns', { params }),

  create: (data: any) => api.post<ApiResponse>('/campaigns', data),

  getById: (id: string) => api.get<ApiResponse>(`/campaigns/${id}`),

  update: (id: string, data: any) => api.put<ApiResponse>(`/campaigns/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse>(`/campaigns/${id}`),

  start: (id: string) => api.post<ApiResponse>(`/campaigns/${id}/start`),

  pause: (id: string) => api.post<ApiResponse>(`/campaigns/${id}/pause`),

  resume: (id: string) => api.post<ApiResponse>(`/campaigns/${id}/resume`),

  cancel: (id: string) => api.post<ApiResponse>(`/campaigns/${id}/cancel`),

  stats: () => api.get<ApiResponse>('/campaigns/stats'),
};

// ---------- WHATSAPP ----------
export const whatsapp = {
  getAccounts: () => api.get<ApiResponse>('/whatsapp/accounts'),

  getAccount: (id: string) => api.get<ApiResponse>(`/whatsapp/accounts/${id}`),

  connect: (data: { code: string; state?: string }) => 
    api.post<ApiResponse>('/whatsapp/connect', data),

  disconnect: (id: string) => api.delete<ApiResponse>(`/whatsapp/accounts/${id}`),

  setDefault: (id: string) => api.post<ApiResponse>(`/whatsapp/accounts/${id}/default`),

  sendText: (data: { whatsappAccountId: string; to: string; message: string }) =>
    api.post<ApiResponse>('/whatsapp/send/text', data),

  sendTemplate: (data: any) => api.post<ApiResponse>('/whatsapp/send/template', data),
};

// ---------- META ----------
export const meta = {
  getAuthUrl: (mode: 'new' | 'existing' | 'both' = 'both') => 
    api.get<ApiResponse<{ url: string }>>('/meta/auth/url', { params: { mode } }),

  connect: (data: { code: string; state?: string }) => 
    api.post<ApiResponse>('/meta/connect', data),

  getStatus: () => api.get<ApiResponse>('/meta/status'),

  refresh: () => api.post<ApiResponse>('/meta/refresh'),

  disconnect: () => api.post<ApiResponse>('/meta/disconnect'),

  getPhoneNumbers: () => api.get<ApiResponse>('/meta/phone-numbers'),

  sendTestMessage: (data: { phoneNumberId: string; to: string; message: string }) =>
    api.post<ApiResponse>('/meta/test-message', data),
};

// ---------- INBOX ----------
export const inbox = {
  getConversations: (params?: any) => api.get<ApiResponse>('/inbox/conversations', { params }),

  getConversation: (id: string) => api.get<ApiResponse>(`/inbox/conversations/${id}`),

  getMessages: (conversationId: string, params?: any) =>
    api.get<ApiResponse>(`/inbox/conversations/${conversationId}/messages`, { params }),

  sendMessage: (conversationId: string, data: { content: string; type?: string }) =>
    api.post<ApiResponse>(`/inbox/conversations/${conversationId}/messages`, data),

  markAsRead: (conversationId: string) =>
    api.post<ApiResponse>(`/inbox/conversations/${conversationId}/read`),

  stats: () => api.get<ApiResponse>('/inbox/stats'),
};

// ---------- CHATBOT ----------
export const chatbot = {
  getAll: (params?: any) => api.get<ApiResponse>('/chatbot', { params }),

  create: (data: any) => api.post<ApiResponse>('/chatbot', data),

  getById: (id: string) => api.get<ApiResponse>(`/chatbot/${id}`),

  update: (id: string, data: any) => api.put<ApiResponse>(`/chatbot/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse>(`/chatbot/${id}`),

  activate: (id: string) => api.post<ApiResponse>(`/chatbot/${id}/activate`),

  deactivate: (id: string) => api.post<ApiResponse>(`/chatbot/${id}/deactivate`),
};

// ---------- BILLING ----------
export const billing = {
  getCurrentPlan: () => api.get<ApiResponse>('/billing/plan'),

  getPlans: () => api.get<ApiResponse>('/billing/plans'),

  getUsage: () => api.get<ApiResponse>('/billing/usage'),

  upgrade: (data: { planType: string; billingCycle: string }) =>
    api.post<ApiResponse>('/billing/upgrade', data),

  cancel: () => api.post<ApiResponse>('/billing/cancel'),

  getInvoices: (params?: any) => api.get<ApiResponse>('/billing/invoices', { params }),

  createRazorpayOrder: (data: { planKey: string; billingCycle?: string }) =>
    api.post<ApiResponse>('/billing/razorpay/create-order', data),

  verifyRazorpayPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => api.post<ApiResponse>('/billing/razorpay/verify', data),
};
// ---------- SETTINGS ----------  ⬅️ YE ADD KAREIN
export const settings = {
  getAll: () => api.get<ApiResponse>('/settings'),
  
  update: (data: any) => api.put<ApiResponse>('/settings', data),
  
  getWebhooks: () => api.get<ApiResponse>('/settings/webhooks'),
  
  updateWebhooks: (data: any) => api.put<ApiResponse>('/settings/webhooks', data),
  
  testWebhook: () => api.post<ApiResponse>('/settings/webhooks/test'),
  
  getApiKeys: () => api.get<ApiResponse>('/settings/api-keys'),
  
  generateApiKey: (data: { name: string }) => 
    api.post<ApiResponse>('/settings/api-keys', data),
  
  revokeApiKey: (id: string) => 
    api.delete<ApiResponse>(`/settings/api-keys/${id}`),
};

// ---------- TEAM ----------  ⬅️ YE ADD KAREIN
export const team = {
  getMembers: () => api.get<ApiResponse>('/team/members'),
  
  inviteMember: (data: { email: string; role: string }) => 
    api.post<ApiResponse>('/team/invite', data),
  
  updateMemberRole: (memberId: string, role: string) => 
    api.put<ApiResponse>(`/team/members/${memberId}`, { role }),
  
  removeMember: (memberId: string) => 
    api.delete<ApiResponse>(`/team/members/${memberId}`),
  
  getInvitations: () => api.get<ApiResponse>('/team/invitations'),
  
  cancelInvitation: (id: string) => 
    api.delete<ApiResponse>(`/team/invitations/${id}`),
  
  resendInvitation: (id: string) => 
    api.post<ApiResponse>(`/team/invitations/${id}/resend`),
};

// ---------- DASHBOARD ----------
export const dashboard = {
  getStats: () => api.get<ApiResponse>('/dashboard/stats'),

  getWidgets: (days: number = 7) => api.get<ApiResponse>('/dashboard/widgets', { params: { days } }),

  getActivity: (limit: number = 10) => 
    api.get<ApiResponse>('/dashboard/activity', { params: { limit } }),
};

// ---------- ADMIN ----------
export const admin = {
  login: (data: { email: string; password: string }) => 
    api.post<ApiResponse<{ token: string }>>('/admin/login', data),

  getDashboard: () => api.get<ApiResponse>('/admin/dashboard'),

  getUsers: (params?: any) => api.get<ApiResponse>('/admin/users', { params }),

  getOrganizations: (params?: any) => api.get<ApiResponse>('/admin/organizations', { params }),

  getPlans: () => api.get<ApiResponse>('/admin/plans'),

  createPlan: (data: any) => api.post<ApiResponse>('/admin/plans', data),

  updatePlan: (id: string, data: any) => api.put<ApiResponse>(`/admin/plans/${id}`, data),
};

// ---------- HEALTH ----------
export const health = {
  check: async (): Promise<boolean> => {
    try {
      await api.get('/health');
      return true;
    } catch {
      return false;
    }
  },

  ping: () => api.get('/health'),
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const setAuthToken = (accessToken: string, refreshToken?: string) => {
  setAuthTokens(accessToken, refreshToken);
};

export const removeAuthToken = () => {
  clearAuthData();
};

export const getAuthToken = () => {
  return getAccessToken();
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

// ============================================
// ERROR HANDLER
// ============================================

export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    return apiError?.message || error.message || 'An error occurred';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};

// ============================================
// EXPORTS
// ============================================

export default api;

export type { ApiResponse, ApiError, RefreshTokenResponse };