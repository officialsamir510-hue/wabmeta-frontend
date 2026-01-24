import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

type ConversationMetricsProps = {
  data?: {
    businessInitiated?: number;
    userInitiated?: number;
    totalConversations?: number;
  };
};

const ConversationMetrics: React.FC<ConversationMetricsProps> = ({ data }) => {
  // Process data or use defaults
  const chartData = [
    { 
      name: 'Business Initiated', 
      value: data?.businessInitiated || 65, 
      color: '#3B82F6' // Blue
    },
    { 
      name: 'User Initiated', 
      value: data?.userInitiated || 35, 
      color: '#10B981' // Green
    },
  ];

  const total = (data?.totalConversations || chartData.reduce((acc, curr) => acc + curr.value, 0)).toLocaleString();

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Conversation Types</h3>
        <p className="text-sm text-gray-500">Breakdown by initiation source</p>
      </div>

      <div className="flex-1 min-h-75 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
          <p className="text-3xl font-bold text-gray-900">{total}</p>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total</p>
        </div>
      </div>

      <div className="mt-4 space-y-3 pt-4 border-t border-gray-100">
        {chartData.map((entry, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full shadow-sm" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm font-medium text-gray-700">{entry.name}</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {entry.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationMetrics;