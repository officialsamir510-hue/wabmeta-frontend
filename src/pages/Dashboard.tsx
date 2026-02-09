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
import { campaigns, contacts, inbox, billing, dashboard } from "../services/api";

type StatsData = {
  contacts: number;
  messagesSent: number;
  deliveryRate: number;
  responseRate: number;
};

type WidgetsResponse = {
  days: number;
  messagesOverview: Array<{ date: string; label: string; sent: number; received: number; total: number }>;
  deliveryByDay: Array<{ label: string; deliveryRate: number }>;
  recentActivity: any[];
};

const CACHE_KEY = "wabmeta_dashboard_cache_v3";

const Dashboard: React.FC = () => {
  const { connection, refreshConnection, disconnect } = useMetaConnection();

  const [statsData, setStatsData] = useState<StatsData>({
    contacts: 0,
    messagesSent: 0,
    deliveryRate: 0,
    responseRate: 0,
  });

  const [billingUsage, setBillingUsage] = useState<any>(null);
  const [widgets, setWidgets] = useState<WidgetsResponse | null>(null);
  const [chartPeriod, setChartPeriod] = useState<'7' | '30' | '90'>('7');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  
  const hasCacheRef = useRef(false);

  // Initial load from cache
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
    } catch {}
  }, []);

  const fetchDashboardData = useCallback(async (opts?: { showFullLoader?: boolean }) => {
    const showFullLoader = opts?.showFullLoader ?? !hasCacheRef.current;
    if (showFullLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const widgetsPromise =
        "getWidgets" in dashboard
          ? (dashboard as { getWidgets: (days: number) => Promise<{ data: { data: WidgetsResponse | null } }> }).getWidgets(Number(chartPeriod))
          : Promise.resolve({ data: { data: null } });

      // 1. Fetch main stats
      const results = await Promise.allSettled([
        contacts.stats(),
        campaigns.stats(),
        inbox.stats(),
        billing.getUsage(),
        // Fetch widgets based on selected period
        widgetsPromise,
      ]);

      const [contactsRes, campaignsRes, inboxRes, billingRes, widgetsRes] = results;

      // Process stats
      const cData = contactsRes.status === "fulfilled" ? contactsRes.value.data?.data : null;
      const campData = campaignsRes.status === "fulfilled" ? campaignsRes.value.data?.data : null;
      const inData = inboxRes.status === "fulfilled" ? inboxRes.value.data?.data : null;
      const billData = billingRes.status === "fulfilled" ? billingRes.value.data?.data : null;
      const wData = widgetsRes.status === "fulfilled" ? widgetsRes.value.data?.data : null;

      const totalSent = campData?.totalMessagesSent || 0;
      const totalDelivered = campData?.totalMessagesDelivered || 0;
      const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;

      const nextStats = {
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
      console.error("Dashboard Data Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [chartPeriod]);

  // Refetch when period changes
  useEffect(() => {
    if (hasCacheRef.current) {
      fetchDashboardData({ showFullLoader: false });
    } else {
      fetchDashboardData();
    }
  }, [fetchDashboardData]);

  // Actions
  const handleSync = async () => {
    try {
      setRefreshing(true);
      await refreshConnection();
      await fetchDashboardData({ showFullLoader: false });
    } finally {
      setRefreshing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true);
      await disconnect();
      await refreshConnection();
      await fetchDashboardData({ showFullLoader: false });
    } finally {
      setDisconnecting(false);
    }
  };

  // Mapped Data for Charts
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

  const statsCards = [
    { title: "Messages Sent", value: (statsData.messagesSent || 0).toLocaleString(), icon: Send, iconColor: "text-blue-600", iconBg: "bg-blue-100", change: 0 },
    { title: "Delivery Rate", value: `${statsData.deliveryRate || 0}%`, icon: CheckCircle2, iconColor: "text-green-600", iconBg: "bg-green-100", change: 0 },
    { title: "Active Contacts", value: (statsData.contacts || 0).toLocaleString(), icon: Users, iconColor: "text-purple-600", iconBg: "bg-purple-100", change: 0 },
    { title: "Response Rate", value: `${statsData.responseRate || 0}%`, icon: MessageSquare, iconColor: "text-orange-600", iconBg: "bg-orange-100", change: 0 },
  ];

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning!</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your business today.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={handleSync} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors" disabled={refreshing}>
            <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <Link to="/dashboard/campaigns/new" className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors">
            <Send className="w-4 h-4" />
            <span>New Campaign</span>
          </Link>
        </div>
      </div>bg-linear-to-r

      {connection.isConnected ? (
        <ConnectionStatus connection={connection} onDisconnect={handleDisconnect} disconnectLoading={disconnecting} />
      ) : (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Connect WhatsApp Business</h3>
                <p className="text-gray-600 max-w-lg mt-1 text-sm md:text-base">Link your account to start sending campaigns.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConnectModal(true)} className="px-6 py-3 bg-[#1877F2] text-white font-semibold rounded-xl shadow-lg transition-all hover:scale-105">
                Connect with Meta
              </button>
            </div>
          </div>
        </div>
      )}

      {lowCredits.show && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <p className="text-amber-800 font-medium">Low message credits: {lowCredits.remaining} remaining</p>
          </div>
          <Link to="/dashboard/billing" className="text-amber-700 underline text-sm">Recharge</Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statsCards.map((stat) => <StatsCard key={stat.title} {...stat} />)}
      </div>

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

      <div className="grid lg:grid-cols-2 gap-6">
        <QuickActions />
        <RecentActivity activities={widgets?.recentActivity || []} />
      </div>

      <MetaConnectModal isOpen={showConnectModal} onClose={() => setShowConnectModal(false)} onConnect={handleSync} />
    </div>
  );
};

export default Dashboard;