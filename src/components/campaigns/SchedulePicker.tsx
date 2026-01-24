import React from 'react';
import { Send, Clock, Calendar, AlertCircle } from 'lucide-react';

interface SchedulePickerProps {
  scheduleType: 'now' | 'later';
  onTypeChange: (type: 'now' | 'later') => void;
  scheduledDate: string;
  scheduledTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

const SchedulePicker: React.FC<SchedulePickerProps> = ({
  scheduleType,
  onTypeChange,
  scheduledDate,
  scheduledTime,
  onDateChange,
  onTimeChange
}) => {
  const today = new Date().toISOString().split('T')[0];
  const minTime = scheduledDate === today 
    ? new Date().toTimeString().slice(0, 5) 
    : '00:00';

  return (
    <div className="space-y-6">
      {/* Schedule Type Selection */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onTypeChange('now')}
          className={`p-6 rounded-xl border-2 text-center transition-all ${
            scheduleType === 'now'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
            scheduleType === 'now' ? 'bg-primary-100' : 'bg-gray-100'
          }`}>
            <Send className={`w-7 h-7 ${
              scheduleType === 'now' ? 'text-primary-600' : 'text-gray-500'
            }`} />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Send Now</h4>
          <p className="text-sm text-gray-500">Start campaign immediately</p>
        </button>

        <button
          onClick={() => onTypeChange('later')}
          className={`p-6 rounded-xl border-2 text-center transition-all ${
            scheduleType === 'later'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
            scheduleType === 'later' ? 'bg-primary-100' : 'bg-gray-100'
          }`}>
            <Clock className={`w-7 h-7 ${
              scheduleType === 'later' ? 'text-primary-600' : 'text-gray-500'
            }`} />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Schedule</h4>
          <p className="text-sm text-gray-500">Send at a specific time</p>
        </button>
      </div>

      {/* Schedule Details */}
      {scheduleType === 'later' && (
        <div className="bg-gray-50 rounded-xl p-6 space-y-4 animate-fade-in">
          <h4 className="font-medium text-gray-900">Schedule Details</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={scheduledDate}
                  min={today}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="time"
                  value={scheduledTime}
                  min={scheduledDate === today ? minTime : undefined}
                  onChange={(e) => onTimeChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Timezone Info */}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Timezone: India Standard Time (IST)</span>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-900 mb-1">Best Practices</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Avoid sending messages between 9 PM - 9 AM</li>
              <li>• Best engagement is typically during 10 AM - 6 PM</li>
              <li>• Consider your audience's timezone</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePicker;