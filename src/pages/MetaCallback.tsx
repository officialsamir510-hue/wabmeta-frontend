import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { whatsapp } from "../services/api";

type Status = "loading" | "success" | "error";

const MetaCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Connecting to Meta...");

  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;

    const code = searchParams.get("code");
    const state = searchParams.get("state");

    const error = searchParams.get("error");
    const errorReason = searchParams.get("error_reason");
    const errorDescription = searchParams.get("error_description");

    // ✅ Use fixed APP URL to avoid www/non-www mismatch
    const appUrl = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/+$/, "");
    const appOrigin = new URL(appUrl).origin;

    // ✅ MUST match the same redirectUri used in OAuth popup
    const redirectUri = `${appUrl}/meta-callback`;

    // 1) Meta returned error
    if (error) {
      processedRef.current = true;
      setStatus("error");
      setMessage(
        errorDescription ||
          errorReason ||
          "Meta authorization failed or was cancelled."
      );
      return;
    }

    // 2) No code yet
    if (!code) {
      return;
    }

    processedRef.current = true;

    // 3) Verify state (recommended)
    const expectedState = sessionStorage.getItem("meta_oauth_state");
    sessionStorage.removeItem("meta_oauth_state");

    if (expectedState && state && expectedState !== state) {
      setStatus("error");
      setMessage("Security check failed (state mismatch). Please try again.");
      return;
    }

    setStatus("loading");
    setMessage("Exchanging code with Meta...");

    whatsapp
      .connect({ code, redirectUri })
      .then((res) => {
        // Optional: store a small marker
        localStorage.setItem(
          "wabmeta_connection",
          JSON.stringify({
            isConnected: true,
            connectedAt: new Date().toISOString(),
          })
        );

        setStatus("success");
        setMessage("Connected! Redirecting...");

        // ✅ If opened in popup, notify opener and close
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            { type: "META_SUCCESS", payload: res.data },
            appOrigin // ✅ not "*"
          );

          setTimeout(() => {
            window.close();
          }, 600);

          return;
        }

        // ✅ If opened in same tab
        setTimeout(() => navigate("/dashboard"), 800);
      })
      .catch((err) => {
        console.error("❌ Meta Connect Failed:", err?.response?.data || err);

        setStatus("error");
        setMessage(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            "Failed to connect to Meta. Please try again."
        );
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
        {status === "loading" && (
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
        )}
        {status === "success" && (
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
        )}
        {status === "error" && (
          <XCircle className="w-12 h-12 text-red-500 mx-auto" />
        )}

        <h2 className="mt-4 text-xl font-bold text-gray-900">{message}</h2>

        {status === "error" && (
          <button
            className="mt-5 px-4 py-2 rounded-lg bg-primary-600 text-white font-medium"
            onClick={() => navigate("/dashboard")}
          >
            Go back
          </button>
        )}
      </div>
    </div>
  );
};

export default MetaCallback;