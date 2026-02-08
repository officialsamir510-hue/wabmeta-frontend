import { useCallback, useEffect, useMemo, useState } from 'react';
import { whatsapp } from '../services/api';

export type WhatsAppAccountStatus = 'PENDING' | 'CONNECTED' | 'DISCONNECTED' | 'BANNED';

export interface WhatsAppAccount {
  id: string;
  phoneNumber: string;
  displayName: string;
  status: WhatsAppAccountStatus;
  isDefault: boolean;
  wabaId: string;
  phoneNumberId: string;
  tokenExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UseWhatsAppConnectionReturn {
  /**
   * IMPORTANT:
   * We keep this always true to DISABLE gating UI across the app.
   * (So pages won't show "No WhatsApp connected" screen)
   */
  isConnected: boolean;

  /**
   * IMPORTANT:
   * Always false to avoid showing "Checking WhatsApp connection..." loader UI
   */
  isLoading: boolean;

  error: string | null;
  accounts: WhatsAppAccount[];
  defaultAccount: WhatsAppAccount | null;

  refresh: () => Promise<void>;
  disconnect: (accountId: string) => Promise<void>;
  setDefault: (accountId: string) => Promise<void>;
}

export const useWhatsAppConnection = (): UseWhatsAppConnectionReturn => {
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setError(null);
      const res = await whatsapp.accounts();

      // api.ts patterns: sometimes res.data.data, sometimes res.data
      const list = (res.data?.data ?? res.data ?? []) as any;

      setAccounts(Array.isArray(list) ? list : []);
    } catch (e: any) {
      // Silent fail (no UI gating wanted)
      setAccounts([]);
      setError(e?.response?.data?.message || e?.message || null);
    }
  }, []);

  useEffect(() => {
    // Silent load (does not block UI)
    fetchAccounts();
  }, [fetchAccounts]);

  const connectedAccounts = useMemo(
    () => accounts.filter((a) => a.status === 'CONNECTED'),
    [accounts]
  );

  const defaultAccount = useMemo(() => {
    return (
      connectedAccounts.find((a) => a.isDefault) ||
      connectedAccounts[0] ||
      null
    );
  }, [connectedAccounts]);

  const disconnect = useCallback(
    async (accountId: string) => {
      await whatsapp.disconnect(accountId);
      await fetchAccounts();
    },
    [fetchAccounts]
  );

  const setDefault = useCallback(
    async (accountId: string) => {
      await whatsapp.setDefault(accountId);
      await fetchAccounts();
    },
    [fetchAccounts]
  );

  return {
    // ✅ Force-disable gating across app
    isConnected: true,

    // ✅ Never show "Checking WhatsApp connection..."
    isLoading: false,

    error,
    accounts,
    defaultAccount,
    refresh: fetchAccounts,
    disconnect,
    setDefault,
  };
};

export default useWhatsAppConnection;