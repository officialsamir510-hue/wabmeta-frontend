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
import toast from "react-hot-toast";

import api from "../services/api";
import StatsCard from "../components/dashboard/StatsCard";
import QuickActions from "../components/dashboard/QuickActions";
import RecentActivity from "../components/dashboard/RecentActivity";
import ChartCard from "../components/dashboard/ChartCard";
import ConnectionStatus from "../components/dashboard/ConnectionStatus";
import MetaConnectModal from "../components/dashboard/MetaConnectModal";
import {
  campaigns,
  contacts,
  inbox,
  billing,
  dashboard,
} from "../services/api";

// ============================================
// TYPES
// ============================================

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
    total: number;
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
  qualityRating?: string;
};

// ============================================
// CONSTANTS
// ============================================

const CACHE_KEY = "wabmeta_dashboard_cache_v3";
const META_CONNECTION_CACHE_KEY = "wabmeta_meta_connection";
const WHATSAPP_ACCOUNTS_CACHE_KEY = "wabmeta_whatsapp_accounts";

// ============================================
// COMPONENT
// ============================================

const Dashboard: React.FC = () => {
  // ============================================
  // STATE
  // ============================================

  // Dashboard data
  const [statsData, setStatsData] = useState<StatsData>({
    contacts: 0,
    messagesSent: 0,
    deliveryRate: 0,
    responseRate: 0,
  });
  const [billingUsage, setBillingUsage] = useState<any>(null);
  const [widgets, setWidgets] = useState<WidgetsResponse | null>(null);
  const [chartPeriod, setChartPeriod] = useState<"7" | "30" | "90">("7");

  // WhatsApp accounts
  const [whatsappAccounts, setWhatsappAccounts] = useState<WhatsAppAccount[]>([]);

  // Connection status
  const [metaConnected, setMetaConnected] = useState<boolean>(false);
  const [organizationId, setOrganizationId] = useState<string>("");

  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Refs
  const hasCacheRef = useRef(false);
  const initialLoadDone = useRef(false);

  // ============================================
  // CACHE MANAGEMENT HELPERS
  // ============================================

  /**
   * Clear all dashboard-related caches
   */
  const clearAllCaches = useCallback(() => {
    console.log("🗑️ Clearing all dashboard caches...");

    // Clear dashboard cache
    localStorage.removeItem(CACHE_KEY);

    // Clear meta connection cache
    localStorage.removeItem(META_CONNECTION_CACHE_KEY);

    // Clear WhatsApp accounts cache
    localStorage.removeItem(WHATSAPP_ACCOUNTS_CACHE_KEY);

    // Clear any other related caches
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('wabmeta_meta_') ||
        key.startsWith('wabmeta_whatsapp_') ||
        key.includes('_connection_') ||
        key.includes('_account_')
      )) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`  Removed: ${key}`);
    });

    // Reset cache ref
    hasCacheRef.current = false;

    console.log("✅ All caches cleared");
  }, []);

  // ============================================
  // LOAD ORGANIZATION ID ON MOUNT
  // ============================================

  useEffect(() => {
    try {
      // Load from cache
      const cachedRaw = localStorage.getItem(CACHE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (cached?.statsData) setStatsData(cached.statsData);
        if (cached?.billingUsage !== undefined) setBillingUsage(cached.billingUsage);
        if (cached?.widgets) setWidgets(cached.widgets);
        if (cached?.chartPeriod) setChartPeriod(cached.chartPeriod);
        hasCacheRef.current = true;
        setLoading(false);
        console.log("📦 Loaded from cache");
      }

      // Load organization ID
      const storedOrg = localStorage.getItem("wabmeta_org");
      if (storedOrg) {
        const org = JSON.parse(storedOrg);
        if (org?.id) {
          setOrganizationId(org.id);
          console.log("🏢 Organization ID:", org.id);
        }
      }
    } catch (e) {
      console.error("❌ Cache/Org read error:", e);
    }
  }, []);

  // ============================================
  // META CONNECTION CHECK
  // ============================================

  const checkMetaConnection = useCallback(async (): Promise<boolean> => {
    if (!organizationId) {
      console.log("⚠️ No organization ID, skipping meta check");
      return false;
    }

    try {
      console.log("🔗 Checking Meta connection status...");

      // Use organization-specific status endpoint
      const response = await api.get(`/meta/organizations/${organizationId}/status`);

      if (response.data?.success && response.data?.data) {
        const { status, connectedCount } = response.data.data;
        const isConnected = status === "CONNECTED";

        console.log("✅ Meta connection status:", {
          isConnected,
          status,
          connectedCount
        });

        setMetaConnected(isConnected);

        if (!isConnected) {
          setWhatsappAccounts([]);
        }

        return isConnected;
      }

      setMetaConnected(false);
      return false;
    } catch (error: any) {
      console.error("❌ Meta status check failed:", error);

      // 404 means not connected yet
      if (error.response?.status === 404) {
        console.log("ℹ️ No Meta connection found (404)");
      }

      setMetaConnected(false);
      setWhatsappAccounts([]);
      return false;
    }
  }, [organizationId]);

  // ============================================
  // WHATSAPP ACCOUNTS
  // ============================================

  const fetchWhatsAppAccounts = useCallback(
    async (forceCheck = false) => {
      if (!organizationId) {
        console.log("⚠️ No organization ID, skipping accounts fetch");
        return;
      }

      try {
        let isConnected = metaConnected;

        // Check connection status if needed
        if (forceCheck || !initialLoadDone.current) {
          isConnected = await checkMetaConnection();
        }

        // Only fetch if connected
        if (!isConnected) {
          console.log("⏭️ Skipping WhatsApp accounts fetch - not connected");
          setWhatsappAccounts([]);
          return;
        }

        console.log("📱 Fetching WhatsApp accounts...");

        // Use Meta accounts endpoint
        const response = await api.get(
          `/meta/organizations/${organizationId}/accounts`
        );

        if (response.data?.success) {
          const accounts = response.data.data?.accounts || response.data.data || [];
          const accountsArray = Array.isArray(accounts) ? accounts : [];

          // Filter only connected accounts
          const connectedAccounts = accountsArray.filter(
            (acc: WhatsAppAccount) => acc.status === "CONNECTED"
          );

          setWhatsappAccounts(connectedAccounts);
          console.log("✅ WhatsApp accounts loaded:", connectedAccounts.length);
        }
      } catch (error: any) {
        console.error("❌ WhatsApp accounts fetch failed:", error);

        // Clear accounts on auth errors
        if (error.response?.status === 401 || error.response?.status === 404) {
          setWhatsappAccounts([]);
          setMetaConnected(false);
          console.log("⚠️ Cleared accounts due to error");
        }
      }
    },
    [organizationId, metaConnected, checkMetaConnection]
  );

  // ============================================
  // DASHBOARD DATA
  // ============================================

  const fetchDashboardData = useCallback(
    async (opts?: { showFullLoader?: boolean }) => {
      const showFullLoader = opts?.showFullLoader ?? !hasCacheRef.current;

      if (showFullLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        console.log("📊 Fetching dashboard data...");

        // Widgets promise with type safety
        const widgetsPromise =
          "getWidgets" in dashboard
            ? (
              dashboard as {
                getWidgets: (
                  days: number
                ) => Promise<{ data: { data: WidgetsResponse | null } }>;
              }
            ).getWidgets(Number(chartPeriod))
            : Promise.resolve({ data: { data: null } });

        // Fetch all data in parallel
        const results = await Promise.allSettled([
          contacts.stats(),
          campaigns.stats(),
          inbox.stats(),
          billing.getUsage(),
          widgetsPromise,
        ]);

        const [contactsRes, campaignsRes, inboxRes, billingRes, widgetsRes] =
          results;

        // Extract data
        const cData =
          contactsRes.status === "fulfilled"
            ? contactsRes.value.data?.data
            : null;
        const campData =
          campaignsRes.status === "fulfilled"
            ? campaignsRes.value.data?.data
            : null;
        const inData =
          inboxRes.status === "fulfilled" ? inboxRes.value.data?.data : null;
        const billData =
          billingRes.status === "fulfilled"
            ? billingRes.value.data?.data
            : null;
        const wData =
          widgetsRes.status === "fulfilled"
            ? widgetsRes.value.data?.data
            : null;

        // Calculate metrics
        const totalSent = campData?.totalMessagesSent || 0;
        const totalDelivered = campData?.totalMessagesDelivered || 0;
        const deliveryRate =
          totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;

        const nextStats: StatsData = {
          contacts: cData?.total || 0,
          messagesSent: totalSent,
          deliveryRate,
          responseRate: inData?.responseRate || 0,
        };

        // Update state
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
        console.log("✅ Dashboard data loaded");
      } catch (error) {
        console.error("❌ Dashboard data fetch error:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [chartPeriod]
  );

  // ============================================
  // CONNECTION HELPERS
  // ============================================



  // Connection object for UI components
  const connection = useMemo(
    () => ({
      isConnected: metaConnected,
      status: metaConnected ? "CONNECTED" : "DISCONNECTED",
      accounts: whatsappAccounts,
    }),
    [metaConnected, whatsappAccounts]
  );

  // ============================================
  // INITIAL LOAD
  // ============================================

  useEffect(() => {
    if (initialLoadDone.current) return;
    if (!organizationId) return; // Wait for org ID

    const initializeDashboard = async () => {
      console.log("🚀 Initializing dashboard...");

      // 1. Check Meta connection
      const isConnected = await checkMetaConnection();

      // 2. Fetch WhatsApp accounts if connected
      if (isConnected) {
        await fetchWhatsAppAccounts(false);
      }

      // 3. Fetch dashboard data
      await fetchDashboardData();

      initialLoadDone.current = true;
      console.log("✅ Dashboard initialized");
    };

    initializeDashboard();
  }, [
    organizationId,
    checkMetaConnection,
    fetchWhatsAppAccounts,
    fetchDashboardData,
  ]);

  // ============================================
  // LISTEN FOR META CONNECTION EVENTS
  // ============================================

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const messageTypes = [
        "META_CONNECTED",
        "META_OAUTH_SUCCESS",
        "META_SUCCESS",
      ];

      if (messageTypes.includes(event.data?.type)) {
        console.log("✅ Meta connected via popup:", event.data.type);

        // Refresh everything
        setMetaConnected(true);
        checkMetaConnection();
        fetchWhatsAppAccounts(true);
        fetchDashboardData({ showFullLoader: false });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [checkMetaConnection, fetchWhatsAppAccounts, fetchDashboardData]);

  // ============================================
  // REFETCH ON PERIOD CHANGE
  // ============================================

  useEffect(() => {
    if (!initialLoadDone.current) return;

    fetchDashboardData({ showFullLoader: false });
  }, [chartPeriod, fetchDashboardData]);

  // ============================================
  // ACTIONS
  // ============================================

  const handleSync = async () => {
    try {
      setRefreshing(true);
      console.log("🔄 Manual refresh triggered");

      // Check connection
      const isConnected = await checkMetaConnection();

      if (isConnected) {
        await fetchWhatsAppAccounts(true);
      }

      await fetchDashboardData({ showFullLoader: false });

      console.log("✅ Refresh complete");
      toast.success("Dashboard refreshed");
    } catch (error) {
      console.error("❌ Refresh failed:", error);
      toast.error("Failed to refresh dashboard");
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Disconnect WhatsApp account - FIXED VERSION
   */
  const handleDisconnect = async () => {
    // Confirm before disconnecting
    if (!window.confirm("Are you sure you want to disconnect your WhatsApp account? This action cannot be undone.")) {
      return;
    }

    // Validate prerequisites
    if (!organizationId) {
      toast.error("Organization not found");
      return;
    }

    if (whatsappAccounts.length === 0) {
      toast.error("No accounts to disconnect");
      return;
    }

    try {
      setDisconnecting(true);
      console.log("🔌 Starting disconnect process...");

      // Get account to disconnect (default or first available)
      const accountToDisconnect = whatsappAccounts.find((a) => a.isDefault) || whatsappAccounts[0];

      if (!accountToDisconnect?.id) {
        throw new Error("No valid account found to disconnect");
      }

      console.log(`📱 Disconnecting account: ${accountToDisconnect.id} (${accountToDisconnect.phoneNumber})`);

      // 1. Call disconnect API
      const response = await api.delete(
        `/meta/organizations/${organizationId}/accounts/${accountToDisconnect.id}`
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Disconnect API failed");
      }

      console.log("✅ API disconnect successful");

      // 2. Clear all local state immediately
      setMetaConnected(false);
      setWhatsappAccounts([]);

      // 3. Clear all caches
      clearAllCaches();

      // 4. Reset stats to show disconnected state
      setStatsData({
        contacts: 0,
        messagesSent: 0,
        deliveryRate: 0,
        responseRate: 0,
      });

      // 5. Verify disconnect with fresh API check
      console.log("🔍 Verifying disconnect status...");
      const isStillConnected = await checkMetaConnection();

      if (isStillConnected) {
        console.warn("⚠️ Server still shows connected, forcing UI update");
        setMetaConnected(false);
        setWhatsappAccounts([]);
      }

      // 6. Refresh dashboard data
      await fetchDashboardData({ showFullLoader: false });

      console.log("✅ Disconnect completed successfully");
      toast.success("WhatsApp account disconnected successfully");

    } catch (error: any) {
      console.error("❌ Disconnect failed:", error);

      // Extract error message
      const errorMessage = error.response?.data?.message
        || error.message
        || "Failed to disconnect account";

      toast.error(errorMessage);

      // Still try to refresh state even on error
      try {
        await checkMetaConnection();
        await fetchWhatsAppAccounts(true);
      } catch (refreshError) {
        console.error("❌ State refresh after error failed:", refreshError);
      }
    } finally {
      setDisconnecting(false);
    }
  };



  const handleConnectSuccess = async () => {
    console.log("🎉 Connection successful, refreshing...");

    setShowConnectModal(false);
    setMetaConnected(true);

    // Clear old cache before fetching new data
    clearAllCaches();

    await Promise.all([
      checkMetaConnection(),
      fetchWhatsAppAccounts(true),
    ]);

    await fetchDashboardData({ showFullLoader: false });

    toast.success("WhatsApp account connected successfully!");
  };

  // ============================================
  // COMPUTED VALUES
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

  const isConnected = metaConnected;

  // Stats cards configuration
  const statsCards = [
    {
      title: "Messages Sent",
      value: (statsData.messagesSent || 0).toLocaleString(),
      icon: Send,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      change: 0,
    },
    {
      title: "Delivery Rate",
      value: `${statsData.deliveryRate || 0}%`,
      icon: CheckCircle2,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
      change: 0,
    },
    {
      title: "Active Contacts",
      value: (statsData.contacts || 0).toLocaleString(),
      icon: Users,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      change: 0,
    },
    {
      title: "Response Rate",
      value: `${statsData.responseRate || 0}%`,
      icon: MessageSquare,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100",
      change: 0,
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
          <p className="text-gray-500 dark:text-gray-400">
            Loading dashboard...
          </p>
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
            className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={refreshing}
            title="Refresh data"
          >
            <RefreshCw
              className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${refreshing ? "animate-spin" : ""
                }`}
            />
          </button>

          <Link
            to="/dashboard/campaigns/create"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>New Campaign</span>
          </Link>
        </div>
      </div>

      {/* Connection Status or Connect Banner */}
      {isConnected ? (
        <ConnectionStatus
          connection={connection}
          onDisconnect={handleDisconnect}
          disconnectLoading={disconnecting}
        />
      ) : (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-sm">
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

            <button
              onClick={() => setShowConnectModal(true)}
              className="px-6 py-3 bg-[#1877F2] hover:bg-[#1565D8] text-white font-semibold rounded-xl shadow-lg transition-all hover:scale-105 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Connect with Meta
            </button>
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
            to="/dashboard/settings/billing"
            className="text-amber-700 dark:text-amber-300 underline text-sm hover:no-underline"
          >
            Recharge
          </Link>
        </div>
      )}

      {/* Connected Accounts Summary */}
      {isConnected && whatsappAccounts.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-green-800 dark:text-green-200 font-medium">
                {whatsappAccounts.length} WhatsApp account
                {whatsappAccounts.length > 1 ? "s" : ""} connected
              </span>
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              {whatsappAccounts.find((a) => a.isDefault)?.phoneNumber ||
                whatsappAccounts[0]?.phoneNumber}
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
        organizationId={organizationId}
        onConnected={handleConnectSuccess}
      />
    </div>
  );
};

export default Dashboard;