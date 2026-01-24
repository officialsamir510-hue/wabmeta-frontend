import React from 'react';
import {
  Send,
  CheckCircle2,
  Eye,
  MessageSquare,
  XCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import type { CampaignStats as CampaignStatsType } from '../../types/campaign';

interface CampaignStatsProps {
  stats: CampaignStatsType;
  showProgress?: boolean;
}

const CampaignStats: React.FC<CampaignStatsProps> = ({ stats, showProgress = true }) => {
  const deliveryRate = stats.sent > 0 ? Math.round((stats.delivered / stats.sent) * 100) : 0;
  const readRate = stats.delivered > 0 ? Math.round((stats.read / stats.delivered) * 100) : 0;
  const replyRate = stats.delivered > 0 ? Math.round((stats.replied / stats.delivered) * 100) : 0;
  const failRate = stats.sent > 0 ? Math.round((stats.failed / stats.sent) * 100) : 0;

  const statCards = [
    {
      label: 'Total Recipients',
      value: stats.total,
      icon: Send,
      color: 'bg-gray-100 text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      label: 'Sent',
      value: stats.sent,
      icon: Send,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50',
      rate: `${Math.round((stats.sent / stats.total) * 100)}%`
    },
    {
      label: 'Delivered',
      value: stats.delivered,
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50',
      rate: `${deliveryRate}%`
    },
    {
      label: 'Read',
      value: stats.read,
      icon: Eye,
      color: 'bg-purple-100 text-purple-600',
      bgColor: 'bg-purple-50',
      rate: `${readRate}%`
    },
    {
      label: 'Replied',
      value: stats.replied,
      icon: MessageSquare,
      color: 'bg-indigo-100 text-indigo-600',
      bgColor: 'bg-indigo-50',
      rate: `${replyRate}%`
    },
    {
      label: 'Failed',
      value: stats.failed,
      icon: XCircle,
      color: 'bg-red-100 text-red-600',
      bgColor: 'bg-red-50',
      rate: `${failRate}%`
    },
  ];

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      {showProgress && stats.pending > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Campaign Progress</span>
            <span className="text-sm text-gray-500">
              {stats.sent} / {stats.total} sent
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full flex">
              <div 
                className="bg-green-500 transition-all duration-500"
                style={{ width: `${(stats.delivered / stats.total) * 100}%` }}
              ></div>
              <div 
                className="bg-blue-500 transition-all duration-500"
                style={{ width: `${((stats.sent - stats.delivered - stats.failed) / stats.total) * 100}%` }}
              ></div>
              <div 
                className="bg-red-500 transition-all duration-500"
                style={{ width: `${(stats.failed / stats.total) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>Delivered</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>In Progress</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>Failed</span>
            </div>
            <span>{stats.pending} pending</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className={`${stat.bgColor} rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              {stat.rate && (
                <span className="text-xs font-medium text-gray-500">{stat.rate}</span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Rates Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Delivery Rate</span>
            <div className={`flex items-center ${deliveryRate >= 95 ? 'text-green-600' : deliveryRate >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
              {deliveryRate >= 95 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span className="font-bold">{deliveryRate}%</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Read Rate</span>
            <div className={`flex items-center ${readRate >= 50 ? 'text-green-600' : readRate >= 30 ? 'text-yellow-600' : 'text-red-600'}`}>
              {readRate >= 50 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span className="font-bold">{readRate}%</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Reply Rate</span>
            <div className={`flex items-center ${replyRate >= 10 ? 'text-green-600' : replyRate >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
              {replyRate >= 10 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span className="font-bold">{replyRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignStats;