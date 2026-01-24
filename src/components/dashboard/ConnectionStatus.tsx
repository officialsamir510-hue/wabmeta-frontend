import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  WifiOff,
  Phone,
  Building2,
  Zap,
  BarChart3
} from 'lucide-react';
import type { MetaConnection } from '../../types/meta';

export interface ConnectionStatusProps {
  connection: MetaConnection;
  onDisconnect?: () => void; // Add this line
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  connection, 
  onDisconnect = () => {} 
}) => {
  if (connection.isConnected) {
    return (
      <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${
        connection.isConnected 
          ? 'bg-green-100 text-green-700' 
          : 'bg-gray-100 text-gray-600'
      }`}>
        {connection.isConnected ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span>Not Connected</span>
          </>
        )}
        {onDisconnect && (
          <button
            onClick={onDisconnect}
            className="ml-4 px-4 py-2 bg-red-500 text-white rounded"
          >
            Disconnect
          </button>
        )}
      </div>
    );
  }

  if (!connection.isConnected) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-800">Not Connected</h4>
            <p className="text-sm text-amber-700 mt-1">
              Connect your WhatsApp Business Account to start sending messages.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { businessAccount } = connection;

  // Determine Limit Color
  const getLimitColor = (limit: string) => {
    if (limit.includes('Unlimited')) return 'bg-purple-100 text-purple-700';
    if (limit.includes('100K')) return 'bg-blue-100 text-blue-700';
    if (limit.includes('10K')) return 'bg-green-100 text-green-700';
    if (limit.includes('1K')) return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white border border-green-200 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Connection Info */}
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-gray-900 text-lg">Connected</h4>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
            </div>
            
            {businessAccount && (
              <div className="mt-1 space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-medium">{businessAccount.name}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{businessAccount.phoneNumber}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Limits & Quality */}
        {businessAccount && (
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Messaging Limit Badge */}
            <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg border ${
              getLimitColor(businessAccount.messagingLimit).replace('bg-', 'border-').replace('text-', 'bg-opacity-10 bg-')
            }`}>
              <div className={`p-1.5 rounded-md ${getLimitColor(businessAccount.messagingLimit)}`}>
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Daily Limit</p>
                <p className="font-bold text-gray-900">{businessAccount.messagingLimit}</p>
              </div>
            </div>

            {/* Quality Rating Badge */}
            <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg border ${
              businessAccount.qualityRating === 'GREEN' 
                ? 'border-green-200 bg-green-50' 
                : businessAccount.qualityRating === 'YELLOW'
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-red-200 bg-red-50'
            }`}>
              <div className={`p-1.5 rounded-md ${
                businessAccount.qualityRating === 'GREEN' ? 'bg-green-100 text-green-700' :
                businessAccount.qualityRating === 'YELLOW' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Quality</p>
                <p className={`font-bold ${
                  businessAccount.qualityRating === 'GREEN' ? 'text-green-700' :
                  businessAccount.qualityRating === 'YELLOW' ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {businessAccount.qualityRating}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;