// src/hooks/useMetaConnection.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { meta, whatsapp } from '../services/api';

// ============================================
// TYPES
// ============================================

interface WhatsAppAccount {
  id: string;
  phoneNumber: string;
  displayName: string;
  status: string;
  isDefault: boolean;
  phoneNumberId?: string;
  wabaId?: string;
  qualityRating?: string;
}

interface PhoneNumber {
  id: string;
  phoneNumberId: string;
  phoneNumber: string;
  displayName?: string;
  isPrimary: boolean;
  isActive: boolean;
  qualityRating?: string;
}

interface MetaConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  status: 'LOADING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'TOKEN_EXPIRED';
  accounts: WhatsAppAccount[];
  phoneNumbers: PhoneNumber[];
  wabaId?: string;
  wabaName?: string;
  connectedAt?: string;
  lastSync?: string;
  error: string | null;
  primaryAccount?: WhatsAppAccount;
}

const STORAGE_KEY = 'wabmeta_connection';

const initialState: MetaConnectionState = {
  isConnected: false,
  isConnecting: false,
  status: 'LOADING',
  accounts: [],
  phoneNumbers: [],
  error: null,
};

// ============================================
// HELPER: Clear all stored data
// ============================================

const clearStoredData = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('meta_connection');
  localStorage.removeItem('meta_status');
  localStorage.removeItem('whatsapp_accounts');
  sessionStorage.removeItem(STORAGE_KEY);
  console.log('🧹 Cleared all Meta connection cache');
};

// ============================================
// HOOK
// ============================================

