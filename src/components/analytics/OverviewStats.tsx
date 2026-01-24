import React from 'react';
import { Send, CheckCircle2, MessageSquare, DollarSign } from 'lucide-react';

interface StatItem {
  title: string;
  value: string | number; // Accept number for raw data
  change: string;
  icon: React.ElementType;
  color: string;
}

interface OverviewStatsProps {
  stats?: StatItem[];
  data?: any;
}

const OverviewStats: React.FC<OverviewStatsProps> = ({ stats, data }) => {
  const metrics = stats || [
    {
      title: 'Total Sent',
      value: data?.messagesSent || 0,
      change: '+0%',
      icon: Send,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Delivery Rate',
      value: data?.deliveryRate || 0,
      change: '+0%',
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Response Rate',
      value: data?.responseRate || 0,
      change: '0%',
      icon: MessageSquare,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Estimated Cost',
      value: data?.cost || 0,
      change: '0%',
      icon: DollarSign,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  // Formatting Helper with Indian Locale
  const formatValue = (stat: StatItem) => {
    // If value is already a formatted string (e.g. "$45.20" or "98%"), return as is
    if (typeof stat.value === 'string') return stat.value;

    const val = Number(stat.value) || 0;

    if (stat.title.includes('Rate')) {
      return `${val}%`;
    }
    if (stat.title.includes('Cost') || stat.title.includes('Revenue')) {
      // ✅ Updated: Uses 'en-IN' locale for correct comma placement (e.g., ₹1,23,456.00)
      return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    }
    return val.toLocaleString('en-IN'); // Format regular numbers too (e.g., 1,234)
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              {stat.icon && <stat.icon className="w-6 h-6" />}
            </div>
            <span className={`text-sm font-medium ${
              stat.change.startsWith('+') 
                ? 'text-green-600' 
                : stat.change.startsWith('-') 
                  ? 'text-red-600' 
                  : 'text-gray-600'
            }`}>
              {stat.change}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatValue(stat)}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
        </div>
      ))}
    </div>
  );
};

export default OverviewStats;