import React, { useEffect, useState } from 'react';
import { Cloud, Smartphone, Server, TrendingUp } from 'lucide-react';
import api from '../../services/api';

interface ConnectionStats {
  cloudApi: { active: number; inactive: number; total: number };
  businessApp: { active: number; inactive: number; total: number };
  onPremise: { active: number; inactive: number; total: number };
}

const WhatsAppConnectionStats: React.FC = () => {
  const [stats, setStats] = useState<ConnectionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/whatsapp-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch WhatsApp stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const totalConnections = stats
    ? stats.cloudApi.total + stats.businessApp.total + stats.onPremise.total
    : 0;

  const cloudApiPercentage = stats
    ? Math.round((stats.cloudApi.total / totalConnections) * 100)
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          WhatsApp Connections
        </h3>
        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
      </div>

      <div className="space-y-4">
        {/* Cloud API */}
        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
              <Cloud className="w-5 h-5 text-green-600 dark:text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Cloud API</p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {stats?.cloudApi.active} active
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {stats?.cloudApi.total || 0}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              {cloudApiPercentage}% of total
            </p>
          </div>
        </div>

        {/* Business App */}
        <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
              <Smartphone className="w-5 h-5 text-orange-600 dark:text-orange-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Business App</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                {stats?.businessApp.active} active
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {stats?.businessApp.total || 0}
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400">Legacy</p>
          </div>
        </div>

        {/* On-Premise (if any) */}
        {stats && stats.onPremise.total > 0 && (
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <Server className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">On-Premise</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {stats.onPremise.active} active
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {stats.onPremise.total}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Enterprise</p>
            </div>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Connections</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {totalConnections}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConnectionStats;