const useMetaConnection = () => {
  const [connection, setConnection] = useState<MetaConnectionState>(initialState);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  const fetchInProgress = useRef(false);

  // ==========================================
  // FETCH STATUS FROM BACKEND
  // ==========================================
  const fetchStatus = useCallback(async (showLoading = true) => {
    // Prevent duplicate fetches
    if (fetchInProgress.current) {
      console.log('⏳ Fetch already in progress, skipping...');
      return;
    }

    fetchInProgress.current = true;

    try {
      if (showLoading) {
        setLoading(true);
      }

      console.log('🔍 Fetching Meta connection status...');

      // 1. Get Meta connection status from backend
      const statusRes = await meta.getStatus();
      const statusData = statusRes.data?.data;

      console.log('📥 Status response:', {
        isConnected: statusData?.isConnected,
        status: statusData?.status,
        accountsCount: statusData?.whatsappAccounts?.length || 0,
      });

      // 2. Get WhatsApp accounts
      let accountsData: any[] = [];
      try {
        const accountsRes = await whatsapp.accounts();
        accountsData = accountsRes.data?.data || [];
        console.log('📱 WhatsApp accounts:', accountsData.length);
      } catch (e) {
        console.warn('⚠️ Could not fetch WhatsApp accounts:', e);
      }

      // 3. Determine connection status
      // ✅ CRITICAL: Only use backend status, don't use cached data
      const isConnected = statusData?.isConnected === true;
      const connectedAccounts = accountsData.filter(
        (a: any) => a.status === 'CONNECTED'
      );

      if (!isMounted.current) return;

      if (isConnected || connectedAccounts.length > 0) {
        // ✅ CONNECTED
        const accounts = accountsData.map((a: any) => ({
          id: a.id,
          phoneNumber: a.phoneNumber,
          displayName: a.displayName || 'WhatsApp Business',
          status: a.status,
          isDefault: a.isDefault || false,
          phoneNumberId: a.phoneNumberId,
          wabaId: a.wabaId,
          qualityRating: a.qualityRating,
        }));

        const phoneNumbers = (statusData?.phoneNumbers || []).map((p: any) => ({
          id: p.id,
          phoneNumberId: p.phoneNumberId,
          phoneNumber: p.phoneNumber,
          displayName: p.displayName,
          isPrimary: p.isPrimary || false,
          isActive: p.isActive !== false,
          qualityRating: p.qualityRating,
        }));

        const primaryAccount = accounts.find((a: WhatsAppAccount) => a.isDefault) || accounts[0];

        setConnection({
          isConnected: true,
          isConnecting: false,
          status: 'CONNECTED',
          accounts,
          phoneNumbers,
          wabaId: statusData?.wabaId || statusData?.connection?.wabaId,
          wabaName: statusData?.wabaName || statusData?.connection?.wabaName,
          connectedAt: statusData?.connectedAt || statusData?.connection?.createdAt,
          lastSync: new Date().toISOString(),
          error: null,
          primaryAccount,
        });

        // Save to localStorage for quick initial load
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          isConnected: true,
          status: 'CONNECTED',
          lastSync: new Date().toISOString(),
        }));

      } else {
        // ❌ NOT CONNECTED
        console.log('⚠️ Not connected, clearing state');
        
        // Clear any cached data
        clearStoredData();

        setConnection({
          isConnected: false,
          isConnecting: false,
          status: statusData?.status === 'TOKEN_EXPIRED' ? 'TOKEN_EXPIRED' : 'DISCONNECTED',
          accounts: [],
          phoneNumbers: [],
          error: statusData?.message || null,
        });
      }

    } catch (err: any) {
      console.error('❌ Failed to fetch connection status:', err);
      
      if (!isMounted.current) return;

      // On error, assume disconnected (don't use cached data)
      clearStoredData();
      
      setConnection({
        isConnected: false,
        isConnecting: false,
        status: 'ERROR',
        accounts: [],
        phoneNumbers: [],
        error: err.message || 'Failed to check connection status',
      });
    } finally {
      fetchInProgress.current = false;
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  // ==========================================
  // DISCONNECT
  // ==========================================
  const disconnect = useCallback(async () => {
    try {
      console.log('🔌 Disconnecting Meta...');
      
      setConnection(prev => ({ ...prev, isConnecting: true }));

      // Call backend disconnect
      await meta.disconnect();

      // Clear all stored data
      clearStoredData();

      // Reset state
      setConnection({
        isConnected: false,
        isConnecting: false,
        status: 'DISCONNECTED',
        accounts: [],
        phoneNumbers: [],
        error: null,
      });

      console.log('✅ Disconnected successfully');
      
      return { success: true };

    } catch (err: any) {
      console.error('❌ Disconnect failed:', err);
      
      // Even if API fails, clear local state
      clearStoredData();
      
      setConnection({
        isConnected: false,
        isConnecting: false,
        status: 'DISCONNECTED',
        accounts: [],
        phoneNumbers: [],
        error: null,
      });

      throw err;
    }
  }, []);

  // ==========================================
  // START CONNECTION (UI state)
  // ==========================================
  const startConnection = useCallback(() => {
    setConnection(prev => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));
  }, []);

  // ==========================================
  // CANCEL CONNECTION
  // ==========================================
  const cancelConnection = useCallback(() => {
    setConnection(prev => ({
      ...prev,
      isConnecting: false,
      error: null,
    }));
  }, []);

  // ==========================================
  // SET ERROR
  // ==========================================
  const setError = useCallback((error: string) => {
    setConnection(prev => ({
      ...prev,
      isConnecting: false,
      error,
    }));
  }, []);

  // ==========================================
  // REFRESH CONNECTION
  // ==========================================
  const refreshConnection = useCallback(async () => {
    console.log('🔄 Refreshing connection...');
    await fetchStatus(true);
  }, [fetchStatus]);

  // ==========================================
  // COMPLETE CONNECTION (after OAuth success)
  // ==========================================
  const completeConnection = useCallback(async () => {
    console.log('✅ Connection complete, fetching status...');
    await fetchStatus(true);
  }, [fetchStatus]);

  // ==========================================
  // INITIAL FETCH ON MOUNT
  // ==========================================
  useEffect(() => {
    isMounted.current = true;
    
    // ✅ Always fetch fresh status from backend on mount
    // Don't rely on cached localStorage data for isConnected status
    fetchStatus();

    return () => {
      isMounted.current = false;
    };
  }, [fetchStatus]);

  // ==========================================
  // PERIODIC REFRESH (Optional - every 5 minutes)
  // ==========================================
  useEffect(() => {
    if (!connection.isConnected) return;

    const interval = setInterval(() => {
      console.log('⏰ Periodic connection refresh...');
      fetchStatus(false); // Don't show loading for background refresh
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [connection.isConnected, fetchStatus]);

  // ==========================================
  // RETURN
  // ==========================================
  return {
    // State
    connection,
    loading,
    isConnected: connection.isConnected,
    isConnecting: connection.isConnecting,
    status: connection.status,
    accounts: connection.accounts,
    phoneNumbers: connection.phoneNumbers,
    primaryAccount: connection.primaryAccount,
    error: connection.error,

    // Actions
    startConnection,
    cancelConnection,
    completeConnection,
    disconnect,
    refreshConnection,
    setError,
    fetchStatus,
  };
};

export default useMetaConnection;
export { useMetaConnection };