import React from 'react';
import { Handle, Position } from 'reactflow';
import { StopCircle } from 'lucide-react';

const EndNode: React.FC<{ data: any }> = ({ data: _data }) => {
    return (
        <div className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg min-w-[100px]">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-red-700" />
            <div className="flex items-center gap-2">
                <StopCircle className="w-4 h-4" />
                <span className="font-medium">End</span>
            </div>
        </div>
    );
};

export default EndNode;