// src/App.tsx

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import LoadingScreen from './components/common/LoadingScreen';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy load pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const VerifyOTP = lazy(() => import('./pages/VerifyOTP'));

// Meta callback
const MetaCallback = lazy(() => import('./pages/MetaCallback'));

// Dashboard pages
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
const Reports = lazy(() => import('./pages/Reports'));
const Billing = lazy(() => import('./pages/Billing'));
const Settings = lazy(() => import('./pages/Settings'));
const Team = lazy(() => import('./pages/Team'));
const Profile = lazy(() => import('./pages/Profile'));
const Help = lazy(() => import('./pages/Help'));

// Admin pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings'));

// Legal pages
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const DataDeletion = lazy(() => import('./pages/DataDeletion'));

const NotFound = lazy(() => import('./pages/NotFound'));

// Protected route wrapper
import { useAuth } from './context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/verify-otp" element={<VerifyOTP />} />

                  {/* Meta OAuth Callback */}
                  <Route path="/meta/callback" element={<MetaCallback />} />

                  {/* Protected dashboard routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inbox"
                    element={
                      <ProtectedRoute>
                        <Inbox />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/contacts"
                    element={
                      <ProtectedRoute>
                        <Contacts />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/contacts/:id"
                    element={
                      <ProtectedRoute>
                        <ContactDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/contacts/import"
                    element={
                      <ProtectedRoute>
                        <ImportContacts />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/templates"
                    element={
                      <ProtectedRoute>
                        <Templates />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/templates/create"
                    element={
                      <ProtectedRoute>
                        <CreateTemplate />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/campaigns"
                    element={
                      <ProtectedRoute>
                        <Campaigns />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/campaigns/create"
                    element={
                      <ProtectedRoute>
                        <CreateCampaign />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/campaigns/:id"
                    element={
                      <ProtectedRoute>
                        <CampaignDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chatbot"
                    element={
                      <ProtectedRoute>
                        <ChatbotList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chatbot/:id"
                    element={
                      <ProtectedRoute>
                        <ChatbotBuilder />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <ProtectedRoute>
                        <Reports />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/billing"
                    element={
                      <ProtectedRoute>
                        <Billing />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/team"
                    element={
                      <ProtectedRoute>
                        <Team />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  // src/App.tsx (continued)

                  <Route
                    path="/help"
                    element={
                      <ProtectedRoute>
                        <Help />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute>
                        <UserManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <ProtectedRoute>
                        <SystemSettings />
                      </ProtectedRoute>
                    }
                  />

                  {/* Legal pages */}
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/data-deletion" element={<DataDeletion />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;