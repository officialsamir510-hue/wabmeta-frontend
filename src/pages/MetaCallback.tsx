// src/pages/MetaCallback.tsx - UPDATED FOR EMBEDDED SIGNUP v3

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';

// ============================================
// TYPES
// ============================================

type CallbackStatus = 'loading' | 'success' | 'error';

interface CallbackState {
  status: CallbackStatus;
  message: string;
  details?: string;
}

interface ConnectionData {
  wabaId?: string;
  wabaName?: string;
  phoneNumbers?: Array<{
    id: string;
    phoneNumber: string;
    displayName: string;
    qualityRating: string;
  }>;
  phoneNumberCount?: number;
  account?: {
    id: string;
    phoneNumber: string;
    displayName: string;
    status: string;
  };
}

// ============================================
// COMPONENT
// ============================================

const MetaCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [ui, setUi] = useState<CallbackState>({
    status: 'loading',
    message: 'Processing your connection...',
  });

  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent double-run (React StrictMode, re-renders)
    if (processedRef.current) return;
    processedRef.current = true;

    void handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCallback = async () => {
    // URL parameters from Meta OAuth callback
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorReason = searchParams.get('error_reason');
    const errorDescription = searchParams.get('error_description');

    console.log('🔄 MetaCallback processing...', {
      hasCode: !!code,
      hasError: !!error,
      hasState: !!state,
      url: window.location.href,
    });

    // 1) OAuth error from Meta
    if (error) {
      console.error('❌ OAuth error from Meta:', {
        error,
        errorReason,
        errorDescription
      });

      const errorMsg = errorDescription || errorReason || error || 'Connection cancelled';

      setUi({
        status: 'error',
        message: 'Meta Authorization Failed',
        details: errorMsg,
      });

      // Notify parent window if in popup
      notifyParent({
        type: 'META_CALLBACK_ERROR',
        error: errorMsg,
      });

      return;
    }

    // 2) Missing code
    if (!code) {
      console.error('❌ Missing authorization code');

      setUi({
        status: 'error',
        message: 'Missing authorization code',
        details: 'The authorization process was incomplete. Please try again.',
      });

      notifyParent({
        type: 'META_CALLBACK_ERROR',
        error: 'Missing authorization code',
      });

      return;
    }

    // 3) Missing state
    if (!state) {
      console.error('❌ Missing state parameter');

      setUi({
        status: 'error',
        message: 'Missing state parameter',
        details: 'Security validation failed. Please try again.',
      });

      notifyParent({
        type: 'META_CALLBACK_ERROR',
        error: 'Missing state parameter',
      });

      return;
    }

    // 4) Extract organizationId from state
    // State format: "organizationId:randomToken"
    const organizationId = state.split(':')[0];

    if (!organizationId) {
      console.error('❌ Invalid state format:', state);

      setUi({
        status: 'error',
        message: 'Invalid state format',
        details: 'Organization context could not be determined. Please try again.',
      });

      notifyParent({
        type: 'META_CALLBACK_ERROR',
        error: 'Invalid state format',
      });

      return;
    }

    console.log('📋 Organization ID from state:', organizationId);

    // 5) Verify with stored organizationId (optional check)
    const storedOrgId = localStorage.getItem('meta_connection_org_id');
    const storedState = localStorage.getItem('meta_connection_state');

    console.log('🔍 Verification:', {
      storedOrgId,
      extractedOrgId: organizationId,
      storedState: storedState ? 'Present' : 'Missing',
      receivedState: state,
    });

    // Optional: Verify state matches what we stored
    if (storedState && storedState !== state) {
      console.warn('⚠️ State mismatch - possible CSRF attack', {
        stored: storedState,
        received: state,
      });

      setUi({
        status: 'error',
        message: 'Security validation failed',
        details: 'State parameter mismatch. This may be a security issue.',
      });

      notifyParent({
        type: 'META_CALLBACK_ERROR',
        error: 'State validation failed',
      });

      return;
    }

    // 6) Check timestamp (optional)
    const storedTimestamp = localStorage.getItem('meta_connection_timestamp');
    if (storedTimestamp) {
      const age = Date.now() - parseInt(storedTimestamp, 10);
      const maxAge = 60 * 60 * 1000; // 1 hour

      console.log('⏱️ Connection age:', {
        ageMs: age,
        ageMin: Math.floor(age / 60000),
        maxAgeMin: Math.floor(maxAge / 60000),
      });

      if (age > maxAge) {
        console.warn('⚠️ Connection attempt expired');

        setUi({
          status: 'error',
          message: 'Connection expired',
          details: 'This authorization has expired. Please start the connection process again.',
        });

        notifyParent({
          type: 'META_CALLBACK_ERROR',
          error: 'Connection expired',
        });

        return;
      }
    }

    // 7) Call backend to complete connection
    try {
      setUi({
        status: 'loading',
        message: 'Connecting your WhatsApp Business account...',
        details: 'This may take a few moments...',
      });

      console.log('🔄 Sending callback to backend...', {
        organizationId,
        codeLength: code.length,
        stateLength: state.length,
      });

      const response = await api.post('/meta/callback', {
        code,
        state,
      });

      console.log('📥 Backend response:', response.data);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Connection failed');
      }

      const connectionData: ConnectionData = response.data.data;

      // Determine success message
      let successDetails = 'Your WhatsApp Business account is now connected.';

      if (connectionData.wabaName) {
        successDetails = `Connected: ${connectionData.wabaName}`;
      } else if (connectionData.account?.displayName) {
        successDetails = `Connected: ${connectionData.account.displayName}`;
      } else if (connectionData.phoneNumbers && connectionData.phoneNumbers.length > 0) {
        successDetails = `Connected ${connectionData.phoneNumbers.length} phone number(s)`;
      }

      console.log('✅ Connection successful:', connectionData);

      setUi({
        status: 'success',
        message: 'WhatsApp Business Connected!',
        details: successDetails,
      });

      // Cleanup localStorage
      localStorage.removeItem('meta_connection_org_id');
      localStorage.removeItem('meta_connection_timestamp');
      localStorage.removeItem('meta_connection_state');

      // Notify parent window if in popup
      const notified = notifyParent({
        type: 'META_CALLBACK_SUCCESS',
        data: connectionData,
      });

      // If in popup, close after delay
      if (notified && window.opener) {
        setTimeout(() => {
          console.log('🔒 Closing popup...');
          window.close();
        }, 1500);
        return;
      }

      // Otherwise, redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard', {
          replace: true,
          state: {
            metaConnected: true,
            connectionData,
            message: 'WhatsApp Business account connected successfully!',
          },
        });
      }, 2000);

    } catch (err: any) {
      console.error('❌ Connection error:', err);

      const status = err?.response?.status;
      const serverError = err?.response?.data?.error;
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to complete connection';

      console.error('Error details:', {
        status,
        serverError,
        errorMessage,
        fullError: err,
      });

      // Handle specific error cases
      if (status === 401) {
        setUi({
          status: 'error',
          message: 'Authentication Required',
          details: 'Your session has expired. Please login again and retry.',
        });
      } else if (status === 403) {
        setUi({
          status: 'error',
          message: 'Permission Denied',
          details: 'You do not have permission to connect WhatsApp for this organization.',
        });
      } else if (status === 400 && errorMessage.includes('state')) {
        setUi({
          status: 'error',
          message: 'Invalid or Expired Link',
          details: 'This authorization link is invalid or has expired. Please try again.',
        });
      } else {
        setUi({
          status: 'error',
          message: 'Connection Failed',
          details: errorMessage,
        });
      }

      notifyParent({
        type: 'META_CALLBACK_ERROR',
        error: errorMessage,
      });
    }
  };

  // ============================================
  // HELPER: Notify Parent Window
  // ============================================

  const notifyParent = (message: any): boolean => {
    try {
      if (window.opener && window.opener !== window) {
        console.log('📤 Notifying parent window:', message);
        window.opener.postMessage(message, window.location.origin);
        return true;
      }
    } catch (err) {
      console.warn('Could not notify parent window:', err);
    }
    return false;
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        {/* Status Icon */}
        <div className="mb-6">
          {ui.status === 'loading' && (
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-green-600 dark:text-green-400 animate-spin" />
            </div>
          )}
          {ui.status === 'success' && (
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-scale-in">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          )}
          {ui.status === 'error' && (
            <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
          )}
        </div>

        {/* Title */}
        <h1
          className={`text-2xl font-bold mb-2 ${ui.status === 'error'
              ? 'text-red-900 dark:text-red-200'
              : 'text-gray-900 dark:text-white'
            }`}
        >
          {ui.status === 'loading' && 'Connecting...'}
          {ui.status === 'success' && 'Connected!'}
          {ui.status === 'error' && 'Connection Failed'}
        </h1>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-4">{ui.message}</p>

        {/* Details */}
        {ui.details && (
          <div
            className={`text-sm mb-6 p-3 rounded-lg ${ui.status === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : ui.status === 'error'
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
          >
            {ui.details}
          </div>
        )}

        {/* Loading indicator */}
        {ui.status === 'loading' && (
          <div className="flex justify-center space-x-1 mb-4">
            <div
              className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <div
              className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <div
              className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        )}

        {/* Success redirect message */}
        {ui.status === 'success' && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {window.opener ? 'Closing window...' : 'Redirecting to dashboard...'}
          </p>
        )}

        {/* Error actions */}
        {ui.status === 'error' && (
          <div className="space-y-3">
            <button
              onClick={() => {
                if (window.opener) {
                  window.close();
                } else {
                  navigate('/settings/integrations', {
                    state: { tab: 'whatsapp' }
                  });
                }
              }}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                if (window.opener) {
                  window.close();
                } else {
                  navigate('/dashboard');
                }
              }}
              className="w-full py-3 px-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
            >
              {window.opener ? 'Close Window' : 'Return to Dashboard'}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span>Secure connection with Meta</span>
          </div>
        </div>
      </div>

      {/* Add scale-in animation */}
      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MetaCallback;