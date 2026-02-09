// src/pages/Dashboard.tsx

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Send,
  MessageSquare,
  Users,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Loader2,
  RefreshCw,
} from "lucide-react";

import StatsCard from "../components/dashboard/StatsCard";
import QuickActions from "../components/dashboard/QuickActions";
import RecentActivity from "../components/dashboard/RecentActivity";
import ChartCard from "../components/dashboard/ChartCard";
import ConnectionStatus from "../components/dashboard/ConnectionStatus";
import { MetaConnectModal } from "../components/dashboard/MetaConnectModal";
import useMetaConnection from "../hooks/useMetaConnection";
import { 
  campaigns, 
  contacts, 
  inbox, 
  billing, 
  dashboard, 
  meta, 
  whatsapp 
} from "../services/api";

// Types
type StatsData = {
  contacts: number;
  messagesSent: number;
  deliveryRate: number;
  responseRate: number;
};

type WidgetsResponse = {
  days: number;
  messagesOverview: Array<{ 
    date: string; 
    label: string; 
    sent: number; 
    received: number; 
    total: number 
  }>;
  deliveryByDay: Array<{ label: string; deliveryRate: number }>;
  recentActivity: any[];
};

type WhatsAppAccount = {
  id: string;
  phoneNumber: string;
  displayName: string;
  status: string;
  isDefault: boolean;
  wabaId?: string;
  phoneNumberId?: string;
};

const CACHE_KEY = "wabmeta_dashboard_cache_v3";

