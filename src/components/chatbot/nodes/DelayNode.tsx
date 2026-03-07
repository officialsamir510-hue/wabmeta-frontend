import React from 'react';
import { Handle, Position } from 'reactflow';
import { Clock } from 'lucide-react';

const DelayNode: React.FC<{ data: any }> = ({ data }) => {
    const seconds = (data.delay || 1000) / 1000;

    return (
        <div className="px-4 py-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg border-2 border-orange-400 min-w-[120px]">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-orange-500" />
            <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-gray-900 dark:text-white">Wait {seconds}s</span>
            </div>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-orange-500" />
        </div>
    );
};

export default DelayNode;