import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  LayoutGrid,
  List,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import TemplateCard from '../components/templates/TemplateCard';
import TemplateFilters from '../components/templates/TemplateFilters';
import TemplatePreview from '../components/templates/TemplatePreview';
import type { Template, TemplateCategory, TemplateStatus } from '../types/template';
import { templates as templateApi } from '../services/api';

const Templates: React.FC = () => {
  // State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [filters, setFilters] = useState<{
    categories: TemplateCategory[];
    statuses: TemplateStatus[];
    hasMedia: boolean | null;
  }>({
    categories: [],
    statuses: [],
    hasMedia: null
  });

  // Fetch Templates on Load
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await templateApi.getAll();
      const templatesData = response.data?.templates || response.data || [];
      
      // Map API data to Frontend Template type if necessary
      const mappedTemplates: Template[] = templatesData.map((t: any) => ({
        id: t._id || t.id,
        name: t.name,
        category: (t.category || 'UTILITY').toLowerCase() as TemplateCategory,
        language: t.language || 'en',
        status: (t.status || 'PENDING').toLowerCase() as TemplateStatus,
        header: mapHeader(t.components),
        body: mapBody(t.components),
        footer: mapFooter(t.components),
        buttons: mapButtons(t.components),
        variables: extractVariables(t.components),
        createdAt: t.createdAt || new Date().toISOString(),
        updatedAt: t.updatedAt || new Date().toISOString(),
        usageCount: t.usageCount || 0,
        rejectionReason: t.rejectionReason
      }));

      setTemplates(mappedTemplates);
    } catch (err: any) {
      console.error("Load Error:", err);
      setError(err.response?.data?.message || 'Failed to load templates');
      
      // Fallback to sample data in development if API fails
      if (import.meta.env.MODE === 'development') {
        setTemplates(getSampleTemplates());
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper Functions for Mapping
  const mapHeader = (components: any[]) => {
    const header = components?.find((c: any) => c.type === 'HEADER');
    if (!header) return { type: 'none' as const };
    return {
      type: (header.format?.toLowerCase() || 'text') as any,
      text: header.text,
      mediaUrl: header.example?.header_handle?.[0]
    };
  };

  const mapBody = (components: any[]) => {
    return components?.find((c: any) => c.type === 'BODY')?.text || '';
  };

  const mapFooter = (components: any[]) => {
    return components?.find((c: any) => c.type === 'FOOTER')?.text || '';
  };

  const mapButtons = (components: any[]) => {
    const buttonsComp = components?.find((c: any) => c.type === 'BUTTONS');
    if (!buttonsComp) return [];
    
    return buttonsComp.buttons.map((b: any, index: number) => ({
      id: String(index),
      type: b.type.toLowerCase(),
      text: b.text,
      url: b.url,
      phoneNumber: b.phone_number
    }));
  };

  const extractVariables = (components: any[]) => {
    const body = components?.find((c: any) => c.type === 'BODY')?.text || '';
    const matches = body.match(/\{\{(\d+)\}\}/g) || [];
    return [...new Set(matches.map((m: string) => m.replace(/[{}]/g, '')))];
  };

  // Sample Data for Fallback
  const getSampleTemplates = (): Template[] => [
    {
      id: '1',
      name: 'welcome_message',
      category: 'utility',
      language: 'en',
      status: 'approved',
      header: { type: 'text', text: 'Welcome to {{1}}!' },
      body: 'Hello {{2}}! 👋\n\nThank you for choosing us. We are excited to have you on board.',
      footer: 'Powered by WabMeta',
      buttons: [
        { id: '1', type: 'url', text: 'Visit Website', url: 'https://example.com' }
      ],
      variables: ['1', '2'],
      createdAt: '2024-01-15',
      updatedAt: '2 hours ago',
      usageCount: 1250
    }
  ];

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.body.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      filters.categories.length === 0 || 
      filters.categories.includes(template.category);
    
    const matchesStatus = 
      filters.statuses.length === 0 || 
      filters.statuses.includes(template.status);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Stats
  const stats = [
    { label: 'Total Templates', value: templates.length, icon: FileText, color: 'bg-blue-100 text-blue-600' },
    { label: 'Approved', value: templates.filter(t => t.status === 'approved').length, icon: CheckCircle2, color: 'bg-green-100 text-green-600' },
    { label: 'Pending', value: templates.filter(t => t.status === 'pending').length, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Rejected', value: templates.filter(t => t.status === 'rejected').length, icon: XCircle, color: 'bg-red-100 text-red-600' },
  ];

  // Handlers
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await templateApi.delete(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete template');
    }
  };

  const handleDuplicate = (_template: Template) => {
    // Navigate to create page with pre-filled data
    // You can implement this by passing state via navigation or using a duplication API
    alert('Duplicate feature coming soon!');
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      await templateApi.sync();
      await loadTemplates();
    } catch (err) {
      alert('Failed to sync templates from Meta');
    } finally {
      setLoading(false);
    }
  };

  // Loading State
  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Message Templates</h1>
          <p className="text-gray-500 mt-1">Create and manage your WhatsApp message templates</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSync}
            disabled={loading}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors disabled:opacity-50"
            title="Sync from Meta"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/dashboard/templates/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Template</span>
          </Link>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error Loading Templates</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button 
              onClick={loadTemplates}
              className="text-sm font-medium text-red-700 hover:text-red-800 mt-2 underline"
            >
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
          <TemplateFilters
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

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onPreview={setPreviewTemplate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {searchQuery || filters.categories.length > 0 || filters.statuses.length > 0
              ? 'Try adjusting your filters or search query'
              : 'Create your first message template to get started'
            }
          </p>
          <Link
            to="/dashboard/templates/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Template</span>
          </Link>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreview
          template={{
            name: previewTemplate.name,
            category: previewTemplate.category,
            language: previewTemplate.language,
            header: previewTemplate.header,
            body: previewTemplate.body,
            footer: previewTemplate.footer || '',
            buttons: previewTemplate.buttons
          }}
          sampleVariables={{}}
          isModal
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  );
};

export default Templates;