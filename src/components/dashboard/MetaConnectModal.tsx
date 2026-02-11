// src/components/dashboard/MetaConnectModal.tsx

import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { meta } from '../../services/api';

interface MetaConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MetaConnectModal: React.FC<MetaConnectModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const popupRef = useRef<Window | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on close/unmount
  useEffect(() => {
    if (!isOpen) {
      cleanup();
    }
    return () => cleanup();
  }, [isOpen]);

  const cleanup = () => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    popupRef.current = null;
    
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    
    setIsConnecting(false);
    setError(null);
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      console.log('🔗 Getting auth URL from backend...');

      // Get auth URL from backend (with embedded mode by default)
      const response = await meta.getAuthUrl({ mode: 'embedded' });
      const authUrl = response.data?.data?.url || response.data?.data?.authUrl;
      const state = response.data?.data?.state;
      
      if (!authUrl) {
        throw new Error('Failed to get authorization URL');
      }

      // ✅ CRITICAL FIX - Ensure config_id is present for embedded signup
      let finalAuthUrl = authUrl;
      const CONFIG_ID = '736708392598776'; // Your Meta embedded signup config ID
      
      // Check if config_id is missing and add it
      if (!authUrl.includes('config_id=')) {
        console.warn('⚠️ config_id missing from backend, adding manually');
        
        // Remove display=popup if exists (not needed for embedded signup)
        finalAuthUrl = authUrl.replace('&display=popup', '');
        finalAuthUrl = authUrl.replace('display=popup&', '');
        finalAuthUrl = authUrl.replace('display=popup', '');
        
        // Add config_id before response_type or at appropriate position
        if (finalAuthUrl.includes('response_type=')) {
          finalAuthUrl = finalAuthUrl.replace('response_type=', `config_id=${CONFIG_ID}&response_type=`);
        } else {
          // Fallback: just append it
          finalAuthUrl = finalAuthUrl + `&config_id=${CONFIG_ID}`;
        }
      }
      
      // Debug log (only first 200 chars for security)
      console.log('✅ Final OAuth URL:', finalAuthUrl.substring(0, 200) + '...');
      console.log('   Contains config_id:', finalAuthUrl.includes('config_id='));

      console.log('✅ Opening Meta auth popup...');

      // Open popup with exact URL
      const width = 650;
      const height = 750;
      const left = (window.screen.width / 2) - (width / 2);
      const top = (window.screen.height / 2) - (height / 2);
      
      const popup = window.open(
        finalAuthUrl, // ✅ Use finalAuthUrl instead of authUrl
        'MetaAuth',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,status=yes`
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site and try again.');
      }

      popupRef.current = popup;

      // Focus the popup
      popup.focus();

      // Check popup status periodically
      checkIntervalRef.current = setInterval(async () => {
        try {
          // Check if popup is closed
          if (!popupRef.current || popupRef.current.closed) {
            console.log('🔍 Popup closed, checking connection status...');
            
            clearInterval(checkIntervalRef.current!);
            checkIntervalRef.current = null;

            // Check if connection was successful by querying backend
            const statusResponse = await meta.getStatus();
            const isConnected = statusResponse.data?.data?.isConnected;

            if (isConnected) {
              console.log('✅ WhatsApp connected successfully!');
              toast.success('WhatsApp Business connected successfully!');
              onSuccess?.();
              onClose();
            } else {
              console.log('⚠️ Connection not completed');
              setError('Connection was not completed. Please try again.');
            }
            
            setIsConnecting(false);
          }
        } catch (err) {
          console.error('Status check error:', err);
          setIsConnecting(false);
        }
      }, 1000);

      // Also listen for URL changes (for redirect detection)
      const urlCheckInterval = setInterval(() => {
        try {
          if (popupRef.current && !popupRef.current.closed) {
            // Try to access the URL (will fail for cross-origin)
            const currentUrl = popupRef.current.location.href;
            
            // Check if redirected back to our domain
            if (currentUrl.includes(window.location.hostname)) {
              console.log('🔄 Detected redirect back to app');
              
              // Extract code from URL if possible
              const urlParams = new URLSearchParams(popupRef.current.location.search);
              const code = urlParams.get('code');
              const error = urlParams.get('error');
              
              if (code) {
                console.log('✅ Got authorization code');
                handleAuthCode(code, state);
              } else if (error) {
                console.error('❌ OAuth error:', error);
                const errorDescription = urlParams.get('error_description');
                setError(`Authorization failed: ${errorDescription || error}`);
                setIsConnecting(false);
              }
              
              // Close popup and clear interval
              popupRef.current.close();
              clearInterval(urlCheckInterval);
            }
          }
        } catch (e) {
          // Cross-origin error is expected, ignore it
        }
      }, 500);

      // Store interval reference for cleanup
      const cleanupUrlCheck = () => clearInterval(urlCheckInterval);

      // Timeout after 5 minutes
      setTimeout(() => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          cleanupUrlCheck();
          checkIntervalRef.current = null;
          
          if (popupRef.current && !popupRef.current.closed) {
            popupRef.current.close();
          }
          
          setError('Connection timeout. Please try again.');
          setIsConnecting(false);
        }
      }, 5 * 60 * 1000);

    } catch (err: any) {
      console.error('❌ Connection error:', err);
      setError(err.message || 'Failed to connect WhatsApp');
      setIsConnecting(false);
      toast.error(err.message || 'Failed to connect');
    }
  };

  const handleAuthCode = async (code: string, state?: string) => {
    try {
      console.log('🔗 Sending auth code to backend...');
      
      // Send code to backend
      const response = await meta.connect({ 
        code,
        state: state || ''
      });

      if (response.data?.data) {
        console.log('✅ Connection successful');
        toast.success('WhatsApp Business connected successfully!');
        cleanup();
        onSuccess?.();
        onClose();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('❌ Backend connection error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to complete connection');
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Connect WhatsApp Business
          </h2>
          <button
            onClick={onClose}
            disabled={isConnecting}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Icon */}
          <div className="text-center">
            <div className="w-20 h-20 bg-linear-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg viewBox="0 0 24 24" className="w-10 h-10 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Connect your WhatsApp Business account to start messaging customers directly.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Connection Failed
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold text-green-900 dark:text-green-100">
              What you'll get:
            </h4>
            <ul className="text-sm text-green-800 dark:text-green-200 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                Send & receive WhatsApp messages
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                Create marketing campaigns
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                Automated chatbot responses
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                Analytics & insights
              </li>
            </ul>
          </div>

          {/* Requirements */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Requirements:
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Facebook account</li>
              <li>• Phone number for WhatsApp (not already registered)</li>
              <li>• Business verification (if required by Meta)</li>
            </ul>
          </div>

          {/* Info Message */}
          {isConnecting && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A popup window has opened. Please complete the setup process there.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                The popup will close automatically when done.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t dark:border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            disabled={isConnecting}
            className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Connect WhatsApp
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetaConnectModal;