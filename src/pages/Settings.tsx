// src/pages/Settings.tsx

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Smartphone,
  User,
  Bell,
  Shield,
  Code,
  Globe,
  CreditCard,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Import settings components
import WhatsAppSettings from '../components/settings/WhatsAppSettings';
import GeneralSettings from '../components/settings/GeneralSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import ApiConfig from '../components/settings/ApiConfig';

type SettingsTab = 'whatsapp' | 'general' | 'notifications' | 'security' | 'api';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('whatsapp');

  const tabs = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: Smartphone,
      description: 'Connect & manage WhatsApp accounts',
    },
    {
      id: 'general',
      name: 'General',
      icon: SettingsIcon,
      description: 'Organization settings',
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
      description: 'Email & push notifications',
    },
    {
      id: 'security',
      name: 'Security',
      icon: Shield,
      description: 'Password & 2FA',
    },
    {
      id: 'api',
      name: 'API & Webhooks',
      icon: Code,
      description: 'API keys & webhook config',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'whatsapp':
        return <WhatsAppSettings />;
      case 'general':
        return <GeneralSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'api':
        return <ApiConfig />;
      default:
        return <WhatsAppSettings />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <SettingsIcon className="w-8 h-8 mr-3 text-gray-600 dark:text-gray-400" />
          Settings
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Manage your account and application settings
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-6">
            <nav className="flex flex-col">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`flex items-center px-4 py-3 text-left transition-colors border-l-4 ${activeTab === tab.id
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-600 text-green-700 dark:text-green-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                >
                  <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-green-600' : ''
                    }`} />
                  <div>
                    <p className={`font-medium ${activeTab === tab.id ? 'text-green-700 dark:text-green-400' : ''
                      }`}>
                      {tab.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 hidden sm:block">
                      {tab.description}
                    </p>
                  </div>
                </button>
              ))}
            </nav>

            {/* Quick Links */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-3">
                Quick Links
              </p>
              <div className="space-y-2">
                <Link
                  to="/dashboard/settings/profile"
                  className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                >
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </Link>
                <Link
                  to="/dashboard/settings/team"
                  className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Team Members
                </Link>
                <Link
                  to="/dashboard/settings/billing"
                  className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing & Plans
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;