// src/pages/Campaigns.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  BarChart3,
  Calendar,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Eye,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { campaigns as campaignsApi } from '../services/api'; // ✅ Correct import
import toast from 'react-hot-toast';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  totalContacts: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  template?: {
    name: string;
  };
}

interface CampaignStats {
  total: number;
  active: number;
  scheduled: number;
  completed: number;
  totalSent: number;
  totalDelivered: number;
}

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
    fetchStats();
  }, [statusFilter]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await campaignsApi.getAll({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined
      });

      if (response.data.success) {
        const campaignsData = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setCampaigns(campaignsData);
      } else {
        throw new Error(response.data.message || 'Failed to load campaigns');
      }
    } catch (error: any) {
      console.error('Fetch campaigns error:', error);
      setError(error.message || 'Failed to load campaigns');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await campaignsApi.stats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleAction = async (action: 'start' | 'pause' | 'resume' | 'cancel', campaignId: string) => {
    try {
      setActionLoading(campaignId);

      let response;
      switch (action) {
        case 'start':
          response = await campaignsApi.start(campaignId);
          break;
        case 'pause':
          response = await campaignsApi.pause(campaignId);
          break;
        case 'resume':
          response = await campaignsApi.resume(campaignId);
          break;
        case 'cancel':
          response = await campaignsApi.cancel(campaignId);
          break;
      }

      if (response?.data.success) {
        toast.success(`Campaign ${action}ed successfully`);
        fetchCampaigns();
        fetchStats();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} campaign`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      setActionLoading(campaignId);
      const response = await campaignsApi.delete(campaignId);

      if (response.data.success) {
        toast.success('Campaign deleted successfully');
        fetchCampaigns();
        fetchStats();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete campaign');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: Campaign['status']) => {
    const badges = {
      DRAFT: { color: 'bg-gray-100 text-gray-700', icon: Clock },
      SCHEDULED: { color: 'bg-blue-100 text-blue-700', icon: Calendar },
      RUNNING: { color: 'bg-green-100 text-green-700', icon: Play },
      PAUSED: { color: 'bg-yellow-100 text-yellow-700', icon: Pause },
      COMPLETED: { color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
      FAILED: { color: 'bg-red-100 text-red-700', icon: XCircle }
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const getProgress = (campaign: Campaign) => {
    if (campaign.totalContacts === 0) return 0;
    return Math.round((campaign.sentCount / campaign.totalContacts) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Failed to Load Campaigns
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={fetchCampaigns}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage your broadcast campaigns
          </p>
        </div>
        <Link
          to="/dashboard/campaigns/create"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
          New Campaign
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.active}
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Play className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Messages Sent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalSent.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Send className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Delivered</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalDelivered.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="RUNNING">Running</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {campaign.name}
                    </h3>
                    {getStatusBadge(campaign.status)}
                  </div>
                  {campaign.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {campaign.description}
                    </p>
                  )}
                  {campaign.template && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Template: {campaign.template.name}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/dashboard/campaigns/${campaign.id}`}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </Link>

                  {campaign.status === 'DRAFT' && (
                    <button
                      onClick={() => handleAction('start', campaign.id)}
                      disabled={actionLoading === campaign.id}
                      className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                    >
                      {actionLoading === campaign.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                      ) : (
                        <Play className="w-5 h-5 text-green-600" />
                      )}
                    </button>
                  )}

                  {campaign.status === 'RUNNING' && (
                    <button
                      onClick={() => handleAction('pause', campaign.id)}
                      disabled={actionLoading === campaign.id}
                      className="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg"
                    >
                      <Pause className="w-5 h-5 text-yellow-600" />
                    </button>
                  )}

                  {campaign.status === 'PAUSED' && (
                    <button
                      onClick={() => handleAction('resume', campaign.id)}
                      className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                    >
                      <Play className="w-5 h-5 text-green-600" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(campaign.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <XCircle className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Recipients</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {campaign.totalContacts.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Sent</p>
                  <p className="text-lg font-semibold text-green-600">
                    {campaign.sentCount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Delivered</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {campaign.deliveredCount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Read</p>
                  <p className="text-lg font-semibold text-purple-600">
                    {campaign.readCount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              {campaign.status === 'RUNNING' && (
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{getProgress(campaign)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${getProgress(campaign)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Meta */}
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Created {formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true })}
                </span>
                {campaign.scheduledAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Scheduled for {new Date(campaign.scheduledAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <Send className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No campaigns yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first campaign to start sending bulk messages
            </p>
            <Link
              to="/dashboard/campaigns/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-5 h-5" />
              Create Campaign
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Campaigns;