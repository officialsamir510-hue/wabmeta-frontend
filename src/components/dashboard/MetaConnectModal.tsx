// src/components/dashboard/MetaConnectModal.tsx

import React, { useEffect, useRef, useState } from "react";
import { X, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface MetaConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect?: () => void | Promise<void>;
}

export const MetaConnectModal: React.FC<MetaConnectModalProps> = ({ 
  isOpen, 
  onClose, 
  onConnect 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const popupRef = useRef<Window | null>(null);
  const messageListenerRef = useRef<((event: MessageEvent) => void) | null>(null);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      popupRef.current?.close();
      popupRef.current = null;
      setLoading(false);
      setError("");
      
      // Remove message listener if exists
      if (messageListenerRef.current) {
        window.removeEventListener("message", messageListenerRef.current);
        messageListenerRef.current = null;
      }
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      popupRef.current?.close();
      if (messageListenerRef.current) {
        window.removeEventListener("message", messageListenerRef.current);
      }
    };
  }, []);

  const handleConnectWhatsApp = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔗 Requesting Meta auth URL...");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/meta/auth/url`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      console.log("📥 Auth URL response:", data);

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || data?.message || "Failed to get authorization URL");
      }

      // Handle both response structures: data.authUrl or data.data.url
      const authUrl = data?.data?.authUrl || data?.data?.url || data?.authUrl;
      
      if (!authUrl) {
        throw new Error("No auth URL in response");
      }

      console.log("✅ Got auth URL:", authUrl.substring(0, 50) + "...");

      // Open popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        authUrl,
        "MetaOAuth",
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes,toolbar=no,menubar=no`
      );

      popupRef.current = popup;

      if (!popup || popup.closed) {
        throw new Error("Popup blocked. Please allow popups for this website.");
      }

      // Message handler for OAuth callback
      const handleMessage = async (event: MessageEvent) => {
        // Validate origin
        if (event.origin !== window.location.origin) return;

        const type = event.data?.type;
        const isSuccess = type === "META_OAUTH_SUCCESS" || type === "META_SUCCESS";
        const isError = type === "META_OAUTH_ERROR" || type === "META_ERROR";

        if (isSuccess) {
          console.log("✅ OAuth success message received");
          
          // Cleanup
          window.removeEventListener("message", handleMessage);
          messageListenerRef.current = null;
          popupRef.current?.close();
          popupRef.current = null;

          toast.success("WhatsApp connected successfully!");
          setLoading(false);
          onClose();

          // Trigger callback
          if (onConnect) {
            try {
              await onConnect();
            } catch (err) {
              console.error("onConnect callback error:", err);
            }
          }
          return;
        }

        if (isError) {
          console.error("❌ OAuth error message received:", event.data);
          
          // Cleanup
          window.removeEventListener("message", handleMessage);
          messageListenerRef.current = null;
          popupRef.current?.close();
          popupRef.current = null;

          const errorMsg = event.data?.error || event.data?.message || "Connection failed";
          setError(errorMsg);
          setLoading(false);
          toast.error(errorMsg);
        }
      };

      // Store ref for cleanup
      messageListenerRef.current = handleMessage;
      window.addEventListener("message", handleMessage);

      // Also monitor popup close (fallback)
      const checkPopup = setInterval(async () => {
        if (!popupRef.current || popupRef.current.closed) {
          clearInterval(checkPopup);
          
          // If still loading, check status
          if (loading) {
            try {
              const statusRes = await fetch(`${import.meta.env.VITE_API_URL}/meta/status`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              });
              const statusData = await statusRes.json();
              
              if (statusData?.data?.isConnected) {
                toast.success("WhatsApp connected successfully!");
                onClose();
                if (onConnect) await onConnect();
              }
            } catch (err) {
              console.error("Status check error:", err);
            }
            setLoading(false);
          }
        }
      }, 1000);

      // Clear interval after 5 minutes (timeout)
      setTimeout(() => clearInterval(checkPopup), 5 * 60 * 1000);

    } catch (err: any) {
      console.error("❌ Connect error:", err);
      const errorMsg = err?.message || "Failed to connect WhatsApp";
      setError(errorMsg);
      setLoading(false);
      toast.error(errorMsg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Connect WhatsApp Business
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition" 
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Requirements */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" size={20} />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Before you start:
                </p>
                <ul className="space-y-1 text-blue-800 dark:text-blue-300">
                  <li>• Meta Business Account</li>
                  <li>• WhatsApp Business Account (WABA)</li>
                  <li>• Verified Business Phone Number</li>
                  <li>• Admin access to Business Manager</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" size={20} />
                <div className="text-sm text-red-800 dark:text-red-300">
                  <p className="font-semibold mb-1">Connection Failed</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p className="font-medium text-gray-900 dark:text-white mb-3">
              What you can do after connecting:
            </p>
            {[
              "Send messages to your customers",
              "Receive and reply to messages",
              "Send bulk campaigns",
              "Use message templates",
              "Automate responses with chatbots",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle className="text-green-600 dark:text-green-400 shrink-0" size={16} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t dark:border-gray-700 space-y-3">
          <button
            onClick={handleConnectWhatsApp}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>Connect WhatsApp</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium py-2 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetaConnectModal;