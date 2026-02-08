import { Handle, Position } from 'reactflow';

const StartNode = () => {
  return (
    <div className="px-4 py-2 bg-green-500 text-white rounded-full shadow-lg">
      <div className="font-medium">Start</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-700" />
    </div>
  );
};

export default StartNode;