// src/pages/MetaCallback.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { meta } from '../services/api';

type CallbackStatus = 'processing' | 'success' | 'error';

const MetaCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<CallbackStatus>('processing');
  const [message, setMessage] = useState('Processing your connection...');
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    handleCallback();
  }, []);

  /**
   * Notify the opener window (if opened as popup)
   */
  const notifyOpener = (
    type: 'META_OAUTH_SUCCESS' | 'META_OAUTH_ERROR' | 'META_CONNECTED',
    data?: Record<string, any>
  ) => {
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage({ type, ...data }, window.location.origin);
        console.log('📤 Notified opener:', type);
      } catch (err) {
        console.error('Failed to post message to opener:', err);
      }
    }
  };

  /**
   * Handle the OAuth callback
   */
  const handleCallback = async () => {
    try {
      // Extract URL parameters
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      console.log('🔗 Meta callback received:', {
        code: code ? code.substring(0, 20) + '...' : 'missing',
        state: state ? state.substring(0, 10) + '...' : 'missing',
        error: error || 'none',
      });

      // Handle OAuth errors from Meta
      if (error) {
        const errorMsg = errorDescription || error || 'Authorization denied';
        throw new Error(errorMsg);
      }

      // Validate required parameters
      if (!code) {
        throw new Error('No authorization code received');
      }

      if (!state) {
        throw new Error('Missing state parameter');
      }

      setMessage('Exchanging authorization code...');

      // Check for auth token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      // Connect via API service
      let response;
      try {
        // Try using the API service first
        response = await meta.connect({ code, state });
      } catch (apiError: any) {
        // Fallback to direct fetch if API service fails
        console.warn('API service failed, trying direct fetch...');
        
        const apiUrl = import.meta.env.VITE_API_URL || 'https://wabmeta-api.onrender.com/api/v1';
        const fetchResponse = await fetch(`${apiUrl}/meta/auth/callback`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        });

        if (!fetchResponse.ok) {
          let errorMessage = `Server error: ${fetchResponse.status}`;
          try {
            const errorData = await fetchResponse.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            const errorText = await fetchResponse.text();
            if (errorText) errorMessage = errorText;
          }
          throw new Error(errorMessage);
        }

        response = { data: await fetchResponse.json() };
      }

      console.log('✅ Backend response:', response.data);

      // Check for success
      if (response.data?.success) {
        setStatus('success');
        setMessage('WhatsApp Business Account connected successfully!');

        // Notify opener window
        notifyOpener('META_OAUTH_SUCCESS', { data: response.data.data });
        notifyOpener('META_CONNECTED', { data: response.data.data });

        // Handle navigation
        if (window.opener && !window.opener.closed) {
          // Close popup after short delay
          setTimeout(() => window.close(), 2000);
        } else {
          // Redirect to dashboard if not in popup
          toast.success('WhatsApp connected successfully!');
          setTimeout(() => {
            navigate('/dashboard/settings?tab=whatsapp&connected=true', {
              replace: true,
            });
          }, 2000);
        }
      } else {
        throw new Error(
          response.data?.error ||
            response.data?.message ||
            'Failed to connect WhatsApp'
        );
      }
    } catch (error: any) {
      console.error('❌ Callback error:', error);

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred';

      setStatus('error');
      setMessage(errorMessage);

      // Notify opener of error
      notifyOpener('META_OAUTH_ERROR', { error: errorMessage });

      // Handle navigation on error
      if (window.opener && !window.opener.closed) {
        setTimeout(() => window.close(), 3000);
      }
    }
  };

  /**
   * Retry connection
   */
  const handleRetry = () => {
    if (window.opener && !window.opener.closed) {
      window.close();
    } else {
      navigate('/dashboard/settings?tab=whatsapp');
    }
  };

  /**
   * Go back to dashboard
   */
  const handleBackToDashboard = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-green-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center">
          {/* Status Icon */}
          <div className="mb-6 flex justify-center">
            {status === 'processing' && (
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {status === 'processing' && 'Connecting WhatsApp'}
            {status === 'success' && 'Connected Successfully!'}
            {status === 'error' && 'Connection Failed'}
          </h2>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>

          {/* Success info */}
          {status === 'success' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {window.opener
                  ? 'This window will close automatically...'
                  : 'Redirecting to dashboard...'}
              </p>
              {/* Success animation */}
              <div className="flex justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce mx-1" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce mx-1" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce mx-1" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Error actions */}
          {status === 'error' && (
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Try Again
              </button>
              <button
                onClick={handleBackToDashboard}
                className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2.5 px-4 rounded-lg transition"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetaCallback;