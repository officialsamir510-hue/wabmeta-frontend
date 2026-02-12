// src/hooks/useMetaConnection.ts

import { useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import type {
  WhatsAppAccount,
  EmbeddedSignupConfig,
  ConnectionProgress,
} from '../types/meta';

interface UseMetaConnectionReturn {
  // State
  accounts: WhatsAppAccount[];
  isLoading: boolean;
  isConnecting: boolean;
  error: string | null;
  progress: ConnectionProgress | null;
  config: EmbeddedSignupConfig | null;

  // Actions
  loadAccounts: () => Promise<void>;
  startConnection: (organizationId: string) => void;
  disconnectAccount: (accountId: string) => Promise<void>;
  setDefaultAccount: (accountId: string) => Promise<void>;
  refreshHealth: (accountId: string) => Promise<any>;
  syncTemplates: (accountId: string) => Promise<any>;
  completeConnection: (code: string, organizationId: string) => Promise<void>;
  clearError: () => void;
}

export function useMetaConnection(organizationId: string): UseMetaConnectionReturn {
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ConnectionProgress | null>(null);
  const [config, setConfig] = useState<EmbeddedSignupConfig | null>(null);

  // ============================================
  // LOAD CONFIG ON MOUNT
  // ============================================

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await api.get('/meta/config');
      if (response.data.success) {
        setConfig(response.data.data);
        console.log('✅ Meta config loaded:', {
          appId: response.data.data.appId,
          version: response.data.data.version,
        });
      }
    } catch (err: any) {
      console.error('Failed to load Meta config:', err);
    }
  };

  // ============================================
  // LOAD ACCOUNTS
  // ============================================

  const loadAccounts = useCallback(async () => {
    if (!organizationId) {
      console.warn('No organizationId provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/meta/organizations/${organizationId}/accounts`);

      if (response.data.success) {
        const accountsData = response.data.data?.accounts || response.data.data || [];
        setAccounts(Array.isArray(accountsData) ? accountsData : []);
        console.log(`✅ Loaded ${accountsData.length} WhatsApp accounts`);
      }
    } catch (err: any) {
      console.error('Failed to load accounts:', err);
      setError(err.response?.data?.message || 'Failed to load WhatsApp accounts');
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  // Load accounts on mount and when organizationId changes
  useEffect(() => {
    if (organizationId) {
      loadAccounts();
    }
  }, [organizationId, loadAccounts]);

  // ============================================
  // START CONNECTION (OAuth Redirect) - ✅ UPDATED
  // ============================================

  const startConnection = useCallback(async (orgId: string) => {
    try {
      setIsConnecting(true);
      setError(null);
      setProgress({
        step: 'INIT',
        status: 'in_progress',
        message: 'Redirecting to Meta OAuth...',
      });

      console.log('🔄 Starting Meta connection for org:', orgId);

      // Store organization ID for callback
      localStorage.setItem('meta_connection_org_id', orgId);
      localStorage.setItem('meta_connection_timestamp', Date.now().toString());

      // Get OAuth URL from backend
      const response = await api.get('/meta/oauth-url', {
        params: { organizationId: orgId },
      });

      const url = response.data?.data?.url;

      if (!url) {
        throw new Error('Failed to generate Meta OAuth URL');
      }

      console.log('✅ OAuth URL generated, redirecting...');

      // Redirect to Meta OAuth
      window.location.href = url;

    } catch (err: any) {
      console.error('❌ Failed to start Meta connection:', err);

      const errorMessage = err.response?.data?.message || err.message || 'Failed to start Meta connection';
      setError(errorMessage);
      setIsConnecting(false);
      setProgress({
        step: 'INIT',
        status: 'error',
        message: errorMessage,
      });
    }
  }, []);

  // ============================================
  // COMPLETE CONNECTION (Called from callback page)
  // ============================================

  const completeConnection = useCallback(async (codeOrToken: string, orgId: string) => {
    setIsConnecting(true);
    setError(null);
    setProgress({
      step: 'TOKEN_EXCHANGE',
      status: 'in_progress',
      message: 'Connecting your WhatsApp Business account...',
    });

    try {
      console.log('🔄 Completing Meta connection...');

      const response = await api.post('/meta/callback', {
        code: codeOrToken,
        organizationId: orgId,
      });

      if (response.data.success) {
        console.log('✅ Meta connection successful');

        setProgress({
          step: 'COMPLETED',
          status: 'completed',
          message: 'WhatsApp account connected successfully!',
        });

        // Add new account to list
        if (response.data.data?.account) {
          setAccounts((prev) => {
            const exists = prev.find(a => a.id === response.data.data.account.id);
            if (exists) {
              return prev.map(a =>
                a.id === response.data.data.account.id
                  ? response.data.data.account
                  : a
              );
            }
            return [response.data.data.account, ...prev];
          });
        }

        // Refresh full account list
        await loadAccounts();

        // Clean up localStorage
        localStorage.removeItem('meta_connection_org_id');
        localStorage.removeItem('meta_connection_timestamp');

        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Connection failed');
      }
    } catch (err: any) {
      console.error('❌ Meta connection failed:', err);

      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to complete connection';

      setError(errorMessage);
      setProgress({
        step: 'COMPLETED',
        status: 'error',
        message: errorMessage,
      });

      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [loadAccounts]);

  // ============================================
  // DISCONNECT ACCOUNT
  // ============================================

  const disconnectAccount = useCallback(async (accountId: string) => {
    try {
      console.log(`🔄 Disconnecting account: ${accountId}`);

      await api.delete(`/meta/organizations/${organizationId}/accounts/${accountId}`);

      setAccounts((prev) => prev.filter((a) => a.id !== accountId));

      console.log('✅ Account disconnected');
    } catch (err: any) {
      console.error('Failed to disconnect account:', err);
      throw new Error(err.response?.data?.message || 'Failed to disconnect account');
    }
  }, [organizationId]);

  // ============================================
  // SET DEFAULT ACCOUNT
  // ============================================

  const setDefaultAccount = useCallback(async (accountId: string) => {
    try {
      console.log(`🔄 Setting default account: ${accountId}`);

      await api.post(`/meta/organizations/${organizationId}/accounts/${accountId}/default`);

      setAccounts((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === accountId,
        }))
      );

      console.log('✅ Default account set');
    } catch (err: any) {
      console.error('Failed to set default account:', err);
      throw new Error(err.response?.data?.message || 'Failed to set default account');
    }
  }, [organizationId]);

  // ============================================
  // REFRESH HEALTH
  // ============================================

  const refreshHealth = useCallback(async (accountId: string) => {
    try {
      console.log(`🔄 Refreshing health for account: ${accountId}`);

      const response = await api.post(
        `/meta/organizations/${organizationId}/accounts/${accountId}/health`
      );

      if (response.data.success && response.data.data) {
        // Update account in list with new health data
        setAccounts((prev) =>
          prev.map((a) => {
            if (a.id === accountId) {
              return {
                ...a,
                qualityRating: response.data.data.qualityRating || a.qualityRating,
                status: response.data.data.healthy ? 'CONNECTED' : 'DISCONNECTED',
              };
            }
            return a;
          })
        );

        console.log('✅ Health refreshed:', response.data.data);
      }

      return response.data.data;
    } catch (err: any) {
      console.error('Failed to refresh health:', err);
      throw new Error(err.response?.data?.message || 'Failed to refresh health');
    }
  }, [organizationId]);

  // ============================================
  // SYNC TEMPLATES
  // ============================================

  const syncTemplates = useCallback(async (accountId: string) => {
    try {
      console.log(`🔄 Syncing templates for account: ${accountId}`);

      const response = await api.post(
        `/meta/organizations/${organizationId}/accounts/${accountId}/sync-templates`
      );

      console.log(`✅ Synced ${response.data.data?.synced || 0} templates`);

      return response.data.data;
    } catch (err: any) {
      console.error('Failed to sync templates:', err);
      throw new Error(err.response?.data?.message || 'Failed to sync templates');
    }
  }, [organizationId]);

  // ============================================
  // CLEAR ERROR
  // ============================================

  const clearError = useCallback(() => {
    setError(null);
    setProgress(null);
  }, []);

  // ============================================
  // RETURN HOOK VALUES
  // ============================================

  return {
    // State
    accounts,
    isLoading,
    isConnecting,
    error,
    progress,
    config,

    // Actions
    loadAccounts,
    startConnection,
    disconnectAccount,
    setDefaultAccount,
    refreshHealth,
    syncTemplates,
    completeConnection,
    clearError,
  };
}

export default useMetaConnection;