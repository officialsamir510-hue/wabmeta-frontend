// src/components/dashboard/MetaConnectModal.tsx

import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface MetaConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MetaConnectModal: React.FC<MetaConnectModalProps> = ({
  isOpen,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnectWhatsApp = async () => {
    try {
      setLoading(true);
      setError('');

      // Step 1: Get OAuth URL from backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/meta/auth/url`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get authorization URL');
      }

      const data = await response.json();

      if (data.success && data.data.authUrl) {
        // Step 2: Open OAuth URL in popup window
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
          data.data.authUrl,
          'MetaOAuth',
          `width=${width},height=${height},top=${top},left=${left},toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no,copyhistory=no`
        );

        // Step 3: Listen for callback message
        const handleMessage = (event: MessageEvent) => {
          // Security check - only accept messages from your domain
          if (event.origin !== window.location.origin) {
            return;
          }

          if (event.data.type === 'META_OAUTH_SUCCESS') {
            popup?.close();
            window.removeEventListener('message', handleMessage);
            
            toast.success('WhatsApp connected successfully!');
            
            // Refresh page or update state
            setTimeout(() => {
              window.location.reload();
            }, 1500);
            
            onClose();
          } else if (event.data.type === 'META_OAUTH_ERROR') {
            popup?.close();
            window.removeEventListener('message', handleMessage);
            setError(event.data.error || 'Connection failed');
            setLoading(false);
          }
        };

        window.addEventListener('message', handleMessage);

        // Check if popup was blocked
        if (!popup || popup.closed) {
          setError('Please allow popups for this website');
          setLoading(false);
          window.removeEventListener('message', handleMessage);
        }

      } else {
        throw new Error(data.message || 'Invalid response from server');
      }

    } catch (err: any) {
      console.error('Connect error:', err);
      setError(err.message || 'Failed to connect WhatsApp');
      setLoading(false);
      toast.error('Failed to connect WhatsApp');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Connect WhatsApp Business
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 mt-0.5" size={20} />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 mb-2">Requirements:</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Meta Business Account</li>
                  <li>• WhatsApp Business Account (WABA)</li>
                  <li>• Verified Business Phone Number</li>
                  <li>• Admin access to the Facebook Business Manager</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-600 mt-0.5" size={20} />
                <div className="text-sm text-red-800">
                  <p className="font-semibold mb-1">Connection Failed</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Benefits */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">After connecting, you can:</h3>
            <div className="space-y-2">
              {[
                'Send messages to your customers',
                'Receive and reply to messages',
                'Send bulk campaigns',
                'Use message templates',
                'Automate responses with chatbots'
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="text-green-600" size={16} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t space-y-3">
          <button
            onClick={handleConnectWhatsApp}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>Connect WhatsApp</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};