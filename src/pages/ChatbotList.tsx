// ✅ CREATE: src/pages/ChatbotList.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bot, Plus, Search, MoreVertical, Play, Pause, Copy, Trash2,
  Loader2, Settings, Zap
} from 'lucide-react';
import { chatbots as chatbotsApi } from '../services/api';
import type { Chatbot } from '../types/chatbot';
import toast from 'react-hot-toast';

const ChatbotList: React.FC = () => {
  const navigate = useNavigate();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadChatbots();
  }, []);

  const loadChatbots = async () => {
    setLoading(true);
    try {
      const res = await chatbotsApi.getAll();
      if (res.data.success) {
        setChatbots(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load chatbots');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (chatbot: Chatbot) => {
    try {
      if (chatbot.status === 'ACTIVE') {
        await chatbotsApi.deactivate(chatbot.id);
        toast.success('Chatbot paused');
      } else {
        await chatbotsApi.activate(chatbot.id);
        toast.success('Chatbot activated');
      }
      loadChatbots();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDuplicate = async (chatbot: Chatbot) => {
    const newName = prompt('Enter name for duplicated chatbot:', `${chatbot.name} (Copy)`);
    if (!newName) return;

    try {
      await chatbotsApi.duplicate(chatbot.id, newName);
      toast.success('Chatbot duplicated');
      loadChatbots();
    } catch (err) {
      toast.error('Failed to duplicate');
    }
  };

  const handleDelete = async (chatbot: Chatbot) => {
    if (!confirm(`Delete "${chatbot.name}"?`)) return;

    try {
      await chatbotsApi.delete(chatbot.id);
      toast.success('Chatbot deleted');
      loadChatbots();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredChatbots = chatbots.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chatbots</h1>
          <p className="text-gray-600 dark:text-gray-400">Create automated conversation flows</p>
        </div>
        <Link
          to="/dashboard/chatbots/new"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
          Create Chatbot
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search chatbots..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
        />
      </div>

      {/* Chatbots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChatbots.map((chatbot) => (
          <div
            key={chatbot.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{chatbot.name}</h3>
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusBadge(chatbot.status)}`}>
                    {chatbot.status}
                  </span>
                </div>
              </div>

              <div className="relative group">
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 hidden group-hover:block z-10">
                  <button
                    onClick={() => navigate(`/dashboard/chatbots/${chatbot.id}`)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Flow
                  </button>
                  <button
                    onClick={() => handleToggleStatus(chatbot)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    {chatbot.status === 'ACTIVE' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {chatbot.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDuplicate(chatbot)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleDelete(chatbot)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {chatbot.description && (
              <p className="text-sm text-gray-500 mb-4">{chatbot.description}</p>
            )}

            <div className="space-y-2">
              {chatbot.triggerKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {chatbot.triggerKeywords.slice(0, 3).map((keyword, i) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">
                      {keyword}
                    </span>
                  ))}
                  {chatbot.triggerKeywords.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                      +{chatbot.triggerKeywords.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {chatbot.isDefault && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Zap className="w-3 h-3" />
                  Default for new conversations
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500">
                {chatbot.flowData?.nodes?.length || 0} nodes
              </span>
              <button
                onClick={() => navigate(`/dashboard/chatbots/${chatbot.id}`)}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Edit Flow →
              </button>
            </div>
          </div>
        ))}

        {filteredChatbots.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Bot className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No chatbots yet</h3>
            <p className="text-gray-500 mb-4">Create your first chatbot to automate conversations</p>
            <Link
              to="/dashboard/chatbots/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              <Plus className="w-5 h-5" />
              Create Chatbot
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotList;