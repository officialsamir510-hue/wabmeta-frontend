// src/pages/admin/AdminDashboard.tsx

import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  MessageSquare,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Activity,
  Smartphone,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Ban
} from 'lucide-react';
import { admin } from '../../services/api';
import { Link } from 'react-router-dom';

// ============================================
// TYPES
// ============================================
interface DashboardStats {
  users: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    newThisMonth: number;
  };
  organizations: {
    total: number;
    byPlan: Record<string, number>;
    newThisMonth: number;
  };
  messages: {
    totalSent: number;
    todaySent: number;
    thisMonthSent: number;
  };
  revenue: {
    mrr: number;
    arr: number;
  };
  whatsapp: {
    connectedAccounts: number;
    totalContacts: number;
    totalCampaigns: number;
  };
}

// ============================================
// STAT CARD COMPONENT
// ============================================
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  link?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title, value, change, changeLabel, icon: Icon, iconBg, iconColor, link
}) => {
  const CardWrapper = link ? Link : 'div';
  const wrapperProps = link ? { to: link } : {};

  return (
    <CardWrapper
      {...wrapperProps as any}
      className={`bg-white rounded-2xl border border-gray-200 p-6 ${link ? 'hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {/* ✅ FIXED: Safe toLocaleString */}
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              )}
              <span>{Math.abs(change)}% {changeLabel || 'vs last month'}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </CardWrapper>
  );
};

// ============================================
// USER STATUS BREAKDOWN COMPONENT
// ============================================
interface StatusBreakdownProps {
  stats: DashboardStats['users'];
}

const UserStatusBreakdown: React.FC<StatusBreakdownProps> = ({ stats }) => {
  const statuses = [
    { label: 'Active', value: stats.active || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Pending', value: stats.pending || 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Suspended', value: stats.suspended || 0, icon: Ban, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  const total = stats.total || 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Status Breakdown</h3>
      <div className="space-y-4">
        {statuses.map((status) => (
          <div key={status.label} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${status.bg}`}>
                <status.icon className={`w-4 h-4 ${status.color}`} />
              </div>
              <span className="text-gray-700 font-medium">{status.label}</span>
            </div>
            <div className="flex items-center space-x-3">
              {/* ✅ FIXED: Safe toLocaleString */}
              <span className="text-2xl font-bold text-gray-900">
                {(status.value || 0).toLocaleString()}
              </span>
              <span className="text-sm text-gray-400">
                ({total > 0 ? Math.round((status.value / total) * 100) : 0}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-6 h-3 bg-gray-100 rounded-full overflow-hidden flex">
        <div
          className="bg-green-500 transition-all"
          style={{ width: `${total > 0 ? ((stats.active || 0) / total) * 100 : 0}%` }}
        />
        <div
          className="bg-yellow-500 transition-all"
          style={{ width: `${total > 0 ? ((stats.pending || 0) / total) * 100 : 0}%` }}
        />
        <div
          className="bg-red-500 transition-all"
          style={{ width: `${total > 0 ? ((stats.suspended || 0) / total) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
};

// ============================================
// PLAN DISTRIBUTION COMPONENT
// ============================================
interface PlanDistributionProps {
  byPlan: Record<string, number>;
  total: number;
}

const PlanDistribution: React.FC<PlanDistributionProps> = ({ byPlan, total }) => {
  const planConfig: Record<string, { color: string; bg: string }> = {
    FREE: { color: 'text-gray-600', bg: 'bg-gray-500' },
    STARTER: { color: 'text-blue-600', bg: 'bg-blue-500' },
    PRO: { color: 'text-purple-600', bg: 'bg-purple-500' },
    ENTERPRISE: { color: 'text-orange-600', bg: 'bg-orange-500' },
  };

  // ✅ FIXED: Handle empty byPlan object
  const plans = Object.entries(byPlan || {}).map(([type, count]) => ({
    type,
    count: count || 0,
    percentage: total > 0 ? Math.round(((count || 0) / total) * 100) : 0,
    ...planConfig[type] || { color: 'text-gray-600', bg: 'bg-gray-500' }
  }));

  // ✅ FIXED: Show message if no data
  if (plans.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizations by Plan</h3>
        <div className="text-center py-8 text-gray-500">
          <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No organizations yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizations by Plan</h3>
      <div className="space-y-4">
        {plans.map((plan) => (
          <div key={plan.type}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-medium ${plan.color}`}>{plan.type}</span>
              {/* ✅ FIXED: Safe toLocaleString */}
              <span className="text-gray-900 font-bold">
                {(plan.count || 0).toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${plan.bg} transition-all`}
                style={{ width: `${plan.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// QUICK STATS COMPONENT
// ============================================
interface QuickStatsProps {
  whatsapp: DashboardStats['whatsapp'];
  messages: DashboardStats['messages'];
}

const QuickStats: React.FC<QuickStatsProps> = ({ whatsapp, messages }) => {
  const stats = [
    { label: 'Connected WhatsApp', value: whatsapp.connectedAccounts || 0, icon: Smartphone },
    { label: 'Total Contacts', value: whatsapp.totalContacts || 0, icon: Users },
    { label: 'Total Campaigns', value: whatsapp.totalCampaigns || 0, icon: MessageSquare },
    { label: "Today's Messages", value: messages.todaySent || 0, icon: Activity },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <stat.icon className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
            </div>
            {/* ✅ FIXED: Safe toLocaleString */}
            <p className="text-2xl font-bold text-gray-900">
              {(stat.value || 0).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await admin.getDashboard();
      console.log('📊 Dashboard Stats:', response.data);

      const data = response.data?.data || response.data;
      setStats(data);

      // Get admin user from localStorage
      const storedAdmin = localStorage.getItem('wabmeta_admin_user');
      if (storedAdmin) {
        try {
          setAdminUser(JSON.parse(storedAdmin));
        } catch {
          console.warn('Failed to parse admin user');
        }
      }

    } catch (err: any) {
      console.error('❌ Failed to fetch dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ✅ FIXED: Safe default values with proper fallbacks
  const dashboardStats: DashboardStats = stats || {
    users: {
      total: 0,
      active: 0,
      pending: 0,
      suspended: 0,
      newThisMonth: 0
    },
    organizations: {
      total: 0,
      byPlan: {},
      newThisMonth: 0
    },
    messages: {
      totalSent: 0,
      todaySent: 0,
      thisMonthSent: 0
    },
    revenue: {
      mrr: 0,
      arr: 0
    },
    whatsapp: {
      connectedAccounts: 0,
      totalContacts: 0,
      totalCampaigns: 0
    },
  };

  // ✅ FIXED: Ensure nested values exist
  const safeStats: DashboardStats = {
    users: {
      total: dashboardStats.users?.total ?? 0,
      active: dashboardStats.users?.active ?? 0,
      pending: dashboardStats.users?.pending ?? 0,
      suspended: dashboardStats.users?.suspended ?? 0,
      newThisMonth: dashboardStats.users?.newThisMonth ?? 0,
    },
    organizations: {
      total: dashboardStats.organizations?.total ?? 0,
      byPlan: dashboardStats.organizations?.byPlan ?? {},
      newThisMonth: dashboardStats.organizations?.newThisMonth ?? 0,
    },
    messages: {
      totalSent: dashboardStats.messages?.totalSent ?? 0,
      todaySent: dashboardStats.messages?.todaySent ?? 0,
      thisMonthSent: dashboardStats.messages?.thisMonthSent ?? 0,
    },
    revenue: {
      mrr: dashboardStats.revenue?.mrr ?? 0,
      arr: dashboardStats.revenue?.arr ?? 0,
    },
    whatsapp: {
      connectedAccounts: dashboardStats.whatsapp?.connectedAccounts ?? 0,
      totalContacts: dashboardStats.whatsapp?.totalContacts ?? 0,
      totalCampaigns: dashboardStats.whatsapp?.totalCampaigns ?? 0,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {adminUser?.name || 'Admin'}! 👋
          </h1>
          <p className="text-gray-500">Here's what's happening with your platform today.</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={safeStats.users.total}
          change={safeStats.users.newThisMonth > 0 ? 12 : undefined}
          changeLabel="new this month"
          icon={Users}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          link="/admin/users"
        />
        <StatCard
          title="Organizations"
          value={safeStats.organizations.total}
          change={safeStats.organizations.newThisMonth > 0 ? 8 : undefined}
          changeLabel="new this month"
          icon={Building2}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          link="/admin/organizations"
        />
        <StatCard
          title="Messages Sent"
          value={safeStats.messages.thisMonthSent}
          icon={MessageSquare}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${safeStats.revenue.mrr.toLocaleString()}`}
          icon={CreditCard}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Status Breakdown */}
        <UserStatusBreakdown stats={safeStats.users} />

        {/* Plan Distribution */}
        <PlanDistribution
          byPlan={safeStats.organizations.byPlan}
          total={safeStats.organizations.total}
        />

        {/* Quick Stats */}
        <QuickStats
          whatsapp={safeStats.whatsapp}
          messages={safeStats.messages}
        />
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Annual Recurring Revenue (ARR)</p>
            {/* ✅ FIXED: Safe toLocaleString */}
            <p className="text-4xl font-bold mt-2">
              ${(safeStats.revenue.arr || 0).toLocaleString()}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Based on ${(safeStats.revenue.mrr || 0).toLocaleString()} MRR
            </p>
          </div>
          <div className="hidden md:block">
            <BarChart3 className="w-20 h-20 text-gray-700" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Users className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-700">Manage Users</span>
          </Link>
          <Link
            to="/admin/organizations"
            className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Building2 className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-700">Organizations</span>
          </Link>
          <Link
            to="/admin/plans"
            className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <CreditCard className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-700">Manage Plans</span>
          </Link>
          <Link
            to="/admin/settings"
            className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Activity className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-gray-700">System Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;