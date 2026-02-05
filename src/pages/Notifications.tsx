// src/pages/Notifications.tsx

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  MessageSquare, 
  Users, 
  Megaphone, 
  CreditCard,
  Settings,
  Check,
  CheckCheck,
  Trash2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Inbox,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ============================================
// TYPES
// ============================================
interface Notification {
  id: string;
  type: 'message' | 'campaign' | 'team' | 'billing' | 'system' | 'alert';
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// ============================================
// MOCK DATA (Replace with API later)
// ============================================
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'New message received',
    description: 'You have a new message from +91 98765 43210',
    time: '5 minutes ago',
    read: false,
    actionUrl: '/dashboard/inbox',
  },
  {
    id: '2',
    type: 'campaign',
    title: 'Campaign completed successfully',
    description: 'Your campaign "Diwali Sale 2024" has been completed. 95% delivery rate.',
    time: '1 hour ago',
    read: false,
    actionUrl: '/dashboard/campaigns',
  },
  {
    id: '3',
    type: 'team',
    title: 'New team member joined',
    description: 'Sarah Wilson has accepted your invitation and joined the team as Admin.',
    time: '2 hours ago',
    read: false,
    actionUrl: '/dashboard/team',
  },
  {
    id: '4',
    type: 'alert',
    title: 'WhatsApp account connected',
    description: 'Your WhatsApp Business account has been successfully connected.',
    time: '5 hours ago',
    read: true,
  },
  {
    id: '5',
    type: 'billing',
    title: 'Payment successful',
    description: 'Your subscription payment of $79 for Pro plan was successful.',
    time: '1 day ago',
    read: true,
    actionUrl: '/dashboard/billing',
  },
  {
    id: '6',
    type: 'campaign',
    title: 'Campaign scheduled',
    description: 'Your campaign "Black Friday Deals" is scheduled for Nov 24, 2024 at 10:00 AM.',
    time: '1 day ago',
    read: true,
    actionUrl: '/dashboard/campaigns',
  },
  {
    id: '7',
    type: 'system',
    title: 'System maintenance completed',
    description: 'Scheduled maintenance has been completed. All services are operational.',
    time: '2 days ago',
    read: true,
  },
  {
    id: '8',
    type: 'message',
    title: 'Multiple unread messages',
    description: 'You have 5 unread messages from different contacts.',
    time: '2 days ago',
    read: true,
    actionUrl: '/dashboard/inbox',
  },
  {
    id: '9',
    type: 'team',
    title: 'Role updated',
    description: 'Your role in "Acme Corp" has been updated to Manager.',
    time: '3 days ago',
    read: true,
  },
  {
    id: '10',
    type: 'billing',
    title: 'Invoice generated',
    description: 'Your invoice #INV-2024-001 for $79 is ready for download.',
    time: '1 week ago',
    read: true,
    actionUrl: '/dashboard/billing',
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'message':
      return MessageSquare;
    case 'campaign':
      return Megaphone;
    case 'team':
      return Users;
    case 'billing':
      return CreditCard;
    case 'alert':
      return AlertCircle;
    case 'system':
      return Settings;
    default:
      return Bell;
  }
};

const getNotificationIconStyle = (type: string) => {
  switch (type) {
    case 'message':
      return 'bg-blue-100 text-blue-600';
    case 'campaign':
      return 'bg-purple-100 text-purple-600';
    case 'team':
      return 'bg-green-100 text-green-600';
    case 'billing':
      return 'bg-orange-100 text-orange-600';
    case 'alert':
      return 'bg-yellow-100 text-yellow-600';
    case 'system':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-primary-100 text-primary-600';
  }
};

// ============================================
// COMPONENT
// ============================================
const Notifications: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.read) return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    return true;
  });

  // Counts
  const unreadCount = notifications.filter(n => !n.read).length;
  const totalCount = notifications.length;

  // Actions
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
    }
  };

  const refreshNotifications = () => {
    setLoading(true);
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 500);
  };

  // Notification types for filter
  const notificationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'message', label: 'Messages' },
    { value: 'campaign', label: 'Campaigns' },
    { value: 'team', label: 'Team' },
    { value: 'billing', label: 'Billing' },
    { value: 'system', label: 'System' },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : "You're all caught up! 🎉"
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Refresh Button */}
          <button
            onClick={refreshNotifications}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Filter Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'all' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'unread' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      {notifications.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
          <div className="flex items-center space-x-4">
            {/* Mark All Read */}
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all as read</span>
            </button>

            {/* Type Filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>
                  {typeFilter === 'all' ? 'All types' : notificationTypes.find(t => t.value === typeFilter)?.label}
                </span>
              </button>
              
              {showFilterMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowFilterMenu(false)} 
                  />
                  <div className="absolute top-full left-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
                    {notificationTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => {
                          setTypeFilter(type.value);
                          setShowFilterMenu(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                          typeFilter === type.value ? 'text-primary-600 bg-primary-50' : 'text-gray-700'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Clear All */}
          <button
            onClick={clearAllNotifications}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear all</span>
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {filter === 'unread' 
                ? 'No unread notifications' 
                : typeFilter !== 'all'
                  ? `No ${typeFilter} notifications`
                  : 'No notifications yet'
              }
            </h3>
            <p className="text-gray-500 max-w-sm">
              {filter === 'unread' 
                ? "You're all caught up! Check back later for new updates."
                : "When you receive notifications, they'll appear here."
              }
            </p>
            {(filter === 'unread' || typeFilter !== 'all') && (
              <button
                onClick={() => {
                  setFilter('all');
                  setTypeFilter('all');
                }}
                className="mt-4 text-primary-600 hover:underline text-sm font-medium"
              >
                View all notifications
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const iconStyle = getNotificationIconStyle(notification.type);

              return (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-4 p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-primary-50/30' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className={`p-2.5 rounded-xl shrink-0 ${iconStyle}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className={`font-medium truncate ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                          {notification.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-400">{notification.time}</span>
                      
                      <div className="flex items-center space-x-1">
                        {/* Action Link */}
                        {notification.actionUrl && (
                          <Link
                            to={notification.actionUrl}
                            className="px-3 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            View
                          </Link>
                        )}
                        
                        {/* Mark as Read */}
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* Delete */}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notification Settings Card */}
      <div className="bg-linear-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white rounded-xl border border-gray-200">
              <Bell className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Notification Preferences</h3>
              <p className="text-sm text-gray-500 mt-1">
                Customize which notifications you receive via email, push, and in-app.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard/settings"
            className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium shadow-sm"
          >
            Manage Settings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Notifications;