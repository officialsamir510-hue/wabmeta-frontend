import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  MessageSquare,
  ChevronDown,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Menu,
  Command,
  CreditCard,
  HelpCircle,
  Loader2
} from 'lucide-react';
import MetaConnectModal from './MetaConnectModal';
import useMetaConnection from '../../hooks/useMetaConnection';
import { useApp } from '../../context/AppContext';

interface TopBarProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

// Meta OAuth Configuration
const META_CONFIG = {
  appId: import.meta.env.VITE_META_APP_ID || 'YOUR_FB_APP_ID',
  configId: import.meta.env.VITE_META_CONFIG_ID || 'YOUR_CONFIG_ID',
  redirectUri: import.meta.env.VITE_META_REDIRECT_URI || 'http://localhost:5173/meta-callback',
  scope: 'whatsapp_business_management,whatsapp_business_messaging,business_management',
};

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, sidebarCollapsed }) => {
  const navigate = useNavigate();
  const { user } = useApp(); // ✅ Use user from context
  
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showConnectionMenu, setShowConnectionMenu] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const connectionRef = useRef<HTMLDivElement>(null);

  const { 
    connection, 
    startConnection, 
    disconnect,
  } = useMetaConnection();

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('metaConnection');
    localStorage.removeItem('wabmeta_user');
    localStorage.removeItem('wabmeta_token');
    sessionStorage.clear();
    setShowProfile(false);
    navigate('/login');
  };

  // Handle Meta OAuth Login
  const handleMetaLogin = () => {
    setIsConnecting(true);
    setShowConnectionMenu(false);

    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    authUrl.searchParams.append('client_id', META_CONFIG.appId);
    authUrl.searchParams.append('redirect_uri', META_CONFIG.redirectUri);
    authUrl.searchParams.append('scope', META_CONFIG.scope);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('state', generateRandomState());

    const state = authUrl.searchParams.get('state');
    sessionStorage.setItem('meta_oauth_state', state || '');

    const popup = window.open(
      authUrl.toString(),
      'MetaLogin',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );

    const checkPopup = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(checkPopup);
        setIsConnecting(false);
      }
    }, 500);

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'META_OAUTH_SUCCESS') {
        clearInterval(checkPopup);
        popup?.close();
        handleOAuthSuccess(event.data.code);
      } else if (event.data.type === 'META_OAUTH_ERROR') {
        clearInterval(checkPopup);
        popup?.close();
        setIsConnecting(false);
        console.error('OAuth Error:', event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(checkPopup);
    };
  };

  const generateRandomState = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const handleOAuthSuccess = async (_code: string) => {
    try {
      await startConnection();
      setIsConnecting(false);
    } catch (error) {
      console.error('Failed to complete OAuth:', error);
      setIsConnecting(false);
    }
  };

  const handleOpenConnectModal = () => {
    setShowConnectionMenu(false);
    setShowConnectModal(true);
  };

  const handleCloseConnectModal = () => {
    setShowConnectModal(false);
  };

  const handleDisconnect = () => {
    if (window.confirm('Are you sure you want to disconnect your WhatsApp Business Account?')) {
      disconnect();
      setShowConnectionMenu(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
      //   setShowNotifications(false);
      // }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
      if (connectionRef.current && !connectionRef.current.contains(event.target as Node)) {
        setShowConnectionMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setShowSearch(true);
      }
      if (event.key === 'Escape') {
        setShowSearch(false);
        setShowProfile(false);
        setShowConnectionMenu(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);


  return (
    <>
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
            {/* Meta Connection Button */}
            <div className="relative" ref={connectionRef}>
              <button
                onClick={() => setShowConnectionMenu(!showConnectionMenu)}
                disabled={isConnecting}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-70 ${
                  connection.isConnected
                    ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                    : 'bg-[#1877F2] hover:bg-[#166FE5] text-white'
                }`}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Connecting...</span>
                  </>
                ) : connection.isConnected ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="hidden sm:inline">Connected</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="hidden sm:inline">Connect with Meta</span>
                  </>
                )}
              </button>

              {/* Connection Dropdown (Same as before) */}
              {showConnectionMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in z-50">
                  {/* ... same connection dropdown content ... */}
                  {connection.isConnected ? (
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                          <MessageSquare className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {connection.businessAccount?.name || 'My Business'}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {connection.businessAccount?.phoneNumber || 'No number'}
                          </p>
                        </div>
                      </div>
                      <button onClick={handleDisconnect} className="w-full mt-3 flex items-center justify-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium">
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <div className="p-4">
                      <p className="font-semibold text-gray-900 mb-1">Not Connected</p>
                      <p className="text-sm text-gray-500 mb-4">Connect your WhatsApp account to start messaging.</p>
                      <button onClick={handleMetaLogin} className="w-full py-2.5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium rounded-xl transition-colors text-sm">
                        Continue with Facebook
                      </button>
                      <div className="flex items-center space-x-3 py-3">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-xs text-gray-400">or</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                      </div>
                      <button onClick={handleOpenConnectModal} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm">
                        Manual Setup
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Other Icons */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              <Search className="w-5 h-5" />
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

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
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.name || 'Guest'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user?.email || 'No email'}
                    </p>
                  </div>
                  
                  <div className="py-2">
                    <Link to="/dashboard/profile" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">My Profile</span>
                    </Link>
                    <Link to="/dashboard/settings" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Settings</span>
                    </Link>
                    <Link to="/dashboard/billing" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Billing</span>
                    </Link>
                    <Link to="/dashboard/help" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Help & Support</span>
                    </Link>
                  </div>
                  
                  <div className="border-t border-gray-100 py-2">
                    <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-left">
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
          <div className="md:hidden px-4 pb-4 animate-fade-in">
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

      <MetaConnectModal
        isOpen={showConnectModal}
        onClose={handleCloseConnectModal}
        onConnect={(_accessToken, _account) => {
          startConnection();
          handleCloseConnectModal();
        }}
      />
    </>
  );
};

export default TopBar;