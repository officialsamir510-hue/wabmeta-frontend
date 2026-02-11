// src/components/common/WhatsAppAccountSelector.tsx

import React, { useState } from 'react';
import {
  Phone,
  ChevronDown,
  Check,
  AlertCircle,
  RefreshCw,
  Plus,
  Settings,
} from 'lucide-react';
import { WhatsAppAccount } from '../../types/meta';

interface WhatsAppAccountSelectorProps {
  accounts: WhatsAppAccount[];
  selectedAccountId: string | null;
  onSelect: (accountId: string) => void;
  onRefresh?: (accountId: string) => Promise<void>;
  onAddNew?: () => void;
  onSettings?: (accountId: string) => void;
  isLoading?: boolean;
}

export const WhatsAppAccountSelector: React.FC<WhatsAppAccountSelectorProps> = ({
  accounts,
  selectedAccountId,
  onSelect,
  onRefresh,
  onAddNew,
  onSettings,
  isLoading,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  const handleRefresh = async (accountId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRefresh) return;

    setRefreshingId(accountId);
    try {
      await onRefresh(accountId);
    } finally {
      setRefreshingId(null);
    }
  };

  const getStatusColor = (account: WhatsAppAccount) => {
    if (account.connectionStatus === 'CONNECTED' && account.status === 'ACTIVE') {
      return 'bg-green-500';
    } else if (account.connectionStatus === 'RECONNECTING') {
      return 'bg-yellow-500';
    } else {
      return 'bg-red-500';
    }
  };

  const getQualityColor = (rating?: string) => {
    switch (rating) {
      case 'GREEN':
        return 'text-green-600 bg-green-50';
      case 'YELLOW':
        return 'text-yellow-600 bg-yellow-50';
      case 'RED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (accounts.length === 0) {
    return (
      <button
        onClick={onAddNew}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:text-green-600 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Connect WhatsApp
      </button>
    );
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors w-full min-w-[240px]"
      >
        <div className="relative">
          <Phone className="w-5 h-5 text-gray-500" />
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
              selectedAccount
                ? getStatusColor(selectedAccount)
                : 'bg-gray-400'
            }`}
          />
        </div>

        <div className="flex-1 text-left">
          {selectedAccount ? (
            <>
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedAccount.displayPhoneNumber || selectedAccount.phoneNumber}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {selectedAccount.verifiedName || 'WhatsApp Business'}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">Select account</p>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full left-0 mt-2 w-full min-w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
            {/* Account List */}
            <div className="max-h-64 overflow-y-auto">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                    account.id === selectedAccountId ? 'bg-green-50' : ''
                  }`}
                  onClick={() => {
                    onSelect(account.id);
                    setIsOpen(false);
                  }}
                >
                  {/* Selection indicator */}
                  <div className="w-5 flex-shrink-0">
                    {account.id === selectedAccountId && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                  </div>

                  {/* Account info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {account.displayPhoneNumber || account.phoneNumber}
                      </p>
                      {account.isDefault && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${getStatusColor(
                          account
                        )}`}
                      />
                      <p className="text-xs text-gray-500 truncate">
                        {account.verifiedName || 'WhatsApp Business'}
                      </p>
                    </div>
                  </div>

                  {/* Quality rating */}
                  {account.qualityRating && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-medium rounded ${getQualityColor(
                        account.qualityRating
                      )}`}
                    >
                      {account.qualityRating}
                    </span>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {onRefresh && (
                      <button
                        onClick={(e) => handleRefresh(account.id, e)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        disabled={refreshingId === account.id}
                      >
                        <RefreshCw
                          className={`w-4 h-4 ${
                            refreshingId === account.id ? 'animate-spin' : ''
                          }`}
                        />
                      </button>
                    )}
                    {onSettings && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSettings(account.id);
                          setIsOpen(false);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add New */}
            {onAddNew && (
              <>
                <div className="border-t border-gray-100 my-2" />
                <button
                  onClick={() => {
                    onAddNew();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Connect Another Account
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WhatsAppAccountSelector;