import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { meta } from '../services/api'; // Import API Service

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

    if (error) {
      processedRef.current = true;
      setStatus('error');
      setMessage('Access denied by user.');
      return;
    }

    if (code) {
      processedRef.current = true;
      
      // 🚀 REAL BACKEND CALL
      meta.connect({ code })
        .then((res) => {
          console.log("Connected:", res.data);
          
          // Save real data to local storage so Dashboard updates
          localStorage.setItem('wabmeta_connection', JSON.stringify({
            isConnected: true,
            businessAccount: res.data.account || { name: 'WhatsApp Business' } // Backend should return account details
          }));

          setStatus('success');
          setTimeout(() => navigate('/dashboard'), 2000);
        })
        .catch((err) => {
          console.error("Meta Connect Failed:", err);
          setStatus('error');
          setMessage("Failed to exchange token with backend.");
        });

    } else {
      setStatus('error');
      setMessage('No code found in URL.');
    }
  }, [searchParams]);

  return (
    // ... JSX same as before (Loader/Success/Error UI)
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold">Connecting...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold">Connected!</h2>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold">Failed</h2>
            <p className="text-red-500">{message}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default MetaCallback;