// src/components/settings/NotificationSettings.tsx

import React, { useState } from 'react';
import { Bell, Mail, Smartphone, MessageSquare, Megaphone, Users, Loader2, CheckCircle } from 'lucide-react';

const NotificationSettings: React.FC = () => {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [settings, setSettings] = useState({
    email: {
      newMessage: true,
      campaignComplete: true,
      weeklyReport: true,
      teamInvite: true,
      billingAlerts: true,
    },
    push: {
      newMessage: true,
      campaignComplete: false,
      teamActivity: true,
    },
    inApp: {
      allNotifications: true,
    },
  });

  const handleToggle = (category: string, setting: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting],
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
            <p className="text-sm text-gray-500">Manage what emails you receive</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">New Messages</p>
                <p className="text-sm text-gray-500">Get notified when you receive new messages</p>
              </div>
            </div>
            <ToggleSwitch
              enabled={settings.email.newMessage}
              onChange={() => handleToggle('email', 'newMessage')}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <Megaphone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Campaign Updates</p>
                <p className="text-sm text-gray-500">Receive updates when campaigns complete</p>
              </div>
            </div>
            <ToggleSwitch
              enabled={settings.email.campaignComplete}
              onChange={() => handleToggle('email', 'campaignComplete')}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Team Invitations</p>
                <p className="text-sm text-gray-500">Get notified about team invites</p>
              </div>
            </div>
            <ToggleSwitch
              enabled={settings.email.teamInvite}
              onChange={() => handleToggle('email', 'teamInvite')}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Weekly Reports</p>
                <p className="text-sm text-gray-500">Receive weekly summary of your activity</p>
              </div>
            </div>
            <ToggleSwitch
              enabled={settings.email.weeklyReport}
              onChange={() => handleToggle('email', 'weeklyReport')}
            />
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Smartphone className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Push Notifications</h3>
            <p className="text-sm text-gray-500">Browser and mobile notifications</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">New Messages</p>
              <p className="text-sm text-gray-500">Instant alerts for incoming messages</p>
            </div>
            <ToggleSwitch
              enabled={settings.push.newMessage}
              onChange={() => handleToggle('push', 'newMessage')}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Campaign Completion</p>
              <p className="text-sm text-gray-500">Get notified when campaigns finish</p>
            </div>
            <ToggleSwitch
              enabled={settings.push.campaignComplete}
              onChange={() => handleToggle('push', 'campaignComplete')}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Team Activity</p>
              <p className="text-sm text-gray-500">Updates about team member actions</p>
            </div>
            <ToggleSwitch
              enabled={settings.push.teamActivity}
              onChange={() => handleToggle('push', 'teamActivity')}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        {success && (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span>Settings saved!</span>
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="ml-auto px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Preferences</span>
          )}
        </button>
      </div>
    </div>
  );
};

const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-primary-500' : 'bg-gray-200'
      }`}
  >
    <div
      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
    />
  </button>
);

export default NotificationSettings;