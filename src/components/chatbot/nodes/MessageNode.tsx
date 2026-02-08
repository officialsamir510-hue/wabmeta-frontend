import { Handle, Position } from 'reactflow';
import { MessageSquare } from 'lucide-react';

const MessageNode = ({ data }: any) => {
  return (
    <div className="px-4 py-3 bg-white border-2 border-blue-500 rounded-lg shadow-lg min-w-50">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-4 h-4 text-blue-500" />
        <span className="font-medium text-gray-900">Message</span>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2">{data.message || 'No message set'}</p>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  );
};

export default MessageNode;