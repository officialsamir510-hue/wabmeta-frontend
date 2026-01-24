import React, { useState } from 'react';
import { Plus, Zap, Search, Trash2, Edit2, Play, Pause } from 'lucide-react';
import CreateRuleModal from '../components/automation/CreateRuleModal';
import type { AutomationRule } from '../types/automation';

const Automation: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Welcome Message',
      status: 'active',
      trigger: { type: 'new_contact' },
      action: { type: 'send_message', value: 'Hi there! Welcome to WabMeta.' },
      executionCount: 1250,
      lastExecuted: '5 mins ago'
    },
    {
      id: '2',
      name: 'Unsubscribe',
      status: 'active',
      trigger: { type: 'keyword_match', value: 'STOP, UNSUBSCRIBE' },
      action: { type: 'add_tag', value: 'Opt-out' },
      executionCount: 45,
      lastExecuted: '1 day ago'
    },
    {
      id: '3',
      name: 'Support Routing',
      status: 'inactive',
      trigger: { type: 'keyword_match', value: 'HELP, SUPPORT' },
      action: { type: 'assign_agent', value: 'Support Team' },
      executionCount: 300,
      lastExecuted: '1 week ago'
    }
  ]);

  const handleSaveRule = (newRule: Omit<AutomationRule, 'id' | 'executionCount'>) => {
    const rule: AutomationRule = {
      ...newRule,
      id: Date.now().toString(),
      executionCount: 0,
      lastExecuted: 'Never'
    };
    setRules([...rules, rule]);
  };

  const toggleStatus = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, status: rule.status === 'active' ? 'inactive' : 'active' } : rule
    ));
  };

  const handleDelete = (id: string) => {
    if(confirm('Are you sure?')) {
      setRules(rules.filter(r => r.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automation Rules</h1>
          <p className="text-gray-500 mt-1">Set up simple if-this-then-that rules</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Rule</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search rules..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {rules.map((rule) => (
            <div key={rule.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${rule.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                    <span className="font-medium bg-gray-100 px-2 py-0.5 rounded">
                      IF: {rule.trigger.type.replace('_', ' ')}
                    </span>
                    <span>→</span>
                    <span className="font-medium bg-primary-50 text-primary-700 px-2 py-0.5 rounded">
                      THEN: {rule.action.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{rule.executionCount} runs</p>
                  <p className="text-xs text-gray-500">Last: {rule.lastExecuted}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => toggleStatus(rule.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      rule.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}
                    title={rule.status === 'active' ? 'Pause' : 'Activate'}
                  >
                    {rule.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button className="p-2 hover:bg-blue-100 hover:text-blue-600 rounded-lg text-gray-400 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(rule.id)}
                    className="p-2 hover:bg-red-100 hover:text-red-600 rounded-lg text-gray-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateRuleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRule}
      />
    </div>
  );
};

export default Automation;