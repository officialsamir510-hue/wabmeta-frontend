import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Camera, Save, Loader2 } from 'lucide-react';
import { auth } from '../services/api';
import { useApp } from '../context/AppContext';

const Profile: React.FC = () => {
  const { user, setUser } = useApp(); // Get user from context
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
  });

  // Load user data on mount
  useEffect(() => {
    if (user) {
      const [first, ...last] = (user.name || '').split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: first || '',
        lastName: last.join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
      };

      if (formData.newPassword) {
        payload.password = formData.newPassword;
        // Ideally send currentPassword too for verification if backend supports it
      }

      // Add updateProfile to your api.ts if not present
      const response = await auth.updateProfile(payload);
      
      // Update context and local storage
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('wabmeta_user', JSON.stringify(updatedUser));
      
      // Clear passwords
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
      
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error("Update Error:", error);
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal information and security</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Avatar */}
        <div className="md:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full border-4 border-gray-50 mx-auto mb-4 bg-primary-100 flex items-center justify-center text-4xl font-bold text-primary-600">
                {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
              </div>
              {/* Camera button can be hooked up to image upload later */}
              <button className="absolute bottom-4 right-0 p-2 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500 mb-4 capitalize">{user.role || 'User'}</p>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Personal Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;