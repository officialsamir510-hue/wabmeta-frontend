// src/hooks/useMetaConnection.ts - UPDATED FOR EMBEDDED SIGNUP v3

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
  startConnection: (organizationId: string, usePopup?: boolean) => void;
  disconnectAccount: (accountId: string) => Promise<void>;
  setDefaultAccount: (accountId: string) => Promise<void>;
  refreshHealth: (accountId: string) => Promise<any>;
  syncTemplates: (accountId: string) => Promise<any>;
  completeConnection: (code: string, state: string) => Promise<void>;
  clearError: () => void;
}

export function useMetaConnection(organizationId: string): UseMetaConnectionReturn {
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ConnectionProgress | null>(null);
  const [config, setConfig] = useState<EmbeddedSignupConfig | null>(null);
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);

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
  // POPUP CALLBACK HANDLER
  // ============================================

  useEffect(() => {
    const handleMetaCallback = (event: MessageEvent) => {
      // Security check - only accept messages from same origin
      if (event.origin !== window.location.origin) {
        console.warn('Message from untrusted origin:', event.origin);
        return;
      }

      console.log('📨 Received message:', event.data);

      if (event.data.type === 'META_CALLBACK_SUCCESS') {
        console.log('✅ Meta callback success');

        setProgress({
          step: 'COMPLETED',
          status: 'completed',
          message: 'WhatsApp Business connected successfully!',
        });

        // Close popup if open
        if (popupWindow && !popupWindow.closed) {
          popupWindow.close();
        }

        // Reload accounts
        loadAccounts();

        // Clean up localStorage
        localStorage.removeItem('meta_connection_org_id');
        localStorage.removeItem('meta_connection_timestamp');
        localStorage.removeItem('meta_connection_state');

        setIsConnecting(false);
      } else if (event.data.type === 'META_CALLBACK_ERROR') {
        console.error('❌ Meta callback error:', event.data.error);

        setError(event.data.error || 'Connection failed');
        setProgress({
          step: 'COMPLETED',
          status: 'error',
          message: event.data.error || 'Connection failed',
        });

        // Close popup if open
        if (popupWindow && !popupWindow.closed) {
          popupWindow.close();
        }

        setIsConnecting(false);
      }
    };

    window.addEventListener('message', handleMetaCallback);

    return () => {
      window.removeEventListener('message', handleMetaCallback);
    };
  }, [popupWindow, loadAccounts]);

  // ============================================
  // START CONNECTION - UPDATED FOR POPUP/REDIRECT
  // ============================================

  const startConnection = useCallback(async (orgId: string, usePopup: boolean = true) => {
    try {
      setIsConnecting(true);
      setError(null);
      setProgress({
        step: 'INIT',
        status: 'in_progress',
        message: 'Initiating Meta connection...',
      });

      console.log('🔄 Starting Meta connection for org:', orgId);
      console.log('   Mode:', usePopup ? 'Popup' : 'Redirect');

      // Store organization ID for callback
      localStorage.setItem('meta_connection_org_id', orgId);
      localStorage.setItem('meta_connection_timestamp', Date.now().toString());

      // Get OAuth URL from backend (using new endpoint)
      const response = await api.post('/meta/initiate-connection', {
        organizationId: orgId,
      });

      const authUrl = response.data?.data?.authUrl;
      const state = response.data?.data?.state;

      if (!authUrl) {
        throw new Error('Failed to generate Meta OAuth URL');
      }

      // Store state for verification
      if (state) {
        localStorage.setItem('meta_connection_state', state);
      }

      console.log('✅ OAuth URL generated');

      setProgress({
        step: 'REDIRECTING',
        status: 'in_progress',
        message: 'Opening Meta authorization...',
      });

      if (usePopup) {
        // Open in popup for better UX
        const width = 600;
        const height = 700;
        const left = Math.max(0, (window.screen.width - width) / 2);
        const top = Math.max(0, (window.screen.height - height) / 2);

        const popup = window.open(
          authUrl,
          'MetaEmbeddedSignup',
          `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes,status=no`
        );

        if (!popup) {
          throw new Error('Popup blocked. Please allow popups and try again.');
        }

        setPopupWindow(popup);

        // Monitor popup close
        const checkPopup = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkPopup);
            console.log('📪 Popup closed');

            // Check if connection was successful
            setTimeout(() => {
              if (isConnecting) {
                setIsConnecting(false);
                setProgress({
                  step: 'CANCELLED',
                  status: 'error',
                  message: 'Connection cancelled',
                });
              }
            }, 1000);
          }
        }, 500);

      } else {
        // Use full page redirect (fallback)
        console.log('🔀 Redirecting to Meta OAuth...');
        window.location.href = authUrl;
      }

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
  }, [isConnecting]);

  // ============================================
  // COMPLETE CONNECTION - UPDATED
  // ============================================

  const completeConnection = useCallback(async (code: string, state: string) => {
    setIsConnecting(true);
    setError(null);
    setProgress({
      step: 'TOKEN_EXCHANGE',
      status: 'in_progress',
      message: 'Connecting your WhatsApp Business account...',
    });

    try {
      console.log('🔄 Completing Meta connection...');
      console.log('   Code:', code ? 'Present' : 'Missing');
      console.log('   State:', state ? 'Present' : 'Missing');

      // Verify state matches what we stored
      const storedState = localStorage.getItem('meta_connection_state');
      if (storedState && storedState !== state) {
        throw new Error('Invalid state parameter - possible CSRF attack');
      }

      const response = await api.post('/meta/callback', {
        code,
        state,
      });

      if (response.data.success) {
        console.log('✅ Meta connection successful');

        const connectionData = response.data.data;

        setProgress({
          step: 'COMPLETED',
          status: 'completed',
          message: 'WhatsApp account connected successfully!',
        });

        // Update accounts list
        if (connectionData?.phoneNumbers) {
          // Add new phone numbers to accounts
          await loadAccounts();
        }

        // Clean up localStorage
        localStorage.removeItem('meta_connection_org_id');
        localStorage.removeItem('meta_connection_timestamp');
        localStorage.removeItem('meta_connection_state');

        // Send success message to parent window if in popup
        if (window.opener) {
          window.opener.postMessage({
            type: 'META_CALLBACK_SUCCESS',
            data: connectionData,
          }, window.location.origin);
        }

        return connectionData;
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

      // Send error message to parent window if in popup
      if (window.opener) {
        window.opener.postMessage({
          type: 'META_CALLBACK_ERROR',
          error: errorMessage,
        }, window.location.origin);
      }

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
  // CLEANUP ON UNMOUNT
  // ============================================

  useEffect(() => {
    return () => {
      // Close popup if still open
      if (popupWindow && !popupWindow.closed) {
        popupWindow.close();
      }
    };
  }, [popupWindow]);

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