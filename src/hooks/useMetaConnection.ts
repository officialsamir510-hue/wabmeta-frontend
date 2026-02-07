// src/hooks/useMetaConnection.ts
import { useState, useCallback, useEffect } from "react";
import type { MetaConnection, WhatsAppBusinessAccount } from "../types/meta";

const STORAGE_KEY = "wabmeta_connection";

const initialState: MetaConnection = {
  isConnected: false,
  isConnecting: false,
  accessToken: null,
  businessAccount: null,
  connectedAt: null,
  error: null,
  lastSync: "",
};

type MetaStatusApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    connected: boolean;
    status: string;
    waba?: { id: string; name?: string };
    phoneNumbers?: Array<{
      id: string;
      number: string;
      verifiedName?: string;
      quality?: string;
      isPrimary?: boolean;
    }>;
    messagingLimit?: string;
    qualityRating?: string;
    lastSynced?: string;
  };
  error?: string;
};

const API_BASE = import.meta.env.VITE_API_URL as string; // must be .../api/v1

export const useMetaConnection = () => {
  const [connection, setConnection] = useState<MetaConnection>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialState;
      }
    }
    return initialState;
  });

  // persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(connection));
  }, [connection]);

  const fetchStatus = useCallback(async () => {
    setConnection((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setConnection({ ...initialState, error: "Not logged in" });
        return;
      }

      const res = await fetch(`${API_BASE}/meta/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = (await res.json()) as MetaStatusApiResponse;

      if (!json?.success) {
        setConnection({ ...initialState, error: json?.error || "Failed to fetch status" });
        return;
      }

      const d = json.data;

      if (d?.connected) {
        // Map backend status -> existing frontend MetaConnection shape
        const businessAccount = {
          id: d.waba?.id,
          name: d.waba?.name,
          phoneNumbers: d.phoneNumbers || [],
          status: d.status,
          messagingLimit: d.messagingLimit,
          qualityRating: d.qualityRating,
        } as unknown as WhatsAppBusinessAccount;

        setConnection((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          accessToken: null, // token backend me encrypted store ho raha hai
          businessAccount,
          connectedAt: prev.connectedAt || new Date().toISOString(),
          error: null,
          lastSync: new Date().toISOString(),
        }));
      } else {
        setConnection({ ...initialState, isConnecting: false });
      }
    } catch (e: any) {
      setConnection({ ...initialState, error: e?.message || "Status fetch failed" });
    }
  }, []);

  // ✅ auto fetch on mount (this is the main fix)
  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  const startConnection = useCallback(() => {
    setConnection((prev) => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));
  }, []);

  // Optional: in case you still use it somewhere
  const completeConnection = useCallback((accessToken: string, businessAccount: WhatsAppBusinessAccount) => {
    setConnection({
      isConnected: true,
      isConnecting: false,
      accessToken,
      businessAccount,
      connectedAt: new Date().toISOString(),
      error: null,
      lastSync: new Date().toISOString(),
    });
  }, []);

  const disconnect = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`${API_BASE}/meta/disconnect`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // even if API fails, clear local state
    } finally {
      setConnection(initialState);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const setError = useCallback((error: string) => {
    setConnection((prev) => ({
      ...prev,
      isConnecting: false,
      error,
    }));
  }, []);

  const cancelConnection = useCallback(() => {
    setConnection((prev) => ({
      ...prev,
      isConnecting: false,
      error: null,
    }));
  }, []);

  // ✅ refresh now means "fetch latest status", not reset-to-false
  const refreshConnection = useCallback(async () => {
    await fetchStatus();
  }, [fetchStatus]);

  return {
    connection,
    startConnection,
    completeConnection,
    disconnect,
    setError,
    cancelConnection,
    refreshConnection,
  };
};

export default useMetaConnection;