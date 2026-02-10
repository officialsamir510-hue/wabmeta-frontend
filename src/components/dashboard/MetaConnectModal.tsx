// src/components/dashboard/MetaConnectModal.tsx

import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, Loader2, MessageCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { meta } from '../../services/api';
import { useFacebookSDK } from '../../hooks/useFacebookSDK';

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
  const { isReady: isFBReady, isLoading: isFBLoading, FB } = useFacebookSDK();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const popupRef = useRef<Window | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) cleanup();
    return () => cleanup();
  }, [isOpen]);

  const cleanup = () => {
    if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
    popupRef.current = null;
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    setIsConnecting(false);
    setError(null);
  };

  const handleConnect = () => {
    // ✅ Method 1: Try FB SDK First (Best UX)
    if (isFBReady && FB) {
      connectViaSDK();
    } else {
      // ✅ Method 2: Fallback to Popup (If SDK fails)
      connectViaPopup();
    }
  };

  const connectViaSDK = () => {
    setIsConnecting(true);
    setError(null);
    console.log('🔗 Starting connection via Facebook SDK (v22.0)');

    FB.login(
      (response: any) => {
        if (response.authResponse) {
          const { code } = response.authResponse;
          if (code) {
            console.log('✅ Got authorization code');
            handleBackendConnection(code);
          } else {
            setIsConnecting(false);
            setError('No authorization code received');
          }
        } else {
          console.log('❌ User cancelled');
          setIsConnecting(false);
        }
      },
      {
        config_id: '736708392598776', // Configuration ID
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: '',
          sessionInfoVersion: '3',
        }
      }
    );
  };

  const connectViaPopup = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      console.log('🔗 Starting connection via Popup fallback');

      const response = await meta.getAuthUrl('new'); // Force 'new' mode
      const authUrl = response.data?.data?.url;
      
      if (!authUrl) throw new Error('Failed to get OAuth URL');

      const width = 650;
      const height = 750;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        authUrl,
        'MetaOAuth',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
      );

      if (!popup) throw new Error('Popup blocked. Please allow popups.');

      popupRef.current = popup;

      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type === 'META_CONNECTED') {
          window.removeEventListener('message', handleMessage);
          cleanup();
          toast.success('WhatsApp connected successfully!');
          onSuccess?.();
          onClose();
        }
      };

      window.addEventListener('message', handleMessage);

      // Check for closure
      checkIntervalRef.current = setInterval(async () => {
        if (!popup || popup.closed) {
          clearInterval(checkIntervalRef.current!);
          window.removeEventListener('message', handleMessage);
          setIsConnecting(false);
          
          // Check status just in case
          const status = await meta.getStatus();
          if (status.data?.data?.isConnected) {
            onSuccess?.();
            onClose();
          }
        }
      }, 1000);

    } catch (err: any) {
      console.error('Popup error:', err);
      setError(err.message);
      setIsConnecting(false);
    }
  };

  const handleBackendConnection = async (code: string) => {
    try {
      const response = await meta.connect({ code });
      if (response.data?.success) {
        toast.success('WhatsApp connected successfully!');
        onSuccess?.();
        onClose();
      } else {
        throw new Error(response.data?.error || 'Connection failed');
      }
    } catch (err: any) {
      console.error('Backend error:', err);
      setError(err.message || 'Failed to connect');
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
            Connect WhatsApp
          </h2>
          <button onClick={onClose} disabled={isConnecting} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Connect your WhatsApp Business account to start messaging.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Facebook account required</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Business verification may be needed</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Valid phone number needed</span>
            </div>
          </div>

          <button
            onClick={handleConnect}
            disabled={isConnecting || isFBLoading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5" />
                Connect WhatsApp Business
              </>
            )}
          </button>

          {!isFBLoading && (
            <p className="text-xs text-center text-gray-400">
              {isFBReady ? '✅ Secure connection via Meta' : '⚠️ Using standard connection'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetaConnectModal;