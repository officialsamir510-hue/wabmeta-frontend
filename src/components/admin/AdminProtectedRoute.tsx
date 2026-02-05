// src/components/admin/AdminProtectedRoute.tsx

import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { admin } from '../../services/api';

const AdminProtectedRoute: React.FC = () => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem('wabmeta_admin_token');
      
      // No token = not authenticated
      if (!token || token === 'true') { // 'true' was old hardcoded value
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }

      try {
        // Verify token with backend
        const response = await admin.getProfile();
        console.log('✅ Admin verified:', response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('❌ Admin verification failed:', error);
        // Clear invalid token
        localStorage.removeItem('wabmeta_admin_token');
        localStorage.removeItem('wabmeta_admin_user');
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    verifyAdmin();
  }, []);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-white animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated = redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Authenticated = render child routes
  return <Outlet />;
};

export default AdminProtectedRoute;