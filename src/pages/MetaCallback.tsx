import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
// import { meta } from '../services/api'; // Commented out for demo

const MetaCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to Meta...');
  
  // Ref to prevent double execution in Strict Mode
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
      
      // 🎥 DEMO MODE: Simulate successful connection
      console.log("Demo Mode: Simulating successful connection with code:", code);
      
      // Simulate API delay
      setTimeout(() => {
        setStatus('success');
        setMessage('Connected Successfully!');
        
        // Mock updating local storage to show connected state in dashboard
        // Note: Structure must match what useMetaConnection hook expects
        const mockConnection = {
          isConnected: true,
          isConnecting: false,
          businessName: "WabMeta Demo Business",
          phoneNumber: "+91 98765 43210",
          businessId: "BIZ_123456789",
          phoneNumberId: "PN_987654321",
          accessToken: "mock_access_token_xyz",
          qualityRating: "GREEN",
          messagingLimit: "1K/day",
          lastSync: new Date().toLocaleTimeString(),
          error: null,
          businessAccount: { // For compatibility with some components accessing nested object
            name: "WabMeta Demo Business",
            phoneNumber: "+91 98765 43210",
            qualityRating: "GREEN",
            messagingLimit: "1K/day"
          }
        };
        
        // ✅ Saving to both keys to ensure compatibility
        localStorage.setItem('metaConnection', JSON.stringify(mockConnection));
        localStorage.setItem('wabmeta_connection', JSON.stringify(mockConnection));
        
        // Redirect to dashboard
        setTimeout(() => navigate('/dashboard'), 2000);
      }, 2000);

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