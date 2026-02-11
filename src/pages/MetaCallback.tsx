// src/pages/MetaCallback.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';

type CallbackStatus = 'loading' | 'success' | 'error';

interface CallbackState {
  status: CallbackStatus;
  message: string;
  details?: string;
}

export const MetaCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<CallbackState>({
    status: 'loading',
    message: 'Processing your connection...',
  });
  
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent double processing
    if (processedRef.current) return;
    processedRef.current = true;

    handleCallback();
  }, []);

  const handleCallback = async () => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorReason = searchParams.get('error_reason');
    const errorDescription = searchParams.get('error_description');
    const stateParam = searchParams.get('state');

    // Handle OAuth error
    if (error) {
      setState({
        status: 'error',
        message: errorReason || 'Connection was cancelled',
        details: errorDescription || undefined,
      });
      return;
    }

    // Validate required params
    if (!code) {
      setState({
        status: 'error',
        message: 'Missing authorization code',
        details: 'Please try connecting again.',
      });
      return;
    }

    // Parse state to get organizationId
    let organizationId: string | null = null;
    
    if (stateParam) {
      try {
        const decodedState = JSON.parse(atob(stateParam));
        organizationId = decodedState.organizationId;
      } catch (e) {
        console.error('Failed to parse state:', e);
      }
    }

    // If no org ID from state, try to get from localStorage or context
    if (!organizationId) {
      organizationId = localStorage.getItem('currentOrganizationId');
    }

    if (!organizationId) {
      setState({
        status: 'error',
        message: 'Organization context lost',
        details: 'Please go back to dashboard and try again.',
      });
      return;
    }

    try {
      setState({
        status: 'loading',
        message: 'Connecting your WhatsApp Business account...',
      });

      const response = await api.post('/meta/callback', {
        code,
        organizationId,
      });

      if (response.data.success) {
        setState({
          status: 'success',
          message: 'WhatsApp Business connected successfully!',
          details: response.data.data.account?.displayPhoneNumber,
        });

        // Redirect to dashboard after delay
        setTimeout(() => {
          navigate('/dashboard', {
            state: {
              notification: {
                type: 'success',
                message: 'WhatsApp Business account connected!',
              },
            },
          });
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Connection failed');
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to complete connection';

      setState({
        status: 'error',
        message: errorMessage,
        details: 'Please try again or contact support.',
      });
    }
  };

  const handleRetry = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Status Icon */}
        <div className="mb-6">
          {state.status === 'loading' && (
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
            </div>
          )}
          {state.status === 'success' && (
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce-once">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          )}
          {state.status === 'error' && (
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          )}
        </div>

        {/* Message */}
        <h1
          className={`text-2xl font-bold mb-2 ${
            state.status === 'error' ? 'text-red-900' : 'text-gray-900'
          }`}
        >
          {state.status === 'loading' && 'Connecting...'}
          {state.status === 'success' && 'Connected!'}
          {state.status === 'error' && 'Connection Failed'}
        </h1>

        <p className="text-gray-600 mb-4">{state.message}</p>

        {state.details && (
          <p className="text-sm text-gray-500 mb-6">{state.details}</p>
        )}

        {/* Actions */}
        {state.status === 'error' && (
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
            >
              Return to Dashboard
            </button>
            <a
              href="mailto:support@wabmeta.com"
              className="block w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Contact Support
            </a>
          </div>
        )}

        {state.status === 'success' && (
          <p className="text-sm text-gray-500">
            Redirecting to dashboard...
          </p>
        )}

        {/* Progress indicators for loading */}
        {state.status === 'loading' && (
          <div className="mt-8">
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetaCallback;