import React, { Suspense, type JSX } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingScreen from './components/common/LoadingScreen';
import { usePlanAccess } from './hooks/usePlanAccess';
import MetaCallback from './pages/MetaCallback';

// Lazy Load Pages
const Landing = React.lazy(() => import('./pages/Landing'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const VerifyOTP = React.lazy(() => import('./pages/VerifyOTP'));
const VerifyEmail = React.lazy(() => import('./pages/VerifyEmail'));

// Dashboard Pages
const DashboardLayout = React.lazy(() => import('./components/dashboard/DashboardLayout'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Contacts = React.lazy(() => import('./pages/Contacts'));
const ContactDetails = React.lazy(() => import('./pages/ContactDetails'));
const ImportContacts = React.lazy(() => import('./pages/ImportContacts'));
const Templates = React.lazy(() => import('./pages/Templates'));
const CreateTemplate = React.lazy(() => import('./pages/CreateTemplate'));
const Campaigns = React.lazy(() => import('./pages/Campaigns'));
const CreateCampaign = React.lazy(() => import('./pages/CreateCampaign'));
const CampaignDetails = React.lazy(() => import('./pages/CampaignDetails'));
const Inbox = React.lazy(() => import('./pages/Inbox'));
const ChatbotList = React.lazy(() => import('./pages/ChatbotList'));
const ChatbotBuilder = React.lazy(() => import('./pages/ChatbotBuilder'));
const Team = React.lazy(() => import('./pages/Team'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Reports = React.lazy(() => import('./pages/Reports'));
const Billing = React.lazy(() => import('./pages/Billing'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Help = React.lazy(() => import('./pages/Help'));
const Automation = React.lazy(() => import('./pages/Automation'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Admin Pages
const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout'));
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = React.lazy(() => import('./pages/admin/UserManagement'));
const SystemSettings = React.lazy(() => import('./pages/admin/SystemSettings'));

// Protected Route Components
const AdminProtectedRoute = React.lazy(() => import('./components/admin/AdminProtectedRoute'));

// Plan Protection Wrapper
type PlanFeature = 
  | "automation"
  | "campaignRetry"
  | "webhooks"
  | "flowBuilder"
  | "mobileApiSameNumber"
  | "prioritySupport"
  | "chatbot"
  | "analytics";

const PlanRoute = ({ feature, children }: { feature: PlanFeature, children: JSX.Element }) => {
  const { hasAccess } = usePlanAccess();
  
  if (!hasAccess(feature)) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upgrade Required</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          The <strong>{feature}</strong> feature is not available in your current plan. 
          Upgrade to Pro or Enterprise to unlock this powerful tool.
        </p>
        <Link 
          to="/dashboard/billing" 
          className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-primary-500/25"
        >
          View Plans & Upgrade
        </Link>
      </div>
    );
  }
  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* ===== Public Routes ===== */}
            <Route path="/" element={<Landing />} />
            
            {/* ✅ Meta Callback (Moved Outside Dashboard) */}
            <Route path="/meta-callback" element={<MetaCallback />} />
            
            {/* ===== Auth Routes ===== */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            
            {/* ===== Dashboard Routes ===== */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              
              {/* Inbox */}
              <Route path="inbox" element={<Inbox />} />
              
              {/* Contacts */}
              <Route path="contacts" element={<Contacts />} />
              <Route path="contacts/:id" element={<ContactDetails />} />
              <Route path="contacts/import" element={<ImportContacts />} />
              
              {/* Templates */}
              <Route path="templates" element={<Templates />} />
              <Route path="templates/new" element={<CreateTemplate />} />
              <Route path="templates/edit/:id" element={<CreateTemplate />} />
              
              {/* Campaigns */}
              <Route path="campaigns" element={<Campaigns />} />
              <Route path="campaigns/new" element={<CreateCampaign />} />
              <Route path="campaigns/:id" element={<CampaignDetails />} />
              
              {/* Protected Features */}
              <Route 
                path="chatbot" 
                element={
                  <PlanRoute feature="chatbot">
                    <ChatbotList />
                  </PlanRoute>
                } 
              />
              <Route 
                path="chatbot/new" 
                element={
                  <PlanRoute feature="chatbot">
                    <ChatbotBuilder />
                  </PlanRoute>
                } 
              />
              <Route 
                path="chatbot/edit/:id" 
                element={
                  <PlanRoute feature="chatbot">
                    <ChatbotBuilder />
                  </PlanRoute>
                } 
              />
              
              <Route 
                path="automation" 
                element={
                  <PlanRoute feature="automation">
                    <Automation />
                  </PlanRoute>
                } 
              />
              
              <Route 
                path="reports" 
                element={
                  <PlanRoute feature="analytics">
                    <Reports />
                  </PlanRoute>
                } 
              />
              
              {/* Management */}
              <Route path="team" element={<Team />} />
              <Route path="settings" element={<Settings />} />
              <Route path="billing" element={<Billing />} />
              <Route path="profile" element={<Profile />} />
              <Route path="help" element={<Help />} />
              
              {/* Placeholder Routes */}
              <Route path="notifications" element={<NotFound />} />
              <Route path="activity" element={<NotFound />} />
            </Route>

            {/* ===== Admin Routes ===== */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            <Route path="/admin" element={<AdminProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="settings" element={<SystemSettings />} />
              </Route>
            </Route>

            {/* ===== 404 Route ===== */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;