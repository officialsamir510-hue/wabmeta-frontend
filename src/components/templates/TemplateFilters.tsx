import React, { useState } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  FileText
} from 'lucide-react';
import type { TemplateCategory, TemplateStatus } from '../../types/template';

interface FilterState {
  categories: TemplateCategory[];
  statuses: TemplateStatus[];
  hasMedia: boolean | null;
}

interface TemplateFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const TemplateFilters: React.FC<TemplateFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const categories: { value: TemplateCategory; label: string; color: string }[] = [
    { value: 'marketing', label: 'Marketing', color: 'bg-purple-100 text-purple-700' },
    { value: 'utility', label: 'Utility', color: 'bg-blue-100 text-blue-700' },
    { value: 'authentication', label: 'Authentication', color: 'bg-orange-100 text-orange-700' },
  ];

  const statuses: { value: TemplateStatus; label: string; icon: React.ElementType; color: string }[] = [
    { value: 'approved', label: 'Approved', icon: CheckCircle2, color: 'text-green-600' },
    { value: 'pending', label: 'Pending', icon: Clock, color: 'text-yellow-600' },
    { value: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-red-600' },
    { value: 'draft', label: 'Draft', icon: FileText, color: 'text-gray-600' },
  ];

  const toggleCategory = (category: TemplateCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const toggleStatus = (status: TemplateStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    onFilterChange({ ...filters, statuses: newStatuses });
  };

  const clearFilters = () => {
    onFilterChange({ categories: [], statuses: [], hasMedia: null });
  };

  const activeFilterCount = filters.categories.length + filters.statuses.length + (filters.hasMedia !== null ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Filter Templates</h3>
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
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => toggleCategory(category.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      filters.categories.includes(category.value)
                        ? `${category.color} ring-2 ring-offset-1 ring-primary-500`
                        : `${category.color} opacity-60 hover:opacity-100`
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
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
          </div>
        </div>
      )}

      {/* Active Filters Pills */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          
          {filters.categories.map((category) => {
            const cat = categories.find(c => c.value === category);
            return (
              <span
                key={category}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
              >
                <span>{cat?.label}</span>
                <button onClick={() => toggleCategory(category)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
          
          {filters.statuses.map((status) => {
            const stat = statuses.find(s => s.value === status);
            return (
              <span
                key={status}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                <span>{stat?.label}</span>
                <button onClick={() => toggleStatus(status)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TemplateFilters;