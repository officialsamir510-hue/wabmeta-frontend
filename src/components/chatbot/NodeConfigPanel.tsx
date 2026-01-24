import React, { useState, useEffect } from 'react';
import type { Node } from 'reactflow';
import { X, Plus, Trash2, HelpCircle } from 'lucide-react';
import type { ChatbotNodeData } from '../../types/chatbot';

interface NodeConfigPanelProps {
  node: Node<ChatbotNodeData> | null;
  onChange: (nodeId: string, data: ChatbotNodeData) => void;
  onClose: () => void;
}

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({ node, onChange, onClose }) => {
  const [data, setData] = useState<ChatbotNodeData | null>(null);

  useEffect(() => {
    if (node) {
      setData(node.data);
    }
  }, [node]);

  if (!node || !data) return null;

  const handleChange = (key: string, value: any) => {
    const newData = { ...data, [key]: value };
    setData(newData);
    onChange(node.id, newData);
  };

  const handleAddOption = () => {
    const options = data.options || [];
    handleChange('options', [...options, `Button ${options.length + 1}`]);
  };

  const handleRemoveOption = (index: number) => {
    const options = data.options || [];
    handleChange('options', options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    const options = [...(data.options || [])];
    options[index] = value;
    handleChange('options', options);
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div>
          <h3 className="font-semibold text-gray-900">
            {node.type === 'message' && 'Send Message'}
            {node.type === 'button' && 'Buttons / Options'}
            {node.type === 'condition' && 'Condition'}
            {node.type === 'start' && 'Start Flow'}
          </h3>
          <p className="text-xs text-gray-500">ID: {node.id}</p>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-lg">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Message Node Config */}
        {node.type === 'message' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message Content</label>
            <textarea
              value={data.content || ''}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Type your message here..."
            />
            <p className="text-xs text-gray-500 mt-1">
              You can use variables like {'{{name}}'}
            </p>
          </div>
        )}

        {/* Button Node Config */}
        {node.type === 'button' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Text</label>
              <textarea
                value={data.content || ''}
                onChange={(e) => handleChange('content', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ask a question..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Options</label>
              <div className="space-y-2">
                {data.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      onClick={() => handleRemoveOption(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {(!data.options || data.options.length < 3) && (
                <button
                  onClick={handleAddOption}
                  className="mt-3 w-full flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Add Button</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Condition Node Config */}
        {node.type === 'condition' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Variable</label>
              <select
                value={data.condition?.field || ''}
                onChange={(e) => handleChange('condition', { ...data.condition, field: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select variable...</option>
                <option value="last_reply">Last User Reply</option>
                <option value="contact_name">Contact Name</option>
                <option value="tags">Tags</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Operator</label>
              <select
                value={data.condition?.operator || ''}
                onChange={(e) => handleChange('condition', { ...data.condition, operator: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
                <option value="starts_with">Starts with</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
              <input
                type="text"
                value={data.condition?.value || ''}
                onChange={(e) => handleChange('condition', { ...data.condition, value: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Value to check..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-yellow-50 p-3 rounded-lg flex items-start space-x-2">
          <HelpCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
          <p className="text-xs text-yellow-800">
            Changes are saved automatically to the local state. Don't forget to save the flow!
          </p>
        </div>
      </div>
    </div>
  );
};

export default NodeConfigPanel;