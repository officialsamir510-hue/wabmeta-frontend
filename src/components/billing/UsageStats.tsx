import React from 'react';
import { Users, MessageSquare, Megaphone, FileText, Bot, Users2 } from 'lucide-react';

interface Props {
  usageData: any;
}

const FREE_WARN_REMAINING = 20;
const FREE_WARN_PCT = 80;

const UsageStats: React.FC<Props> = ({ usageData }) => {
  if (!usageData) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h3>
        <p className="text-gray-500">No usage data available</p>
      </div>
    );
  }

  const stats = [
    { label: 'Contacts', icon: Users, ...usageData.contacts, color: 'blue' },
    { label: 'Messages', icon: MessageSquare, ...usageData.messages, color: 'green' }, // includes unlimited
    { label: 'Team Members', icon: Users2, ...usageData.teamMembers, color: 'purple' },
    { label: 'Campaigns', icon: Megaphone, ...usageData.campaigns, color: 'orange' },
    { label: 'Templates', icon: FileText, ...usageData.templates, color: 'pink' },
    { label: 'Chatbots', icon: Bot, ...usageData.chatbots, color: 'cyan' },
  ];

  const getColorClass = (color: string, percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    const colors: Record<string, string> = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      pink: 'bg-pink-500',
      cyan: 'bg-cyan-500',
    };
    return colors[color] || 'bg-gray-500';
  };

  const shouldWarnMessages = (used: number, limit: number, unlimited?: boolean) => {
    if (unlimited) return false;
    if (!limit || limit <= 0) return false;
    const remaining = Math.max(limit - used, 0);
    const pct = (used / limit) * 100;
    return remaining <= FREE_WARN_REMAINING || pct >= FREE_WARN_PCT;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Usage Statistics</h3>

      <div className="space-y-5">
        {stats.map((stat: any) => {
          const used = Number(stat.used || 0);
          const limit = Number(stat.limit || 0);
          const isMessages = stat.label === 'Messages';
          const warn = isMessages
            ? shouldWarnMessages(used, limit, stat.unlimited)
            : stat.percentage >= 90;

          const remaining = limit > 0 ? Math.max(limit - used, 0) : 0;

          return (
            <div key={stat.label}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <stat.icon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {used.toLocaleString()} / {limit.toLocaleString()}
                  {isMessages && stat.unlimited ? " (Unlimited*)" : ""}
                </span>
              </div>

              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${getColorClass(stat.color, stat.percentage)}`}
                  style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                />
              </div>

              {warn && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ {remaining} remaining — Approaching limit
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UsageStats;