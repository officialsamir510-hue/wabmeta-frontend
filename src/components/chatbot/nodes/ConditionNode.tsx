import { Handle, Position } from 'reactflow';
import { Zap } from 'lucide-react';

const ConditionNode = ({ data }: any) => {
  return (
    <div className="px-4 py-3 bg-white border-2 border-orange-500 rounded-lg shadow-lg min-w-50">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-orange-500" />
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-orange-500" />
        <span className="font-medium text-gray-900">Condition</span>
      </div>
      <p className="text-sm text-gray-600">
        {data.condition?.type}: {data.condition?.value || 'Not set'}
      </p>
      <div className="flex justify-between mt-2">
        <Handle type="source" position={Position.Bottom} id="yes" className="w-3 h-3 bg-green-500" style={{ left: '25%' }} />
        <Handle type="source" position={Position.Bottom} id="no" className="w-3 h-3 bg-red-500" style={{ left: '75%' }} />
      </div>
    </div>
  );
};

export default ConditionNode;