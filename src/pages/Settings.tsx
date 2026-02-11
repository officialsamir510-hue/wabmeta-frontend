// src/pages/Settings.tsx
import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Key, 
  Building2,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Import components (check if these exist, if not comment them out)
// import GeneralSettings from '../components/settings/GeneralSettings';
// import BusinessProfile from '../components/settings/BusinessProfile';
// import NotificationSettings from '../components/settings/NotificationSettings';
// import ApiConfig from '../components/settings/ApiConfig';
// import SecuritySettings from '../components/settings/SecuritySettings';
// import MetaApiWebhookSettings from '../components/settings/MetaApiWebhookSettings';

// ✅ CORRECT Import
import api from '../services/api';

interface Tab {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const Settings: React.FC = () => {
  useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>({});
  const [, setSaving] = useState(false);

  const tabs: Tab[] = [
    { id: 'general', name: 'General', icon: <SettingsIcon className="w-5 h-5" /> },
    { id: 'profile', name: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'business', name: 'Business Profile', icon: <Building2 className="w-5 h-5" /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'security', name: 'Security', icon: <Shield className="w-5 h-5" /> },
    { id: 'api', name: 'API & Webhooks', icon: <Key className="w-5 h-5" /> },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings');
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (data: any) => {
    try {
      setSaving(true);
      await api.put('/settings', data);
      await fetchSettings();
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
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
        return <GeneralSettingsPanel settings={settings} onUpdate={updateSettings} />;
      case 'profile':
        return <ProfileSettingsPanel settings={settings} onUpdate={updateSettings} />;
      case 'business':
        return <BusinessSettingsPanel settings={settings} onUpdate={updateSettings} />;
      case 'notifications':
        return <NotificationSettingsPanel settings={settings} onUpdate={updateSettings} />;
      case 'security':
        return <SecuritySettingsPanel settings={settings} onUpdate={updateSettings} />;
      case 'api':
        return <ApiSettingsPanel settings={settings} onUpdate={updateSettings} />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account and application settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 shrink-0">
            <nav className="bg-white rounded-xl shadow-sm p-4">
              <ul className="space-y-1">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-green-50 text-green-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
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

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Inline Settings Panels (Temporary)
const GeneralSettingsPanel: React.FC<any> = ({  }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold">General Settings</h2>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Timezone</label>
        <select className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm">
          <option>UTC</option>
          <option>Asia/Kolkata</option>
          <option>America/New_York</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Language</label>
        <select className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm">
          <option>English</option>
          <option>Hindi</option>
        </select>
      </div>
    </div>
  </div>
);

const ProfileSettingsPanel: React.FC<any> = ({  }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold">Profile Settings</h2>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input 
          type="text" 
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
          placeholder="Your name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input 
          type="email" 
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
          placeholder="your@email.com"
        />
      </div>
    </div>
  </div>
);

const BusinessSettingsPanel: React.FC<any> = ({  }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold">Business Profile</h2>
    <p className="text-gray-600">Configure your business information for WhatsApp</p>
  </div>
);

const NotificationSettingsPanel: React.FC<any> = ({  }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold">Notification Settings</h2>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span>Email Notifications</span>
        <input type="checkbox" className="rounded text-green-600" defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <span>Push Notifications</span>
        <input type="checkbox" className="rounded text-green-600" />
      </div>
    </div>
  </div>
);

const SecuritySettingsPanel: React.FC<any> = ({  }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold">Security Settings</h2>
    <div className="space-y-4">
      <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
        Change Password
      </button>
      <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
        Enable 2FA
      </button>
    </div>
  </div>
);

const ApiSettingsPanel: React.FC<any> = ({  }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold">API & Webhooks</h2>
    <p className="text-gray-600">Manage API keys and webhook configurations</p>
  </div>
);

export default Settings;