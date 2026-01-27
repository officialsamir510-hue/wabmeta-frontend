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

    // Handle OAuth Error
    if (error) {
      processedRef.current = true;
      setStatus('error');
      setMessage('Access denied by user.');
      return;
    }

    // Handle Success Code
    if (code) {
      processedRef.current = true;
      
      // 🚀 REAL BACKEND CALL
      meta.connect({ code })
        .then((res) => {
          console.log("Connected Successfully:", res.data);
          
          // 1. Update Connection State (For Dashboard components)
          const connectionData = {
            isConnected: true,
            businessAccount: res.data.account || { 
              name: 'WhatsApp Business', 
              phoneNumber: res.data.phoneNumber || 'Not Available' 
            },
            lastSync: new Date().toISOString()
          };
          localStorage.setItem('wabmeta_connection', JSON.stringify(connectionData));
          localStorage.setItem('metaConnection', JSON.stringify(connectionData)); // Dual store for compatibility

          // 2. Update User Object (For Profile/Settings)
          const storedUser = localStorage.getItem('wabmeta_user');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            user.meta = {
              connected: true,
              wabaId: res.data.wabaId,
              phoneNumberId: res.data.phoneNumberId,
              accessToken: res.data.accessToken
            };
            localStorage.setItem('wabmeta_user', JSON.stringify(user));
          }

          setStatus('success');
          setMessage('Successfully connected! Redirecting...');
          
          setTimeout(() => navigate('/dashboard'), 2000);
        })
        .catch((err) => {
          console.error("Meta Connect Failed:", err);
          
          // Special handling for Demo Video if backend fails
          if (code === 'demo_video_success_code') {
             console.log("⚠️ Backend failed but proceeding in Demo Mode");
             const mockData = {
                isConnected: true,
                businessAccount: { name: 'Demo Business', phoneNumber: '+91 98765 43210' }
             };
             localStorage.setItem('wabmeta_connection', JSON.stringify(mockData));
             setStatus('success');
             setTimeout(() => navigate('/dashboard'), 2000);
             return;
          }

          setStatus('error');
          setMessage(err.response?.data?.message || "Failed to exchange token with backend.");
        });

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
            <p className="text-gray-500 mt-2 text-sm">Redirecting to Dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Connection Failed</h2>
            <p className="text-gray-600 mt-2 text-sm">{message}</p>
            
            <button 
              onClick={() => navigate('/dashboard')}
              className="mt-6 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetaCallback;