import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { DailyStat } from '../../types/analytics'; 

// Define Props Interface
interface DeliveryChartProps {
  data?: { history?: DailyStat[] }; // Accept any data structure, will process internally
}

const DeliveryChart: React.FC<DeliveryChartProps> = ({ data }) => {
  // ✅ Process Data: Extract history array if present, otherwise use default mock data
  const chartData = (data && data.history && Array.isArray(data.history) && data.history.length > 0) 
    ? data.history 
    : [
        { date: 'Mon', sent: 0, read: 0 },
        { date: 'Tue', sent: 0, read: 0 },
        { date: 'Wed', sent: 0, read: 0 },
        { date: 'Thu', sent: 0, read: 0 },
        { date: 'Fri', sent: 0, read: 0 },
        { date: 'Sat', sent: 0, read: 0 },
        { date: 'Sun', sent: 0, read: 0 },
      ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Message Performance</h3>
          <p className="text-sm text-gray-500">Sent vs Delivered vs Read over time</p>
        </div>
      </div>

      <div className="h-80 w-full min-h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6B7280', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6B7280', fontSize: 12 }} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
            <Area 
              type="monotone" 
              dataKey="sent" 
              stroke="#3B82F6" 
              fillOpacity={1} 
              fill="url(#colorSent)" 
              strokeWidth={2}
              name="Sent"
              animationDuration={1500}
            />
            <Area 
              type="monotone" 
              dataKey="read" 
              stroke="#10B981" 
              fillOpacity={1} 
              fill="url(#colorRead)" 
              strokeWidth={2}
              name="Read"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DeliveryChart;