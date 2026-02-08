// src/pages/Campaigns.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Send,
  Pause,
  Play,
  Trash2,
  MoreVertical,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  MessageSquare,
  TrendingUp,
  Calendar,
  AlertCircle,
  RefreshCw,
  BarChart2,
  Eye,
  Zap,
} from 'lucide-react';
import { campaigns } from '../services/api';
import { useWhatsAppConnection } from '../hooks/useWhatsAppConnection';
import { useSocket } from '../context/SocketContext';
import NoWhatsAppConnected from '../components/common/NoWhatsAppConnected';

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  totalContacts: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  pendingCount: number;
  templateId: string;
  template?: {
    name: string;
    category: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CampaignStats {
  total: number;
  draft: number;
  scheduled: number;
  running: number;
  completed: number;
  totalMessagesSent: number;
  averageDeliveryRate: number;
  averageReadRate: number;
}

const Campaigns: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, isLoading: connectionLoading, defaultAccount } = useWhatsAppConnection();
  
  // 🔌 Socket.IO integration
  const { isConnected: isSocketConnected, on, off } = useSocket();

  const [campaignList, setCampaignList] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch campaigns
  const fetchCampaigns = async () => {
    if (!isConnected) return;

    try {
      setLoading(true);
      setError(null);

      const [campaignsRes, statsRes] = await Promise.all([
        campaigns.getAll({
          search: searchQuery || undefined,
          status: statusFilter || undefined,
        }),
        campaigns.stats(),
      ]);

      setCampaignList(campaignsRes.data.data || []);
      setStats(statsRes.data.data || null);
    } catch (err: any) {
      console.error('Error fetching campaigns:', err);
      setError(err.response?.data?.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchCampaigns();
    }
  }, [isConnected, searchQuery, statusFilter]);

  // ========================================
  // 🔌 SOCKET EVENT HANDLERS
  // ========================================

  useEffect(() => {
    if (!isSocketConnected) return;

    console.log('🔌 Setting up campaign socket listeners');

    // Listen for campaign updates
    const handleCampaignUpdate = (data: { campaign: Campaign }) => {
      console.log('📥 Campaign update received:', data);
      
      setCampaignList(prev => 
        prev.map(c => 
          c.id === data.campaign.id ? { ...c, ...data.campaign } : c
        )
      );
    };

    // Listen for campaign status changes
    const handleCampaignStatusChange = (data: { 
      campaignId: string; 
      status: Campaign['status'];
      sentCount?: number;
      deliveredCount?: number;
      readCount?: number;
      failedCount?: number;
      pendingCount?: number;
    }) => {
      console.log('📥 Campaign status change:', data);
      
      setCampaignList(prev => 
        prev.map(c => 
          c.id === data.campaignId 
            ? { 
                ...c, 
                status: data.status,
                sentCount: data.sentCount ?? c.sentCount,
                deliveredCount: data.deliveredCount ?? c.deliveredCount,
                readCount: data.readCount ?? c.readCount,
                failedCount: data.failedCount ?? c.failedCount,
                pendingCount: data.pendingCount ?? c.pendingCount,
              } 
            : c
        )
      );
    };

    // Listen for campaign progress updates
    const handleCampaignProgress = (data: {
      campaignId: string;
      sentCount: number;
      deliveredCount: number;
      readCount: number;
      failedCount: number;
      pendingCount: number;
      progress: number;
    }) => {
      console.log('📥 Campaign progress update:', data);
      
      setCampaignList(prev => 
        prev.map(c => 
          c.id === data.campaignId 
            ? { 
                ...c,
                sentCount: data.sentCount,
                deliveredCount: data.deliveredCount,
                readCount: data.readCount,
                failedCount: data.failedCount,
                pendingCount: data.pendingCount,
              } 
            : c
        )
      );
    };

    // Subscribe to events
    on('campaign:updated', handleCampaignUpdate);
    on('campaign:statusChanged', handleCampaignStatusChange);
    on('campaign:progress', handleCampaignProgress);

    // Cleanup
    return () => {
      console.log('🔌 Cleaning up campaign socket listeners');
      off('campaign:updated', handleCampaignUpdate);
      off('campaign:statusChanged', handleCampaignStatusChange);
      off('campaign:progress', handleCampaignProgress);
    };
  }, [isSocketConnected, on, off]);

  // Handle campaign actions
  const handleStartCampaign = async (campaignId: string) => {
    try {
      setActionLoading(campaignId);
      await campaigns.start(campaignId);
      
      // Optimistic update
      setCampaignList(prev =>
        prev.map(c =>
          c.id === campaignId ? { ...c, status: 'RUNNING' as const } : c
        )
      );
    } catch (err: any) {
      console.error('Error starting campaign:', err);
      alert(err.response?.data?.message || 'Failed to start campaign');
      await fetchCampaigns(); // Revert on error
    } finally {
      setActionLoading(null);
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      setActionLoading(campaignId);
      await campaigns.pause(campaignId);
      
      // Optimistic update
      setCampaignList(prev =>
        prev.map(c =>
          c.id === campaignId ? { ...c, status: 'PAUSED' as const } : c
        )
      );
    } catch (err: any) {
      console.error('Error pausing campaign:', err);
      alert(err.response?.data?.message || 'Failed to pause campaign');
      await fetchCampaigns();
    } finally {
      setActionLoading(null);
    }
  };

  const handleResumeCampaign = async (campaignId: string) => {
    try {
      setActionLoading(campaignId);
      await campaigns.resume(campaignId);
      
      // Optimistic update
      setCampaignList(prev =>
        prev.map(c =>
          c.id === campaignId ? { ...c, status: 'RUNNING' as const } : c
        )
      );
    } catch (err: any) {
      console.error('Error resuming campaign:', err);
      alert(err.response?.data?.message || 'Failed to resume campaign');
      await fetchCampaigns();
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!selectedCampaign) return;

    try {
      await campaigns.delete(selectedCampaign.id);
      setCampaignList(prev => prev.filter(c => c.id !== selectedCampaign.id));
      setShowDeleteModal(false);
      setSelectedCampaign(null);
    } catch (err: any) {
      console.error('Error deleting campaign:', err);
      alert(err.response?.data?.message || 'Failed to delete campaign');
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { icon: any; class: string; label: string }> = {
      DRAFT: {
        icon: Clock,
        class: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        label: 'Draft',
      },
      SCHEDULED: {
        icon: Calendar,
        class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        label: 'Scheduled',
      },
      RUNNING: {
        icon: Play,
        class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        label: 'Running',
      },
      PAUSED: {
        icon: Pause,
        class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        label: 'Paused',
      },
      COMPLETED: {
        icon: CheckCircle,
        class: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        label: 'Completed',
      },
      FAILED: {
        icon: XCircle,
        class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        label: 'Failed',
      },
    };

    const badge = badges[status] || badges.DRAFT;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  // Calculate delivery rate
  const getDeliveryRate = (campaign: Campaign) => {
    if (campaign.sentCount === 0) return 0;
    return Math.round((campaign.deliveredCount / campaign.sentCount) * 100);
  };

  // Calculate read rate
  const getReadRate = (campaign: Campaign) => {
    if (campaign.deliveredCount === 0) return 0;
    return Math.round((campaign.readCount / campaign.deliveredCount) * 100);
  };

  // Calculate progress percentage
  const getProgress = (campaign: Campaign) => {
    if (campaign.totalContacts === 0) return 0;
    const completed = campaign.sentCount + campaign.failedCount;
    return Math.round((completed / campaign.totalContacts) * 100);
  };

  // Loading state for connection check
  if (connectionLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking WhatsApp connection...</p>
        </div>
      </div>
    );
  }

  // No WhatsApp connected
  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Create and manage your WhatsApp marketing campaigns
            </p>
          </div>
        </div>

        <NoWhatsAppConnected
          title="WhatsApp Account Required for Campaigns"
          description="You need to connect your WhatsApp Business account to create and run campaigns. Campaigns allow you to send bulk messages to your contacts using approved templates."
          variant="full-page"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-500 dark:text-gray-400">
              Manage your WhatsApp marketing campaigns
            </p>
            {defaultAccount && (
              <span className="inline-flex items-center text-sm text-green-600 dark:text-green-400">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></span>
                {defaultAccount.displayName || defaultAccount.phoneNumber}
              </span>
            )}
            {isSocketConnected && (
              <span className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400">
                <Zap className="w-4 h-4 mr-1" />
                Live
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCampaigns}
            disabled={loading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/dashboard/campaigns/new"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Campaign
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Send className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Messages Sent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalMessagesSent.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivery Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.averageDeliveryRate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Read Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.averageReadRate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <BarChart2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border rounded-lg transition-colors ${
              showFilters 
                ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600' 
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
            {statusFilter && (
              <span className="ml-2 w-5 h-5 bg-green-600 text-white text-xs rounded-full flex items-center justify-center">
                1
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="RUNNING">Running</option>
                  <option value="PAUSED">Paused</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>

              {statusFilter && (
                <button
                  onClick={() => setStatusFilter('')}
                  className="self-end px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Campaigns List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading campaigns...</p>
          </div>
        ) : campaignList.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No campaigns found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery || statusFilter
                ? 'Try adjusting your filters or search query'
                : 'Create your first campaign to start messaging your contacts'}
            </p>
            {!searchQuery && !statusFilter && (
              <Link
                to="/dashboard/campaigns/new"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Campaign
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Audience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {campaignList.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{campaign.name}</p>
                        {campaign.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {campaign.description}
                          </p>
                        )}
                        {campaign.template && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Template: {campaign.template.name}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(campaign.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm">
                        <Users className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {campaign.totalContacts.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Sent:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {campaign.sentCount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Delivered:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {campaign.deliveredCount.toLocaleString()} ({getDeliveryRate(campaign)}%)
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Read:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {campaign.readCount.toLocaleString()} ({getReadRate(campaign)}%)
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Progress</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {getProgress(campaign)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getProgress(campaign)}%` }}
                          />
                        </div>
                        {campaign.status === 'RUNNING' && campaign.pendingCount > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {campaign.pendingCount} pending
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Details */}
                        <button
                          onClick={() => navigate(`/dashboard/campaigns/${campaign.id}`)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Campaign Actions based on status */}
                        {campaign.status === 'DRAFT' && (
                          <button
                            onClick={() => handleStartCampaign(campaign.id)}
                            disabled={actionLoading === campaign.id}
                            className="p-2 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Start Campaign"
                          >
                            {actionLoading === campaign.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {campaign.status === 'RUNNING' && (
                          <button
                            onClick={() => handlePauseCampaign(campaign.id)}
                            disabled={actionLoading === campaign.id}
                            className="p-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Pause Campaign"
                          >
                            {actionLoading === campaign.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                            ) : (
                              <Pause className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {campaign.status === 'PAUSED' && (
                          <button
                            onClick={() => handleResumeCampaign(campaign.id)}
                            disabled={actionLoading === campaign.id}
                            className="p-2 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Resume Campaign"
                          >
                            {actionLoading === campaign.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {/* Delete (only for draft campaigns) */}
                        {campaign.status === 'DRAFT' && (
                          <button
                            onClick={() => {
                              setSelectedCampaign(campaign);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">
              Delete Campaign
            </h3>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{selectedCampaign.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCampaign(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCampaign}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;