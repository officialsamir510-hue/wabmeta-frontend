// src/components/dashboard/MetaConnectModal.tsx

import React, { useState, useEffect } from 'react';
import { X, MessageCircle, CheckCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useMetaConnection } from '../../hooks/useMetaConnection';
import { ConnectionProgress, WhatsAppAccount } from '../../types/meta';

interface MetaConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  onConnected?: (account: WhatsAppAccount) => void;
}

const progressSteps = [
  { key: 'INIT', label: 'Initializing...' },
  { key: 'TOKEN_EXCHANGE', label: 'Authenticating...' },
  { key: 'FETCHING_WABA', label: 'Fetching Business Account...' },
  { key: 'FETCHING_PHONE', label: 'Getting Phone Number...' },
  { key: 'SUBSCRIBE_WEBHOOK', label: 'Setting up Webhooks...' },
  { key: 'SAVING', label: 'Saving Account...' },
  { key: 'COMPLETED', label: 'Connected!' },
];

export const MetaConnectModal: React.FC<MetaConnectModalProps> = ({
  isOpen,
  onClose,
  organizationId,
  onConnected,
}) => {
  const {
    accounts,
    isConnecting,
    error,
    progress,
    sdkLoaded,
    startConnection,
    clearError,
    loadAccounts,
  } = useMetaConnection(organizationId);

  const [showAccounts, setShowAccounts] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAccounts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (progress?.step === 'COMPLETED' && progress?.status === 'completed') {
      // Delay to show success message
      const timer = setTimeout(() => {
        onConnected?.(accounts[0]);
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [progress, accounts, onConnected, onClose]);

  const handleConnect = () => {
    clearError();
    startConnection(organizationId);
  };

  const handleClose = () => {
    if (!isConnecting) {
      clearError();
      onClose();
    }
  };

  if (!isOpen) return null;

  const getCurrentStepIndex = () => {
    if (!progress) return -1;
    return progressSteps.findIndex((s) => s.key === progress.step);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform rounded-2xl bg-white shadow-2xl transition-all">
          {/* Close button */}
          {!isConnecting && (
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          )}

          {/* Content */}
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Connect WhatsApp Business
              </h2>
              <p className="mt-2 text-gray-600">
                Connect your WhatsApp Business account to start sending messages
              </p>
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">
                      Connection Failed
                    </p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                  <button
                    onClick={clearError}
                    className="text-red-400 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Connection Progress */}
            {isConnecting && progress && (
              <div className="mb-6">
                <div className="space-y-3">
                  {progressSteps.map((step, index) => {
                    const currentIndex = getCurrentStepIndex();
                    const isComplete = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isError =
                      isCurrent && progress.status === 'error';

                    return (
                      <div
                        key={step.key}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          isCurrent
                            ? isError
                              ? 'bg-red-50'
                              : 'bg-green-50'
                            : isComplete
                            ? 'bg-gray-50'
                            : ''
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {isComplete ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : isCurrent ? (
                            isError ? (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <Loader2 className="h-5 w-5 text-green-500 animate-spin" />
                            )
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            isCurrent
                              ? isError
                                ? 'text-red-700 font-medium'
                                : 'text-green-700 font-medium'
                              : isComplete
                              ? 'text-gray-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {isCurrent && progress.message
                            ? progress.message
                            : step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Existing Accounts */}
            {!isConnecting && accounts.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={() => setShowAccounts(!showAccounts)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <span>
                    {accounts.length} account{accounts.length > 1 ? 's' : ''} connected
                  </span>
                  <span className="text-green-600">{showAccounts ? 'Hide' : 'Show'}</span>
                </button>

                {showAccounts && (
                  <div className="mt-3 space-y-2">
                    {accounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {account.displayPhoneNumber || account.phoneNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {account.verifiedName}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {account.isDefault && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              Default
                            </span>
                          )}
                          <span
                            className={`w-2 h-2 rounded-full ${
                              account.connectionStatus === 'CONNECTED'
                                ? 'bg-green-500'
                                : 'bg-red-500'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Connect Button */}
            {!isConnecting && (
              <button
                onClick={handleConnect}
                disabled={!sdkLoaded}
                className="w-full py-4 px-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {!sdkLoaded ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-5 w-5" />
                    {accounts.length > 0
                      ? 'Connect Another Account'
                      : 'Connect WhatsApp Business'}
                  </>
                )}
              </button>
            )}

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By connecting, you agree to Meta's{' '}
                <a
                  href="https://www.whatsapp.com/legal/business-terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  WhatsApp Business Terms
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaConnectModal;