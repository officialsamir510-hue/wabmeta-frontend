import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Send,
  MessageSquare,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
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

import { campaigns, contacts, inbox, billing } from "../services/api";

type StatsData = {
  contacts: number;
  messagesSent: number;
  deliveryRate: number;
  responseRate: number;
};

const CACHE_KEY = "wabmeta_dashboard_cache_v2";

const Dashboard: React.FC = () => {
  // ✅ startConnection removed (we’ll use modal + refreshConnection)
  const { connection, refreshConnection } = useMetaConnection();

  const [statsData, setStatsData] = useState<StatsData>({
    contacts: 0,
    messagesSent: 0,
    deliveryRate: 0,
    responseRate: 0,
  });

  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
  const [billingUsage, setBillingUsage] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showManualModal, setShowManualModal] = useState(false);

  const hasCacheRef = useRef(false);

  const calculateProgress = (total: number = 0, sent: number = 0) => {
    if (!total) return 0;
    return Math.round((sent / total) * 100);
  };

  // ✅ Load cached data immediately
  useEffect(() => {
    try {
      const cachedRaw = localStorage.getItem(CACHE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (cached?.statsData) setStatsData(cached.statsData);
        if (Array.isArray(cached?.activeCampaigns)) setActiveCampaigns(cached.activeCampaigns);
        if (cached?.billingUsage !== undefined) setBillingUsage(cached.billingUsage);

        hasCacheRef.current = true;
        setLoading(false);
      }
    } catch {
      // ignore cache errors
    }
  }, []);

  const fetchDashboardData = useCallback(async (opts?: { showFullLoader?: boolean }) => {
    const showFullLoader = opts?.showFullLoader ?? !hasCacheRef.current;

    if (showFullLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const results = await Promise.allSettled([
        contacts.stats(),
        campaigns.stats(),
        inbox.stats(),
        campaigns.getAll({ page: 1, limit: 5 }),
        billing.getUsage(),
      ]);

      const [contactsStatsRes, campaignsStatsRes, inboxStatsRes, campaignsListRes, billingUsageRes] =
        results;

      const contactsStats =
        contactsStatsRes.status === "fulfilled" ? contactsStatsRes.value.data?.data : null;

      const campStats =
        campaignsStatsRes.status === "fulfilled" ? campaignsStatsRes.value.data?.data : null;

      const inStats = inboxStatsRes.status === "fulfilled" ? inboxStatsRes.value.data?.data : null;

      const list =
        campaignsListRes.status === "fulfilled" ? campaignsListRes.value.data?.data : [];

      const usage =
        billingUsageRes.status === "fulfilled" ? billingUsageRes.value.data?.data : null;

      const totalSent = campStats?.totalMessagesSent || 0;
      const totalDelivered = campStats?.totalMessagesDelivered || 0;
      const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;

      const nextStatsData: StatsData = {
        contacts: contactsStats?.total || 0,
        messagesSent: totalSent,
        deliveryRate,
        responseRate: inStats?.responseRate || 0,
      };

      const active = (Array.isArray(list) ? list : [])
        .filter((c: any) =>
          c?.status
            ? ["RUNNING", "SCHEDULED", "COMPLETED"].includes(String(c.status).toUpperCase())
            : false
        )
        .slice(0, 5)
        .map((c: any) => ({
          id: c.id,
          name: c.name || "Untitled Campaign",
          status: String(c.status || "unknown").toLowerCase(),
          sent: c.sentCount || 0,
          delivered: c.deliveredCount || 0,
          opened: c.readCount || 0,
          progress: calculateProgress(c.totalContacts || 0, c.sentCount || 0),
        }));

      setStatsData(nextStatsData);
      setActiveCampaigns(active);
      setBillingUsage(usage);

      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          statsData: nextStatsData,
          activeCampaigns: active,
          billingUsage: usage,
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
  }, []);

  useEffect(() => {
    fetchDashboardData({ showFullLoader: !hasCacheRef.current });
  }, [fetchDashboardData]);

  // ✅ IMPORTANT: on page load, fetch connection status once
  useEffect(() => {
    try {
      refreshConnection();
    } catch {
      // ignore connection errors
    }
  }, [refreshConnection]);

  const handleSync = async () => {
    try {
      setRefreshing(true);
      await refreshConnection();
      await fetchDashboardData({ showFullLoader: false });
    } catch (error) {
      console.error("Failed to sync:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const lowCredits = useMemo(() => {
    const msg = billingUsage?.messages;
    if (!msg || !msg.limit || msg.limit <= 0) return { show: false, remaining: 0 };
    if (msg.unlimited) return { show: false, remaining: 0 };

    const used = Number(msg.used || 0);
    const limit = Number(msg.limit || 0);
    const remaining = Math.max(limit - used, 0);
    const show = remaining <= 20 || (used / limit) * 100 >= 80;
    return { show, remaining };
  }, [billingUsage]);

  const stats = useMemo(
    () => [
      {
        title: "Messages Sent",
        value: (statsData.messagesSent || 0).toLocaleString(),
        change: 0,
        icon: Send,
        iconColor: "text-blue-600",
        iconBg: "bg-blue-100",
      },
      {
        title: "Delivery Rate",
        value: `${statsData.deliveryRate || 0}%`,
        change: 0,
        icon: CheckCircle2,
        iconColor: "text-green-600",
        iconBg: "bg-green-100",
      },
      {
        title: "Active Contacts",
        value: (statsData.contacts || 0).toLocaleString(),
        change: 0,
        icon: Users,
        iconColor: "text-purple-600",
        iconBg: "bg-purple-100",
      },
      {
        title: "Response Rate",
        value: `${statsData.responseRate || 0}%`,
        change: 0,
        icon: MessageSquare,
        iconColor: "text-orange-600",
        iconBg: "bg-orange-100",
      },
    ],
    [statsData]
  );

  const messageData = [
    { name: "Mon", messages: 2400 },
    { name: "Tue", messages: 1398 },
    { name: "Wed", messages: 9800 },
    { name: "Thu", messages: 3908 },
    { name: "Fri", messages: 4800 },
    { name: "Sat", messages: 3800 },
    { name: "Sun", messages: 4300 },
  ];

  const deliveryData = [
    { name: "Mon", delivered: 95, failed: 5 },
    { name: "Tue", delivered: 98, failed: 2 },
    { name: "Wed", delivered: 97, failed: 3 },
    { name: "Thu", delivered: 99, failed: 1 },
    { name: "Fri", delivered: 96, failed: 4 },
    { name: "Sat", delivered: 98, failed: 2 },
    { name: "Sun", delivered: 97, failed: 3 },
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning!</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your business today.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSync}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            title="Refresh"
            disabled={refreshing}
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? "animate-spin" : ""}`} />
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
      {connection.isConnected ? (
        <ConnectionStatus connection={connection} />
      ) : (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Connect WhatsApp Business</h3>
                <p className="text-gray-600 max-w-lg mt-1 text-sm md:text-base">
                  Link your account to start sending automated campaigns and manage customer chats directly from WabMeta.
                </p>
              </div>
            </div>

            {/* ✅ Both buttons open same modal (single working flow) */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowManualModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                Connect with Meta
              </button>

              <button
                onClick={() => setShowManualModal(true)}
                className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all active:scale-95"
              >
                Manual Setup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Low credits banner */}
      {lowCredits.show && (
        <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-800">Low message credits</p>
              <p className="text-sm text-amber-600">
                You have {lowCredits.remaining} credits remaining. Recharge to continue sending messages.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard/billing"
            className="flex items-center space-x-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <Zap className="w-4 h-4" />
            <span>Recharge</span>
          </Link>
        </div>
      )}

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

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <QuickActions />
        <RecentActivity />
      </div>

      {/* ✅ Meta Connect Modal */}
      <MetaConnectModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        onConnect={async () => {
          // ✅ refresh status & dashboard without full reload
          await refreshConnection();
          await fetchDashboardData({ showFullLoader: false });
        }}
      />
    </div>
  );
};

export default Dashboard;