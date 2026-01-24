import React, { useState } from 'react';
import { CheckCircle2, XCircle, Filter, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import type { WebhookLog } from '../../types/settings';

const WebhookLogs: React.FC = () => {
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const logs: WebhookLog[] = [
    {
      id: 'evt_1',
      event: 'message_received',
      status: 'success',
      timestamp: '2024-01-20 10:30:45',
      payload: JSON.stringify({ type: 'text', from: '919876543210', content: 'Hello' }, null, 2)
    },
    {
      id: 'evt_2',
      event: 'message_status',
      status: 'success',
      timestamp: '2024-01-20 10:31:00',
      payload: JSON.stringify({ status: 'delivered', message_id: 'msg_123' }, null, 2)
    },
    {
      id: 'evt_3',
      event: 'template_update',
      status: 'failed',
      timestamp: '2024-01-20 10:35:12',
      payload: JSON.stringify({ error: 'Signature verification failed' }, null, 2)
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Webhook Logs</h3>
        <div className="flex space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {logs.map((log) => (
          <div key={log.id} className="group">
            <div 
              className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
            >
              <div className="flex items-center space-x-4">
                {log.status === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{log.event}</p>
                  <p className="text-xs text-gray-500">{log.timestamp}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  log.status === 'success' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {log.status.toUpperCase()}
                </span>
                {expandedLog === log.id ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
            
            {expandedLog === log.id && (
              <div className="px-4 pb-4 bg-gray-50">
                <pre className="p-3 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto font-mono">
                  {log.payload}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WebhookLogs;