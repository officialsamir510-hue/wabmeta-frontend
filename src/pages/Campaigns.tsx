import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Send,
  Play,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  Loader2,
  AlertCircle,
  RefreshCw,
  Lock
} from 'lucide-react';
import CampaignCard from '../components/campaigns/CampaignCard';
import CampaignFilters from '../components/campaigns/CampaignFilters';
import type { Campaign, CampaignStatus } from '../types/campaign';
import { campaigns as campaignApi } from '../services/api';
import { usePlanAccess } from '../hooks/usePlanAccess';

const Campaigns: React.FC = () => {
  const { hasAccess } = usePlanAccess();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<{ statuses: CampaignStatus[]; dateRange: string }>({
    statuses: [],
    dateRange: 'all'
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await campaignApi.getAll({ page: 1, limit: 50 });

      // ✅ Correct array location
      const campaignsData = Array.isArray(response.data?.data) ? response.data.data : [];

      const mappedCampaigns: Campaign[] = campaignsData.map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        templateId: c.templateId,
        templateName: c.templateName || 'Unknown Template',

        audience: {
          type: c.contactGroupId ? 'group' : 'all',
          tags: [],
          totalContacts: c.totalContacts || 0
        },

        status: String(c.status || 'DRAFT').toLowerCase() as CampaignStatus,

        scheduledAt: c.scheduledAt ? new Date(c.scheduledAt).toLocaleString() : undefined,

        stats: {
          total: c.totalContacts || 0,
          sent: c.sentCount || 0,
          delivered: c.deliveredCount || 0,
          read: c.readCount || 0,
          replied: 0,
          failed: c.failedCount || 0,
          pending: c.pendingCount || 0
        },

        createdAt: c.createdAt || new Date().toISOString(),
        createdBy: '—',
        variableMapping: c.variableMapping || {}
      }));

      setCampaigns(mappedCampaigns);
    } catch (err: any) {
      console.error('Error fetching campaigns:', err);
      setError(err.response?.data?.message || 'Failed to load campaigns');

      if (import.meta.env.MODE === 'development') {
        setCampaigns(getDemoCampaigns());
      }
    } finally {
      setLoading(false);
    }
  };

  const getDemoCampaigns = (): Campaign[] => [
    {
      id: '1',
      name: 'Diwali Sale 2024',
      description: 'Festive season promotional campaign',
      templateId: '1',
      templateName: 'Diwali Sale Promotion',
      audience: { type: 'all', totalContacts: 2500, tags: [] },
      status: 'completed',
      stats: { total: 2500, sent: 2500, delivered: 2450, read: 1800, replied: 0, failed: 50, pending: 0 },
      createdAt: '2 days ago',
      createdBy: 'John Doe',
      variableMapping: { '1': 'first_name', '2': 'order_date' }
    }
  ];

  const stats = [
    { label: 'Total Campaigns', value: campaigns.length, icon: Send, color: 'bg-blue-100 text-blue-600' },
    { label: 'Running', value: campaigns.filter(c => c.status === 'running').length, icon: Play, color: 'bg-green-100 text-green-600' },
    { label: 'Scheduled', value: campaigns.filter(c => c.status === 'scheduled').length, icon: Clock, color: 'bg-purple-100 text-purple-600' },
    { label: 'Completed', value: campaigns.filter(c => c.status === 'completed').length, icon: CheckCircle2, color: 'bg-gray-100 text-gray-600' },
  ];

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.templateName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filters.statuses.length === 0 || filters.statuses.includes(campaign.status);
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await campaignApi.delete(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete campaign');
    }
  };

  const handleDuplicate = (_campaign: Campaign) => {
    alert('Duplicate functionality coming soon!');
  };

  const handlePause = async (id: string) => {
    try {
      await campaignApi.pause(id);
      setCampaigns(prev => prev.map(c => (c.id === id ? { ...c, status: 'paused' } : c)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to pause campaign');
    }
  };

  const handleResume = async (id: string) => {
    try {
      // ✅ resume endpoint exists in our backend
      if (campaignApi.resume) await campaignApi.resume(id);
      else await campaignApi.start(id);

      setCampaigns(prev => prev.map(c => (c.id === id ? { ...c, status: 'running' } : c)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to resume campaign');
    }
  };

  if (loading && campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-500 mt-1">Create and manage bulk messaging campaigns</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchCampaigns}
            disabled={loading}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {hasAccess('automation') ? (
            <Link
              to="/dashboard/campaigns/new"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Campaign</span>
            </Link>
          ) : (
            <button
              disabled
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gray-100 text-gray-400 font-medium rounded-xl cursor-not-allowed"
              title="Upgrade to create more campaigns"
            >
              <Plus className="w-5 h-5" />
              <span>Create Campaign</span>
              <Lock className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error Loading Campaigns</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button onClick={fetchCampaigns} className="text-sm font-medium text-red-700 hover:text-red-800 mt-2 underline">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        <div className="flex-1">
          <CampaignFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            onFilterChange={setFilters}
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-primary-100 text-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-primary-100 text-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length > 0 ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onPause={handlePause}
              onResume={handleResume}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || filters.statuses.length > 0 ? 'Try adjusting your filters' : 'Create your first campaign to get started'}
          </p>

          {hasAccess('automation') ? (
            <Link
              to="/dashboard/campaigns/new"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Campaign</span>
            </Link>
          ) : (
            <button disabled className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gray-100 text-gray-400 font-medium rounded-xl cursor-not-allowed">
              <Plus className="w-5 h-5" />
              <span>Create Campaign</span>
              <Lock className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Campaigns;