// src/components/dashboard/RecentActivity.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Send, 
  MessageSquare, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ArrowRight,
  Megaphone,
  FileText,
  Bot,
  Settings,
  CreditCard
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// ============================================
// TYPES
// ============================================

interface Activity {
  id: string | number;
  type: 'campaign' | 'message' | 'contact' | 'success' | 'warning' | 'template' | 'chatbot' | 'billing' | 'system' | string;
  action?: string;
  title?: string;
  description: string;
  time?: string;
  timestamp?: string;
  metadata?: any;
}

interface RecentActivityProps {
  activities?: Activity[];
}

// ============================================
// STATIC FALLBACK DATA
// ============================================

const staticActivities: Activity[] = [
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

// ============================================
// HELPER FUNCTIONS
// ============================================

const getIcon = (type: string, action?: string) => {
  // Handle action-based icons first
  if (action) {
    switch (action) {
      case 'message_sent':
        return Send;
      case 'message_received':
        return MessageSquare;
      case 'campaign_started':
      case 'campaign_completed':
        return Megaphone;
      case 'contact_created':
      case 'contact_imported':
        return UserPlus;
      case 'template_approved':
        return CheckCircle2;
      case 'template_rejected':
        return AlertCircle;
    }
  }

  // Handle type-based icons
  switch (type) {
    case 'campaign':
      return Megaphone;
    case 'message':
      return MessageSquare;
    case 'contact':
      return UserPlus;
    case 'success':
    case 'template':
      return CheckCircle2;
    case 'warning':
      return AlertCircle;
    case 'chatbot':
      return Bot;
    case 'billing':
      return CreditCard;
    case 'system':
      return Settings;
    default:
      return Clock;
  }
};

const getIconStyle = (type: string, action?: string) => {
  // Handle action-based styles
  if (action) {
    switch (action) {
      case 'message_sent':
        return 'bg-green-100 text-green-600';
      case 'message_received':
        return 'bg-blue-100 text-blue-600';
      case 'template_approved':
        return 'bg-green-100 text-green-600';
      case 'template_rejected':
        return 'bg-red-100 text-red-600';
    }
  }

  // Handle type-based styles
  switch (type) {
    case 'campaign':
      return 'bg-orange-100 text-orange-600';
    case 'message':
      return 'bg-blue-100 text-blue-600';
    case 'contact':
      return 'bg-purple-100 text-purple-600';
    case 'success':
    case 'template':
      return 'bg-green-100 text-green-600';
    case 'warning':
      return 'bg-yellow-100 text-yellow-600';
    case 'chatbot':
      return 'bg-indigo-100 text-indigo-600';
    case 'billing':
      return 'bg-pink-100 text-pink-600';
    case 'system':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const getBackgroundStyle = (type: string) => {
  switch (type) {
    case 'campaign':
      return 'hover:bg-orange-50';
    case 'message':
      return 'hover:bg-blue-50';
    case 'contact':
      return 'hover:bg-purple-50';
    case 'success':
    case 'template':
      return 'hover:bg-green-50';
    case 'warning':
      return 'hover:bg-yellow-50';
    default:
      return 'hover:bg-gray-50';
  }
};

const formatTime = (activity: Activity): string => {
  // If time is already formatted, return it
  if (activity.time) {
    return activity.time;
  }

  // If timestamp is provided, format it
  if (activity.timestamp) {
    try {
      return formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  }

  return 'Recently';
};

const getTitle = (activity: Activity): string => {
  if (activity.title) {
    return activity.title;
  }

  // Generate title from action
  if (activity.action) {
    const actionTitles: Record<string, string> = {
      'message_sent': 'Message sent',
      'message_received': 'New message received',
      'campaign_started': 'Campaign started',
      'campaign_completed': 'Campaign completed',
      'contact_created': 'New contact added',
      'contact_imported': 'Contacts imported',
      'template_approved': 'Template approved',
      'template_rejected': 'Template rejected',
    };
    return actionTitles[activity.action] || activity.action.replace(/_/g, ' ');
  }

  // Generate title from type
  const typeTitles: Record<string, string> = {
    'campaign': 'Campaign activity',
    'message': 'Message activity',
    'contact': 'Contact activity',
    'template': 'Template update',
    'billing': 'Billing update',
    'system': 'System notification',
  };
  
  return typeTitles[activity.type] || 'Activity';
};

// ============================================
// COMPONENT
// ============================================

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  // Use provided activities or fall back to static data
  const displayActivities = activities && activities.length > 0 
    ? activities.slice(0, 5) 
    : staticActivities;

  // Empty state
  if (!displayActivities || displayActivities.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No recent activity</h3>
          <p className="text-sm text-gray-500">
            Your recent actions will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <Link 
          to="/dashboard/activity"
          className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {displayActivities.map((activity) => {
          const Icon = getIcon(activity.type, activity.action);
          const title = getTitle(activity);
          const time = formatTime(activity);
          
          return (
            <div 
              key={activity.id}
              className={`flex items-start space-x-4 p-3 rounded-xl transition-colors cursor-pointer ${getBackgroundStyle(activity.type)}`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconStyle(activity.type, activity.action)}`}>
                <Icon className="w-5 h-5" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                  {title}
                </p>
                <p className="text-sm text-gray-500 line-clamp-1">
                  {activity.description}
                </p>
              </div>
              
              {/* Time */}
              <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                {time}
              </span>
            </div>
          );
        })}
      </div>

      {/* Show indicator if there are more activities */}
      {activities && activities.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <Link
            to="/dashboard/activity"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            +{activities.length - 5} more activities
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;