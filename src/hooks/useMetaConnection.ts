import { useState, useCallback, useEffect } from 'react';
import type { MetaConnection, WhatsAppBusinessAccount } from '../types/meta';

const STORAGE_KEY = 'wabmeta_connection';

const initialState: MetaConnection = {
  isConnected: false,
  isConnecting: false,
  accessToken: null,
  businessAccount: null,
  connectedAt: null,
  error: null,
  lastSync: ''
};

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(connection));
  }, [connection]);

  const startConnection = useCallback(() => {
    setConnection(prev => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));
  }, []);

  const completeConnection = useCallback((
    accessToken: string,
    businessAccount: WhatsAppBusinessAccount
  ) => {
    return setConnection({
      isConnected: true,
      isConnecting: false,
      accessToken,
      businessAccount,
      connectedAt: new Date().toISOString(),
      error: null,
      lastSync: '', // or set to a default value or new Date().toISOString() if appropriate
    });
  }, []);

  const disconnect = useCallback(() => {
    setConnection(initialState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const setError = useCallback((error: string) => {
    setConnection(prev => ({
      ...prev,
      isConnecting: false,
      error,
    }));
  }, []);

  const cancelConnection = useCallback(() => {
    setConnection(prev => ({
      ...prev,
      isConnecting: false,
      error: null,
    }));
  }, []);

  return {
    connection,
    startConnection,
    completeConnection,
    disconnect,
    setError,
    cancelConnection,
  };
};

export default useMetaConnection;