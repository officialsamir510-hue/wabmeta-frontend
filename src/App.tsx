// src/App.tsx

import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeProvider';
import { SocketProvider } from './context/SocketProvider';

// Components
import LoadingScreen from './components/common/LoadingScreen';
import ErrorBoundary from './components/common/ErrorBoundary';

// Layouts
import DashboardLayout from './components/dashboard/DashboardLayout';
import AdminLayout from './components/admin/AdminLayout';
import AuthLayout from './components/auth/AuthLayout';

// ============================================
// LAZY LOADED PAGES
// ============================================

// Public
const Landing = lazy(() => import('./pages/Landing'));

// Auth
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const VerifyOTP = lazy(() => import('./pages/VerifyOTP'));

// OAuth
const MetaCallback = lazy(() => import('./pages/MetaCallback'));

// Dashboard
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Inbox = lazy(() => import('./pages/Inbox'));
const Contacts = lazy(() => import('./pages/Contacts'));
const ContactDetails = lazy(() => import('./pages/ContactDetails'));
const ImportContacts = lazy(() => import('./pages/ImportContacts'));
const Templates = lazy(() => import('./pages/Templates'));
const CreateTemplate = lazy(() => import('./pages/CreateTemplate'));
const Campaigns = lazy(() => import('./pages/Campaigns'));
const CreateCampaign = lazy(() => import('./pages/CreateCampaign'));
const CampaignDetails = lazy(() => import('./pages/CampaignDetails'));
const ChatbotList = lazy(() => import('./pages/ChatbotList'));
const ChatbotBuilder = lazy(() => import('./pages/ChatbotBuilder'));
const Automation = lazy(() => import('./pages/Automation'));
const Reports = lazy(() => import('./pages/Reports'));
const Help = lazy(() => import('./pages/Help'));

// Settings & misc
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const Team = lazy(() => import('./pages/Team'));
const Billing = lazy(() => import('./pages/Billing'));
const Notifications = lazy(() => import('./pages/Notifications'));

// Legal & errors
const DataDeletion = lazy(() => import('./pages/DataDeletion'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

// ============================================
// ROUTE GUARDS
// ============================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin' | 'superadmin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const adminToken = localStorage.getItem('wabmeta_admin_token');
  const location = useLocation();

  if (!adminToken) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// ============================================
// SCROLL TO TOP
// ============================================

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// ============================================
// PAGE TITLE UPDATER (Enhanced)
// ============================================

const PageTitleUpdater: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Static route title mappings
    const staticMap: Record<string, string> = {
      // Public
      '/': 'WabMeta - WhatsApp Business Platform',

      // Auth
      '/login': 'Login | WabMeta',
      '/signup': 'Sign Up | WabMeta',
      '/forgot-password': 'Forgot Password | WabMeta',
      '/reset-password': 'Reset Password | WabMeta',
      '/verify-email': 'Verify Email | WabMeta',
      '/verify-otp': 'Verify OTP | WabMeta',

      // OAuth
      '/meta/callback': 'Connecting... | WabMeta',

      // Dashboard
      '/dashboard': 'Dashboard | WabMeta',
      '/dashboard/inbox': 'Inbox | WabMeta',
      '/dashboard/contacts': 'Contacts | WabMeta',
      '/dashboard/contacts/import': 'Import Contacts | WabMeta',
      '/dashboard/templates': 'Templates | WabMeta',
      '/dashboard/templates/create': 'Create Template | WabMeta',
      '/dashboard/campaigns': 'Campaigns | WabMeta',
      '/dashboard/campaigns/create': 'Create Campaign | WabMeta',
      '/dashboard/chatbot': 'Chatbot | WabMeta',
      '/dashboard/chatbot/create': 'Create Chatbot | WabMeta',
      '/dashboard/automation': 'Automation | WabMeta',
      '/dashboard/reports': 'Reports | WabMeta',
      '/dashboard/notifications': 'Notifications | WabMeta',

      // Settings
      '/dashboard/settings': 'Settings | WabMeta',
      '/dashboard/settings/profile': 'Profile | WabMeta',
      '/dashboard/settings/team': 'Team | WabMeta',
      '/dashboard/settings/billing': 'Billing | WabMeta',

      // Admin
      '/admin/login': 'Admin Login | WabMeta',
      '/admin/dashboard': 'Admin Dashboard | WabMeta',

      // Legal
      '/privacy': 'Privacy Policy | WabMeta',
      '/terms': 'Terms of Service | WabMeta',
      '/data-deletion': 'Data Deletion | WabMeta',

      // Errors
      '/404': 'Page Not Found | WabMeta',
    };

    // Dynamic route patterns (order matters - more specific patterns first)
    const dynamicPatterns: Array<{
      pattern: RegExp;
      title: string | ((match: RegExpMatchArray) => string);
    }> = [
        {
          pattern: /^\/dashboard\/inbox\/(.+)$/,
          title: 'Conversation | WabMeta',
        },
        {
          pattern: /^\/dashboard\/contacts\/([^/]+)$/,
          title: 'Contact Details | WabMeta',
        },
        {
          pattern: /^\/dashboard\/templates\/([^/]+)$/,
          title: 'Edit Template | WabMeta',
        },
        {
          pattern: /^\/dashboard\/campaigns\/([^/]+)$/,
          title: 'Campaign Details | WabMeta',
        },
        {
          pattern: /^\/dashboard\/chatbot\/([^/]+)$/,
          title: 'Edit Chatbot | WabMeta',
        },
        {
          pattern: /^\/admin\/users\/([^/]+)$/,
          title: 'User Details | Admin | WabMeta',
        },
        {
          pattern: /^\/admin\/organizations\/([^/]+)$/,
          title: 'Organization Details | Admin | WabMeta',
        },
        {
          pattern: /^\/admin\/(.+)$/,
          title: 'Admin | WabMeta',
        },
      ];

    // Try to find exact match first
    let title = staticMap[pathname];

    // If no exact match, try dynamic patterns
    if (!title) {
      for (const { pattern, title: patternTitle } of dynamicPatterns) {
        const match = pathname.match(pattern);
        if (match) {
          title = typeof patternTitle === 'function' ? patternTitle(match) : patternTitle;
          break;
        }
      }
    }

    // Fallback: try prefix matching (for nested routes we might have missed)
    if (!title) {
      const prefixMatch = Object.entries(staticMap)
        .filter(([path]) => path !== '/' && pathname.startsWith(path))
        .sort((a, b) => b[0].length - a[0].length)[0]; // Get longest matching prefix

      if (prefixMatch) {
        title = prefixMatch[1];
      }
    }

    // Final fallback
    document.title = title || 'WabMeta';
  }, [pathname]);

  return null;
};

