import React, { useState, useEffect } from "react";
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
  Key,
} from "lucide-react";
import type { WhatsAppBusinessAccount } from "../../types/meta";

interface MetaConnectModalProps {
  isOpen: boolean;
  onClose: () => void;

  // kept for compatibility with your existing parent code
  onConnect: (accessToken: string, account: WhatsAppBusinessAccount) => void;

  isConnecting?: boolean;
}

type Step = "intro" | "manual-setup" | "connecting" | "success" | "error";

const MetaConnectModal: React.FC<MetaConnectModalProps> = ({ isOpen, onClose, onConnect }) => {
  const [step, setStep] = useState<Step>("intro");
  const [error, setError] = useState<string | null>(null);

  // Manual Setup Form State (UI only – backend doesn’t support it yet)
  const [manualFormData, setManualFormData] = useState({
    wabaId: "",
    phoneNumberId: "",
    accessToken: "",
    businessName: "",
    phoneNumber: "",
  });

  // ✅ Listen for OAuth success message from MetaCallback popup
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (event: MessageEvent) => {
      // We expect message from same origin (your MetaCallback page)
      if (event.origin !== window.location.origin) return;

      const data = event.data;

      if (data?.type === "META_SUCCESS") {
        // payload is backend response from /whatsapp/connect
        const payload = data.payload;

        // Save connection marker for your UI/hooks
        const connectionData = {
          isConnected: true,
          isConnecting: false,
          lastSync: new Date().toISOString(),
          payload,
        };

        localStorage.setItem("wabmeta_connection", JSON.stringify(connectionData));
        localStorage.setItem("metaConnection", JSON.stringify(connectionData));

        setStep("success");

        // Call parent callback (access token is not returned to frontend in our backend flow)
        onConnect("", {
          id: payload?.data?.id || payload?.id || manualFormData.wabaId || "WABA",
          name: payload?.data?.displayName || payload?.displayName || "WhatsApp Business",
          phoneNumber: payload?.data?.phoneNumber || payload?.phoneNumber || "",
          phoneNumberId: payload?.data?.phoneNumberId || payload?.phoneNumberId || "",
          verificationStatus: "verified",
          qualityRating: payload?.data?.qualityRating || payload?.qualityRating || "UNKNOWN",
          messagingLimit: "N/A",
        });

        setTimeout(() => {
          onClose();
          // optional: reload to reflect connection status everywhere
          window.location.reload();
        }, 1200);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isOpen, onClose, onConnect, manualFormData.wabaId]);

  const handleMetaLogin = () => {
    const appId = import.meta.env.VITE_META_APP_ID || "881518987956566";
    const redirectUri = `${window.location.origin}/meta-callback`;

    const authUrl =
      `https://www.facebook.com/v18.0/dialog/oauth` +
      `?client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=whatsapp_business_management,whatsapp_business_messaging,business_management`;

    const width = 600;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(authUrl, "MetaLogin", `width=${width},height=${height},top=${top},left=${left}`);
    setStep("connecting");
  };

  // ✅ Manual setup currently NOT supported by backend (clean contract)
  const handleManualSetup = async () => {
    setError(
      "Manual setup is not supported in this version. Please use 'Continue with Facebook' OAuth connection."
    );
    setStep("error");
  };

  const handleRetry = () => {
    setError(null);
    setStep("intro");
  };

  const resetModal = () => {
    setStep("intro");
    setError(null);
    setManualFormData({
      wabaId: "",
      phoneNumberId: "",
      accessToken: "",
      businessName: "",
      phoneNumber: "",
    });
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetModal, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="relative bg-linear-to-r from-[#1877F2] to-[#0668E1] p-6 text-white">
          <button onClick={handleClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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
          {step === "intro" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Connect Your WhatsApp Business</h3>
                <p className="text-gray-500">Link your WhatsApp Business Account to start sending messages.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Zap, text: "Bulk Messaging" },
                  { icon: MessageSquare, text: "Live Chat" },
                  { icon: Shield, text: "Secure API" },
                  { icon: Building2, text: "Business Verified" },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
                    <feature.icon className="w-5 h-5 text-primary-500" />
                    <span className="text-sm font-medium text-gray-700">{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleMetaLogin}
                  className="w-full flex items-center justify-center space-x-3 py-4 bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02]"
                >
                  <span>Continue with Facebook</span>
                  <ExternalLink className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-3">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-sm text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <button
                  onClick={() => setStep("manual-setup")}
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

          {/* Step: Manual Setup (disabled) */}
          {step === "manual-setup" && (
            <div className="space-y-5">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Manual Setup</h3>
                <p className="text-gray-500 text-sm">
                  Manual setup is currently not supported. Use OAuth connection instead.
                </p>
              </div>

              <div className="space-y-4 opacity-60 pointer-events-none">
                <input className="w-full px-4 py-2 border rounded-xl" placeholder="Business Name" />
                <input className="w-full px-4 py-2 border rounded-xl" placeholder="Phone Number" />
                <input className="w-full px-4 py-2 border rounded-xl" placeholder="WABA ID" />
                <input className="w-full px-4 py-2 border rounded-xl" placeholder="Phone Number ID" />
                <input className="w-full px-4 py-2 border rounded-xl" placeholder="Access Token" />
              </div>

              <div className="flex space-x-3 pt-2">
                <button onClick={() => setStep("intro")} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">
                  Back
                </button>
                <button onClick={handleManualSetup} className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors">
                  Connect
                </button>
              </div>
            </div>
          )}

          {/* Step: Connecting */}
          {step === "connecting" && (
            <div className="py-12 text-center">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">Connecting...</h3>
              <p className="text-gray-500">Please complete the login in the popup window.</p>
            </div>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="py-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">Connected!</h3>
              <p className="text-gray-500">Your WhatsApp account is now linked.</p>
            </div>
          )}

          {/* Step: Error */}
          {step === "error" && (
            <div className="py-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">Connection Failed</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button onClick={handleRetry} className="px-6 py-2 bg-primary-500 text-white rounded-xl">
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetaConnectModal;