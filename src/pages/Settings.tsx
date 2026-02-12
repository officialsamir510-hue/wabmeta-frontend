// src/pages/Settings.tsx

import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Key,
  Building2,
  Loader2,
  Save,
  Eye,
  EyeOff,
  Globe,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { users as usersApi } from '../services/api';
import toast from 'react-hot-toast';

interface Tab {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface UserSettings {
  timezone: string;
  language: string;
  theme: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading] = useState(false); // ✅ Changed to false - no API call initially
  const [saving, setSaving] = useState(false);

  // ✅ Initialize with default values (no API call)
  const [settings, setSettings] = useState<UserSettings>({
    timezone: 'UTC',
    language: 'en',
    theme: 'light',
    notifications: {
      email: true,
      push: false,
      sms: false,
      marketing: false
    }
  });

  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const tabs: Tab[] = [
    { id: 'general', name: 'General', icon: <SettingsIcon className="w-5 h-5" /> },
    { id: 'profile', name: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'business', name: 'Business Profile', icon: <Building2 className="w-5 h-5" /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'security', name: 'Security', icon: <Shield className="w-5 h-5" /> },
    { id: 'api', name: 'API & Webhooks', icon: <Key className="w-5 h-5" /> },
  ];

  useEffect(() => {
    loadSettingsFromStorage();
    loadProfileFromUser();
  }, [user]);

  // ✅ Load settings from localStorage (no API call)
  const loadSettingsFromStorage = () => {
    try {
      const savedSettings = localStorage.getItem('wabmeta_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings from storage:', error);
    }
  };

  // ✅ Load profile from auth user
  const loadProfileFromUser = () => {
    if (user) {
      setProfile({
        firstName: (user as any).firstName || (user as any).name?.split(' ')[0] || '',
        lastName: (user as any).lastName || (user as any).name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        phone: (user as any).phone || ''
      });
    }
  };

  // ✅ Save settings to localStorage
  const updateSettings = async (data: Partial<UserSettings>) => {
    try {
      setSaving(true);
      const updatedSettings = { ...settings, ...data };
      setSettings(updatedSettings);
      localStorage.setItem('wabmeta_settings', JSON.stringify(updatedSettings));
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // ✅ Update profile via API
  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      setSaving(true);
      const response = await usersApi.updateProfile(data);
      if (response.data.success) {
        setProfile(prev => ({ ...prev, ...data }));
        toast.success('Profile updated successfully');
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      );
    }

    switch (activeTab) {
      case 'general':
        return <GeneralSettingsPanel settings={settings} onUpdate={updateSettings} saving={saving} />;
      case 'profile':
        return <ProfileSettingsPanel profile={profile} onUpdate={updateProfile} saving={saving} />;
      case 'business':
        return <BusinessSettingsPanel />;
      case 'notifications':
        return <NotificationSettingsPanel settings={settings} onUpdate={updateSettings} saving={saving} />;
      case 'security':
        return <SecuritySettingsPanel />;
      case 'api':
        return <ApiSettingsPanel />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your account and application settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 shrink-0">
            <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <ul className="space-y-1">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === tab.id
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      {tab.icon}
                      <span>{tab.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================
// General Settings Panel
// =============================================
const GeneralSettingsPanel: React.FC<{
  settings: UserSettings;
  onUpdate: (data: Partial<UserSettings>) => Promise<void>;
  saving: boolean;
}> = ({ settings, onUpdate, saving }) => {
  const [timezone, setTimezone] = useState(settings.timezone);
  const [language, setLanguage] = useState(settings.language);
  const [theme, setTheme] = useState(settings.theme);

  useEffect(() => {
    setTimezone(settings.timezone);
    setLanguage(settings.language);
    setTheme(settings.theme);
  }, [settings]);

  const handleSave = () => {
    onUpdate({ timezone, language, theme });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">General Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure your preferences</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Globe className="w-4 h-4 inline mr-2" />Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="UTC">UTC</option>
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
          <div className="flex gap-3">
            {[
              { id: 'light', name: 'Light', icon: Sun },
              { id: 'dark', name: 'Dark', icon: Moon },
              { id: 'system', name: 'System', icon: SettingsIcon }
            ].map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${theme === id
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
              >
                <Icon className="w-4 h-4" />{name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Changes
      </button>
    </div>
  );
};

// =============================================
// Profile Settings Panel
// =============================================
const ProfileSettingsPanel: React.FC<{
  profile: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => Promise<void>;
  saving: boolean;
}> = ({ profile, onUpdate, saving }) => {
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [phone, setPhone] = useState(profile.phone);

  useEffect(() => {
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setPhone(profile.phone);
  }, [profile]);

  const handleSave = () => {
    onUpdate({ firstName, lastName, phone });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update your personal information</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Profile
      </button>
    </div>
  );
};

// =============================================
// Notification Settings Panel
// =============================================
const NotificationSettingsPanel: React.FC<{
  settings: UserSettings;
  onUpdate: (data: Partial<UserSettings>) => Promise<void>;
  saving: boolean;
}> = ({ settings, onUpdate, saving }) => {
  const [notifications, setNotifications] = useState(settings.notifications);

  useEffect(() => {
    setNotifications(settings.notifications);
  }, [settings]);

  const handleToggle = (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    onUpdate({ notifications: updated });
  };

  const notificationItems = [
    { key: 'email' as const, title: 'Email Notifications', desc: 'Receive notifications via email' },
    { key: 'push' as const, title: 'Push Notifications', desc: 'Receive browser notifications' },
    { key: 'sms' as const, title: 'SMS Notifications', desc: 'Receive notifications via SMS' },
    { key: 'marketing' as const, title: 'Marketing Emails', desc: 'Receive product updates' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notification Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose how you want to receive notifications</p>
      </div>

      <div className="space-y-4">
        {notificationItems.map(({ key, title, desc }) => (
          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
            <button
              onClick={() => handleToggle(key)}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications[key] ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications[key] ? 'translate-x-6' : 'translate-x-1'
                }`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// =============================================
// Other Panels (Placeholder)
// =============================================
const BusinessSettingsPanel: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Business Profile</h2>
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <p className="text-yellow-700 dark:text-yellow-400">
        Business profile settings are synced with your WhatsApp Business Account.
      </p>
    </div>
  </div>
);

const SecuritySettingsPanel: React.FC = () => {
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      setSaving(true);
      await api.post('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security Settings</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>
        <button onClick={handleChangePassword} disabled={saving || !currentPassword || !newPassword}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          Change Password
        </button>
      </div>
    </div>
  );
};

const ApiSettingsPanel: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">API & Webhooks</h2>
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <p className="text-blue-700 dark:text-blue-400">API documentation available at docs.wabmeta.com</p>
    </div>
  </div>
);

export default Settings;