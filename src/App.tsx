// src/App.tsx

import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';

// Components
import LoadingScreen from './components/common/LoadingScreen';
import ErrorBoundary from './components/common/ErrorBoundary';

// Layouts (existing in components/*)
import DashboardLayout from './components/dashboard/DashboardLayout';
import AdminLayout from './components/admin/AdminLayout';
import AuthLayout from './components/auth/AuthLayout';

// ============================================
// LAZY LOADED PAGES (match actual file tree)
// ============================================

// Public
const Landing = lazy(() => import('./pages/Landing'));

// Auth (flat under pages)
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const VerifyOTP = lazy(() => import('./pages/VerifyOTP'));

// OAuth
const MetaCallback = lazy(() => import('./pages/MetaCallback'));

// Dashboard (flat under pages)
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
  requiredRole?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

interface AdminRouteProps { children: React.ReactNode; }
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const adminToken = localStorage.getItem('wabmeta_admin_token');
  const location = useLocation();
  if (!adminToken) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return <>{children}</>;
};

// ============================================
// SCROLL TO TOP + TITLE
// ============================================

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const PageTitleUpdater: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const map: Record<string, string> = {
      '/': 'WabMeta - WhatsApp Business Platform',
      '/login': 'Login | WabMeta',
      '/signup': 'Sign Up | WabMeta',
      '/dashboard': 'Dashboard | WabMeta',
      '/inbox': 'Inbox | WabMeta',
      '/contacts': 'Contacts | WabMeta',
      '/templates': 'Templates | WabMeta',
      '/campaigns': 'Campaigns | WabMeta',
      '/chatbot': 'Chatbot | WabMeta',
      '/settings': 'Settings | WabMeta',
      '/billing': 'Billing | WabMeta',
    };
    document.title = map[pathname] || 'WabMeta';
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
        {/* Public */}
        <Route path="/" element={<Landing />} />

        {/* Auth (AuthLayout is a wrapper for each page, not an Outlet layout) */}
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
          element={
            <AuthLayout title="Create your account" subtitle="Start your free trial">
              <Signup />
            </AuthLayout>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthLayout title="Reset your password" showBackButton>
              <ForgotPassword />
            </AuthLayout>
          }
        />
        <Route
          path="/reset-password"
          element={
            <AuthLayout title="Set a new password">
              <ResetPassword />
            </AuthLayout>
          }
        />
        <Route
          path="/verify-email"
          element={
            <AuthLayout title="Verify your email">
              <VerifyEmail />
            </AuthLayout>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <AuthLayout title="Verify OTP">
              <VerifyOTP />
            </AuthLayout>
          }
        />

        {/* OAuth */}
        <Route path="/meta/callback" element={<MetaCallback />} />

        {/* Protected Dashboard */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Inbox */}
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/inbox/:conversationId" element={<Inbox />} />

          {/* Contacts */}
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/contacts/import" element={<ImportContacts />} />
          <Route path="/contacts/:id" element={<ContactDetails />} />

          {/* Templates */}
          <Route path="/templates" element={<Templates />} />
          <Route path="/templates/create" element={<CreateTemplate />} />

          {/* Campaigns */}
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/create" element={<CreateCampaign />} />
          <Route path="/campaigns/:id" element={<CampaignDetails />} />

          {/* Chatbot */}
          <Route path="/chatbot" element={<ChatbotList />} />
          <Route path="/chatbot/create" element={<ChatbotBuilder />} />
          <Route path="/chatbot/:id" element={<ChatbotBuilder />} />

          {/* Automation & Reports */}
          <Route path="/automation" element={<Automation />} />
          <Route path="/reports" element={<Reports />} />

          {/* Settings */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/profile" element={<Profile />} />
          <Route path="/settings/team" element={<Team />} />
          <Route path="/settings/billing" element={<Billing />} />
          <Route path="/notifications" element={<Notifications />} />

          {/* Shortcuts */}
          <Route path="/profile" element={<Navigate to="/settings/profile" replace />} />
          <Route path="/team" element={<Navigate to="/settings/team" replace />} />
          <Route path="/billing" element={<Navigate to="/settings/billing" replace />} />
        </Route>

        {/* Admin */}
        <Route
          path="/admin/login"
          element={
            <AuthLayout title="Admin Login">
              <AdminLogin />
            </AuthLayout>
          }
        />
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Legal */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/data-deletion" element={<DataDeletion />} />

        {/* Errors */}
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
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: { background: '#363636', color: '#fff' },
                  success: { duration: 3000, iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                  error: { duration: 5000, iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                }}
              />
              <AppRoutes />
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
