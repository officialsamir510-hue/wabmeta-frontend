import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminProtectedRoute: React.FC = () => {
  // Check for admin token in localStorage
  const isAdminAuthenticated = localStorage.getItem('wabmeta_admin_token') === 'true';

  // If not authenticated, redirect to admin login or 404 to hide it
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // If authenticated, show the admin layout/pages
  return <Outlet />;
};

export default AdminProtectedRoute;