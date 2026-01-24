import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Pause,
  RefreshCw,
  Download,
  Users,
  Clock,
  MessageSquare
} from 'lucide-react';
import CampaignStats from '../components/campaigns/CampaignStats';

const CampaignDetails: React.FC = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'recipients' | 'activity'>('overview');

  // Sample campaign data
  const campaign = {
    id,
    name: 'Diwali Sale 2024',
    description: 'Festive season promotional campaign with special discounts',
    templateName: 'Diwali Sale Promotion',
    templateBody: '🪔 Happy Diwali {{1}}! 🪔\n\nGet FLAT 50% OFF on all products!\nCode: DIWALI50\nValid till: {{2}}',
    status: 'running',
    audience: { type: 'all', totalContacts: 2500 },
    stats: {
      total: 2500,
      sent: 1850,
      delivered: 1800,
      read: 1200,
      replied: 180,
      failed: 50,
      pending: 650
    },
    scheduledAt: null,
    startedAt: '2 hours ago',
    createdAt: 'Dec 20, 2024 at 10:30 AM',
    createdBy: 'John Doe',
    variableMapping: { '1': 'First Name', '2': 'Dec 31, 2024' }
  };

  const recipients = [
    { id: '1', name: 'Priya Sharma', phone: '+91 98765 43210', status: 'delivered', readAt: '10:35 AM' },
    { id: '2', name: 'Rahul Kumar', phone: '+91 87654 32109', status: 'read', readAt: '10:40 AM' },
    { id: '3', name: 'Anjali Patel', phone: '+91 76543 21098', status: 'replied', readAt: '10:45 AM' },
    { id: '4', name: 'Vikram Singh', phone: '+91 65432 10987', status: 'failed', readAt: null },
    { id: '5', name: 'Neha Gupta', phone: '+91 54321 09876', status: 'pending', readAt: null },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-blue-100 text-blue-700';
      case 'read': return 'bg-green-100 text-green-700';
      case 'replied': return 'bg-purple-100 text-purple-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start space-x-4">
          <Link
            to="/dashboard/campaigns"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center space-x-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="ml-1 capitalize">{campaign.status}</span>
              </span>
            </div>
            <p className="text-gray-500 mt-1">{campaign.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-medium rounded-xl transition-colors">
            <Pause className="w-4 h-4" />
            <span>Pause</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <CampaignStats stats={campaign.stats} showProgress />

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Template</p>
              <p className="font-medium text-gray-900">{campaign.templateName}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Audience</p>
              <p className="font-medium text-gray-900">{campaign.audience.totalContacts.toLocaleString()} contacts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Started</p>
              <p className="font-medium text-gray-900">{campaign.startedAt}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'recipients', label: 'Recipients' },
              { id: 'activity', label: 'Activity Log' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Message Preview</h3>
                <div className="bg-gray-100 rounded-xl p-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{campaign.templateBody}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Variable Mapping</h3>
                <div className="space-y-3">
                  {Object.entries(campaign.variableMapping).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-mono text-primary-600">{`{{${key}}}`}</span>
                      <span className="text-gray-700">{value}</span>
                    </div>
                  ))}
                </div>

                <h3 className="font-semibold text-gray-900 mt-6 mb-4">Campaign Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Created by</span>
                    <span className="text-gray-900">{campaign.createdBy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Created at</span>
                    <span className="text-gray-900">{campaign.createdAt}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recipients Tab */}
          {activeTab === 'recipients' && (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Contact</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Phone</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Read At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recipients.map((recipient) => (
                      <tr key={recipient.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium text-sm">
                              {recipient.name.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-900">{recipient.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{recipient.phone}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(recipient.status)}`}>
                            {recipient.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">{recipient.readAt || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              {[
                { time: '10:30 AM', action: 'Campaign started', details: 'Sending to 2,500 contacts' },
                { time: '10:32 AM', action: '500 messages sent', details: 'Processing...' },
                { time: '10:35 AM', action: '1,000 messages sent', details: 'Processing...' },
                { time: '10:40 AM', action: '1,500 messages sent', details: 'Processing...' },
                { time: '10:45 AM', action: '1,850 messages sent', details: '650 remaining' },
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <span className="text-sm text-gray-500">{activity.time}</span>
                    </div>
                    <p className="text-sm text-gray-500">{activity.details}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;