const Dashboard: React.FC = () => {
  // Meta connection hook
  const { connection, refreshConnection, disconnect } = useMetaConnection();

  // State
  const [statsData, setStatsData] = useState<StatsData>({
    contacts: 0,
    messagesSent: 0,
    deliveryRate: 0,
    responseRate: 0,
  });

  const [billingUsage, setBillingUsage] = useState<any>(null);
  const [widgets, setWidgets] = useState<WidgetsResponse | null>(null);
  const [chartPeriod, setChartPeriod] = useState<'7' | '30' | '90'>('7');
  
  // WhatsApp accounts
  const [whatsappAccounts, setWhatsappAccounts] = useState<WhatsAppAccount[]>([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  
  const hasCacheRef = useRef(false);

  // ============================================
  // FETCH WHATSAPP ACCOUNTS
  // ============================================
  const fetchWhatsAppAccounts = useCallback(async () => {
    try {
      const response = await whatsapp.accounts();
      
      if (response.data?.success) {
        const accounts = response.data.data || [];
        setWhatsappAccounts(accounts);
        console.log('📱 WhatsApp accounts:', accounts.length);
      }
    } catch (error) {
      console.error('❌ Failed to fetch WhatsApp accounts:', error);
    }
  }, []);

  // ============================================
  // CHECK META CONNECTION
  // ============================================
  const checkMetaConnection = useCallback(async () => {
    try {
      const response = await meta.getStatus();
      
      if (response.data?.success && response.data?.data) {
        const { isConnected, status } = response.data.data;
        
        console.log('🔗 Meta connection status:', { isConnected, status });
        
        if (isConnected) {
          await fetchWhatsAppAccounts();
        }
        
        return isConnected;
      }
    } catch (error) {
      console.error('❌ Failed to check Meta status:', error);
    }
    return false;
  }, [fetchWhatsAppAccounts]);

  // ============================================
  // INITIAL LOAD FROM CACHE
  // ============================================
  useEffect(() => {
    try {
      const cachedRaw = localStorage.getItem(CACHE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (cached?.statsData) setStatsData(cached.statsData);
        if (cached?.billingUsage !== undefined) setBillingUsage(cached.billingUsage);
        if (cached?.widgets) setWidgets(cached.widgets);
        if (cached?.chartPeriod) setChartPeriod(cached.chartPeriod);
        hasCacheRef.current = true;
        setLoading(false);
      }
    } catch (e) {
      console.error('Cache read error:', e);
    }
  }, []);

  // ============================================
  // FETCH DASHBOARD DATA
  // ============================================
  const fetchDashboardData = useCallback(async (opts?: { showFullLoader?: boolean }) => {
    const showFullLoader = opts?.showFullLoader ?? !hasCacheRef.current;
    if (showFullLoader) setLoading(true);
    else setRefreshing(true);

    try {
      // Widgets promise with type safety
      const widgetsPromise = "getWidgets" in dashboard
        ? (dashboard as { getWidgets: (days: number) => Promise<{ data: { data: WidgetsResponse | null } }> })
            .getWidgets(Number(chartPeriod))
        : Promise.resolve({ data: { data: null } });

      // Fetch all data in parallel
      const results = await Promise.allSettled([
        contacts.stats(),
        campaigns.stats(),
        inbox.stats(),
        billing.getUsage(),
        widgetsPromise,
      ]);

      const [contactsRes, campaignsRes, inboxRes, billingRes, widgetsRes] = results;

      // Process stats
      const cData = contactsRes.status === "fulfilled" ? contactsRes.value.data?.data : null;
      const campData = campaignsRes.status === "fulfilled" ? campaignsRes.value.data?.data : null;
      const inData = inboxRes.status === "fulfilled" ? inboxRes.value.data?.data : null;
      const billData = billingRes.status === "fulfilled" ? billingRes.value.data?.data : null;
      const wData = widgetsRes.status === "fulfilled" ? widgetsRes.value.data?.data : null;

      // Calculate delivery rate
      const totalSent = campData?.totalMessagesSent || 0;
      const totalDelivered = campData?.totalMessagesDelivered || 0;
      const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;

      const nextStats: StatsData = {
        contacts: cData?.total || 0,
        messagesSent: totalSent,
        deliveryRate,
        responseRate: inData?.responseRate || 0,
      };

      setStatsData(nextStats);
      setBillingUsage(billData);
      setWidgets(wData);

      // Save to cache
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          statsData: nextStats,
          billingUsage: billData,
          widgets: wData,
          chartPeriod,
          ts: Date.now(),
        })
      );

      hasCacheRef.current = true;
    } catch (error) {
      console.error("❌ Dashboard Data Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [chartPeriod]);

  // ============================================
  // LISTEN FOR META CONNECTION EVENTS
  // ============================================
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      const messageTypes = [
        'META_CONNECTED', 
        'META_OAUTH_SUCCESS', 
        'META_SUCCESS'
      ];
      
      if (messageTypes.includes(event.data?.type)) {
        console.log('✅ Meta connected via popup:', event.data.type);
        // Refresh everything
        checkMetaConnection();
        fetchWhatsAppAccounts();
        refreshConnection();
        fetchDashboardData({ showFullLoader: false });
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Initial load
    checkMetaConnection();
    fetchWhatsAppAccounts();
    
    return () => window.removeEventListener('message', handleMessage);
  }, [checkMetaConnection, fetchWhatsAppAccounts, refreshConnection, fetchDashboardData]);

  // ============================================
  // REFETCH WHEN PERIOD CHANGES
  // ============================================
  useEffect(() => {
    if (hasCacheRef.current) {
      fetchDashboardData({ showFullLoader: false });
    } else {
      fetchDashboardData();
    }
  }, [fetchDashboardData]);

  // ============================================
  // ACTIONS
  // ============================================
  const handleSync = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        refreshConnection(),
        fetchWhatsAppAccounts(),
      ]);
      await fetchDashboardData({ showFullLoader: false });
    } finally {
      setRefreshing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true);
      await disconnect();
      setWhatsappAccounts([]);
      await refreshConnection();
      await fetchDashboardData({ showFullLoader: false });
    } finally {
      setDisconnecting(false);
    }
  };

  const handleConnectSuccess = async () => {
    console.log('🎉 Connection successful, refreshing data...');
    await Promise.all([
      checkMetaConnection(),
      fetchWhatsAppAccounts(),
      refreshConnection(),
    ]);
    await fetchDashboardData({ showFullLoader: false });
  };

  // ============================================
  // MEMOIZED DATA
  // ============================================
  const messageChartData = useMemo(() => {
    const rows = widgets?.messagesOverview || [];
    return rows.map((r) => ({
      name: r.label,
      messages: r.sent,
    }));
  }, [widgets]);

  const deliveryChartData = useMemo(() => {
    const rows = widgets?.deliveryByDay || [];
    return rows.map((r) => ({
      name: r.label,
      delivered: r.deliveryRate || 0,
    }));
  }, [widgets]);

  const lowCredits = useMemo(() => {
    const msg = billingUsage?.messages;
    if (!msg || !msg.limit || msg.limit <= 0) return { show: false, remaining: 0 };
    if (msg.unlimited) return { show: false, remaining: 0 };
    const remaining = Math.max(Number(msg.limit) - Number(msg.used || 0), 0);
    return { show: remaining <= 20, remaining };
  }, [billingUsage]);

  // Check if connected (from hook or accounts)
  const isConnected = useMemo(() => {
    return connection.isConnected || whatsappAccounts.length > 0;
  }, [connection.isConnected, whatsappAccounts]);

  // Stats cards configuration
  const statsCards = [
    { 
      title: "Messages Sent", 
      value: (statsData.messagesSent || 0).toLocaleString(), 
      icon: Send, 
      iconColor: "text-blue-600", 
      iconBg: "bg-blue-100", 
      change: 0 
    },
    { 
      title: "Delivery Rate", 
      value: `${statsData.deliveryRate || 0}%`, 
      icon: CheckCircle2, 
      iconColor: "text-green-600", 
      iconBg: "bg-green-100", 
      change: 0 
    },
    { 
      title: "Active Contacts", 
      value: (statsData.contacts || 0).toLocaleString(), 
      icon: Users, 
      iconColor: "text-purple-600", 
      iconBg: "bg-purple-100", 
      change: 0 
    },
    { 
      title: "Response Rate", 
      value: `${statsData.responseRate || 0}%`, 
      icon: MessageSquare, 
      iconColor: "text-orange-600", 
      iconBg: "bg-orange-100", 
      change: 0 
    },
  ];

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading && !hasCacheRef.current) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Good morning!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleSync} 
            className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors" 
            disabled={refreshing}
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <Link 
            to="/dashboard/campaigns/new" 
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>New Campaign</span>
          </Link>
        </div>
      </div>

      {/* Connection Status */}
      {isConnected ? (
        <ConnectionStatus 
          connection={connection} 
          onDisconnect={handleDisconnect} 
          disconnectLoading={disconnecting} 
        />
      ) : (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Connect WhatsApp Business
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-lg mt-1 text-sm md:text-base">
                  Link your account to start sending campaigns and messages.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConnectModal(true)} 
                className="px-6 py-3 bg-[#1877F2] hover:bg-[#1565D8] text-white font-semibold rounded-xl shadow-lg transition-all hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Connect with Meta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Low Credits Warning */}
      {lowCredits.show && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <p className="text-amber-800 dark:text-amber-200 font-medium">
              Low message credits: {lowCredits.remaining} remaining
            </p>
          </div>
          <Link 
            to="/dashboard/billing" 
            className="text-amber-700 dark:text-amber-300 underline text-sm hover:no-underline"
          >
            Recharge
          </Link>
        </div>
      )}

      {/* Connected Accounts Summary */}
      {whatsappAccounts.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-green-800 dark:text-green-200 font-medium">
                {whatsappAccounts.length} WhatsApp account{whatsappAccounts.length > 1 ? 's' : ''} connected
              </span>
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              {whatsappAccounts.find(a => a.isDefault)?.phoneNumber || whatsappAccounts[0]?.phoneNumber}
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statsCards.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard
          title="Messages Overview"
          subtitle="Total messages sent"
          type="area"
          data={messageChartData}
          dataKey="messages"
          period={chartPeriod}
          onPeriodChange={setChartPeriod}
        />
        <ChartCard
          title="Delivery Performance"
          subtitle="Message delivery rate (%)"
          type="bar"
          data={deliveryChartData}
          dataKey="delivered"
          color="#10B981"
          period={chartPeriod}
          onPeriodChange={setChartPeriod}
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <QuickActions />
        <RecentActivity activities={widgets?.recentActivity || []} />
      </div>

      {/* Meta Connect Modal */}
      <MetaConnectModal 
        isOpen={showConnectModal} 
        onClose={() => setShowConnectModal(false)} 
        onConnect={handleConnectSuccess} 
      />
    </div>
  );
};

export default Dashboard;