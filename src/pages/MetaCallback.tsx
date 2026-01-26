import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';

const MetaCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    // URL se gandagi saaf karo taaki user ko code na dikhe
    window.history.replaceState({}, document.title, "/meta-callback");

    // Fake Loading
    const timer = setTimeout(() => {
      setStatus('success');
      
      // Fake Data Save
      localStorage.setItem('wabmeta_connection', JSON.stringify({
        isConnected: true,
        businessAccount: {
          name: "WabMeta Business",
          phoneNumber: "+91 98765 43210",
          qualityRating: "GREEN",
          messagingLimit: "1K/day"
        }
      }));

      // Redirect
      setTimeout(() => navigate('/dashboard'), 2000);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
        {status === 'loading' ? (
          <>
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Connecting WhatsApp...</h2>
            <p className="text-gray-500 mt-2">Verifying credentials with Meta</p>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Success!</h2>
            <p className="text-green-600 font-medium mt-2">Your account is now connected.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default MetaCallback;