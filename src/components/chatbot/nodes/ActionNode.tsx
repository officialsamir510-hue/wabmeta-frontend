import React from 'react';
import { Handle, Position } from 'reactflow';
import { Zap } from 'lucide-react';

const ActionNode: React.FC<{ data: any }> = ({ data }) => {
    return (
        <div className="px-4 py-3 bg-white dark:bg-gray-700 rounded-lg shadow-lg border-2 border-pink-400 min-w-[160px]">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-pink-500" />
            <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-pink-500" />
                <span className="font-medium text-gray-900 dark:text-white">Action</span>
            </div>
            <p className="text-xs text-gray-500">{data.action?.type || 'Configure action'}</p>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-pink-500" />
        </div>
    );
};

export default ActionNode;