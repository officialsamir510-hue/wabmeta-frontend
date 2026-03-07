import React from 'react';
import { Handle, Position } from 'reactflow';
import { GitBranch } from 'lucide-react';

const ConditionNode: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="px-4 py-3 bg-white dark:bg-gray-700 rounded-lg shadow-lg border-2 border-yellow-400 min-w-[180px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-yellow-500" />
      <div className="flex items-center gap-2 mb-2">
        <GitBranch className="w-4 h-4 text-yellow-500" />
        <span className="font-medium text-gray-900 dark:text-white">Condition</span>
      </div>
      <p className="text-xs text-gray-500">
        {data.condition?.variable} {data.condition?.operator} {data.condition?.value || '...'}
      </p>
      <div className="flex justify-between mt-2 text-xs">
        <div className="relative">
          <span className="text-green-600">Yes</span>
          <Handle type="source" position={Position.Bottom} id="true" className="w-2 h-2 bg-green-500" style={{ left: '20%' }} />
        </div>
        <div className="relative">
          <span className="text-red-600">No</span>
          <Handle type="source" position={Position.Bottom} id="false" className="w-2 h-2 bg-red-500" style={{ left: '80%' }} />
        </div>
      </div>
    </div>
  );
};

export default ConditionNode;