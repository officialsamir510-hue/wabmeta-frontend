import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface DateRangePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
  const ranges = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'This Month', value: 'month' },
    { label: 'Last Month', value: 'last_month' },
  ];

  return (
    <div className="relative">
      <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl px-4 py-2 hover:border-gray-300 transition-colors cursor-pointer">
        <Calendar className="w-4 h-4 text-gray-500" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-transparent border-none focus:outline-none text-sm font-medium text-gray-700 cursor-pointer pr-6"
        >
          {ranges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 pointer-events-none" />
      </div>
    </div>
  );
};

export default DateRangePicker;