import React, { useState } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  X,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import type { CampaignStatus } from '../../types/campaign';

interface FilterState {
  statuses: CampaignStatus[];
  dateRange: string;
}

interface CampaignFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const CampaignFilters: React.FC<CampaignFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const statuses: { value: CampaignStatus; label: string; icon: React.ElementType; color: string }[] = [
    { value: 'running', label: 'Running', icon: Play, color: 'text-blue-600' },
    { value: 'scheduled', label: 'Scheduled', icon: Clock, color: 'text-purple-600' },
    { value: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-green-600' },
    { value: 'paused', label: 'Paused', icon: Pause, color: 'text-yellow-600' },
    { value: 'failed', label: 'Failed', icon: XCircle, color: 'text-red-600' },
    { value: 'draft', label: 'Draft', icon: Clock, color: 'text-gray-600' },
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ];

  const toggleStatus = (status: CampaignStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    onFilterChange({ ...filters, statuses: newStatuses });
  };

  const clearFilters = () => {
    onFilterChange({ statuses: [], dateRange: 'all' });
  };

  const activeFilterCount = filters.statuses.length + (filters.dateRange !== 'all' ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition-colors ${
            showFilters || activeFilterCount > 0
              ? 'bg-primary-50 border-primary-200 text-primary-700'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-primary-500 text-white text-xs font-semibold rounded-full">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Filter Campaigns</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="space-y-2">
                {statuses.map((status) => (
                  <label
                    key={status.value}
                    className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      filters.statuses.includes(status.value)
                        ? 'bg-primary-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.statuses.includes(status.value)}
                      onChange={() => toggleStatus(status.value)}
                      className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <status.icon className={`w-4 h-4 ${status.color}`} />
                    <span className="text-sm text-gray-700">{status.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => onFilterChange({ ...filters, dateRange: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignFilters;