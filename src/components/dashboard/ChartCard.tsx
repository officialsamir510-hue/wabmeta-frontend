import React, { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  type?: 'area' | 'bar' | 'line';
  data: any[];
  dataKey?: string;
  dataKeys?: string[];
  color?: string;
  colors?: string[];
  showPeriodSelector?: boolean;
  showLegend?: boolean;
  height?: number;
  // ✅ NEW: Controlled period props
  period?: '7' | '30' | '90';
  onPeriodChange?: (period: '7' | '30' | '90') => void;
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  if (dateStr.length <= 3) return dateStr;
  try {
    return format(parseISO(dateStr), 'MMM dd');
  } catch {
    return dateStr;
  }
};

const formatNumber = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3">
      <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center space-x-2 text-sm">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600 capitalize">{entry.name}:</span>
          <span className="font-medium text-gray-900">{formatNumber(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  type = 'area',
  data,
  dataKey = 'value',
  dataKeys,
  color = '#25D366',
  colors = ['#25D366', '#3B82F6', '#F59E0B', '#EF4444'],
  showPeriodSelector = true,
  showLegend = false,
  height = 288,
  period,
  onPeriodChange,
}) => {
  const [internalPeriod, setInternalPeriod] = useState<'30' | '7' | '90'>('7');
  const activePeriod = period ?? internalPeriod;

  const handlePeriodChange = (p: '7' | '30' | '90') => {
    if (onPeriodChange) onPeriodChange(p);
    else setInternalPeriod(p);
  };

  const formattedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((item) => ({
      ...item,
      name: item.name || (item.date ? formatDate(item.date) : ''),
      formattedDate: item.date ? formatDate(item.date) : item.name,
    }));
  }, [data]);

  const isEmpty = !formattedData || formattedData.length === 0;
  const keysToRender = dataKeys || [dataKey];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        
        {showPeriodSelector && (
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {[{ value: '7', label: '7D' }, { value: '30', label: '30D' }, { value: '90', label: '90D' }].map((p) => (
              <button
                key={p.value}
                onClick={() => handlePeriodChange(p.value as any)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activePeriod === p.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No data available</p>
        </div>
      ) : (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {type === 'area' ? (
              <AreaChart data={formattedData}>
                <defs>
                  {keysToRender.map((key, index) => (
                    <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors[index] || color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={colors[index] || color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={formatNumber} />
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend />}
                {keysToRender.map((key, index) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={colors[index] || color}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#gradient-${key})`}
                    name={key.charAt(0).toUpperCase() + key.slice(1)}
                  />
                ))}
              </AreaChart>
            ) : type === 'bar' ? (
              <BarChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={formatNumber} />
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend />}
                {keysToRender.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={colors[index] || color}
                    radius={[4, 4, 0, 0]}
                    name={key.charAt(0).toUpperCase() + key.slice(1)}
                  />
                ))}
              </BarChart>
            ) : (
              <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={formatNumber} />
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend />}
                {keysToRender.map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={colors[index] || color}
                    strokeWidth={2}
                    dot={{ fill: colors[index] || color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name={key.charAt(0).toUpperCase() + key.slice(1)}
                  />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ChartCard;