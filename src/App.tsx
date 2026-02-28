// src/App.tsx - FINAL FIXED VERSION

import React, { Suspense, lazy, useEffect, useState } from 'react';
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
import UpgradeModal from './components/common/UpgradeModal';

// Layouts
import DashboardLayout from './components/dashboard/DashboardLayout';
import AdminLayout from './components/admin/AdminLayout';

// ============================================
// LAZY LOADED PAGES
// ============================================

// Public
const Landing = lazy(() => import('./pages/Landing'));
const Contact = lazy(() => import('./pages/Contact'));
const Documentation = lazy(() => import('./pages/Documentation'));
const Blog = lazy(() => import('./pages/Blog'));

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
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const SubscriptionManagement = lazy(() => import('./pages/admin/SubscriptionManagement'));
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings'));

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

  // ✅ Show loading while checking auth
  if (isLoading) {
    return <LoadingScreen />;
  }

  // ✅ Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // ✅ Role check (optional)
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// ✅ Public route - redirect to dashboard if already logged in
interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children, redirectTo = '/dashboard' }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // ✅ Show loading while checking auth
  if (isLoading) {
    return <LoadingScreen />;
  }

  // ✅ Already authenticated - redirect to dashboard
  if (isAuthenticated) {
    // Check if there's a saved location to return to
    const from = (location.state as any)?.from || redirectTo;
    return <Navigate to={from} replace />;
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
// PAGE TITLE UPDATER
// ============================================

const PageTitleUpdater: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const staticMap: Record<string, string> = {
      '/': 'WabMeta - WhatsApp Business Platform',
      '/login': 'Login | WabMeta',
      '/signup': 'Sign Up | WabMeta',
      '/forgot-password': 'Forgot Password | WabMeta',
      '/reset-password': 'Reset Password | WabMeta',
      '/verify-email': 'Verify Email | WabMeta',
      '/verify-otp': 'Verify OTP | WabMeta',
      '/meta/callback': 'Connecting... | WabMeta',
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
      '/dashboard/settings': 'Settings | WabMeta',
      '/dashboard/settings/profile': 'Profile | WabMeta',
      '/dashboard/settings/team': 'Team | WabMeta',
      '/dashboard/settings/billing': 'Billing | WabMeta',
      '/admin/login': 'Admin Login | WabMeta',
      '/admin/dashboard': 'Admin Dashboard | WabMeta',
      '/privacy': 'Privacy Policy | WabMeta',
      '/terms': 'Terms of Service | WabMeta',
      '/contact': 'Contact Us | WabMeta',
      '/documentation': 'Documentation | WabMeta',
      '/blog': 'Blog | WabMeta',
      '/data-deletion': 'Data Deletion | WabMeta',
      '/404': 'Page Not Found | WabMeta',
    };

    const dynamicPatterns: Array<{ pattern: RegExp; title: string }> = [
      { pattern: /^\/dashboard\/inbox\/(.+)$/, title: 'Conversation | WabMeta' },
      { pattern: /^\/dashboard\/contacts\/([^/]+)$/, title: 'Contact Details | WabMeta' },
      { pattern: /^\/dashboard\/templates\/([^/]+)$/, title: 'Edit Template | WabMeta' },
      { pattern: /^\/dashboard\/campaigns\/([^/]+)$/, title: 'Campaign Details | WabMeta' },
      { pattern: /^\/dashboard\/chatbot\/([^/]+)$/, title: 'Edit Chatbot | WabMeta' },
      { pattern: /^\/admin\/(.+)$/, title: 'Admin | WabMeta' },
    ];

    let title = staticMap[pathname];

    if (!title) {
      for (const { pattern, title: patternTitle } of dynamicPatterns) {
        if (pattern.test(pathname)) {
          title = patternTitle;
          break;
        }
      }
    }

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
        <Route path="/contact" element={<Contact />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/blog" element={<Blog />} />

        {/* ============================== */}
        {/* AUTH ROUTES (Redirect if logged in) */}
        {/* ============================== */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

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

          {/* Notifications & Help */}
          <Route path="/dashboard/notifications" element={<Notifications />} />
          <Route path="/dashboard/help" element={<Help />} />

          {/* Convenience Redirects */}
          <Route path="/dashboard/profile" element={<Navigate to="/dashboard/settings/profile" replace />} />
          <Route path="/dashboard/team" element={<Navigate to="/dashboard/settings/team" replace />} />
          <Route path="/dashboard/billing" element={<Navigate to="/dashboard/settings/billing" replace />} />
        </Route>

        {/* ============================== */}
        {/* LEGACY REDIRECTS */}
        {/* ============================== */}
        <Route path="/inbox" element={<Navigate to="/dashboard/inbox" replace />} />
        <Route path="/inbox/:conversationId" element={<Navigate to="/dashboard/inbox/:conversationId" replace />} />
        <Route path="/contacts" element={<Navigate to="/dashboard/contacts" replace />} />
        <Route path="/templates" element={<Navigate to="/dashboard/templates" replace />} />
        <Route path="/campaigns" element={<Navigate to="/dashboard/campaigns" replace />} />
        <Route path="/chatbot" element={<Navigate to="/dashboard/chatbot" replace />} />
        <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />

        {/* ============================== */}
        {/* ADMIN ROUTES */}
        {/* ============================== */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/subscriptions" element={<SubscriptionManagement />} />
          <Route path="/admin/settings" element={<SystemSettings />} />
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
  const [upgradeModal, setUpgradeModal] = useState({
    isOpen: false,
    limitType: '',
    used: 0,
    limit: 0,
    message: '',
  });

  useEffect(() => {
    const handleLimitExceeded = (event: Event) => {
      const customEvent = event as CustomEvent;
      setUpgradeModal({
        isOpen: true,
        limitType: customEvent.detail?.limitType || 'resource',
        used: customEvent.detail?.used || 0,
        limit: customEvent.detail?.limit || 0,
        message: customEvent.detail?.message || '',
      });
    };

    window.addEventListener('planLimitExceeded', handleLimitExceeded);
    return () => {
      window.removeEventListener('planLimitExceeded', handleLimitExceeded);
    };
  }, []);

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
                containerStyle={{ top: 20, right: 20 }}
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    maxWidth: '400px',
                  },
                  success: {
                    duration: 3000,
                    style: { background: '#10b981', color: '#fff' },
                    iconTheme: { primary: '#fff', secondary: '#10b981' },
                  },
                  error: {
                    duration: 5000,
                    style: { background: '#ef4444', color: '#fff' },
                    iconTheme: { primary: '#fff', secondary: '#ef4444' },
                  },
                  loading: {
                    style: { background: '#3b82f6', color: '#fff' },
                  },
                }}
              />

              {/* App Routes */}
              <AppRoutes />

              {/* Upgrade Modal */}
              <UpgradeModal
                isOpen={upgradeModal.isOpen}
                onClose={() => setUpgradeModal(prev => ({ ...prev, isOpen: false }))}
                limitType={upgradeModal.limitType as any}
                used={upgradeModal.used}
                limit={upgradeModal.limit}
                message={upgradeModal.message}
              />
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;