// src/components/settings/NotificationSettings.tsx

import React from 'react';
import { Bell, Mail, MessageSquare } from 'lucide-react';

const NotificationSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <Bell className="w-6 h-6 mr-2 text-orange-600" />
          Notification Preferences
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Choose how you want to be notified
        </p>
      </div>

      <div className="space-y-4">
        {[
          { id: 'email', label: 'Email Notifications', desc: 'Receive updates via email', icon: Mail },
          { id: 'message', label: 'New Message Alerts', desc: 'Get notified for new messages', icon: MessageSquare },
          { id: 'campaign', label: 'Campaign Updates', desc: 'Campaign completion & stats', icon: Bell },
        ].map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center">
              <item.icon className="w-5 h-5 text-gray-500 mr-3" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationSettings;