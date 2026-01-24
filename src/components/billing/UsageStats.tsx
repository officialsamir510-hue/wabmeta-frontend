import React from 'react';
import { MessageSquare, BarChart3, AlertCircle } from 'lucide-react';

const UsageStats: React.FC = () => {
  const usage = {
    conversations: { used: 8500, total: 10000 },
    marketing: { used: 12000, total: 15000 }
  };

  const convPercent = (usage.conversations.used / usage.conversations.total) * 100;
  const marketPercent = (usage.marketing.used / usage.marketing.total) * 100;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Current Usage</h3>

      <div className="space-y-6">
        {/* Service Conversations */}
        <div>
          <div className="flex justify-between mb-2">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Service Conversations</span>
            </div>
            <span className="text-sm text-gray-500">
              {usage.conversations.used.toLocaleString()} / {usage.conversations.total.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${convPercent > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${convPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Marketing Conversations */}
        <div>
          <div className="flex justify-between mb-2">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Marketing Conversations</span>
            </div>
            <span className="text-sm text-gray-500">
              {usage.marketing.used.toLocaleString()} / {usage.marketing.total.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${marketPercent > 90 ? 'bg-red-500' : 'bg-purple-500'}`}
              style={{ width: `${marketPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Alert */}
        {(convPercent > 80 || marketPercent > 80) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Usage Limit Warning</p>
              <p className="text-xs text-amber-700 mt-1">
                You are approaching your monthly limit. Upgrade your plan to avoid interruption.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsageStats;