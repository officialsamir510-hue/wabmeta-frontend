import React from 'react';
import { Handle, Position } from 'reactflow';
import { Play } from 'lucide-react';

const StartNode: React.FC<{ data: any }> = ({ data: _data }) => {
  return (
    <div className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg min-w-[120px]">
      <div className="flex items-center gap-2">
        <Play className="w-4 h-4" />
        <span className="font-medium">Start</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-700" />
    </div>
  );
};

export default StartNode;
