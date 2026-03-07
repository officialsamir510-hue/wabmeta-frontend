import React from 'react';
import { MessageSquare, MousePointer, GitBranch, Clock, Zap, StopCircle } from 'lucide-react';

const nodeTypes = [
  { type: 'message', label: 'Message', icon: MessageSquare, color: 'bg-blue-500' },
  { type: 'button', label: 'Buttons', icon: MousePointer, color: 'bg-purple-500' },
  { type: 'condition', label: 'Condition', icon: GitBranch, color: 'bg-yellow-500' },
  { type: 'delay', label: 'Delay', icon: Clock, color: 'bg-orange-500' },
  { type: 'action', label: 'Action', icon: Zap, color: 'bg-pink-500' },
  { type: 'end', label: 'End', icon: StopCircle, color: 'bg-red-500' },
];

const NodeSidebar: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-medium text-gray-500 mb-3">DRAG TO ADD</h3>
      <div className="space-y-2">
        {nodeTypes.map(({ type, label, icon: Icon, color }) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => onDragStart(e, type)}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-move hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodeSidebar;