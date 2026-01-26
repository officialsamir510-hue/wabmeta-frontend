import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search,
  Bell,
  MessageSquare,
  ChevronDown,
  Moon,
  Menu,
  Command,
  Loader2
} from 'lucide-react';
import MetaConnectModal from './MetaConnectModal';
import useMetaConnection from '../../hooks/useMetaConnection';
import { useApp } from '../../context/AppContext';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface TopBarProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, sidebarCollapsed }) => {
  const navigate = useNavigate();
  const { user } = useApp();
  
  // Removed unused showSearch state
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

  // 🔹 EFFECT: Listen for Facebook Popup "FINISH" Event
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // 1. Security Check
      if (event.origin !== "https://business.facebook.com" && event.origin !== "https://www.facebook.com") return;

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        // 2. Check if User Completed Signup
        if (data.type === 'WA_EMBEDDED_SIGNUP' && data.event === 'FINISH') {
          const { code } = data.data;
          console.log("🔹 Meta Auth Code Received in TopBar:", code);
          
          if (code) {
            await exchangeCodeForToken(code);
          }
        }
      } catch (e) {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 🔹 HELPER: Exchange Code with Backend
  const exchangeCodeForToken = async (code: string) => {
    setIsConnecting(true);
    try {
      const token = localStorage.getItem('wabmeta_token') || localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/api/meta/callback`,
        { code },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          }
        }
      );

      if (response.data && response.data.success) {
        // Update Context
        startConnection();
        setShowConnectionMenu(false);
        alert("WhatsApp Connected Successfully!");
      }
    } catch (error) {
      console.error("Connection Failed:", error);
      alert("Failed to connect WhatsApp. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  // 🔹 REAL META LOGIN HANDLER (Popup)
  const handleMetaLogin = () => {
    // Show loading spinner on button
    setIsConnecting(true);

    // Standard URL provided in prompt
    const url = `https://business.facebook.com/messaging/whatsapp/onboard/?app_id=881518987956566&config_id=909621421506894&extras={"sessionInfoVersion":3,"version":"v3"}`;
    
    // Calculate center position
    const width = 800;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    // Open Popup
    window.open(url, "WA", `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`);

    // Reset loading state after a few seconds (assuming user is interacting with popup)
    setTimeout(() => setIsConnecting(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('metaConnection');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    setShowProfile(false);
    navigate('/login');
  };

  const handleOpenConnectModal = () => {
    setShowConnectionMenu(false);
    setShowConnectModal(true);
  };

  const handleCloseConnectModal = () => {
    setShowConnectModal(false);
  };

  const handleDisconnect = () => {
    if (window.confirm('Are you sure you want to disconnect?')) {
      disconnect();
      setShowConnectionMenu(false);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  return (
    <>
      <header 
        className={`fixed top-0 right-0 z-30 bg-white border-b border-gray-200 transition-all duration-300 ${
          sidebarCollapsed ? 'left-20' : 'left-64'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left: Mobile Menu & Search */}
          <div className="flex items-center space-x-4">
            <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Search..." className="w-64 lg:w-80 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center space-x-1 text-gray-400">
                  <Command className="w-4 h-4" /><span className="text-xs">K</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Connect Button & Profile */}
          <div className="flex items-center space-x-2">
            {/* Meta Connection Button */}
            <div className="relative" ref={connectionRef}>
              <button
                onClick={() => setShowConnectionMenu(!showConnectionMenu)}
                disabled={isConnecting}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
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

              {/* Dropdown Menu */}
              {showConnectionMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in z-50">
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
                      
                      {/* 🔹 REAL META LOGIN BUTTON */}
                      <button onClick={handleMetaLogin} className="w-full py-2.5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
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

            {/* Profile & Icons */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"><Search className="w-5 h-5" /></button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><Moon className="w-5 h-5" /></button>
            <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500"><Bell className="w-5 h-5" /></button>

            <div className="relative" ref={profileRef}>
              <button onClick={() => setShowProfile(!showProfile)} className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-gray-100">
                <div className="w-9 h-9 bg-linear-to-br from-primary-500 to-whatsapp-teal rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'JD'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Guest'}</p>
                  <p className="text-xs text-gray-500">{user?.role || 'User'}</p>
                </div>
                <ChevronDown className="hidden md:block w-4 h-4 text-gray-400" />
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold">{user?.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-2">
                    <Link to="/dashboard/profile" className="block px-4 py-2 hover:bg-gray-50 text-sm">Profile</Link>
                    <Link to="/dashboard/settings" className="block px-4 py-2 hover:bg-gray-50 text-sm">Settings</Link>
                  </div>
                  <div className="border-t border-gray-100 py-2">
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-sm">Logout</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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