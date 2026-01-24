import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { MousePointer2 } from 'lucide-react';
import type { ChatbotNodeData } from '../../../types/chatbot';

const ButtonNode: React.FC<NodeProps<ChatbotNodeData>> = ({ data, selected }) => {
  return (
    <div className={`bg-white border-2 rounded-xl shadow-md min-w-62.5 transition-all ${
      selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
    }`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />
      
      <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 rounded-t-lg flex items-center">
        <MousePointer2 className="w-4 h-4 text-blue-600 mr-2" />
        <span className="font-semibold text-blue-900 text-sm">Buttons / Options</span>
      </div>
      
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-3">{data.content || 'Select an option:'}</p>
        <div className="space-y-2">
          {data.options?.map((option, index) => (
            <div key={index} className="relative">
              <div className="bg-gray-100 px-3 py-2 rounded text-sm text-center text-gray-700 border border-gray-200">
                {option}
              </div>
              <Handle
                type="source"
                position={Position.Right}
                id={`option-${index}`}
                className="w-3 h-3 bg-blue-500 -right-1.5 top-1/2 -translate-y-1/2"
              />
            </div>
          ))}
          {(!data.options || data.options.length === 0) && (
            <p className="text-xs text-gray-400 italic">No buttons added</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ButtonNode;