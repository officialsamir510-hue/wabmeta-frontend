import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Shield,
  Zap,
  Building2,
  AlertCircle,
  Key
} from 'lucide-react';
import type { WhatsAppBusinessAccount } from '../../types/meta';
import { meta } from '../../services/api';

interface MetaConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (accessToken: string, account: WhatsAppBusinessAccount) => void;
  isConnecting?: boolean;
}

type Step = 'intro' | 'manual-setup' | 'connecting' | 'success' | 'error';

const MetaConnectModal: React.FC<MetaConnectModalProps> = ({
  isOpen,
  onClose,
  onConnect
}) => {
  const [step, setStep] = useState<Step>('intro');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Manual Setup Form State
  const [manualFormData, setManualFormData] = useState({
    wabaId: '',
    phoneNumberId: '',
    accessToken: '',
    businessName: '',
    phoneNumber: ''
  });

  // Effect to listen for OAuth popup success
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Security Check
      if (event.origin !== "https://business.facebook.com" && event.origin !== "https://www.facebook.com" && event.origin !== window.location.origin) return;

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        // OAuth Success
        if (data.type === 'WA_EMBEDDED_SIGNUP' && data.event === 'FINISH') {
          // This part is handled by the callback page usually, but kept for completeness
          const { code } = data.data;
          console.log("🔹 Meta Auth Code Received:", code);
        }
      } catch (e) {
        // Ignore parsing errors
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Handle Meta OAuth Login (Opens Popup)
  const handleMetaLogin = () => {
    const appId = import.meta.env.VITE_META_APP_ID || "881518987956566"; 
    const redirectUri = `${window.location.origin}/meta-callback`; 

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=whatsapp_business_management,whatsapp_business_messaging,business_management`;
    
    const width = 600;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(authUrl, "MetaLogin", `width=${width},height=${height},top=${top},left=${left}`);
    setStep('connecting');
  };

  // ✅ Handle Manual Setup Submit
  const handleManualSetup = async () => {
    if (!manualFormData.wabaId || !manualFormData.accessToken) {
      setError("WABA ID and Access Token are required.");
      return;
    }

    setIsLoading(true);
    setStep('connecting');
    setError(null);

    try {
      // 🚀 Real Backend Call using centralized API
      const response = await meta.connect({
        wabaId: manualFormData.wabaId.trim(),
        phoneNumberId: manualFormData.phoneNumberId.trim(),
        accessToken: manualFormData.accessToken.trim(),
        businessName: manualFormData.businessName.trim(),
        phoneNumber: manualFormData.phoneNumber.trim()
      });

      if (response.data.success || response.data.connected) {
        setStep('success');
        
        // Update Local State immediately for UI responsiveness
        const connectionData = {
          isConnected: true,
          isConnecting: false,
          businessAccount: {
            name: manualFormData.businessName || 'WhatsApp Business',
            phoneNumber: manualFormData.phoneNumber || 'Not Available',
            qualityRating: "GREEN", // Default assumption
            messagingLimit: "250/day" // Default assumption
          },
          lastSync: new Date().toISOString()
        };
        
        localStorage.setItem('wabmeta_connection', JSON.stringify(connectionData));
        localStorage.setItem('metaConnection', JSON.stringify(connectionData));

        // Call onConnect to notify parent
        onConnect(
          manualFormData.accessToken, 
          {
            id: manualFormData.wabaId,
            name: manualFormData.businessName,
            phoneNumber: manualFormData.phoneNumber,
            phoneNumberId: manualFormData.phoneNumberId,
            verificationStatus: 'verified',
            qualityRating: 'GREEN',
            messagingLimit: '250/day'
          }
        );

        setTimeout(() => {
          onClose();
          window.location.reload(); // Refresh to update Dashboard immediately
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Connection failed');
      }
    } catch (err: any) {
      console.error("Connect Error:", err);
      setError(err.response?.data?.message || "Invalid Credentials or Server Error. Please try again.");
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setStep('intro');
    setIsLoading(false);
  };

  const resetModal = () => {
    setStep('intro');
    setError(null);
    setIsLoading(false);
    setManualFormData({
      wabaId: '',
      phoneNumberId: '',
      accessToken: '',
      businessName: '',
      phoneNumber: ''
    });
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetModal, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="relative bg-linear-to-r from-[#1877F2] to-[#0668E1] p-6 text-white">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">Connect with Meta</h2>
              <p className="text-white/80 text-sm">WhatsApp Business API</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Step: Intro */}
          {step === 'intro' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Connect Your WhatsApp Business
                </h3>
                <p className="text-gray-500">
                  Link your WhatsApp Business Account to start sending messages.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Zap, text: 'Bulk Messaging' },
                  { icon: MessageSquare, text: 'Live Chat' },
                  { icon: Shield, text: 'Secure API' },
                  { icon: Building2, text: 'Business Verified' },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
                    <feature.icon className="w-5 h-5 text-primary-500" />
                    <span className="text-sm font-medium text-gray-700">{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {/* OAuth Button */}
                <button
                  onClick={handleMetaLogin}
                  className="w-full flex items-center justify-center space-x-3 py-4 bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02]"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Continue with Facebook</span>
                  <ExternalLink className="w-4 h-4" />
                </button>

                {/* Divider */}
                <div className="flex items-center space-x-3">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-sm text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Manual Setup Button */}
                <button
                  onClick={() => setStep('manual-setup')}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                >
                  <Key className="w-5 h-5" />
                  <span>Manual Setup with API Keys</span>
                </button>
              </div>

              <p className="text-xs text-center text-gray-500">
                By connecting, you agree to Meta's Terms of Service and Privacy Policy
              </p>
            </div>
          )}

          {/* Step: Manual Setup */}
          {step === 'manual-setup' && (
            <div className="space-y-5">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Manual Setup</h3>
                <p className="text-gray-500 text-sm">Enter API credentials from Meta Developer Portal</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={manualFormData.businessName}
                    onChange={(e) => setManualFormData({ ...manualFormData, businessName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="My Business"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={manualFormData.phoneNumber}
                    onChange={(e) => setManualFormData({ ...manualFormData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WABA ID</label>
                  <input
                    type="text"
                    value={manualFormData.wabaId}
                    onChange={(e) => setManualFormData({ ...manualFormData, wabaId: e.target.value })}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="10001234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number ID</label>
                  <input
                    type="text"
                    value={manualFormData.phoneNumberId}
                    onChange={(e) => setManualFormData({ ...manualFormData, phoneNumberId: e.target.value })}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="10009876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Permanent Access Token</label>
                  <input
                    type="password"
                    value={manualFormData.accessToken}
                    onChange={(e) => setManualFormData({ ...manualFormData, accessToken: e.target.value })}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="EAAG..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button onClick={() => setStep('intro')} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">Back</button>
                <button onClick={handleManualSetup} disabled={isLoading} className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors disabled:opacity-70 flex justify-center">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Connect'}
                </button>
              </div>
            </div>
          )}

          {/* Step: Connecting */}
          {step === 'connecting' && (
            <div className="py-12 text-center">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">Connecting...</h3>
              <p className="text-gray-500">Please complete the login in the popup window.</p>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="py-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">Connected!</h3>
              <p className="text-gray-500">Your WhatsApp account is now linked.</p>
            </div>
          )}

          {/* Step: Error */}
          {step === 'error' && (
            <div className="py-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">Connection Failed</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button onClick={handleRetry} className="px-6 py-2 bg-primary-500 text-white rounded-xl">Try Again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetaConnectModal;