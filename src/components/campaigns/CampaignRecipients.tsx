// src/components/campaigns/CampaignRecipients.tsx

import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Loader2,
} from 'lucide-react';
import { campaigns as campaignsApi } from '../../services/api';
import toast from 'react-hot-toast';

interface Recipient {
  id: string;
  contactId: string;
  phone: string;
  fullName: string;
  email?: string;
  status: string;
  waMessageId?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failedAt?: string;
  failureReason?: string;
  retryCount: number;
}

interface Props {
  campaignId: string;
  onRetryFailed?: () => void;
}

const CampaignRecipients: React.FC<Props> = ({ campaignId, onRetryFailed }) => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 0 });
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    queued: 0,
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
  });

  useEffect(() => {
    fetchRecipients();
  }, [campaignId, statusFilter, page]);

  const fetchRecipients = async () => {
    setLoading(true);
    try {
      const res = await campaignsApi.getRecipients(campaignId, {
        page,
        limit: 50,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search || undefined,
      });

      if (res.data.success) {
        const payload = res.data.data as any;
        setRecipients(Array.isArray(payload) ? payload : payload?.recipients ?? []);
        setMeta({
          total: res.data.meta?.total ?? payload?.meta?.total ?? 0,
          totalPages: res.data.meta?.totalPages ?? payload?.meta?.totalPages ?? 0,
        });
        if (payload?.summary) {
          setSummary(payload.summary);
        }
      }
    } catch (err) {
      toast.error('Failed to load recipients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchRecipients();
  };

  const handleRetryFailed = async () => {
    if (!confirm('Retry all failed messages?')) return;

    setRetrying(true);
    try {
      const res = await campaignsApi.retryFailed(campaignId);
      if (res.data.success) {
        toast.success(res.data.data.message);
        fetchRecipients();
        onRetryFailed?.();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to retry');
    } finally {
      setRetrying(false);
    }
  };

  const handleExport = async (type: 'all' | 'failed') => {
    setExporting(true);
    try {
      const res =
        type === 'failed'
          ? await campaignsApi.exportFailedContacts(campaignId)
          : await campaignsApi.exportRecipients(campaignId, statusFilter === 'all' ? undefined : statusFilter);

      // Download file
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `campaign-${type}-${campaignId}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success('Export downloaded!');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SENT':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'READ':
        return <Eye className="w-4 h-4 text-purple-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'PENDING':
      case 'QUEUED':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      SENT: 'bg-blue-100 text-blue-700',
      DELIVERED: 'bg-green-100 text-green-700',
      READ: 'bg-purple-100 text-purple-700',
      FAILED: 'bg-red-100 text-red-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      QUEUED: 'bg-orange-100 text-orange-700',
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          colors[status.toUpperCase()] || 'bg-gray-100 text-gray-700'
        }`}
      >
        {getStatusIcon(status)}
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Campaign Recipients
          </h3>

          <div className="flex items-center gap-2">
            {summary.failed > 0 && (
              <button
                onClick={handleRetryFailed}
                disabled={retrying}
                className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg text-sm font-medium transition-colors"
              >
                {retrying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Retry Failed ({summary.failed})
              </button>
            )}

            <button
              onClick={() => handleExport('all')}
              disabled={exporting}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{summary.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-blue-600">{summary.sent}</div>
            <div className="text-xs text-gray-500">Sent</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-green-600">{summary.delivered}</div>
            <div className="text-xs text-gray-500">Delivered</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-purple-600">{summary.read}</div>
            <div className="text-xs text-gray-500">Read</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-red-600">{summary.failed}</div>
            <div className="text-xs text-gray-500">Failed</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-yellow-600">
              {summary.pending + summary.queued}
            </div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search phone or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="SENT">Sent</option>
            <option value="DELIVERED">Delivered</option>
            <option value="READ">Read</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : recipients.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No recipients found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sent At
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recipients.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">
                    {r.phone}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {r.fullName}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(r.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {r.sentAt ? new Date(r.sentAt).toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {r.status === 'FAILED' && r.failureReason && (
                      <span className="text-red-600 text-xs" title={r.failureReason}>
                        {r.failureReason.substring(0, 50)}
                        {r.failureReason.length > 50 ? '…' : ''}
                      </span>
                    )}
                    {r.status === 'DELIVERED' && r.deliveredAt && (
                      <span className="text-green-600 text-xs">
                        ✓ {new Date(r.deliveredAt).toLocaleTimeString()}
                      </span>
                    )}
                    {r.status === 'READ' && r.readAt && (
                      <span className="text-purple-600 text-xs">
                        ✓✓ {new Date(r.readAt).toLocaleTimeString()}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Showing {(page - 1) * 50 + 1} – {Math.min(page * 50, meta.total)} of {meta.total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50 text-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50 text-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignRecipients;
