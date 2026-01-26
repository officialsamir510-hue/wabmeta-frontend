import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MetaCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your connection...');

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (code) {
      exchangeToken(code);
    } else if (errorParam) {
      setStatus('error');
      setMessage('Authorization was cancelled or failed.');
    } else {
      setStatus('error');
      setMessage('No authorization code found in the URL.');
    }
  }, [searchParams]);

  const exchangeToken = async (code: string) => {
    try {
      const token = localStorage.getItem('wabmeta_token') || localStorage.getItem('token');

      // Send the code to the backend
      const response = await axios.post(
        `${API_URL}/api/meta/callback`,
        { code },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          }
        }
      );

      if (response.data) {
        setStatus('success');
        setMessage('WhatsApp Business connected successfully!');
        
        // Optional: Update local user state or cache if necessary
        // localStorage.setItem('user_settings', JSON.stringify(response.data.user));

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Meta Callback Error:', err);
      setStatus('error');
      setMessage(
        err.response?.data?.message || 
        'Failed to connect with Meta. Please try again.'
      );
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Finalizing Connection</h2>
            <p className="text-gray-500 mt-2">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Success!</h2>
            <p className="text-gray-500 mt-2">{message}</p>
            <p className="text-sm text-gray-400 mt-4">Redirecting you back...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Connection Failed</h2>
            <p className="text-red-500 mt-2">{message}</p>
            <button 
              onClick={handleBack}
              className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Back to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MetaCallback;