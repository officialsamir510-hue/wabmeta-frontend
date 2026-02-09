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
// HELPER FUNCTIONS
// ============================================

const getIcon = (type: string, action?: string) => {
  if (action) {
    switch (action) {
      case 'message_sent': return Send;
      case 'message_received': return MessageSquare;
      case 'campaign_started':
      case 'campaign_completed': return Megaphone;
      case 'contact_created':
      case 'contact_imported': return UserPlus;
      case 'template_approved': return CheckCircle2;
      case 'template_rejected': return AlertCircle;
    }
  }

  switch (type) {
    case 'campaign': return Megaphone;
    case 'message': return MessageSquare;
    case 'contact': return UserPlus;
    case 'success':
    case 'template': return CheckCircle2;
    case 'warning': return AlertCircle;
    case 'chatbot': return Bot;
    case 'billing': return CreditCard;
    case 'system': return Settings;
    default: return Clock;
  }
};

const getIconStyle = (type: string, action?: string) => {
  if (action) {
    switch (action) {
      case 'message_sent': return 'bg-green-100 text-green-600';
      case 'message_received': return 'bg-blue-100 text-blue-600';
      case 'template_approved': return 'bg-green-100 text-green-600';
      case 'template_rejected': return 'bg-red-100 text-red-600';
    }
  }

  switch (type) {
    case 'campaign': return 'bg-orange-100 text-orange-600';
    case 'message': return 'bg-blue-100 text-blue-600';
    case 'contact': return 'bg-purple-100 text-purple-600';
    case 'success':
    case 'template': return 'bg-green-100 text-green-600';
    case 'warning': return 'bg-yellow-100 text-yellow-600';
    case 'chatbot': return 'bg-indigo-100 text-indigo-600';
    case 'billing': return 'bg-pink-100 text-pink-600';
    case 'system': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const getBackgroundStyle = (type: string) => {
  switch (type) {
    case 'campaign': return 'hover:bg-orange-50';
    case 'message': return 'hover:bg-blue-50';
    case 'contact': return 'hover:bg-purple-50';
    case 'success':
    case 'template': return 'hover:bg-green-50';
    case 'warning': return 'hover:bg-yellow-50';
    default: return 'hover:bg-gray-50';
  }
};

const formatTime = (activity: Activity): string => {
  if (activity.time) return activity.time;
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
  if (activity.title) return activity.title;

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
  // Use provided activities (or empty array if none provided)
  // IMPORTANT: Removed staticActivities fallback to ensure real data or empty state
  const displayActivities = activities && activities.length > 0 
    ? activities.slice(0, 5) 
    : [];

  // Empty state
  if (displayActivities.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No recent activity</h3>
          <p className="text-sm text-gray-500">
            Your recent actions will appear here once you start using the platform.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <Link 
          to="/dashboard/activity" // Ensure this route exists or change to appropriate logs page
          className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Activity List */}
      <div className="space-y-3 flex-1 overflow-y-auto max-h-75 custom-scrollbar pr-2">
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
    </div>
  );
};

export default RecentActivity;