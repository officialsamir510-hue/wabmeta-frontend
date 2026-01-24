import React, { useState } from 'react';
import { Search, Plus, Zap, Edit2, Trash2, X } from 'lucide-react';
import type { QuickReply } from '../../types/chat';

interface QuickRepliesProps {
  replies: QuickReply[];
  onSelect: (reply: QuickReply) => void;
  onAdd?: (reply: Omit<QuickReply, 'id'>) => void;
  onEdit?: (reply: QuickReply) => void;
  onDelete?: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const QuickReplies: React.FC<QuickRepliesProps> = ({
  replies,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  isOpen,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newReply, setNewReply] = useState({ title: '', message: '', shortcut: '' });

  const filteredReplies = replies.filter(reply =>
    reply.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reply.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reply.shortcut?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    if (newReply.title && newReply.message) {
      onAdd?.(newReply);
      setNewReply({ title: '', message: '', shortcut: '' });
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-fade-in z-20">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-gray-900">Quick Replies</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAdding(true)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search replies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Add New Form */}
      {isAdding && (
        <div className="p-3 bg-gray-50 border-b border-gray-200 animate-fade-in">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Title"
              value={newReply.title}
              onChange={(e) => setNewReply({ ...newReply, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <textarea
              placeholder="Message"
              value={newReply.message}
              onChange={(e) => setNewReply({ ...newReply, message: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Shortcut (e.g., /hello)"
                value={newReply.shortcut}
                onChange={(e) => setNewReply({ ...newReply, shortcut: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewReply({ title: '', message: '', shortcut: '' });
                }}
                className="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replies List */}
      <div className="max-h-75 overflow-y-auto">
        {filteredReplies.length > 0 ? (
          filteredReplies.map((reply) => (
            <div
              key={reply.id}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 group transition-colors"
              onClick={() => onSelect(reply)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{reply.title}</h4>
                    {reply.shortcut && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-mono">
                        {reply.shortcut}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 truncate">{reply.message}</p>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(reply);
                    }}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(reply.id);
                    }}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            <Zap className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No quick replies found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickReplies;