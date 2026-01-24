import React, { useState } from 'react';
import { Eye, EyeOff, Copy, CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react';
import type { ApiConfiguration } from '../../types/settings';

const ApiConfig: React.FC = () => {
  const [showToken, setShowToken] = useState(false);
  const [config, setConfig] = useState<ApiConfiguration>({
    wabaId: '109876543210987',
    phoneNumberId: '123456789012345',
    accessToken: 'EAAG...',
    webhookUrl: 'https://api.wabmeta.com/webhook/wh_12345',
    verifyToken: 'wabmeta_verify_123'
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Add toast notification logic here
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Meta API Credentials</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp Business Account ID
            </label>
            <div className="flex">
              <input
                type="text"
                value={config.wabaId}
                readOnly
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-l-xl focus:outline-none text-gray-600 font-mono text-sm"
              />
              <button
                onClick={() => handleCopy(config.wabaId)}
                className="px-4 border border-l-0 border-gray-200 rounded-r-xl hover:bg-gray-50 transition-colors"
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number ID
            </label>
            <div className="flex">
              <input
                type="text"
                value={config.phoneNumberId}
                readOnly
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-l-xl focus:outline-none text-gray-600 font-mono text-sm"
              />
              <button
                onClick={() => handleCopy(config.phoneNumberId)}
                className="px-4 border border-l-0 border-gray-200 rounded-r-xl hover:bg-gray-50 transition-colors"
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permanent Access Token
            </label>
            <div className="flex">
              <input
                type={showToken ? 'text' : 'password'}
                value={config.accessToken}
                readOnly
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-l-xl focus:outline-none text-gray-600 font-mono text-sm"
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="px-3 border-y border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {showToken ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </button>
              <button
                onClick={() => handleCopy(config.accessToken)}
                className="px-4 border border-l-0 border-gray-200 rounded-r-xl hover:bg-gray-50 transition-colors"
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Used to authenticate requests to the WhatsApp Business API.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Webhook Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Callback URL
            </label>
            <div className="flex">
              <input
                type="text"
                value={config.webhookUrl}
                readOnly
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-l-xl focus:outline-none text-gray-600 font-mono text-sm"
              />
              <button
                onClick={() => handleCopy(config.webhookUrl)}
                className="px-4 border border-l-0 border-gray-200 rounded-r-xl hover:bg-gray-50 transition-colors"
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verify Token
            </label>
            <div className="flex">
              <input
                type="text"
                value={config.verifyToken}
                readOnly
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-l-xl focus:outline-none text-gray-600 font-mono text-sm"
              />
              <button
                onClick={() => {
                  // Generate new token logic
                  setConfig({ ...config, verifyToken: 'new_token_' + Date.now() });
                }}
                className="px-3 border-y border-gray-200 hover:bg-gray-50 transition-colors"
                title="Regenerate Token"
              >
                <RefreshCw className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => handleCopy(config.verifyToken)}
                className="px-4 border border-l-0 border-gray-200 rounded-r-xl hover:bg-gray-50 transition-colors"
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 text-sm">Webhook Active</h4>
              <p className="text-green-700 text-sm mt-1">
                Last event received: 2 minutes ago
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div>
          <h4 className="font-medium text-yellow-900">Important Security Note</h4>
          <p className="text-sm text-yellow-800 mt-1">
            Keep your Access Token and App Secret secure. Do not share them in public repositories or client-side code.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiConfig;