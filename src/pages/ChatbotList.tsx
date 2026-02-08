// src/pages/ChatbotList.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Bot,
  Play,
  Pause,
  Trash2,
  Copy,
  Edit,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  MessageSquare,
  Settings,
} from 'lucide-react';
import { useChatbotList } from '../hooks/useChatbot';
import type { Chatbot } from '../types/chatbot';

const ChatbotList: React.FC = () => {
  const navigate = useNavigate();
  const {
    chatbots,
    loading,
    error,
    refresh,
    createChatbot,
    deleteChatbot,
    activateChatbot,
    deactivateChatbot,
    duplicateChatbot,
  } = useChatbotList();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  const [newChatbotName, setNewChatbotName] = useState('');
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filter chatbots based on search
  const filteredChatbots = chatbots.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle create new chatbot
  const handleCreateChatbot = async () => {
    if (!newChatbotName.trim()) return;

    try {
      setCreating(true);
      const newChatbot = await createChatbot({
        name: newChatbotName,
        description: '',
        flowData: {
          nodes: [
            {
              id: 'start',
              type: 'start',
              position: { x: 250, y: 50 },
              data: { label: 'Start' },
            },
          ],
          edges: [],
        },
        triggerKeywords: [],
        isDefault: false,
        welcomeMessage: 'Hello! How can I help you today?',
        fallbackMessage: "I'm sorry, I didn't understand that. Please try again.",
      });

      setShowCreateModal(false);
      setNewChatbotName('');
      navigate(`/dashboard/chatbot/edit/${newChatbot.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create chatbot');
    } finally {
      setCreating(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedChatbot) return;

    try {
      await deleteChatbot(selectedChatbot.id);
      setShowDeleteModal(false);
      setSelectedChatbot(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete chatbot');
    }
  };

  // Handle activate/deactivate
  const handleToggleStatus = async (chatbot: Chatbot) => {
    try {
      setActionLoading(chatbot.id);
      if (chatbot.status === 'ACTIVE') {
        await deactivateChatbot(chatbot.id);
      } else {
        await activateChatbot(chatbot.id);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update chatbot status');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle duplicate
  const handleDuplicate = async (chatbot: Chatbot) => {
    try {
      setActionLoading(chatbot.id);
      const duplicate = await duplicateChatbot(chatbot.id);
      navigate(`/dashboard/chatbot/edit/${duplicate.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to duplicate chatbot');
    } finally {
      setActionLoading(null);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Pause className="w-3 h-3 mr-1" />
            Paused
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            <Clock className="w-3 h-3 mr-1" />
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chatbots</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Create automated conversation flows for your customers
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Chatbot
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search chatbots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Chatbots Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredChatbots.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'No chatbots found' : 'No chatbots yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Create your first chatbot to automate customer conversations'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Chatbot
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChatbots.map((chatbot) => (
            <div
              key={chatbot.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      chatbot.status === 'ACTIVE' 
                        ? 'bg-green-100 dark:bg-green-900' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Bot className={`w-5 h-5 ${
                        chatbot.status === 'ACTIVE' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{chatbot.name}</h3>
                      {chatbot.isDefault && (
                        <span className="text-xs text-green-600 dark:text-green-400">Default Chatbot</span>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(chatbot.status)}
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {chatbot.description || 'No description'}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <Zap className="w-4 h-4 mr-1" />
                      Triggers
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white mt-1">
                      {chatbot.triggerKeywords.length}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Nodes
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white mt-1">
                      {chatbot.flowData?.nodes?.length || 0}
                    </p>
                  </div>
                </div>

                {/* Keywords */}
                {chatbot.triggerKeywords.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Keywords:</p>
                    <div className="flex flex-wrap gap-1">
                      {chatbot.triggerKeywords.slice(0, 3).map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                      {chatbot.triggerKeywords.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                          +{chatbot.triggerKeywords.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/dashboard/chatbot/edit/${chatbot.id}`)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(chatbot)}
                      disabled={actionLoading === chatbot.id}
                      className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedChatbot(chatbot);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(chatbot)}
                    disabled={actionLoading === chatbot.id}
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                      chatbot.status === 'ACTIVE'
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-900/50'
                        : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50'
                    }`}
                  >
                    {actionLoading === chatbot.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1"></div>
                    ) : chatbot.status === 'ACTIVE' ? (
                      <Pause className="w-4 h-4 mr-1" />
                    ) : (
                      <Play className="w-4 h-4 mr-1" />
                    )}
                    {chatbot.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Create New Chatbot
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Chatbot Name *
              </label>
              <input
                type="text"
                value={newChatbotName}
                onChange={(e) => setNewChatbotName(e.target.value)}
                placeholder="e.g., Customer Support Bot"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewChatbotName('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateChatbot}
                disabled={!newChatbotName.trim() || creating}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedChatbot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">
              Delete Chatbot
            </h3>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{selectedChatbot.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedChatbot(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotList;