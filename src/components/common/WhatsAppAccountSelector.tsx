// src/components/common/WhatsAppAccountSelector.tsx

import React from 'react';
import { Phone, CheckCircle, Star } from 'lucide-react';

interface WhatsAppAccount {
  id: string;
  phoneNumber: string;
  displayName: string;
  status: string;
  isDefault: boolean;
}

interface Props {
  accounts: WhatsAppAccount[];
  selectedId?: string;
  onSelect: (account: WhatsAppAccount) => void;
  showStatus?: boolean;
}

const WhatsAppAccountSelector: React.FC<Props> = ({
  accounts,
  selectedId,
  onSelect,
  showStatus = true,
}) => {
  if (!accounts || accounts.length === 0) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-center">
        <Phone className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
        <p className="text-yellow-700 dark:text-yellow-300">
          No WhatsApp accounts connected
        </p>
        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
          Go to Settings → WhatsApp to connect
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select WhatsApp Account
      </label>
      
      <div className="grid gap-3">
        {accounts.map((account) => {
          const isSelected = selectedId === account.id;
          const isConnected = account.status === 'CONNECTED';
          
          return (
            <button
              key={account.id}
              type="button"
              onClick={() => onSelect(account)}
              disabled={!isConnected}
              className={`
                relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left
                ${isSelected 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
                ${!isConnected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Phone Icon */}
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${isConnected 
                  ? 'bg-green-100 dark:bg-green-900/50' 
                  : 'bg-gray-100 dark:bg-gray-800'
                }
              `}>
                <Phone className={`w-6 h-6 ${isConnected ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              
              {/* Account Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white truncate">
                    {account.displayName || 'WhatsApp Business'}
                  </span>
                  
                  {account.isDefault && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 text-xs font-medium rounded-full">
                      <Star className="w-3 h-3" />
                      Default
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {account.phoneNumber}
                </p>
                
                {showStatus && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span className={`text-xs ${
                      isConnected 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-500'
                    }`}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Selection Indicator */}
              {isSelected && (
                <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WhatsAppAccountSelector;