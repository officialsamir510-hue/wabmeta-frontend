import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  ChevronDown,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Menu,
  Command,
  CreditCard,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface TopBarProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, sidebarCollapsed }) => {
  const navigate = useNavigate();
  const { user } = useApp();
  
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('metaConnection');
    localStorage.removeItem('wabmeta_user');
    localStorage.removeItem('wabmeta_token');
    sessionStorage.clear();
    setShowProfile(false);
    navigate('/login');
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setShowSearch(true);
      }
      if (event.key === 'Escape') {
        setShowSearch(false);
        setShowNotifications(false);
        setShowProfile(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const notifications = [
    {
      id: 1,
      type: 'message',
      title: 'New message from Priya',
      description: 'Hi, I wanted to know about...',
      time: '2 min ago',
      unread: true
    }
  ];

  return (
    <header 
      className={`fixed top-0 right-0 z-30 bg-white border-b border-gray-200 transition-all duration-300 ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-64 lg:w-80 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center space-x-1 text-gray-400">
                <Command className="w-4 h-4" />
                <span className="text-xs">K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          
          {/* Mobile Search */}
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Mark all read
                  </button>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                        notification.unread ? 'bg-primary-50/50' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                          <Bell className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-500 truncate">{notification.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                      </div>
                      {notification.unread && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-2"></div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="px-4 py-3 border-t border-gray-100">
                  <Link 
                    to="/dashboard/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-9 h-9 bg-linear-to-br from-primary-500 to-whatsapp-teal rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'JD'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || 'Guest'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role || 'User'}
                </p>
              </div>
              <ChevronDown className={`hidden md:block w-4 h-4 text-gray-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                </div>
                
                <div className="py-2">
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">My Profile</span>
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Settings</span>
                  </Link>
                  <Link
                    to="/dashboard/billing"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Billing</span>
                  </Link>
                  <Link
                    to="/dashboard/help"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Help & Support</span>
                  </Link>
                </div>
                
                <div className="border-t border-gray-100 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showSearch && (
        <div className="md:hidden px-4 pb-4 animate-fade-in bg-white border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default TopBar;