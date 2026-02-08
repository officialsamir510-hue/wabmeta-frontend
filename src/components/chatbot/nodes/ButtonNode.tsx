import { Handle, Position } from 'reactflow';
import { Plus } from 'lucide-react';

const ButtonNode = ({ data }: any) => {
  return (
    <div className="px-4 py-3 bg-white border-2 border-purple-500 rounded-lg shadow-lg min-w-50">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-500" />
      <div className="flex items-center gap-2 mb-2">
        <Plus className="w-4 h-4 text-purple-500" />
        <span className="font-medium text-gray-900">Buttons</span>
      </div>
      <div className="space-y-1">
        {data.buttons?.map((btn: any, idx: number) => (
          <div key={idx} className="text-sm bg-purple-50 px-2 py-1 rounded">
            {btn.text}
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-purple-500" />
    </div>
  );
};

export default ButtonNode;