// src/components/dashboard/ConnectionStatus.tsx

import React from 'react';
import { Phone, CheckCircle, Wifi, WifiOff, Settings, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WhatsAppAccount {
  id: string;
  phoneNumber: string;
  displayName: string;
  status: string;
  isDefault: boolean;
}

interface ConnectionProps {
  isConnected: boolean;
  status: string;
  accounts?: WhatsAppAccount[];
  connectedAt?: string;
}

interface Props {
  connection: ConnectionProps;
  onDisconnect: () => void;
  disconnectLoading?: boolean;
}

const ConnectionStatus: React.FC<Props> = ({
  connection,
  onDisconnect,
  disconnectLoading,
}) => {
  const { isConnected, accounts = [] } = connection;
  const defaultAccount = accounts.find((a) => a.isDefault) || accounts[0];
  const connectedAccounts = accounts.filter((a) => a.status === 'CONNECTED');

  if (!isConnected || connectedAccounts.length === 0) {
    return null;
  }

  return (
    <div className="bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Status & Accounts */}
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-14 h-14 bg-green-100 dark:bg-green-900/50 rounded-2xl flex items-center justify-center shrink-0">
            <Wifi className="w-7 h-7 text-green-600 dark:text-green-400" />
          </div>
          
          {/* Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                WhatsApp Connected
              </h3>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            
            {/* Primary Account */}
            {defaultAccount && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Phone className="w-4 h-4" />
                <span className="font-semibold">{defaultAccount.displayName}</span>
                <span className="text-gray-500">•</span>
                <span className="font-mono text-sm">{defaultAccount.phoneNumber}</span>
                {defaultAccount.isDefault && (
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                )}
              </div>
            )}
            
            {/* Additional Accounts Count */}
            {connectedAccounts.length > 1 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                +{connectedAccounts.length - 1} more account{connectedAccounts.length > 2 ? 's' : ''} connected
              </p>
            )}
          </div>
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-3 lg:shrink-0">
          <Link
            to="/dashboard/settings?tab=whatsapp"
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Manage</span>
          </Link>
          
          <button
            onClick={onDisconnect}
            disabled={disconnectLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
          >
            <WifiOff className="w-4 h-4" />
            <span>{disconnectLoading ? 'Disconnecting...' : 'Disconnect'}</span>
          </button>
        </div>
      </div>
      
      {/* Accounts List (if multiple) */}
      {connectedAccounts.length > 1 && (
        <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            All Connected Accounts:
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {connectedAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {account.displayName || 'WhatsApp'}
                    </p>
                    {account.isDefault && (
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {account.phoneNumber}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;