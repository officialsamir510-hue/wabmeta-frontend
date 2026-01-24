import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Inbox,
  Clock,
  CheckCircle2
} from 'lucide-react';
import ConversationItem from './ConversationItem';
import type { Conversation, ConversationStatus } from '../../types/chat';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (conversation: Conversation) => void;
  onNewChat: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeId,
  onSelect,
  onNewChat
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const statusFilters = [
    { value: 'all', label: 'All Chats', icon: Inbox, count: conversations.length },
    { value: 'open', label: 'Open', icon: Inbox, count: conversations.filter(c => c.status === 'open').length },
    { value: 'pending', label: 'Pending', icon: Clock, count: conversations.filter(c => c.status === 'pending').length },
    { value: 'resolved', label: 'Resolved', icon: CheckCircle2, count: conversations.filter(c => c.status === 'resolved').length },
  ];

  const filteredConversations = conversations
    .filter(conv => {
      const matchesSearch = conv.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           conv.contact.phone.includes(searchQuery) ||
                           conv.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Pinned first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then by unread count
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
      return 0;
    });

  const unreadTotal = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Inbox</h2>
            {unreadTotal > 0 && (
              <p className="text-sm text-gray-500">{unreadTotal} unread messages</p>
            )}
          </div>
          <button
            onClick={onNewChat}
            className="p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
              showFilters ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Filters */}
      {showFilters && (
        <div className="p-3 border-b border-gray-200 bg-gray-50 animate-fade-in">
          <div className="grid grid-cols-2 gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value as any)}
                className={`flex items-center space-x-2 p-2 rounded-lg text-sm transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <filter.icon className="w-4 h-4" />
                <span>{filter.label}</span>
                <span className="ml-auto text-xs font-medium">{filter.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Status Tabs */}
      <div className="flex border-b border-gray-200">
        {statusFilters.slice(0, 3).map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value as any)}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              statusFilter === filter.value
                ? 'text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {filter.label}
            {filter.count > 0 && filter.value !== 'all' && (
              <span className="ml-1 text-xs">({filter.count})</span>
            )}
            {statusFilter === filter.value && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></div>
            )}
          </button>
        ))}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={activeId === conversation.id}
              onClick={() => onSelect(conversation)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No conversations</h3>
            <p className="text-gray-500 text-sm">
              {searchQuery 
                ? 'Try a different search term' 
                : 'Start a new conversation to begin'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;