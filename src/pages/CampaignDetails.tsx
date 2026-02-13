import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Pause,
  Play,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Users,
  Send,
  RefreshCw,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { campaigns as campaignsApi } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

// Helper for safe numbers
const safeNumber = (val: any) => (isNaN(Number(val)) ? 0 : Number(val));
const formatPercent = (val: number, total: number) => {
  if (!total) return '0%';
  return `${Math.round((val / total) * 100)}%`;
};

const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaignDetails();
  }, [id]);

  const fetchCampaignDetails = async (isRefresh = false) => {
    if (!id) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await campaignsApi.getById(id);
      if (response.data.success) {
        setCampaign(response.data.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load campaign details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAction = async (action: 'pause' | 'resume' | 'cancel') => {
    if (!id) return;
    try {
      let response;
      if (action === 'pause') response = await campaignsApi.pause(id);
      if (action === 'resume') response = await campaignsApi.resume(id);
      if (action === 'cancel') response = await campaignsApi.cancel(id);

      if (response?.data.success) {
        toast.success(`Campaign ${action}d successfully`);
        fetchCampaignDetails(true);
      }
    } catch (err: any) {
      toast.error(`Failed to ${action} campaign`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Error Loading Campaign</h2>
        <p className="text-gray-600 dark:text-gray-400">{error || 'Campaign not found'}</p>
        <button
          onClick={() => navigate('/dashboard/campaigns')}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  const total = safeNumber(campaign.totalContacts);
  const sent = safeNumber(campaign.sentCount);
  const delivered = safeNumber(campaign.deliveredCount);
  const read = safeNumber(campaign.readCount);
  const failed = safeNumber(campaign.failedCount);

  // Pending = Total - (Sent + Failed) -- Approximation
  const pending = Math.max(0, total - sent - failed);

  // Colors for status badge
  const statusColors: Record<string, string> = {
    RUNNING: 'bg-blue-100 text-blue-700',
    PAUSED: 'bg-yellow-100 text-yellow-700',
    COMPLETED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
    DRAFT: 'bg-gray-100 text-gray-700',
    SCHEDULED: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/campaigns')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{campaign.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[campaign.status] || 'bg-gray-100 text-gray-700'}`}>
                {campaign.status}
              </span>
            </div>
            {campaign.description && (
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{campaign.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {campaign.status === 'RUNNING' && (
            <button
              onClick={() => handleAction('pause')}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg font-medium transition-colors"
            >
              <Pause className="w-4 h-4" /> Pause
            </button>
          )}
          {campaign.status === 'PAUSED' && (
            <button
              onClick={() => handleAction('resume')}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium transition-colors"
            >
              <Play className="w-4 h-4" /> Resume
            </button>
          )}

          <button
            onClick={() => fetchCampaignDetails(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-end mb-2">
          <h3 className="font-medium text-gray-900 dark:text-white">Campaign Progress</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {sent + failed} / {total} processed
          </span>
        </div>

        <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
          {/* Delivered */}
          <div style={{ width: `${(delivered / total) * 100}%` }} className="bg-green-500 h-full" />
          {/* Sent but not delivered yet (In Progress) */}
          <div style={{ width: `${((sent - delivered) / total) * 100}%` }} className="bg-blue-500 h-full" />
          {/* Failed */}
          <div style={{ width: `${(failed / total) * 100}%` }} className="bg-red-500 h-full" />
        </div>

        <div className="flex gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Delivered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-gray-600 dark:text-gray-400">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Failed</span>
          </div>
          <div className="ml-auto text-gray-500">
            {pending} pending
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Recipients */}
        <div className="bg-gray-900 text-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-gray-800 rounded-lg">
              <Users className="w-5 h-5 text-gray-300" />
            </div>
          </div>
          <div className="text-3xl font-bold">{total.toLocaleString()}</div>
          <div className="text-sm text-gray-400 mt-1">Total Recipients</div>
        </div>

        {/* Sent */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium text-gray-500">{formatPercent(sent, total)}</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{sent.toLocaleString()}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sent</div>
        </div>

        {/* Delivered */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs font-medium text-gray-500">{formatPercent(delivered, sent)}</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{delivered.toLocaleString()}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Delivered</div>
        </div>

        {/* Read */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs font-medium text-gray-500">{formatPercent(read, delivered)}</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{read.toLocaleString()}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Read</div>
        </div>

        {/* Failed */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs font-medium text-gray-500">{formatPercent(failed, total)}</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{failed.toLocaleString()}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Failed</div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Campaign Details</h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <span className="text-gray-500 dark:text-gray-400">Template</span>
              <span className="font-medium text-gray-900 dark:text-white">{campaign.templateName || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <span className="text-gray-500 dark:text-gray-400">Audience</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {campaign.contactGroupName || 'All Contacts'}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <span className="text-gray-500 dark:text-gray-400">WhatsApp Account</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {campaign.whatsappAccountPhone || 'Default'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Created At</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(campaign.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-full mb-3">
            <Clock className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {campaign.startedAt ? 'Started' : campaign.scheduledAt ? 'Scheduled' : 'Draft'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {campaign.startedAt
              ? formatDistanceToNow(new Date(campaign.startedAt), { addSuffix: true })
              : campaign.scheduledAt
                ? new Date(campaign.scheduledAt).toLocaleString()
                : 'Not started yet'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;