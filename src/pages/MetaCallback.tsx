import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { whatsapp } from "../services/api";

const MetaCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Connecting to Meta...");
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;

    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      processedRef.current = true;
      setStatus("error");
      setMessage("Access denied by user.");
      return;
    }

    if (!code) return;

    processedRef.current = true;

    // ✅ MUST match the same redirectUri used in OAuth popup
    const redirectUri = `${window.location.origin}/meta-callback`;

    whatsapp
      .connect({ code, redirectUri })
      .then((res) => {
        console.log("✅ Connected Successfully:", res.data);

        // Optional: store connection marker
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
        if (window.opener) {
          window.opener.postMessage({ type: "META_SUCCESS", payload: res.data }, "*");
          setTimeout(() => window.close(), 800);
          return;
        }

        // ✅ If opened in same tab
        setTimeout(() => navigate("/dashboard"), 1200);
      })
      .catch((err) => {
        console.error("❌ Meta Connect Failed:", err?.response?.data || err);
        setStatus("error");
        setMessage("Failed to connect. Check console for details.");
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
        {status === "loading" && <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />}
        {status === "success" && <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />}
        {status === "error" && <XCircle className="w-12 h-12 text-red-500 mx-auto" />}
        <h2 className="mt-4 text-xl font-bold">{message}</h2>
      </div>
    </div>
  );
};

export default MetaCallback;