// ============================================
// MAIN ROUTES
// ============================================

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ScrollToTop />
      <PageTitleUpdater />

      <Routes>
        {/* ============================== */}
        {/* PUBLIC ROUTES */}
        {/* ============================== */}
        <Route path="/" element={<Landing />} />

        {/* ============================== */}
        {/* AUTH ROUTES */}
        {/* ============================== */}
        <Route
          path="/login"
          element={
            <AuthLayout title="Welcome back" subtitle="Login to continue">
              <Login />
            </AuthLayout>
          }
        />
        <Route
          path="/signup"
          element={<Signup />}
        />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />
        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />
        <Route
          path="/verify-otp"
          element={<VerifyOTP />}
        />

        {/* ============================== */}
        {/* OAUTH CALLBACKS */}
        {/* ============================== */}
        <Route path="/meta/callback" element={<MetaCallback />} />

        {/* ============================== */}
        {/* PROTECTED DASHBOARD ROUTES */}
        {/* ============================== */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard Home */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Inbox */}
          <Route path="/dashboard/inbox" element={<Inbox />} />
          <Route path="/dashboard/inbox/:conversationId" element={<Inbox />} />

          {/* Contacts */}
          <Route path="/dashboard/contacts" element={<Contacts />} />
          <Route path="/dashboard/contacts/import" element={<ImportContacts />} />
          <Route path="/dashboard/contacts/:id" element={<ContactDetails />} />

          {/* Templates */}
          <Route path="/dashboard/templates" element={<Templates />} />
          <Route path="/dashboard/templates/create" element={<CreateTemplate />} />
          <Route path="/dashboard/templates/:id" element={<CreateTemplate />} />

          {/* Campaigns */}
          <Route path="/dashboard/campaigns" element={<Campaigns />} />
          <Route path="/dashboard/campaigns/create" element={<CreateCampaign />} />
          <Route path="/dashboard/campaigns/:id" element={<CampaignDetails />} />

          {/* Chatbot */}
          <Route path="/dashboard/chatbot" element={<ChatbotList />} />
          <Route path="/dashboard/chatbot/create" element={<ChatbotBuilder />} />
          <Route path="/dashboard/chatbot/:id" element={<ChatbotBuilder />} />

          {/* Automation & Reports */}
          <Route path="/dashboard/automation" element={<Automation />} />
          <Route path="/dashboard/reports" element={<Reports />} />

          {/* Settings */}
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/dashboard/settings/profile" element={<Profile />} />
          <Route path="/dashboard/settings/team" element={<Team />} />
          <Route path="/dashboard/settings/billing" element={<Billing />} />

          {/* Notifications */}
          <Route path="/dashboard/notifications" element={<Notifications />} />
          <Route path="/dashboard/help" element={<Help />} />

          {/* Convenience Redirects within Dashboard */}
          <Route path="/dashboard/profile" element={<Navigate to="/dashboard/settings/profile" replace />} />
          <Route path="/dashboard/team" element={<Navigate to="/dashboard/settings/team" replace />} />
          <Route path="/dashboard/billing" element={<Navigate to="/dashboard/settings/billing" replace />} />
        </Route>

        {/* ============================== */}
        {/* LEGACY REDIRECTS (old paths → new paths) */}
        {/* ============================== */}
        <Route path="/inbox" element={<Navigate to="/dashboard/inbox" replace />} />
        <Route path="/inbox/:conversationId" element={<Navigate to="/dashboard/inbox/:conversationId" replace />} />
        <Route path="/contacts" element={<Navigate to="/dashboard/contacts" replace />} />
        <Route path="/contacts/import" element={<Navigate to="/dashboard/contacts/import" replace />} />
        <Route path="/contacts/:id" element={<Navigate to="/dashboard/contacts/:id" replace />} />
        <Route path="/templates" element={<Navigate to="/dashboard/templates" replace />} />
        <Route path="/templates/create" element={<Navigate to="/dashboard/templates/create" replace />} />
        <Route path="/templates/:id" element={<Navigate to="/dashboard/templates/:id" replace />} />
        <Route path="/campaigns" element={<Navigate to="/dashboard/campaigns" replace />} />
        <Route path="/campaigns/create" element={<Navigate to="/dashboard/campaigns/create" replace />} />
        <Route path="/campaigns/:id" element={<Navigate to="/dashboard/campaigns/:id" replace />} />
        <Route path="/chatbot" element={<Navigate to="/dashboard/chatbot" replace />} />
        <Route path="/chatbot/create" element={<Navigate to="/dashboard/chatbot/create" replace />} />
        <Route path="/chatbot/:id" element={<Navigate to="/dashboard/chatbot/:id" replace />} />
        <Route path="/automation" element={<Navigate to="/dashboard/automation" replace />} />
        <Route path="/reports" element={<Navigate to="/dashboard/reports" replace />} />
        <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />
        <Route path="/settings/profile" element={<Navigate to="/dashboard/settings/profile" replace />} />
        <Route path="/settings/team" element={<Navigate to="/dashboard/settings/team" replace />} />
        <Route path="/settings/billing" element={<Navigate to="/dashboard/settings/billing" replace />} />
        <Route path="/profile" element={<Navigate to="/dashboard/settings/profile" replace />} />
        <Route path="/team" element={<Navigate to="/dashboard/settings/team" replace />} />
        <Route path="/billing" element={<Navigate to="/dashboard/settings/billing" replace />} />
        <Route path="/notifications" element={<Navigate to="/dashboard/notifications" replace />} />


        {/* ============================== */}
        {/* ADMIN ROUTES */}
        {/* ============================== */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />
        <Route
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* Add more admin routes here as needed */}
          {/* <Route path="/admin/users" element={<AdminUsers />} /> */}
          {/* <Route path="/admin/users/:id" element={<AdminUserDetails />} /> */}
          {/* <Route path="/admin/organizations" element={<AdminOrganizations />} /> */}
          {/* <Route path="/admin/organizations/:id" element={<AdminOrgDetails />} /> */}
          {/* <Route path="/admin/settings" element={<AdminSettings />} /> */}
        </Route>

        {/* ============================== */}
        {/* LEGAL PAGES */}
        {/* ============================== */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/data-deletion" element={<DataDeletion />} />

        {/* ============================== */}
        {/* ERROR PAGES */}
        {/* ============================== */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

// ============================================
// MAIN APP COMPONENT
// ============================================

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                gutter={8}
                containerStyle={{
                  top: 20,
                  right: 20,
                }}
                toastOptions={{
                  // Default options
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    maxWidth: '400px',
                  },
                  // Success toast
                  success: {
                    duration: 3000,
                    style: {
                      background: '#10b981',
                      color: '#fff',
                    },
                    iconTheme: {
                      primary: '#fff',
                      secondary: '#10b981',
                    },
                  },
                  // Error toast
                  error: {
                    duration: 5000,
                    style: {
                      background: '#ef4444',
                      color: '#fff',
                    },
                    iconTheme: {
                      primary: '#fff',
                      secondary: '#ef4444',
                    },
                  },
                  // Loading toast
                  loading: {
                    style: {
                      background: '#3b82f6',
                      color: '#fff',
                    },
                  },
                }}
              />
              {/* App Routes */}
              <AppRoutes />
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;