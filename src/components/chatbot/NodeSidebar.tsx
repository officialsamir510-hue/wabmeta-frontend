import React from 'react';
import { 
  MessageSquare, 
  MousePointer2, 
  GitFork, 
  Zap,
  Image,
  Clock,
  User,
  GripVertical
} from 'lucide-react';

const NodeSidebar: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const nodes = [
    { type: 'message', label: 'Send Message', icon: MessageSquare, color: 'text-primary-600', bg: 'bg-primary-50' },
    { type: 'button', label: 'Buttons', icon: MousePointer2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { type: 'condition', label: 'Condition', icon: GitFork, color: 'text-orange-600', bg: 'bg-orange-50' },
    { type: 'action', label: 'Action', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
    { type: 'media', label: 'Media', icon: Image, color: 'text-pink-600', bg: 'bg-pink-50' },
    { type: 'delay', label: 'Delay', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { type: 'input', label: 'User Input', icon: User, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col h-full">
      <h3 className="font-semibold text-gray-900 mb-4">Components</h3>
      <p className="text-xs text-gray-500 mb-4">Drag and drop nodes to the canvas</p>
      
      <div className="space-y-3 flex-1 overflow-y-auto">
        {nodes.map((node) => (
          <div
            key={node.type}
            onDragStart={(event) => onDragStart(event, node.type)}
            draggable
            className="flex items-center p-3 bg-white border border-gray-200 rounded-xl cursor-grab hover:border-primary-500 hover:shadow-sm transition-all group"
          >
            <GripVertical className="w-4 h-4 text-gray-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className={`w-8 h-8 ${node.bg} rounded-lg flex items-center justify-center mr-3`}>
              <node.icon className={`w-4 h-4 ${node.color}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">{node.label}</span>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="bg-blue-50 p-3 rounded-xl">
          <p className="text-xs text-blue-800">
            <strong>Tip:</strong> You can connect nodes by dragging from handles.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NodeSidebar;