// src/pages/Profile.tsx

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Building2,
  Calendar,
  Shield,
  RefreshCw,
  LogOut,
  Smartphone,
  Monitor,
  Trash2
} from 'lucide-react';
import { auth, settings } from '../services/api';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  avatar: string | null;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Session {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    avatar: '',
  });

  // ==========================================
  // FETCH PROFILE
  // ==========================================
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use /users/profile endpoint
      const response = await settings.getProfile();
      console.log('📥 Profile Response:', response.data);

      // Handle different response structures
      const userData = response.data?.data || response.data;
      
      if (!userData || !userData.id) {
        throw new Error('Invalid profile data received');
      }

      setProfile(userData);
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        avatar: userData.avatar || '',
      });

    } catch (err: any) {
      console.error('❌ Failed to fetch profile:', err);
      
      // Try fallback to /auth/me
      try {
        console.log('🔄 Trying /auth/me fallback...');
        const fallbackResponse = await auth.me();
        console.log('📥 Auth/Me Response:', fallbackResponse.data);
        
        const userData = fallbackResponse.data?.data?.user || 
                        fallbackResponse.data?.data || 
                        fallbackResponse.data?.user || 
                        fallbackResponse.data;

        if (userData && userData.id) {
          setProfile(userData);
          setFormData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            phone: userData.phone || '',
            avatar: userData.avatar || '',
          });
          setError(null);
          return;
        }
      } catch (fallbackErr) {
        console.error('❌ Fallback also failed:', fallbackErr);
      }

      setError(err.response?.data?.message || err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH SESSIONS
  // ==========================================
  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const response = await fetch('/api/v1/users/sessions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('wabmeta_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessions(data.data || []);
      }
    } catch (err) {
      console.log('Sessions not available');
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchSessions();
  }, []);

  // ==========================================
  // UPDATE PROFILE
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await settings.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName || null,
        phone: formData.phone || null,
        avatar: formData.avatar || null,
      });
      
      console.log('✅ Profile Updated:', response.data);

      const updatedUser = response.data?.data || response.data;
      if (updatedUser) {
        setProfile((prev) => prev ? { ...prev, ...updatedUser } : updatedUser);
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('❌ Failed to update profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // HANDLE AVATAR CHANGE
  // ==========================================
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // ==========================================
  // REVOKE SESSION
  // ==========================================
  const handleRevokeSession = async (sessionId: string) => {
    if (!window.confirm('Revoke this session?')) return;
    
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('wabmeta_token');
      await fetch(`/api/v1/users/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (err) {
      alert('Failed to revoke session');
    }
  };

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR STATE (No Profile)
  // ==========================================
  if (!profile && error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Profile</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchProfile}
            className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your personal information</p>
        </div>
        <button
          onClick={fetchProfile}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            ×
          </button>
        </div>
      )}

      {/* Success Banner */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-700 font-medium">Profile updated successfully!</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Avatar & Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              <div className="w-28 h-28 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-primary-600">
                    {formData.firstName?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-primary-500 text-white rounded-full cursor-pointer hover:bg-primary-600 transition-colors shadow-lg">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Name & Email */}
            <h2 className="text-xl font-bold text-gray-900">
              {profile?.firstName} {profile?.lastName}
            </h2>
            <p className="text-gray-500">{profile?.email}</p>

            {/* Status Badges */}
            <div className="mt-4 flex items-center justify-center flex-wrap gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                profile?.status === 'ACTIVE' 
                  ? 'bg-green-100 text-green-700' 
                  : profile?.status === 'SUSPENDED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
              }`}>
                {profile?.status === 'ACTIVE' ? '✓ Active' : profile?.status}
              </span>
              {profile?.emailVerified && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </span>
              )}
            </div>

            {/* Join Date */}
            {profile?.createdAt && (
              <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500 flex items-center justify-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Joined {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <a
                href="/dashboard/settings"
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Building2 className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Organization Settings</span>
              </a>
              <a
                href="/dashboard/settings"
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Security Settings</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column - Edit Form & Sessions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Form */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Edit Profile</h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      placeholder="John"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Active Sessions */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
              <button
                onClick={fetchSessions}
                disabled={loadingSessions}
                className="text-sm text-primary-600 hover:underline flex items-center space-x-1"
              >
                <RefreshCw className={`w-3 h-3 ${loadingSessions ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingSessions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            ) : sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`flex items-center justify-between p-4 rounded-xl ${
                      session.isCurrent ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {session.userAgent?.toLowerCase().includes('mobile') ? (
                        <Smartphone className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Monitor className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 flex items-center space-x-2">
                          <span>{session.userAgent?.split(' ')[0] || 'Unknown Device'}</span>
                          {session.isCurrent && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {session.ipAddress || 'Unknown IP'} • 
                          {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Revoke session"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Monitor className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No active sessions found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;