// src/components/dashboard/ConnectionStatus.tsx
import React from "react";
import { Power, CheckCircle2 } from "lucide-react";
import type { MetaConnection as MetaConnType } from "../../types/meta";

type Props = {
  connection: MetaConnType;
  onDisconnect: () => void | Promise<void>;
  disconnectLoading?: boolean;
};

const ConnectionStatus: React.FC<Props> = ({ connection, onDisconnect, disconnectLoading }) => {
  const waba = connection.businessAccount as any;
  const phoneNumbers = waba?.phoneNumbers || [];

  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-green-700" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-green-900">WhatsApp Connected</h3>
            <p className="text-sm text-green-800">
              WABA: <span className="font-semibold">{waba?.name || waba?.wabaName || "Connected"}</span>
            </p>

            {phoneNumbers?.length > 0 && (
              <div className="mt-2 space-y-1 text-sm text-green-800">
                {phoneNumbers.map((p: any) => (
                  <div key={p.id} className="flex flex-wrap gap-2">
                    <span className="font-medium">Phone:</span>
                    <span>{p.number || p.phoneNumber}</span>
                    {p.isPrimary && <span className="text-xs bg-green-200 text-green-900 px-2 py-0.5 rounded-full">Primary</span>}
                    {p.verifiedName && <span className="text-xs text-green-700">({p.verifiedName})</span>}
                  </div>
                ))}
              </div>
            )}

            {connection.lastSync && (
              <p className="text-xs text-green-700 mt-2">Last sync: {new Date(connection.lastSync).toLocaleString()}</p>
            )}
          </div>
        </div>

        <button
          onClick={onDisconnect}
          disabled={!!disconnectLoading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-700 font-semibold rounded-xl hover:bg-red-50 transition disabled:opacity-60"
        >
          <Power className="w-4 h-4" />
          {disconnectLoading ? "Disconnecting..." : "Disconnect"}
        </button>
      </div>
    </div>
  );
};

export default ConnectionStatus;