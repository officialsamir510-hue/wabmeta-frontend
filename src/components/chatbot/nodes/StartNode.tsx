import { Handle, Position } from 'reactflow';
import { Play } from 'lucide-react';

const StartNode = () => {
  return (
    <div className="bg-white border-2 border-green-500 rounded-xl shadow-md min-w-50">
      <div className="bg-green-50 px-4 py-2 border-b border-green-100 rounded-t-lg flex items-center">
        <Play className="w-4 h-4 text-green-600 mr-2" />
        <span className="font-semibold text-green-900 text-sm">Start Flow</span>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-500">Trigger: Incoming Message</p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
    </div>
  );
};

export default StartNode;