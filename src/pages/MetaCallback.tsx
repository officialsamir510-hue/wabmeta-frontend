// src/pages/MetaCallback.tsx

import React, { useEffect, useState, useRef } from 'react';
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

// ============================================
// HELPERS
// ============================================

const safeParseState = (stateParam: string | null): {
  organizationId?: string;
  userId?: string;
  timestamp?: number;
  nonce?: string;
} | null => {
  if (!stateParam) return null;
  try {
    const json = atob(stateParam);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

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
    if (processedRef.current) return;
    processedRef.current = true;
    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCallback = async () => {
    // Get URL parameters
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorReason = searchParams.get('error_reason');
    const errorDescription = searchParams.get('error_description');
    const stateParam = searchParams.get('state');

    console.log('🔄 MetaCallback processing...', {
      hasCode: !!code,
      hasError: !!error,
      hasState: !!stateParam,
    });

    // Handle OAuth errors
    if (error) {
      console.error('❌ OAuth error:', { error, errorReason, errorDescription });
      setUi({
        status: 'error',
        message: errorReason || 'Connection cancelled',
        details: errorDescription || 'Please try connecting again.',
      });
      return;
    }

    // Check for authorization code
    if (!code) {
      setUi({
        status: 'error',
        message: 'Missing authorization code',
        details: 'Please try connecting again.',
      });
      return;
    }

    // Parse state and get organization ID
    const decoded = safeParseState(stateParam);
    let organizationId =
      decoded?.organizationId ||
      localStorage.getItem('meta_connection_org_id') ||
      localStorage.getItem('currentOrganizationId') ||
      null;

    console.log('📋 Organization ID:', organizationId);

    if (!organizationId) {
      setUi({
        status: 'error',
        message: 'Organization context lost',
        details: 'Please go back and try connecting again.',
      });
      return;
    }

    // Check state age (10 minute expiry)
    if (decoded?.timestamp) {
      const age = Date.now() - decoded.timestamp;
      const tenMinutes = 10 * 60 * 1000;

      if (age > tenMinutes) {
        console.warn('⚠️ State expired:', { age, maxAge: tenMinutes });
        setUi({
          status: 'error',
          message: 'Authorization expired',
          details: 'Please try connecting again.',
        });
        return;
      }
    }

    // Complete the connection
    try {
      setUi({
        status: 'loading',
        message: 'Connecting your WhatsApp Business account...'
      });

      console.log('🔄 Sending callback to server...');

      const response = await api.post('/meta/callback', {
        code,
        organizationId
      });

      console.log('📥 Server response:', response.data);

      if (response.data?.success) {
        const account = response.data.data?.account;

        console.log('✅ Connection successful:', account);

        setUi({
          status: 'success',
          message: 'WhatsApp Business connected successfully!',
          details: account?.displayName || account?.phoneNumber || 'Account connected',
        });

        // Clean up localStorage
        localStorage.removeItem('meta_connection_org_id');
        localStorage.removeItem('meta_connection_timestamp');

        // ✅ Notify opener window if this is a popup flow
        try {
          if (window.opener && window.opener !== window) {
            console.log('📤 Notifying opener window...');
            window.opener.postMessage(
              {
                type: 'META_OAUTH_SUCCESS',
                account: account,
              },
              window.location.origin
            );

            // Close popup after short delay
            setTimeout(() => {
              console.log('🔒 Closing popup...');
              window.close();
            }, 1000);
            return;
          }
        } catch (popupError) {
          console.warn('Could not notify opener:', popupError);
        }

        // ✅ Fallback: Redirect to dashboard
        setTimeout(() => {
          console.log('➡️ Redirecting to dashboard...');
          navigate('/dashboard', {
            replace: true,
            state: {
              metaConnected: true,
              message: 'WhatsApp account connected successfully!'
            }
          });
        }, 1500);

      } else {
        throw new Error(response.data?.message || 'Connection failed');
      }
    } catch (err: any) {
      console.error('❌ Connection error:', err);

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to complete connection';

      setUi({
        status: 'error',
        message: errorMessage,
        details: 'Please try again or contact support.'
      });
    }
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
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-pulse">
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
        <h1 className={`text-2xl font-bold mb-2 ${ui.status === 'error'
            ? 'text-red-900 dark:text-red-200'
            : 'text-gray-900 dark:text-white'
          }`}>
          {ui.status === 'loading' && 'Connecting...'}
          {ui.status === 'success' && 'Connected!'}
          {ui.status === 'error' && 'Connection Failed'}
        </h1>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {ui.message}
        </p>

        {/* Details */}
        {ui.details && (
          <p className={`text-sm mb-6 ${ui.status === 'success'
              ? 'text-green-600 dark:text-green-400 font-medium'
              : 'text-gray-500 dark:text-gray-400'
            }`}>
            {ui.details}
          </p>
        )}

        {/* Loading indicator */}
        {ui.status === 'loading' && (
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}

        {/* Success redirect message */}
        {ui.status === 'success' && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Redirecting to dashboard...
          </p>
        )}

        {/* Error actions */}
        {ui.status === 'error' && (
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard/settings', { state: { tab: 'whatsapp' } })}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 px-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
            >
              Return to Dashboard
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
    </div>
  );
};

export default MetaCallback;