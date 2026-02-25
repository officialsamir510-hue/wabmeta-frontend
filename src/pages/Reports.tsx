// src/pages/Reports.tsx - COMPLETE WITH REAL DATA

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  Download,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Zap,
} from 'lucide-react';
import { analytics } from '../services/api';
import toast from 'react-hot-toast';

// Simple chart component (you can replace with recharts if installed)
const SimpleBarChart: React.FC<{ data: any[]; dataKey: string; color: string }> = ({
  data,
  dataKey,
  color,
}) => {
  const maxValue = Math.max(...data.map((d) => d[dataKey] || 0), 1);

  return (
    <div className="flex items-end justify-between h-32 gap-1">
      {data.slice(-14).map((item, index) => {
        const height = ((item[dataKey] || 0) / maxValue) * 100;
        return (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className={`w-full rounded-t transition-all hover:opacity-80`}
              style={{
                height: `${Math.max(height, 2)}%`,
                backgroundColor: color,
              }}
              title={`${item.date}: ${item[dataKey]}`}
            />
          </div>
        );
      })}
    </div>
  );
};

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<'7' | '14' | '30' | '90'>('30');
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'campaigns' | 'contacts'>('overview');

  // Data states
  const [overview, setOverview] = useState<any>(null);
  const [messageData, setMessageData] = useState<any>(null);
  const [campaignData, setCampaignData] = useState<any>(null);
  const [contactData, setContactData] = useState<any>(null);

  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  const fetchAllData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const days = parseInt(dateRange);

      const [overviewRes, messagesRes, campaignsRes, contactsRes] = await Promise.allSettled([
        analytics.getOverview(),
        analytics.getMessages(days),
        analytics.getCampaigns(10),
        analytics.getContacts(days),
      ]);

      if (overviewRes.status === 'fulfilled' && overviewRes.value.data.success) {
        setOverview(overviewRes.value.data.data);
      }

      if (messagesRes.status === 'fulfilled' && messagesRes.value.data.success) {
        setMessageData(messagesRes.value.data.data);
      }

      if (campaignsRes.status === 'fulfilled' && campaignsRes.value.data.success) {
        setCampaignData(campaignsRes.value.data.data);
      }

      if (contactsRes.status === 'fulfilled' && contactsRes.value.data.success) {
        setContactData(contactsRes.value.data.data);
      }

      if (isRefresh) {
        toast.success('Data refreshed');
      }
    } catch (error: any) {
      console.error('Fetch analytics error:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExport = async (type: string) => {
    try {
      const loadingToast = toast.loading('Exporting data...');
      const response = await analytics.export(type, 'csv');
      toast.dismiss(loadingToast);

      if (response.data.success) {
        // Create download link
        const blob = new Blob([response.data.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-analytics.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success('Export successful!');
      }
    } catch (error) {
      toast.error('Export failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-green-600" />
            Reports & Analytics
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Track your WhatsApp business performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
          >
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={() => fetchAllData(true)}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Export Button */}
          <button
            onClick={() => handleExport(activeTab)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6 w-fit">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
          { id: 'campaigns', label: 'Campaigns', icon: Send },
          { id: 'contacts', label: 'Contacts', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Contacts"
              value={overview.contacts?.total || 0}
              change={overview.contacts?.growth || 0}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Messages Sent"
              value={overview.messages?.sent || 0}
              change={overview.messages?.growth || 0}
              icon={Send}
              color="green"
            />
            <StatCard
              title="Messages Received"
              value={overview.messages?.received || 0}
              icon={Mail}
              color="purple"
            />
            <StatCard
              title="Active Campaigns"
              value={overview.campaigns?.active || 0}
              subValue={`${overview.campaigns?.completed || 0} completed`}
              icon={Zap}
              color="orange"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Message Trends */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Message Trends
              </h3>
              {messageData?.chartData && messageData.chartData.length > 0 ? (
                <SimpleBarChart
                  data={messageData.chartData}
                  dataKey="sent"
                  color="#22c55e"
                />
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
              <div className="flex justify-between mt-4 text-sm text-gray-500">
                <span>{dateRange} days ago</span>
                <span>Today</span>
              </div>
            </div>

            {/* Contact Growth */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Contact Growth
              </h3>
              {contactData?.chartData && contactData.chartData.length > 0 ? (
                <SimpleBarChart
                  data={contactData.chartData}
                  dataKey="count"
                  color="#3b82f6"
                />
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
              <div className="flex justify-between mt-4 text-sm text-gray-500">
                <span>{dateRange} days ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickStat
              label="Delivery Rate"
              value={`${messageData?.rates?.delivery || 0}%`}
              icon={CheckCircle}
              color="green"
            />
            <QuickStat
              label="Read Rate"
              value={`${messageData?.rates?.read || 0}%`}
              icon={Eye}
              color="blue"
            />
            <QuickStat
              label="Failure Rate"
              value={`${messageData?.rates?.failure || 0}%`}
              icon={XCircle}
              color="red"
            />
            <QuickStat
              label="Templates"
              value={overview.templates?.approved || 0}
              subLabel={`of ${overview.templates?.total || 0}`}
              icon={FileText}
              color="purple"
            />
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && messageData && (
        <div className="space-y-6">
          {/* Message Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              title="Total Sent"
              value={messageData.totals?.sent || 0}
              icon={Send}
              color="blue"
              compact
            />
            <StatCard
              title="Delivered"
              value={messageData.totals?.delivered || 0}
              icon={CheckCircle}
              color="green"
              compact
            />
            <StatCard
              title="Read"
              value={messageData.totals?.read || 0}
              icon={Eye}
              color="purple"
              compact
            />
            <StatCard
              title="Failed"
              value={messageData.totals?.failed || 0}
              icon={XCircle}
              color="red"
              compact
            />
            <StatCard
              title="Received"
              value={messageData.totals?.received || 0}
              icon={Mail}
              color="orange"
              compact
            />
          </div>

          {/* Message Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Daily Message Volume
            </h3>
            {messageData.chartData && messageData.chartData.length > 0 ? (
              <SimpleBarChart
                data={messageData.chartData}
                dataKey="sent"
                color="#22c55e"
              />
            ) : (
              <div className="h-32 flex items-center justify-center text-gray-500">
                No message data for this period
              </div>
            )}
          </div>

          {/* Message Type Breakdown */}
          {messageData.typeBreakdown && messageData.typeBreakdown.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Message Types
              </h3>
              <div className="space-y-3">
                {messageData.typeBreakdown.map((item: any) => (
                  <div key={item.type} className="flex items-center">
                    <span className="w-24 text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {item.type.toLowerCase()}
                    </span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-16 text-right">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && campaignData && (
        <div className="space-y-6">
          {/* Campaign Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Campaigns"
              value={campaignData.overall?.totalCampaigns || 0}
              icon={Zap}
              color="blue"
              compact
            />
            <StatCard
              title="Messages Sent"
              value={campaignData.overall?.totalSent || 0}
              icon={Send}
              color="green"
              compact
            />
            <StatCard
              title="Avg Delivery Rate"
              value={`${campaignData.overall?.avgDeliveryRate || 0}%`}
              icon={CheckCircle}
              color="purple"
              compact
            />
            <StatCard
              title="Avg Read Rate"
              value={`${campaignData.overall?.avgReadRate || 0}%`}
              icon={Eye}
              color="orange"
              compact
            />
          </div>

          {/* Recent Campaigns Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Campaigns
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Sent
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Delivered
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Read
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Delivery %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {campaignData.campaigns?.length > 0 ? (
                    campaignData.campaigns.map((campaign: any) => (
                      <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {campaign.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {campaign.templateName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${campaign.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : campaign.status === 'RUNNING'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                  : campaign.status === 'FAILED'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                              }`}
                          >
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white">
                          {campaign.sentCount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white">
                          {campaign.deliveredCount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white">
                          {campaign.readCount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`text-sm font-medium ${campaign.deliveryRate >= 90
                                ? 'text-green-600'
                                : campaign.deliveryRate >= 70
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                              }`}
                          >
                            {campaign.deliveryRate}%
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No campaigns found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Contacts Tab */}
      {activeTab === 'contacts' && contactData && (
        <div className="space-y-6">
          {/* Contact Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total Contacts"
              value={contactData.totals?.total || 0}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Active Contacts"
              value={contactData.totals?.active || 0}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="New This Period"
              value={contactData.totals?.newThisPeriod || 0}
              icon={TrendingUp}
              color="purple"
            />
          </div>

          {/* Contact Growth Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contact Growth
            </h3>
            {contactData.chartData && contactData.chartData.length > 0 ? (
              <SimpleBarChart
                data={contactData.chartData}
                dataKey="count"
                color="#3b82f6"
              />
            ) : (
              <div className="h-32 flex items-center justify-center text-gray-500">
                No contact data for this period
              </div>
            )}
          </div>

          {/* Source & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source Breakdown */}
            {contactData.sourceBreakdown && contactData.sourceBreakdown.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Contact Sources
                </h3>
                <div className="space-y-3">
                  {contactData.sourceBreakdown.map((item: any) => (
                    <div key={item.source} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.source}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Tags */}
            {contactData.topTags && contactData.topTags.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Top Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {contactData.topTags.map((item: any) => (
                    <span
                      key={item.tag}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm"
                    >
                      {item.tag} ({item.count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// STAT CARD COMPONENT
// ============================================

interface StatCardProps {
  title: string;
  value: number | string;
  change?: number;
  subValue?: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  compact?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  subValue,
  icon: Icon,
  color,
  compact = false,
}) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${compact ? 'p-4' : 'p-6'
        }`}
    >
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
          >
            {change >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className={compact ? 'mt-2' : 'mt-4'}>
        <p
          className={`font-bold text-gray-900 dark:text-white ${compact ? 'text-xl' : 'text-2xl'
            }`}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{title}</p>
        {subValue && (
          <p className="text-xs text-gray-400 dark:text-gray-500">{subValue}</p>
        )}
      </div>
    </div>
  );
};

// ============================================
// QUICK STAT COMPONENT
// ============================================

interface QuickStatProps {
  label: string;
  value: string | number;
  subLabel?: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const QuickStat: React.FC<QuickStatProps> = ({
  label,
  value,
  subLabel,
  icon: Icon,
  color,
}) => {
  const colors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex items-center">
      <Icon className={`w-8 h-8 ${colors[color]} mr-3`} />
      <div>
        <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {label}
          {subLabel && <span className="ml-1 opacity-70">{subLabel}</span>}
        </p>
      </div>
    </div>
  );
};

export default Reports;