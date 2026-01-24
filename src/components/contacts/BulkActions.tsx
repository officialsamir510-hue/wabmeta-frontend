import React, { useState } from 'react';
import {
  Send,
  Tag,
  Trash2,
  Download,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  MessageSquare
} from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAction: (action: string) => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onClearSelection,
  onBulkAction
}) => {
  const [showMore, setShowMore] = useState(false);

  const primaryActions = [
    { id: 'send-message', label: 'Send Message', icon: Send, color: 'bg-primary-500 hover:bg-primary-600 text-white' },
    { id: 'add-tag', label: 'Add Tag', icon: Tag, color: 'bg-blue-500 hover:bg-blue-600 text-white' },
    { id: 'export', label: 'Export', icon: Download, color: 'bg-gray-100 hover:bg-gray-200 text-gray-700' },
  ];

  const moreActions = [
    { id: 'add-to-group', label: 'Add to Group', icon: UserPlus },
    { id: 'remove-from-group', label: 'Remove from Group', icon: UserMinus },
    { id: 'send-campaign', label: 'Add to Campaign', icon: MessageSquare },
    { id: 'delete', label: 'Delete Selected', icon: Trash2, danger: true },
  ];

  return (
    <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Selection Info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
            {selectedCount}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {selectedCount} contact{selectedCount > 1 ? 's' : ''} selected
            </p>
            <button
              onClick={onClearSelection}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear selection
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {primaryActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onBulkAction(action.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors ${action.color}`}
            >
              <action.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          ))}

          {/* More Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMore(!showMore)}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMore && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMore(false)}
                ></div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20 animate-fade-in">
                  {moreActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => {
                        onBulkAction(action.id);
                        setShowMore(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-2 text-left transition-colors ${
                        action.danger
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <action.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;