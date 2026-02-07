// src/pages/Settings.tsx

import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  MessageSquare,
  Globe,
  Bell,
  Shield,
  Activity,
  Loader2,
  AlertCircle,
  Smartphone,
  Webhook
} from 'lucide-react';
import GeneralSettings from '../components/settings/GeneralSettings';
import ApiConfig from '../components/settings/ApiConfig';
import BusinessProfile from '../components/settings/BusinessProfile';
import WebhookLogs from '../components/settings/WebhookLogs';
import NotificationSettings from '../components/settings/NotificationSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import MetaApiWebhookSettings from '../components/settings/MetaApiWebhookSettings';
import { settings as settingsApi, team as teamApi } from '../services/api';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [profile, setProfile] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'business', label: 'Business Profile', icon: MessageSquare },
    { id: 'whatsapp', label: 'WhatsApp Integration', icon: Smartphone }, // ✅ NEW TAB
    { id: 'api', label: 'API & Webhooks', icon: SettingsIcon },
    { id: 'meta-webhook', label: 'Meta Webhooks', icon: Webhook }, // ✅ NEW TAB
    { id: 'logs', label: 'Webhook Logs', icon: Activity },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  // Fetch settings data
  const fetchSettingsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [profileRes, orgRes] = await Promise.all([
        settingsApi.getProfile(),
        teamApi.getCurrent(),
      ]);

      console.log('📥 Settings Data:', {
        profile: profileRes.data,
        organization: orgRes.data,
      });

      setProfile(profileRes.data?.data || profileRes.data);
      setOrganization(orgRes.data?.data || orgRes.data);

      // Fetch API keys and webhooks if on those tabs
      try {
        const [apiKeysRes, webhooksRes] = await Promise.all([
          settingsApi.getApiKeys(),
          settingsApi.getWebhooks(),
        ]);
        setApiKeys(apiKeysRes.data?.data || apiKeysRes.data || []);
        setWebhooks(webhooksRes.data?.data || webhooksRes.data || []);
      } catch (err) {
        // API keys/webhooks might not be implemented yet
        console.log('API keys/webhooks not available');
      }

    } catch (err: any) {
      console.error('❌ Failed to fetch settings:', err);
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  // Update profile
  const handleUpdateProfile = async (data: any) => {
    try {
      const response = await settingsApi.updateProfile(data);
      setProfile(response.data?.data || response.data);
      return { success: true };
    } catch (err: any) {
      throw err;
    }
  };

  // Change password
  const handleChangePassword = async (data: { currentPassword: string; newPassword: string }) => {
    try {
      await settingsApi.changePassword(data);
      return { success: true };
    } catch (err: any) {
      throw err;
    }
  };

  // Update organization
  const handleUpdateOrganization = async (data: any) => {
    if (!organization?.id) return;
    
    try {
      const response = await teamApi.update(organization.id, data);
      setOrganization(response.data?.data || response.data);
      return { success: true };
    } catch (err: any) {
      throw err;
    }
  };

  // API Keys handlers
  const handleCreateApiKey = async (data: any) => {
    try {
      const response = await settingsApi.createApiKey(data);
      setApiKeys([...apiKeys, response.data?.data || response.data]);
      return response.data?.data || response.data;
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    try {
      await settingsApi.deleteApiKey(id);
      setApiKeys(apiKeys.filter(k => k.id !== id));
    } catch (err: any) {
      throw err;
    }
  };

  // Webhook handlers
  const handleCreateWebhook = async (data: any) => {
    try {
      const response = await settingsApi.createWebhook(data);
      setWebhooks([...webhooks, response.data?.data || response.data]);
      return response.data?.data || response.data;
    } catch (err: any) {
      throw err;
    }
  };

  const handleUpdateWebhook = async (id: string, data: any) => {
    try {
      const response = await settingsApi.updateWebhook(id, data);
      setWebhooks(webhooks.map(w => w.id === id ? (response.data?.data || response.data) : w));
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    try {
      await settingsApi.deleteWebhook(id);
      setWebhooks(webhooks.filter(w => w.id !== id));
    } catch (err: any) {
      throw err;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      );
    }

    switch (activeTab) {
      case 'general':
        return (
          <GeneralSettings 
            profile={profile}
            onUpdate={handleUpdateProfile}
          />
        );
      
      case 'business':
        return (
          <BusinessProfile 
            organization={organization}
            onUpdate={handleUpdateOrganization}
          />
        );
      
      // ✅ NEW: WhatsApp Integration Tab
      case 'whatsapp':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">WhatsApp Business Account</h2>
              <p className="text-sm text-gray-500 mb-6">
                Connect and manage your WhatsApp Business Account through Meta Business
              </p>
              {/* WhatsApp connection component will go here */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  WhatsApp integration is configured in the WhatsApp section of your dashboard.
                  Go to <strong>WhatsApp → Connect Account</strong> to set up your connection.
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'api':
        return (
          <ApiConfig 
            apiKeys={apiKeys}
            webhooks={webhooks}
            onCreateApiKey={handleCreateApiKey}
            onDeleteApiKey={handleDeleteApiKey}
            onCreateWebhook={handleCreateWebhook}
            onUpdateWebhook={handleUpdateWebhook}
            onDeleteWebhook={handleDeleteWebhook}
          />
        );
      
      // ✅ NEW: Meta Webhook Settings Tab
      case 'meta-webhook':
        return <MetaApiWebhookSettings />;
      
      case 'logs':
        return <WebhookLogs />;
      
      case 'notifications':
        return <NotificationSettings />;
      
      case 'security':
        return (
          <SecuritySettings 
            onChangePassword={handleChangePassword}
          />
        );
      
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-gray-200 rounded-xl">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <SettingsIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Coming Soon</h3>
            <p className="text-gray-500">This settings panel is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences and API configuration</p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="text-red-400 hover:text-red-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-24">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Configuration
              </h3>
            </div>
            <nav className="flex flex-col p-2 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${
                    activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  <span className="flex-1 text-left">{tab.label}</span>
                  {/* Badge for new features */}
                  {(tab.id === 'whatsapp' || tab.id === 'meta-webhook') && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      NEW
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Meta Connection Status Card */}
          {(activeTab === 'whatsapp' || activeTab === 'meta-webhook') && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Meta Integration</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    Configure your Meta Business and WhatsApp API settings
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;