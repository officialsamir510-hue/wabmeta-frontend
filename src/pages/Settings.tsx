import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  MessageSquare,
  Globe,
  Bell,
  Shield,
  Activity
} from 'lucide-react';
import GeneralSettings from '../components/settings/GeneralSettings';
import ApiConfig from '../components/settings/ApiConfig';
import BusinessProfile from '../components/settings/BusinessProfile';
import WebhookLogs from '../components/settings/WebhookLogs';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'business', label: 'Business Profile', icon: MessageSquare },
    { id: 'api', label: 'API & Webhooks', icon: SettingsIcon },
    { id: 'logs', label: 'Webhook Logs', icon: Activity },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'api':
        return <ApiConfig />;
      case 'business':
        return <BusinessProfile />;
      case 'logs':
        return <WebhookLogs />;
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
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences and API configuration</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-24">
            <nav className="flex flex-col p-2 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${
                    activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;