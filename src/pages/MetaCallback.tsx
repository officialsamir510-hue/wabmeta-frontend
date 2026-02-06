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

        console.log('Callback params:', { code: code?.slice(0, 10), state: state?.slice(0, 10), error });

        if (error) {
          setStatus('error');
          setMessage(errorDescription || 'Authorization denied');
          
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

        if (!code || !state) {
          setStatus('error');
          setMessage('Invalid callback parameters');
          return;
        }

        // ✅ IMPORTANT: Ensure correct API URL with version
        const apiUrl = import.meta.env.VITE_API_URL || 'https://wabmeta-api.onrender.com/api/v1';
        const callbackUrl = `${apiUrl}/meta/auth/callback`;
        
        console.log('Calling backend:', callbackUrl);

        const response = await fetch(callbackUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code, state })
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Backend error:', errorText);
          throw new Error(`Backend error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('WhatsApp Business Account connected successfully!');
          
          if (window.opener) {
            window.opener.postMessage({
              type: 'META_OAUTH_SUCCESS',
              data: data.data
            }, window.location.origin);
            
            setTimeout(() => {
              window.close();
            }, 2000);
          } else {
            toast.success('WhatsApp connected successfully!');
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          }
        } else {
          throw new Error(data.error || 'Failed to connect');
        }

      } catch (error: any) {
        console.error('Callback error:', error);
        setStatus('error');
        setMessage(error.message || 'An unexpected error occurred');
        
        if (window.opener) {
          window.opener.postMessage({
            type: 'META_OAUTH_ERROR',
            error: error.message
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

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'processing' && 'Connecting WhatsApp'}
            {status === 'success' && 'Connected!'}
            {status === 'error' && 'Connection Failed'}
          </h2>

          <p className="text-gray-600 mb-6">{message}</p>

          {status === 'error' && (
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetaCallback;