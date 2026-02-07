// src/components/dashboard/MetaConnectModal.tsx

import React, { useEffect, useRef, useState } from "react";
import { X, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface MetaConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect?: () => void; // ✅ added
}

export const MetaConnectModal: React.FC<MetaConnectModalProps> = ({
  isOpen,
  onClose,
  onConnect,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const popupRef = useRef<Window | null>(null);

  // Cleanup if modal closes
  useEffect(() => {
    if (!isOpen) {
      popupRef.current?.close();
      popupRef.current = null;
      setLoading(false);
      setError("");
    }
  }, [isOpen]);

  const handleConnectWhatsApp = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/meta/auth/url`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get authorization URL");
      }

      const data = await response.json();

      if (!(data?.success && data?.data?.authUrl)) {
        throw new Error(data?.error || data?.message || "Invalid response from server");
      }

      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        data.data.authUrl,
        "MetaOAuth",
        `width=${width},height=${height},top=${top},left=${left},toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
      );

      popupRef.current = popup;

      if (!popup || popup.closed) {
        setError("Please allow popups for this website");
        setLoading(false);
        return;
      }

      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        const type = event.data?.type;

        const isSuccess = type === "META_OAUTH_SUCCESS" || type === "META_SUCCESS";
        const isError = type === "META_OAUTH_ERROR" || type === "META_ERROR";

        if (isSuccess) {
          window.removeEventListener("message", handleMessage);
          popupRef.current?.close();
          popupRef.current = null;

          toast.success("WhatsApp connected successfully!");
          setLoading(false);
          onClose();

          // ✅ trigger parent refresh (no reload)
          if (onConnect) {
            try {
              await onConnect();
            } catch {}
          }
          return;
        }

        if (isError) {
          window.removeEventListener("message", handleMessage);
          popupRef.current?.close();
          popupRef.current = null;

          setError(event.data?.error || "Connection failed");
          setLoading(false);
          return;
        }
      };

      window.addEventListener("message", handleMessage);
    } catch (err: any) {
      console.error("Connect error:", err);
      setError(err?.message || "Failed to connect WhatsApp");
      setLoading(false);
      toast.error("Failed to connect WhatsApp");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Connect WhatsApp Business</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 mt-0.5" size={20} />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 mb-2">Requirements:</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Meta Business Account</li>
                  <li>• WhatsApp Business Account (WABA)</li>
                  <li>• Verified Business Phone Number</li>
                  <li>• Admin access to the Business Manager</li>
                </ul>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-600 mt-0.5" size={20} />
                <div className="text-sm text-red-800">
                  <p className="font-semibold mb-1">Connection Failed</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">After connecting, you can:</h3>
            <div className="space-y-2">
              {[
                "Send messages to your customers",
                "Receive and reply to messages",
                "Send bulk campaigns",
                "Use message templates",
                "Automate responses with chatbots",
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="text-green-600" size={16} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t space-y-3">
          <button
            onClick={handleConnectWhatsApp}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Connecting...</span>
              </>
            ) : (
              <span>Connect WhatsApp</span>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};