// src/hooks/useWhatsAppConnection.ts

import { useState, useEffect, useCallback } from 'react';
import { whatsapp } from '../services/api';

interface WhatsAppAccount {
  id: string;
  phoneNumber: string;
  displayName: string;
  status: 'PENDING' | 'CONNECTED' | 'DISCONNECTED' | 'BANNED';
  isDefault: boolean;
  wabaId: string;
  phoneNumberId: string;
  tokenExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UseWhatsAppConnectionReturn {
  isConnected: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await whatsapp.accounts();
      const accountsData = response.data.data || response.data || [];
      
      setAccounts(Array.isArray(accountsData) ? accountsData : []);
    } catch (err: any) {
      console.error('Error fetching WhatsApp accounts:', err);
      setError(err.response?.data?.message || 'Failed to fetch WhatsApp accounts');
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const disconnect = async (accountId: string) => {
    try {
      await whatsapp.disconnect(accountId);
      await fetchAccounts();
    } catch (err: any) {
      console.error('Error disconnecting account:', err);
      throw err;
    }
  };

  const setDefault = async (accountId: string) => {
    try {
      await whatsapp.setDefault(accountId);
      await fetchAccounts();
    } catch (err: any) {
      console.error('Error setting default account:', err);
      throw err;
    }
  };

  // Calculate derived values
  const connectedAccounts = accounts.filter(a => a.status === 'CONNECTED');
  const isConnected = connectedAccounts.length > 0;
  const defaultAccount = connectedAccounts.find(a => a.isDefault) || connectedAccounts[0] || null;

  return {
    isConnected,
    isLoading,
    error,
    accounts,
    defaultAccount,
    refresh: fetchAccounts,
    disconnect,
    setDefault,
  };
};

export default useWhatsAppConnection;