// src/pages/MetaCallback.tsx

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MetaCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your connection...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Check for OAuth errors
        if (error) {
          setStatus('error');
          setMessage(errorDescription || 'Authorization denied');
          
          // Notify parent window if in popup
          if (window.opener) {
            window.opener.postMessage({
              type: 'META_OAUTH_ERROR',
              error: errorDescription || error
            }, window.location.origin);
            
            setTimeout(() => {
              window.close();
            }, 3000);
          }
          return;
        }

        // Check for code and state
        if (!code || !state) {
          setStatus('error');
          setMessage('Invalid callback parameters');
          return;
        }

        // Send code to backend
        const response = await fetch(`${import.meta.env.VITE_API_URL}/meta/auth/callback`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code, state })
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('WhatsApp Business Account connected successfully!');
          
          // Notify parent window if in popup
          if (window.opener) {
            window.opener.postMessage({
              type: 'META_OAUTH_SUCCESS',
              data: data.data
            }, window.location.origin);
            
            setTimeout(() => {
              window.close();
            }, 2000);
          } else {
            // If not in popup, redirect to dashboard
            toast.success('WhatsApp connected successfully!');
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          }
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to connect WhatsApp account');
          
          if (window.opener) {
            window.opener.postMessage({
              type: 'META_OAUTH_ERROR',
              error: data.error
            }, window.location.origin);
          }
        }

      } catch (error: any) {
        console.error('Callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred');
        
        if (window.opener) {
          window.opener.postMessage({
            type: 'META_OAUTH_ERROR',
            error: 'Unexpected error occurred'
          }, window.location.origin);
        }
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center">
          {/* Status Icon */}
          <div className="mb-6 flex justify-center">
            {status === 'processing' && (
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'processing' && 'Connecting WhatsApp'}
            {status === 'success' && 'Connected!'}
            {status === 'error' && 'Connection Failed'}
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {/* Additional Info */}
          {status === 'processing' && (
            <p className="text-sm text-gray-500">
              Please wait while we complete the connection...
            </p>
          )}

          {status === 'success' && (
            <p className="text-sm text-green-600">
              Redirecting to dashboard...
            </p>
          )}

          {status === 'error' && (
            <div className="space-y-3 mt-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition"
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