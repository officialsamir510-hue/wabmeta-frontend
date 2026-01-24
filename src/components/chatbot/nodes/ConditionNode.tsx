import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { GitFork } from 'lucide-react';
import type { ChatbotNodeData } from '../../../types/chatbot';

const ConditionNode: React.FC<NodeProps<ChatbotNodeData>> = ({ data, selected }) => {
  return (
    <div className={`bg-white border-2 rounded-xl shadow-md min-w-50 transition-all ${
      selected ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200'
    }`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />
      
      <div className="bg-orange-50 px-4 py-2 border-b border-orange-100 rounded-t-lg flex items-center justify-center">
        <GitFork className="w-4 h-4 text-orange-600 mr-2" />
        <span className="font-semibold text-orange-900 text-sm">Condition</span>
      </div>
      
      <div className="p-4 text-center">
        <p className="text-sm font-medium text-gray-700 mb-1">
          Check if:
        </p>
        <div className="bg-gray-100 rounded px-2 py-1 text-xs text-gray-600 mb-4">
          {data.condition ? `${data.condition.field} ${data.condition.operator} ${data.condition.value}` : 'No condition set'}
        </div>
        
        <div className="flex justify-between items-center px-2">
          <div className="relative">
            <span className="text-xs font-bold text-green-600 block mb-1">TRUE</span>
            <Handle
              type="source"
              position={Position.Bottom}
              id="true"
              className="w-3 h-3 bg-green-500 left-1/2 -translate-x-1/2"
            />
          </div>
          <div className="relative">
            <span className="text-xs font-bold text-red-600 block mb-1">FALSE</span>
            <Handle
              type="source"
              position={Position.Bottom}
              id="false"
              className="w-3 h-3 bg-red-500 left-1/2 -translate-x-1/2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConditionNode;