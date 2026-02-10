// src/components/dashboard/MetaConnectModal.tsx

import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, Loader2, Plus, Link, Sparkles, ArrowRight } from 'lucide-react';
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
  const [selectedMode, setSelectedMode] = useState<'new' | 'existing' | null>(null);
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
    setSelectedMode(null);
    setError(null);
  };

  const handleConnect = async (mode: 'new' | 'existing') => {
    try {
      setIsConnecting(true);
      setSelectedMode(mode);
      setError(null);

      console.log(`🔗 Starting ${mode} connection flow...`);

      // Get OAuth URL from backend with mode
      const response = await meta.getAuthUrl(mode);
      
      const authUrl = response.data?.data?.url || response.data?.data?.authUrl;
      
      if (!authUrl) {
        throw new Error('Failed to get OAuth URL');
      }

      console.log(`✅ Got OAuth URL for ${mode} mode`);

      // Open in popup
      const width = 650;
      const height = 750;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        authUrl,
        'MetaOAuth',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      popupRef.current = popup;

      // Listen for messages from popup
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        const { type } = event.data || {};

        if (type === 'META_OAUTH_SUCCESS' || type === 'META_CONNECTED') {
          console.log('✅ Connection successful');
          window.removeEventListener('message', handleMessage);
          cleanup();
          toast.success('WhatsApp connected successfully!');
          onSuccess?.();
          onClose();
        }

        if (type === 'META_OAUTH_ERROR') {
          console.error('❌ Connection failed:', event.data.error);
          window.removeEventListener('message', handleMessage);
          setError(event.data.error || 'Connection failed');
          setIsConnecting(false);
          setSelectedMode(null);
        }
      };

      window.addEventListener('message', handleMessage);

      // Monitor popup closure
      checkIntervalRef.current = setInterval(async () => {
        if (!popupRef.current || popupRef.current.closed) {
          clearInterval(checkIntervalRef.current!);
          checkIntervalRef.current = null;
          window.removeEventListener('message', handleMessage);

          // Check if connection succeeded
          try {
            const statusRes = await meta.getStatus();
            if (statusRes.data?.data?.isConnected) {
              toast.success('WhatsApp connected successfully!');
              onSuccess?.();
              onClose();
              return;
            }
          } catch (err) {
            console.error('Status check error:', err);
          }

          setIsConnecting(false);
          setSelectedMode(null);
        }
      }, 1000);

      // Timeout after 5 minutes
      setTimeout(() => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
          setIsConnecting(false);
          setSelectedMode(null);
        }
      }, 5 * 60 * 1000);

    } catch (err: any) {
      console.error('❌ Connect error:', err);
      setError(err.message || 'Failed to connect');
      setIsConnecting(false);
      setSelectedMode(null);
      toast.error(err.message || 'Failed to connect');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
        <div className="p-6 space-y-5">
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Choose how you want to connect your WhatsApp Business account
          </p>

          {/* Error */}
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

          {/* Option 1: Create New */}
          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 dark:hover:border-green-400 transition-all duration-200">
            <button
              onClick={() => handleConnect('new')}
              disabled={isConnecting}
              className="w-full p-6 text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-linear-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                  <Plus className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Create New WhatsApp Business
                    </h3>
                    <span className="px-2.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                      Recommended
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Perfect for first-time setup. We'll guide you through creating a new WhatsApp Business account with your phone number.
                  </p>
                  <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1.5">
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-green-500" />
                      Quick guided setup process
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-green-500" />
                      Automatic configuration
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-green-500" />
                      Best for new businesses
                    </li>
                  </ul>
                </div>
                {isConnecting && selectedMode === 'new' ? (
                  <Loader2 className="w-6 h-6 text-green-600 animate-spin shrink-0" />
                ) : (
                  <ArrowRight className="w-6 h-6 text-gray-400 shrink-0" />
                )}
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          </div>

          {/* Option 2: Connect Existing */}
          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200">
            <button
              onClick={() => handleConnect('existing')}
              disabled={isConnecting}
              className="w-full p-6 text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-linear-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                  <Link className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Connect Existing WhatsApp
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Already have a WhatsApp Business account? Connect your existing setup to start messaging immediately.
                  </p>
                  <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1.5">
                    <li className="flex items-center gap-2">
                      <Link className="w-4 h-4 text-blue-500" />
                      Use your current WhatsApp Business
                    </li>
                    <li className="flex items-center gap-2">
                      <Link className="w-4 h-4 text-blue-500" />
                      Keep existing settings & data
                    </li>
                    <li className="flex items-center gap-2">
                      <Link className="w-4 h-4 text-blue-500" />
                      No phone number changes needed
                    </li>
                  </ul>
                </div>
                {isConnecting && selectedMode === 'existing' ? (
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin shrink-0" />
                ) : (
                  <ArrowRight className="w-6 h-6 text-gray-400 shrink-0" />
                )}
              </div>
            </button>
          </div>

          {/* Requirements */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Before you start:
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Facebook account with admin access</li>
              <li>• Valid phone number (not used on regular WhatsApp)</li>
              <li>• Business verification documents (may be required)</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isConnecting}
            className="w-full px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetaConnectModal;