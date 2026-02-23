// src/pages/Dashboard.tsx - COMPLETE WITH WORKING CHARTS

import React, { useState, useEffect } from 'react';
import {
  Users,
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  Mail,
  FileText,
  BarChart3,
} from 'lucide-react';
import { dashboard } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

// ============================================
// SIMPLE BAR CHART COMPONENT
// ============================================

interface BarChartProps {
  data: any[];
  bars: { key: string; color: string; label: string }[];
  height?: number;
}

const SimpleBarChart: React.FC<BarChartProps> = ({ data, bars, height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-400" style={{ height }}>
        No data available
      </div>
    );
  }

  const maxValue = Math.max(
    ...data.flatMap((d) => bars.map((bar) => d[bar.key] || 0)),
    1
  );

  return (
    <div className="w-full" style={{ height }}>
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {bars.map((bar) => (
          <div key={bar.key} className="flex items-center text-xs">
            <div
              className="w-3 h-3 rounded-sm mr-1"
              style={{ backgroundColor: bar.color }}
            />
            <span className="text-gray-600 dark:text-gray-400">{bar.label}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="flex items-end justify-between gap-1 h-32">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="flex items-end gap-0.5 h-28">
              {bars.map((bar) => {
                const value = item[bar.key] || 0;
                const heightPercent = (value / maxValue) * 100;
                return (
                  <div
                    key={bar.key}
                    className="w-2 rounded-t transition-all hover:opacity-80 cursor-pointer"
                    style={{
                      height: `${Math.max(heightPercent, 2)}%`,
                      backgroundColor: bar.color,
                    }}
                    title={`${bar.label}: ${value}`}
                  />
                );
              })}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 truncate w-full text-center">
              {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// DONUT CHART COMPONENT
// ============================================

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  size?: number;
}

const SimpleDonutChart: React.FC<DonutChartProps> = ({ data, size = 150 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center text-gray-400"
        style={{ width: size, height: size }}
      >
        No data
      </div>
    );
  }

  let currentAngle = -90; // Start from top

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox="0 0 100 100">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const angle = (percentage / 100) * 360;

          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          currentAngle = endAngle;

          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;

          const x1 = 50 + 40 * Math.cos(startRad);
          const y1 = 50 + 40 * Math.sin(startRad);
          const x2 = 50 + 40 * Math.cos(endRad);
          const y2 = 50 + 40 * Math.sin(endRad);

          const largeArc = angle > 180 ? 1 : 0;

          const pathD = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

          return (
            <path
              key={index}
              d={pathD}
              fill={item.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          );
        })}
        {/* Inner circle for donut effect */}
        <circle cx="50" cy="50" r="25" fill="white" className="dark:fill-gray-800" />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-lg font-bold fill-gray-900 dark:fill-white"
        >
          {total}
        </text>
      </svg>

      {/* Legend */}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center text-sm">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-600 dark:text-gray-400 mr-2">{item.name}:</span>
            <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [widgets, setWidgets] = useState<any>(null);
  const [dateRange, setDateRange] = useState<7 | 14 | 30>(7);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [statsRes, widgetsRes] = await Promise.all([
        dashboard.getStats(),
        dashboard.getWidgets(dateRange),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      if (widgetsRes.data.success) {
        setWidgets(widgetsRes.data.data);
      }

      if (isRefresh) {
        toast.success('Dashboard refreshed');
      }
    } catch (error: any) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName || 'User'}! 👋
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Here's what's happening with your WhatsApp business
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(parseInt(e.target.value) as 7 | 14 | 30)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Contacts"
          value={stats?.contacts?.total || 0}
          change={stats?.contacts?.growth || 0}
          subValue={`+${stats?.contacts?.thisMonth || 0} this month`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Messages Sent"
          value={stats?.messages?.sent || 0}
          change={stats?.messages?.growth || 0}
          subValue={`${stats?.messages?.today || 0} today`}
          icon={Send}
          color="green"
        />
        <StatCard
          title="Delivery Rate"
          value={`${stats?.delivery?.deliveryRate || 0}%`}
          subValue={`${stats?.delivery?.delivered || 0} delivered`}
          icon={CheckCircle}
          color="purple"
        />
        <StatCard
          title="Active Campaigns"
          value={stats?.campaigns?.active || 0}
          subValue={`${stats?.campaigns?.completed || 0} completed`}
          icon={Zap}
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Messages Overview Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
              Messages Overview
            </h3>
            <Link
              to="/dashboard/reports"
              className="text-sm text-green-600 hover:text-green-700 flex items-center"
            >
              View Details
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <SimpleBarChart
            data={widgets?.messagesOverview || []}
            bars={[
              { key: 'sent', color: '#22c55e', label: 'Sent' },
              { key: 'delivered', color: '#3b82f6', label: 'Delivered' },
              { key: 'received', color: '#8b5cf6', label: 'Received' },
            ]}
          />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {widgets?.summary?.totalSent || 0}
              </p>
              <p className="text-xs text-gray-500">Sent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {widgets?.summary?.deliveryRate || 0}%
              </p>
              <p className="text-xs text-gray-500">Delivery Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {widgets?.summary?.readRate || 0}%
              </p>
              <p className="text-xs text-gray-500">Read Rate</p>
            </div>
          </div>
        </div>

        {/* Delivery Performance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
              Delivery Performance
            </h3>
          </div>

          <div className="flex items-center justify-center py-4">
            <SimpleDonutChart
              data={widgets?.deliveryPerformance || []}
              size={160}
            />
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Delivered</span>
              </div>
              <span className="font-bold text-green-600">
                {widgets?.summary?.totalDelivered || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Failed</span>
              </div>
              <span className="font-bold text-red-600">
                {widgets?.summary?.totalFailed || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Stats
          </h3>
          <div className="space-y-4">
            <QuickStatItem
              label="Unread Conversations"
              value={stats?.conversations?.unread || 0}
              icon={Mail}
              color="orange"
              href="/dashboard/inbox"
            />
            <QuickStatItem
              label="Active Conversations"
              value={stats?.conversations?.active || 0}
              icon={MessageSquare}
              color="blue"
              href="/dashboard/inbox"
            />
            <QuickStatItem
              label="Approved Templates"
              value={stats?.templates?.approved || 0}
              icon={FileText}
              color="green"
              href="/dashboard/templates"
            />
            <QuickStatItem
              label="Connected Accounts"
              value={stats?.whatsapp?.connected || 0}
              icon={CheckCircle}
              color="purple"
              href="/dashboard/settings"
            />
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Campaigns
            </h3>
            <Link
              to="/dashboard/campaigns"
              className="text-sm text-green-600 hover:text-green-700 flex items-center"
            >
              View All
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {widgets?.recentCampaigns && widgets.recentCampaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-2 font-medium">Campaign</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Sent</th>
                    <th className="pb-2 font-medium text-right">Delivery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {widgets.recentCampaigns.map((campaign: any) => (
                    <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3">
                        <Link
                          to={`/dashboard/campaigns/${campaign.id}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-green-600"
                        >
                          {campaign.name}
                        </Link>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${campaign.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : campaign.status === 'RUNNING'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : campaign.status === 'FAILED'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                        >
                          {campaign.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                        {campaign.sentCount}/{campaign.totalContacts}
                      </td>
                      <td className="py-3 text-right">
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
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Zap className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No campaigns yet</p>
              <Link
                to="/dashboard/campaigns/create"
                className="mt-2 inline-block text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Create your first campaign →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Conversations
          </h3>
          <Link
            to="/dashboard/inbox"
            className="text-sm text-green-600 hover:text-green-700 flex items-center"
          >
            View Inbox
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {widgets?.recentConversations && widgets.recentConversations.length > 0 ? (
          <div className="space-y-3">
            {widgets.recentConversations.map((conv: any) => (
              <Link
                key={conv.id}
                to={`/dashboard/inbox/${conv.id}`}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-medium">
                      {conv.contactName?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {conv.contactName || conv.phone}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {conv.lastMessage || 'No messages'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {conv.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-green-600 text-white text-xs rounded-full mb-1">
                      {conv.unreadCount}
                    </span>
                  )}
                  <p className="text-xs text-gray-400">
                    {conv.lastMessageAt
                      ? new Date(conv.lastMessageAt).toLocaleDateString()
                      : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No conversations yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// STAT CARD COMPONENT
// ============================================

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  subValue?: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  subValue,
  icon: Icon,
  color,
}) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
          >
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{title}</p>
        {subValue && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subValue}</p>
        )}
      </div>
    </div>
  );
};

// ============================================
// QUICK STAT ITEM COMPONENT
// ============================================

interface QuickStatItemProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange';
  href: string;
}

const QuickStatItem: React.FC<QuickStatItemProps> = ({
  label,
  value,
  icon: Icon,
  color,
  href,
}) => {
  const colors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  };

  return (
    <Link
      to={href}
      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
    >
      <div className="flex items-center">
        <Icon className={`w-5 h-5 ${colors[color]} mr-3`} />
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <span className="font-bold text-gray-900 dark:text-white">{value}</span>
    </Link>
  );
};

export default Dashboard;