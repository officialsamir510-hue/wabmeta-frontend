import React from 'react';
import { Handle, Position } from 'reactflow';
import { MousePointer } from 'lucide-react';

const ButtonNode: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="px-4 py-3 bg-white dark:bg-gray-700 rounded-lg shadow-lg border-2 border-purple-400 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-500" />
      <div className="flex items-center gap-2 mb-2">
        <MousePointer className="w-4 h-4 text-purple-500" />
        <span className="font-medium text-gray-900 dark:text-white">Buttons</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{data.message || 'Choose an option:'}</p>
      <div className="space-y-1">
        {(data.buttons || []).map((btn: any, i: number) => (
          <div key={i} className="relative">
            <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-sm">
              {btn.text}
            </div>
            <Handle
              type="source"
              position={Position.Right}
              id={btn.id}
              className="w-2 h-2 bg-purple-500"
              style={{ top: '50%' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ButtonNode;
