import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';

const MetaCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    // 1. Fake Loading (2 sec)
    setTimeout(() => {
      setStatus('success');
      
      // 2. Set Fake Data
      const mockData = {
        isConnected: true,
        businessAccount: {
          id: "123",
          name: "WabMeta Demo Business",
          phoneNumber: "+91 98765 43210",
          phoneNumberId: "123456",
          verificationStatus: "verified",
          qualityRating: "GREEN",
          messagingLimit: "1K/day"
        }
      };
      // ✅ Key name must match hook
      localStorage.setItem('wabmeta_connection', JSON.stringify(mockData));

      // 3. Redirect back to Dashboard
      setTimeout(() => navigate('/dashboard'), 2000);
    }, 2000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
        {status === 'loading' ? (
          <>
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold">Connecting WhatsApp...</h2>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold">Success!</h2>
            <p>Redirecting you back...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default MetaCallback;