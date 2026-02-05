// src/pages/admin/AdminLogin.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { admin } from '../../services/api';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ✅ Call real backend API
      const response = await admin.login({ email, password });
      
      console.log('✅ Admin Login Response:', response.data);

      // Extract token from response
      const { token, admin: adminData } = response.data.data || response.data;

      if (!token) {
        throw new Error('No token received from server');
      }

      // Store token in localStorage
      localStorage.setItem('wabmeta_admin_token', token);
      localStorage.setItem('wabmeta_admin_user', JSON.stringify(adminData));

      // Navigate to dashboard
      navigate('/admin/dashboard');

    } catch (err: any) {
      console.error('❌ Admin Login Error:', err);
      
      // Extract error message
      const errorMessage = 
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your credentials.';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Top Accent */}
        <div className="h-2 bg-linear-to-r from-red-500 to-orange-500"></div>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-gray-800" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Portal</h2>
            <p className="text-gray-500 text-sm mt-1">WabMeta Super Admin Access</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-red-600 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                  placeholder="admin@wabmeta.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl transition-all disabled:opacity-70 mt-4 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Access Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Protected Area • Unauthorized access prohibited
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;