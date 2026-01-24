import React, { useState } from 'react';
import { X, Zap, ArrowRight, Save } from 'lucide-react';
import type { AutomationRule, TriggerType, ActionType } from '../../types/automation';

interface CreateRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: Omit<AutomationRule, 'id' | 'executionCount'>) => void;
}

const CreateRuleModal: React.FC<CreateRuleModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState<TriggerType>('keyword_match');
  const [triggerValue, setTriggerValue] = useState('');
  const [actionType, setActionType] = useState<ActionType>('send_message');
  const [actionValue, setActionValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      status: 'active',
      trigger: { type: triggerType, value: triggerValue },
      action: { type: actionType, value: actionValue }
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Create Automation Rule</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Welcome New Leads"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-6 relative">
            {/* IF Section */}
            <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">IF (Trigger)</span>
              
              <div className="space-y-3">
                <select
                  value={triggerType}
                  onChange={(e) => setTriggerType(e.target.value as TriggerType)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                >
                  <option value="keyword_match">Incoming Message Matches</option>
                  <option value="new_contact">New Contact Added</option>
                  <option value="tag_added">Tag Applied</option>
                </select>

                {triggerType === 'keyword_match' && (
                  <input
                    type="text"
                    placeholder="Enter keywords (comma separated)"
                    value={triggerValue}
                    onChange={(e) => setTriggerValue(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                  />
                )}
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-gray-400" />
            </div>

            {/* THEN Section */}
            <div className="flex-1 bg-primary-50 p-4 rounded-xl border border-primary-100">
              <span className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-3 block">THEN (Action)</span>
              
              <div className="space-y-3">
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as ActionType)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                >
                  <option value="send_message">Send Message</option>
                  <option value="add_tag">Add Tag</option>
                  <option value="assign_agent">Assign to Agent</option>
                </select>

                {actionType === 'send_message' && (
                  <textarea
                    placeholder="Enter message text..."
                    value={actionValue}
                    onChange={(e) => setActionValue(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm resize-none"
                  />
                )}
                {actionType === 'add_tag' && (
                  <input
                    type="text"
                    placeholder="Enter tag name"
                    value={actionValue}
                    onChange={(e) => setActionValue(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Rule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRuleModal;