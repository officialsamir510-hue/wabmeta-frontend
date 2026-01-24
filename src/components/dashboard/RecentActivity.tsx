import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Send, 
  MessageSquare, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface Activity {
  id: number;
  type: 'campaign' | 'message' | 'contact' | 'success' | 'warning';
  title: string;
  description: string;
  time: string;
}

const RecentActivity: React.FC = () => {
  const activities: Activity[] = [
    {
      id: 1,
      type: 'campaign',
      title: 'Campaign "Diwali Sale" sent',
      description: '2,500 messages delivered successfully',
      time: '5 minutes ago'
    },
    {
      id: 2,
      type: 'message',
      title: 'New message from Rahul Kumar',
      description: 'Hi, I would like to place an order...',
      time: '15 minutes ago'
    },
    {
      id: 3,
      type: 'contact',
      title: '150 new contacts imported',
      description: 'From marketing_leads.csv',
      time: '1 hour ago'
    },
    {
      id: 4,
      type: 'success',
      title: 'Template approved',
      description: 'Order Confirmation template is now active',
      time: '2 hours ago'
    },
    {
      id: 5,
      type: 'warning',
      title: 'Low message credits',
      description: 'Only 500 credits remaining. Recharge soon.',
      time: '3 hours ago'
    },
  ];

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'campaign': return Send;
      case 'message': return MessageSquare;
      case 'contact': return UserPlus;
      case 'success': return CheckCircle2;
      case 'warning': return AlertCircle;
      default: return Clock;
    }
  };

  const getIconStyle = (type: Activity['type']) => {
    switch (type) {
      case 'campaign': return 'bg-blue-100 text-blue-600';
      case 'message': return 'bg-green-100 text-green-600';
      case 'contact': return 'bg-purple-100 text-purple-600';
      case 'success': return 'bg-green-100 text-green-600';
      case 'warning': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <Link 
          to="/dashboard/activity"
          className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          <span>View all</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = getIcon(activity.type);
          
          return (
            <div 
              key={activity.id}
              className="flex items-start space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconStyle(activity.type)}`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-500 truncate">{activity.description}</p>
              </div>
              
              <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;