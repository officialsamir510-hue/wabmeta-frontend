// src/hooks/useMetaConnection.ts

import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  WhatsAppAccount,
  EmbeddedSignupConfig,
  ConnectionProgress,
  FBLoginResponse,
} from '../types/meta';

interface UseMetaConnectionReturn {
  // State
  accounts: WhatsAppAccount[];
  isLoading: boolean;
  isConnecting: boolean;
  error: string | null;
  progress: ConnectionProgress | null;
  config: EmbeddedSignupConfig | null;
  sdkLoaded: boolean;

  // Actions
  loadAccounts: () => Promise<void>;
  startConnection: (organizationId: string) => void;
  disconnectAccount: (accountId: string) => Promise<void>;
  setDefaultAccount: (accountId: string) => Promise<void>;
  refreshHealth: (accountId: string) => Promise<void>;
  syncTemplates: (accountId: string) => Promise<void>;
  completeConnection: (code: string, organizationId: string) => Promise<void>;
  clearError: () => void;
}

export function useMetaConnection(organizationId: string): UseMetaConnectionReturn {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ConnectionProgress | null>(null);
  const [config, setConfig] = useState<EmbeddedSignupConfig | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  
  const sdkInitialized = useRef(false);

  // Load Facebook SDK
  useEffect(() => {
    loadFacebookSDK();
    loadConfig();
  }, []);

  const loadFacebookSDK = useCallback(() => {
    if (sdkInitialized.current) return;

    // Check if already loaded
    if (window.FB) {
      setSdkLoaded(true);
      return;
    }

    // Load SDK script
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';

    window.fbAsyncInit = () => {
      if (config) {
        window.FB.init({
          appId: config.appId,
          autoLogAppEvents: true,
          xfbml: true,
          version: config.version,
        });
        setSdkLoaded(true);
        sdkInitialized.current = true;
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [config]);

  // Initialize SDK when config is loaded
  useEffect(() => {
    if (config && window.FB && !sdkInitialized.current) {
      window.FB.init({
        appId: config.appId,
        autoLogAppEvents: true,
        xfbml: true,
        version: config.version,
      });
      setSdkLoaded(true);
      sdkInitialized.current = true;
    }
  }, [config]);

  const loadConfig = async () => {
    try {
      const response = await api.get('/meta/config');
      setConfig(response.data.data);
    } catch (err: any) {
      console.error('Failed to load Meta config:', err);
    }
  };

  const loadAccounts = useCallback(async () => {
    if (!organizationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/meta/organizations/${organizationId}/accounts`);
      setAccounts(response.data.data.accounts);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load WhatsApp accounts');
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  // Load accounts on mount
  useEffect(() => {
    if (organizationId) {
      loadAccounts();
    }
  }, [organizationId, loadAccounts]);

  const startConnection = useCallback(
    (orgId: string) => {
      if (!config || !sdkLoaded || !window.FB) {
        setError('Facebook SDK not loaded. Please refresh the page.');
        return;
      }

      setIsConnecting(true);
      setError(null);
      setProgress({
        step: 'INIT',
        status: 'in_progress',
        message: 'Opening WhatsApp Business signup...',
      });

      // Facebook Login with WhatsApp Business scopes
      window.FB.login(
        (response: FBLoginResponse) => {
          if (response.status === 'connected' && response.authResponse) {
            // Get the code from authResponse
            const code = response.authResponse.code || response.authResponse.accessToken;
            
            if (code) {
              completeConnection(code, orgId);
            } else {
              setError('Failed to get authorization code');
              setIsConnecting(false);
              setProgress(null);
            }
          } else {
            setError('Connection cancelled or failed');
            setIsConnecting(false);
            setProgress(null);
          }
        },
        {
          scope: 'whatsapp_business_management,whatsapp_business_messaging,business_management',
          response_type: 'code',
          extras: {
            setup: {
              // Embedded Signup specific
            },
            featureType: 'whatsapp_embedded_signup',
            sessionInfoVersion: 2,
          },
        }
      );
    },
    [config, sdkLoaded]
  );

  const completeConnection = async (code: string, orgId: string) => {
    setIsConnecting(true);
    setProgress({
      step: 'TOKEN_EXCHANGE',
      status: 'in_progress',
      message: 'Connecting your WhatsApp Business account...',
    });

    try {
      const response = await api.post('/meta/callback', {
        code,
        organizationId: orgId,
      });

      if (response.data.success) {
        setProgress({
          step: 'COMPLETED',
          status: 'completed',
          message: 'WhatsApp account connected successfully!',
        });

        // Add new account to list
        if (response.data.data.account) {
          setAccounts((prev) => [response.data.data.account, ...prev]);
        }

        // Refresh accounts
        await loadAccounts();
      } else {
        throw new Error(response.data.message || 'Connection failed');
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to complete connection';
      setError(errorMessage);
      setProgress({
        step: 'COMPLETED',
        status: 'error',
        message: errorMessage,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectAccount = async (accountId: string) => {
    try {
      await api.delete(`/meta/organizations/${organizationId}/accounts/${accountId}`);
      setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to disconnect account');
    }
  };

  const setDefaultAccount = async (accountId: string) => {
    try {
      await api.post(`/meta/organizations/${organizationId}/accounts/${accountId}/default`);
      setAccounts((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === accountId,
        }))
      );
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to set default account');
    }
  };

  const refreshHealth = async (accountId: string) => {
    try {
      const response = await api.post(
        `/meta/organizations/${organizationId}/accounts/${accountId}/health`
      );
      
      // Update account in list with new health data
      if (response.data.data) {
        await loadAccounts();
      }
      
      return response.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to refresh health');
    }
  };

  const syncTemplates = async (accountId: string) => {
    try {
      const response = await api.post(
        `/meta/organizations/${organizationId}/accounts/${accountId}/sync-templates`
      );
      return response.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to sync templates');
    }
  };

  const clearError = useCallback(() => {
    setError(null);
    setProgress(null);
  }, []);

  return {
    accounts,
    isLoading,
    isConnecting,
    error,
    progress,
    config,
    sdkLoaded,
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