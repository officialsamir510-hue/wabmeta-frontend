import React, { useMemo, useState } from "react";
import { X, Loader2, ExternalLink, AlertTriangle } from "lucide-react";
import { meta } from "../../services/api";

interface MetaConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  onConnected?: () => void; // optional
}

const MetaConnectModal: React.FC<MetaConnectModalProps> = ({
  isOpen,
  onClose,
  organizationId,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const popupFeatures = useMemo(
    () => "width=540,height=720,noopener,noreferrer",
    []
  );

  const openPopupOrRedirect = async () => {
    setError(null);

    if (!organizationId) {
      setError("Organization ID missing. Please refresh and try again.");
      return;
    }

    try {
      setLoading(true);

      // store org for callback fallback
      localStorage.setItem("currentOrganizationId", organizationId);

      const resp = await meta.getOAuthUrl(organizationId);
      const url = resp.data?.data?.url;

      if (!url) throw new Error("Failed to generate Meta OAuth URL");

      // Try popup
      const popup = window.open(url, "wabmeta_meta_connect", popupFeatures);

      // Popup blocked => redirect
      if (!popup) {
        window.location.href = url;
        return;
      }

      // Optional: focus popup
      popup.focus();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to start connection");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Connect WhatsApp Business
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            We’ll redirect you to Meta to connect your WhatsApp Business Account.
            After completing signup, this window will update automatically.
          </p>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-700 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">Connection error</p>
                <p className="text-sm text-amber-800 mt-1">{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={openPopupOrRedirect}
            disabled={loading}
            className="w-full px-5 py-3 rounded-xl bg-[#1877F2] hover:bg-[#1565D8] text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Opening Meta…
              </>
            ) : (
              <>
                <ExternalLink className="w-5 h-5" />
                Continue with Meta
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            If popup is blocked, we’ll open Meta in the same tab.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MetaConnectModal;