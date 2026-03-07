// ✅ CREATE: src/pages/Automation.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap, Plus, Search, Play, Pause, Trash2,
  Clock, MessageSquare, Users, Webhook, Loader2
} from 'lucide-react';
import { automations as automationsApi } from '../services/api';
import type { Automation } from '../types/automation';
import toast from 'react-hot-toast';

const triggerIcons: Record<string, React.ReactNode> = {
  NEW_CONTACT: <Users className="w-4 h-4" />,
  KEYWORD: <MessageSquare className="w-4 h-4" />,
  SCHEDULE: <Clock className="w-4 h-4" />,
  WEBHOOK: <Webhook className="w-4 h-4" />,
  INACTIVITY: <Clock className="w-4 h-4" />,
};

const triggerLabels: Record<string, string> = {
  NEW_CONTACT: 'New Contact',
  KEYWORD: 'Keyword Match',
  SCHEDULE: 'Scheduled',
  WEBHOOK: 'Webhook',
  INACTIVITY: 'Inactivity',
};

const AutomationPage: React.FC = () => {
  const navigate = useNavigate();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = async () => {
    setLoading(true);
    try {
      const res = await automationsApi.getAll();
      if (res.data.success) {
        setAutomations(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load automations');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (automation: Automation) => {
    try {
      await automationsApi.toggle(automation.id);
      toast.success(automation.isActive ? 'Automation paused' : 'Automation activated');
      loadAutomations();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (automation: Automation) => {
    if (!confirm(`Delete "${automation.name}"?`)) return;
    try {
      await automationsApi.delete(automation.id);
      toast.success('Automation deleted');
      loadAutomations();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const filteredAutomations = automations.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Automations</h1>
          <p className="text-gray-600 dark:text-gray-400">Automate your workflows and save time</p>
        </div>
        <Link
          to="/dashboard/automations/new"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
          Create Automation
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Automations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {automations.filter((a) => a.isActive).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Play className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Executions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {automations.reduce((sum, a) => sum + a.executionCount, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Messages Sent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search automations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
        />
      </div>

      {/* Automations List */}
      <div className="space-y-3">
        {filteredAutomations.map((automation) => (
          <div
            key={automation.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${automation.isActive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                  <Zap className={`w-6 h-6 ${automation.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{automation.name}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${automation.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {automation.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      {triggerIcons[automation.trigger]}
                      {triggerLabels[automation.trigger]}
                    </span>
                    <span>•</span>
                    <span>{automation.actions.length} action(s)</span>
                    <span>•</span>
                    <span>Ran {automation.executionCount} times</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(automation)}
                  className={`p-2 rounded-lg transition-colors ${automation.isActive
                      ? 'text-yellow-600 hover:bg-yellow-50'
                      : 'text-green-600 hover:bg-green-50'
                    }`}
                >
                  {automation.isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => navigate(`/dashboard/automations/${automation.id}`)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(automation)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredAutomations.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Zap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No automations yet</h3>
            <p className="text-gray-500 mb-4">Create your first automation to save time</p>
            <Link
              to="/dashboard/automations/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              <Plus className="w-5 h-5" />
              Create Automation
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutomationPage;