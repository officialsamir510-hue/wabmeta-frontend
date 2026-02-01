import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { meta } from '../services/api';

const MetaCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to Meta...');
  
  // ✅ Prevent double execution (React 18 StrictMode causes double render)
  const processedRef = useRef(false);

  useEffect(() => {
    // ✅ Guard: Execute only once
    if (processedRef.current) return;
    processedRef.current = true;

    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorReason = searchParams.get('error_reason');
    const errorDescription = searchParams.get('error_description');

    console.log('📥 Meta Callback Received:', { code, error, errorReason });

    // ========================================
    // ❌ HANDLE ERROR FROM META
    // ========================================
    if (error) {
      const errorMsg = errorDescription || errorReason || 'Access denied by user';
      
      setStatus('error');
      setMessage(errorMsg);
      
      console.error('❌ Meta Authorization Error:', errorMsg);

      // ✅ If Popup Mode: Notify parent window
      if (window.opener) {
        window.opener.postMessage(
          { type: 'META_ERROR', error: errorMsg }, 
          window.location.origin
        );
        setTimeout(() => window.close(), 2000);
      } else {
        // ✅ Standalone Mode: Redirect to dashboard after 3 seconds
        setTimeout(() => navigate('/dashboard'), 3000);
      }
      return;
    }

    // ========================================
    // ✅ HANDLE SUCCESS WITH CODE
    // ========================================
    if (code) {
      console.log('✅ Authorization Code Received:', code);
      
      setStatus('loading');
      setMessage('Exchanging token with backend...');

      // ✅ ALWAYS call backend to exchange code for token
      // Whether in popup or standalone mode
      meta.connect({ code })
        .then((res) => {
          console.log('✅ Meta Connected Successfully:', res.data);
          
          // ✅ Update Local Storage (Optional - for UI state)
          const connectionData = {
            isConnected: true,
            businessAccount: res.data?.businessAccount || { 
              name: 'WhatsApp Business', 
              qualityRating: 'GREEN', 
              messagingLimit: '1K/day' 
            },
            phoneNumber: res.data?.phoneNumber || null,
            wabaId: res.data?.wabaId || null,
            lastSync: new Date().toISOString()
          };
          localStorage.setItem('wabmeta_connection', JSON.stringify(connectionData));

          setStatus('success');
          setMessage('Connected successfully!');

          // ✅ If Popup Mode: Notify parent and close
          if (window.opener) {
            console.log('📤 Sending success message to parent window');
            window.opener.postMessage(
              { 
                type: 'META_SUCCESS', 
                data: res.data 
              }, 
              window.location.origin
            );
            
            setTimeout(() => {
              console.log('🔒 Closing popup window');
              window.close();
            }, 1500);
          } 
          // ✅ Standalone Mode: Redirect to dashboard
          else {
            setTimeout(() => {
              console.log('🔄 Redirecting to dashboard');
              navigate('/dashboard');
            }, 2000);
          }
        })
        .catch((err) => {
          console.error('❌ Meta Connect Failed:', err);
          
          const errorMessage = err.response?.data?.message 
            || err.message 
            || 'Failed to exchange authorization token';
          
          setStatus('error');
          setMessage(errorMessage);

          // ✅ If Popup Mode: Notify parent of error
          if (window.opener) {
            window.opener.postMessage(
              { 
                type: 'META_ERROR', 
                error: errorMessage 
              }, 
              window.location.origin
            );
            setTimeout(() => window.close(), 2000);
          } else {
            // ✅ Standalone Mode: Redirect after showing error
            setTimeout(() => navigate('/dashboard'), 3000);
          }
        });

    } else {
      // ========================================
      // ❌ NO CODE AND NO ERROR
      // ========================================
      console.error('❌ No authorization code found in URL');
      
      setStatus('error');
      setMessage('No authorization code found. Please try again.');

      if (window.opener) {
        window.opener.postMessage(
          { type: 'META_ERROR', error: 'No code received' }, 
          window.location.origin
        );
        setTimeout(() => window.close(), 2000);
      } else {
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    }

  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-200">
        
        {/* ========================================
            LOADING STATE
        ======================================== */}
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Connecting...</h2>
            <p className="text-gray-500 mt-2 text-sm">{message}</p>
            <div className="mt-4 flex space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}

        {/* ========================================
            SUCCESS STATE
        ======================================== */}
        {status === 'success' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-scale-in">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Connected Successfully!</h2>
            <p className="text-gray-500 mt-2 text-sm">
              {window.opener ? 'Closing window...' : 'Redirecting to dashboard...'}
            </p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
              <div className="bg-green-600 h-1 rounded-full animate-progress"></div>
            </div>
          </div>
        )}

        {/* ========================================
            ERROR STATE
        ======================================== */}
        {status === 'error' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 animate-shake">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Connection Failed</h2>
            <p className="text-gray-600 mt-2 text-sm">{message}</p>
            
            {/* ✅ Show "Back to Dashboard" button only in standalone mode */}
            {!window.opener && (
              <button 
                onClick={() => navigate('/dashboard')}
                className="mt-6 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-all duration-200 transform hover:scale-105"
              >
                Back to Dashboard
              </button>
            )}

            {/* ✅ Auto-close message for popup mode */}
            {window.opener && (
              <p className="text-xs text-gray-400 mt-4">Window will close automatically...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetaCallback;