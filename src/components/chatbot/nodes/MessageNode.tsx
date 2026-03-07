import React from 'react';
import { Handle, Position } from 'reactflow';
import { MessageSquare } from 'lucide-react';

const MessageNode: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="px-4 py-3 bg-white dark:bg-gray-700 rounded-lg shadow-lg border-2 border-blue-400 min-w-[200px] max-w-[280px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-4 h-4 text-blue-500" />
        <span className="font-medium text-gray-900 dark:text-white">Message</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
        {data.message || 'Enter message...'}
      </p>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  );
};

export default MessageNode;