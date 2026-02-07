import React, { useEffect, useState } from "react";

type MetaSettings = {
  connected: boolean;
  status?: string;
  waba?: { id: string; name?: string };
  phoneNumbers?: Array<{
    id: string;
    phoneNumberId: string;
    number: string;
    verifiedName?: string;
    qualityRating?: string;
    isPrimary?: boolean;
  }>;
  token?: { masked?: string | null; expiresAt?: string };
  webhook?: { callbackUrl?: string; verifyTokenMasked?: string | null };
  graphApiVersion?: string;
};

const MetaApiWebhookSettings: React.FC = () => {
  const [data, setData] = useState<MetaSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/meta/settings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const json = await res.json();
        if (json?.success) setData(json.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-4 bg-white rounded-xl border">Loading Meta settings...</div>;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">WhatsApp API & Webhook</h3>

      {!data?.connected ? (
        <div className="text-gray-600">Not connected yet.</div>
      ) : (
        <div className="space-y-3 text-sm text-gray-700">
          <div><span className="font-medium">Status:</span> {data.status}</div>
          <div><span className="font-medium">WhatsApp Business Account ID (WABA):</span> {data.waba?.id}</div>
          <div><span className="font-medium">WABA Name:</span> {data.waba?.name}</div>

          <div className="pt-2">
            <div className="font-medium mb-1">Phone Numbers</div>
            {(data.phoneNumbers || []).map((p) => (
              <div key={p.id} className="p-3 rounded-xl border bg-gray-50">
                <div><span className="font-medium">Phone Number ID:</span> {p.phoneNumberId}</div>
                <div><span className="font-medium">Number:</span> {p.number}</div>
                {p.verifiedName && <div><span className="font-medium">Verified Name:</span> {p.verifiedName}</div>}
                {p.qualityRating && <div><span className="font-medium">Quality:</span> {p.qualityRating}</div>}
              </div>
            ))}
          </div>

          <div className="pt-2">
            <div className="font-medium mb-1">Permanent Access Token</div>
            <div className="text-gray-600">
              For security, token is not shown in full.
              <div><span className="font-medium">Stored Token (masked):</span> {data.token?.masked || "—"}</div>
              {data.token?.expiresAt && (
                <div><span className="font-medium">Expires At:</span> {new Date(data.token.expiresAt).toLocaleString()}</div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <div className="font-medium mb-1">Webhook Configuration</div>
            <div><span className="font-medium">Callback URL:</span> {data.webhook?.callbackUrl}</div>
            <div><span className="font-medium">Verify Token (masked):</span> {data.webhook?.verifyTokenMasked || "—"}</div>
            <div><span className="font-medium">Graph API Version:</span> {data.graphApiVersion}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaApiWebhookSettings;