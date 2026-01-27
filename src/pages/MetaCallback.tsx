import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { meta } from '../services/api';

const MetaCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to Meta...');
  
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle Error from Meta
    if (error) {
      processedRef.current = true;
      setStatus('error');
      setMessage('Access denied by user.');
      
      // Notify parent if inside popup
      if (window.opener) {
        window.opener.postMessage({ type: 'META_ERROR', error: 'Access denied' }, '*');
        setTimeout(() => window.close(), 2000);
      }
      return;
    }

    // Handle Success Code
    if (code) {
      processedRef.current = true;
      
      // ✅ 1. IF POPUP MODE (Video/Demo flow)
      if (window.opener) {
        console.log("Popup detected. Sending message to parent...");
        
        // Notify Parent Window
        window.opener.postMessage({ type: 'META_SUCCESS', code }, '*');
        
        setStatus('success');
        setMessage('Connected! Closing window...');
        setTimeout(() => window.close(), 1500);
      } 
      
      // ✅ 2. IF STANDALONE MODE (Redirect flow)
      else {
        console.log("Standalone mode. Calling backend...");
        
        meta.connect({ code })
          .then((res) => {
            console.log("Connected Successfully:", res.data);
            
            // Update Local Storage for UI
            const connectionData = {
              isConnected: true,
              businessAccount: { 
                name: 'WhatsApp Business', 
                qualityRating: 'GREEN', 
                messagingLimit: '1K/day' 
              },
              lastSync: new Date().toISOString()
            };
            localStorage.setItem('wabmeta_connection', JSON.stringify(connectionData));

            setStatus('success');
            setTimeout(() => navigate('/dashboard'), 2000);
          })
          .catch((err) => {
            console.error("Meta Connect Failed:", err);
            setStatus('error');
            setMessage(err.response?.data?.message || "Failed to exchange token.");
          });
      }

    } else {
      processedRef.current = true;
      setStatus('error');
      setMessage('No authorization code found.');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
        
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Connecting...</h2>
            <p className="text-gray-500 mt-2 text-sm">Validating your WhatsApp Account</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Connected Successfully!</h2>
            <p className="text-gray-500 mt-2 text-sm">
              {window.opener ? 'Closing window...' : 'Redirecting...'}
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Connection Failed</h2>
            <p className="text-gray-600 mt-2 text-sm">{message}</p>
            
            {!window.opener && (
              <button 
                onClick={() => navigate('/dashboard')}
                className="mt-6 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-colors"
              >
                Back to Dashboard
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetaCallback;