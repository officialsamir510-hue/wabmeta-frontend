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

    if (error) {
      processedRef.current = true;
      setStatus('error');
      setMessage('Access denied by user.');
      return;
    }

    if (code) {
      processedRef.current = true;
      
      // 🚀 REAL BACKEND CALL (No Fakes)
      meta.connect({ code })
        .then((res) => {
          console.log("Connected Successfully:", res.data);
          
          // Save Connection State
          localStorage.setItem('wabmeta_connection', JSON.stringify({
            isConnected: true,
            businessAccount: { name: 'WhatsApp Business' } // Backend should send real name later
          }));

          setStatus('success');
          setMessage('Connected! Redirecting...');
          
          setTimeout(() => navigate('/dashboard'), 2000);
        })
        .catch((err) => {
          console.error("Meta Connect Failed:", err.response?.data || err);
          setStatus('error');
          setMessage("Failed to connect. Check console for details.");
        });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
        {status === 'loading' && <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />}
        {status === 'success' && <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />}
        {status === 'error' && <XCircle className="w-12 h-12 text-red-500 mx-auto" />}
        <h2 className="mt-4 text-xl font-bold">{message}</h2>
      </div>
    </div>
  );
};

export default MetaCallback;