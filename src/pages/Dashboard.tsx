import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  MessageSquare,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  RefreshCw,
  Loader2
} from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import QuickActions from '../components/dashboard/QuickActions';
import RecentActivity from '../components/dashboard/RecentActivity';
import ChartCard from '../components/dashboard/ChartCard';
import ConnectionStatus from '../components/dashboard/ConnectionStatus';
import useMetaConnection from '../hooks/useMetaConnection';
import { dashboard, campaigns } from '../services/api';

const Dashboard: React.FC = () => {
  // Meta Connection Hook
  const { connection, startConnection, disconnect } = useMetaConnection();
  
  // State for stats and campaigns
  const [statsData, setStatsData] = useState({
    contacts: 0,
    messagesSent: 0,
    deliveryRate: 0,
    responseRate: 0
  });
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data on Load
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch stats and active campaigns in parallel
        const [statsRes, campaignsRes] = await Promise.all([
          dashboard.getStats(),
          campaigns.getAll() // Assuming this endpoint supports filtering or returns recent campaigns
        ]);

        setStatsData(statsRes.data);
        
        // Filter and map active campaigns (running or scheduled)
        const allCampaigns = campaignsRes.data?.campaigns || campaignsRes.data || [];
        const active = allCampaigns
          .filter((c: any) => ['running', 'scheduled', 'completed'].includes(c.status?.toLowerCase()))
          .slice(0, 5) // Show top 5
          .map((c: any) => ({
            id: c._id || c.id,
            name: c.name,
            status: c.status?.toLowerCase(),
            sent: c.stats?.sent || 0,
            delivered: c.stats?.delivered || 0,
            opened: c.stats?.read || 0,
            progress: calculateProgress(c.stats?.total, c.stats?.sent)
          }));
          
        setActiveCampaigns(active);

      } catch (error) {
        console.error("Dashboard Data Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper to calculate progress percentage
  const calculateProgress = (total: number, sent: number) => {
    if (!total || total === 0) return 0;
    return Math.round((sent / total) * 100);
  };

  // Dynamic Stats Data
  const stats = [
    {
      title: 'Messages Sent',
      value: statsData.messagesSent.toLocaleString(),
      change: 0, // Calculate if historical data available
      icon: Send,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Delivery Rate',
      value: `${statsData.deliveryRate}%`,
      change: 0,
      icon: CheckCircle2,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Active Contacts',
      value: statsData.contacts.toLocaleString(),
      change: 0,
      icon: Users,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100'
    },
    {
      title: 'Response Rate',
      value: `${statsData.responseRate}%`,
      change: 0,
      icon: MessageSquare,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100'
    },
  ];

  // Chart Data (Mock for now, replace with API data if available)
  const messageData = [
    { name: 'Mon', messages: 2400 },
    { name: 'Tue', messages: 1398 },
    { name: 'Wed', messages: 9800 },
    { name: 'Thu', messages: 3908 },
    { name: 'Fri', messages: 4800 },
    { name: 'Sat', messages: 3800 },
    { name: 'Sun', messages: 4300 },
  ];

  const deliveryData = [
    { name: 'Mon', delivered: 95, failed: 5 },
    { name: 'Tue', delivered: 98, failed: 2 },
    { name: 'Wed', delivered: 97, failed: 3 },
    { name: 'Thu', delivered: 99, failed: 1 },
    { name: 'Fri', delivered: 96, failed: 4 },
    { name: 'Sat', delivered: 98, failed: 2 },
    { name: 'Sun', delivered: 97, failed: 3 },
  ];

  // Handle Meta Connection
  const handleConnectMeta = async () => {
    try {
      await startConnection();
    } catch (error) {
      console.error('Failed to connect to Meta:', error);
    }
  };

  // Handle Sync
  const handleSync = async () => {
    // TODO: Implement sync logic or remove this handler if not needed
    console.warn('Sync functionality is not implemented.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning, John! 👋</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your business today.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/dashboard/campaigns/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>New Campaign</span>
          </Link>
        </div>
      </div>

      {/* Connection Status Section */}
      {connection.isConnected ? (
        <ConnectionStatus connection={connection} onDisconnect={disconnect} />
      ) : (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Connect Your WhatsApp Business</h3>
                <p className="text-gray-600">Link your account to start sending messages and grow your business</p>
              </div>
            </div>
            <button
              onClick={handleConnectMeta}
              disabled={connection.isConnecting}
              className="flex items-center space-x-2 px-6 py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {connection.isConnecting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Connect with Meta</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Alert Banner - Low Credits */}
      <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-amber-800">Low message credits</p>
            <p className="text-sm text-amber-600">You have 500 credits remaining. Recharge to continue sending messages.</p>
          </div>
        </div>
        <Link
          to="/dashboard/billing"
          className="flex items-center space-x-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          <Zap className="w-4 h-4" />
          <span>Recharge</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard
          title="Messages Overview"
          subtitle="Total messages sent this week"
          type="area"
          data={messageData}
          dataKey="messages"
        />
        <ChartCard
          title="Delivery Performance"
          subtitle="Message delivery rate"
          type="bar"
          data={deliveryData}
          dataKey="delivered"
          color="#10B981"
        />
      </div>

      {/* Active Campaigns */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Active Campaigns</h2>
          <Link 
            to="/dashboard/campaigns"
            className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            <span>View all</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-3 text-sm font-medium text-gray-500">Campaign Name</th>
                <th className="pb-3 text-sm font-medium text-gray-500">Status</th>
                <th className="pb-3 text-sm font-medium text-gray-500">Sent</th>
                <th className="pb-3 text-sm font-medium text-gray-500">Delivered</th>
                <th className="pb-3 text-sm font-medium text-gray-500">Opened</th>
                <th className="pb-3 text-sm font-medium text-gray-500">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4">
                    <p className="font-medium text-gray-900">{campaign.name}</p>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'running' ? 'bg-green-100 text-green-700' :
                      campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {campaign.status === 'running' && (
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                      )}
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 text-gray-600">{campaign.sent.toLocaleString()}</td>
                  <td className="py-4 text-gray-600">{campaign.delivered.toLocaleString()}</td>
                  <td className="py-4 text-gray-600">{campaign.opened.toLocaleString()}</td>
                  <td className="py-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 rounded-full transition-all"
                          style={{ width: `${campaign.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-10">{campaign.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {activeCampaigns.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No active campaigns found. Create one to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <QuickActions />
        <RecentActivity />
      </div>

      {/* API Status Footer */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${connection.isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
              <span className="text-sm text-gray-600">
                {connection.isConnected ? 'WhatsApp API Connected' : 'WhatsApp API Disconnected'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-sm text-gray-600">All systems operational</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Last sync: {connection.lastSync || 'Never'}</span>
            <button 
              onClick={handleSync}
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sync Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;