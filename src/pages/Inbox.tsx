// src/pages/Inbox.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  RefreshCw,
  Archive,
  Search,
  Loader2,
} from 'lucide-react';

import ConversationList from '../components/inbox/ConversationList';
import ChatWindow from '../components/inbox/ChatWindow';
import ContactInfo from '../components/inbox/ContactInfo';

import { inbox as inboxApi } from '../services/api';
import type { Conversation, Message } from '../types/chat';

// Extend Conversation type to include WhatsApp window properties
interface WhatsAppConversation extends Conversation {
  isWindowOpen?: boolean;
  windowExpiresAt?: string;
  isArchived?: boolean;
  isRead?: boolean;
}

interface InboxStats {
  totalConversations: number;
  unreadConversations: number;
  archivedConversations: number;
  assignedToMe: number;
  unassigned: number;
  todayMessages: number;
  responseRate: number;
  averageResponseTime: number;
}

interface ApiConversation {
  id: string;
  contact: {
    id: string;
    phone: string;
    fullPhone: string;
    firstName: string | null;
    lastName: string | null;
    fullName: string;
    avatar: string | null;
    email: string | null;
    tags: string[];
  };
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  isArchived: boolean;
  isRead: boolean;
  unreadCount: number;
  assignedTo: string | null;
  labels: string[];
  isWindowOpen?: boolean;
  windowExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiMessage {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  type: string;
  content: string | null;
  mediaUrl: string | null;
  status: string;
  createdAt: string;
}

const convertApiConversation = (apiConv: ApiConversation): WhatsAppConversation => ({
  id: apiConv.id,
  contact: {
    id: apiConv.contact.id,
    name: apiConv.contact.fullName || apiConv.contact.phone,
    phone: apiConv.contact.fullPhone || apiConv.contact.phone,
    email: apiConv.contact.email || undefined,
    avatar: apiConv.contact.avatar || undefined,
    tags: apiConv.contact.tags || [],
    lastSeen: apiConv.lastMessageAt || undefined,
  },
  lastMessage: {
    id: `${apiConv.id}_last`,
    conversationId: apiConv.id,
    type: 'text',
    content: apiConv.lastMessagePreview || '',
    isOutgoing: false,
    status: 'delivered',
    timestamp: apiConv.lastMessageAt
      ? new Date(apiConv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '',
  },
  unreadCount: apiConv.unreadCount,
  status: apiConv.isArchived ? 'resolved' : 'open',
  assignedTo: apiConv.assignedTo || undefined,
  labels: apiConv.labels || [],
  isPinned: false,
  isMuted: false,
  updatedAt: apiConv.lastMessageAt
    ? new Date(apiConv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '',
  isWindowOpen: apiConv.isWindowOpen,
  windowExpiresAt: apiConv.windowExpiresAt,
  isArchived: apiConv.isArchived,
  isRead: apiConv.isRead,
});

const convertApiMessage = (apiMsg: ApiMessage, conversationId: string): Message => {
  let status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' = 'sent';
  if (apiMsg.status === 'PENDING') status = 'sending';
  else if (apiMsg.status === 'SENT') status = 'sent';
  else if (apiMsg.status === 'DELIVERED') status = 'delivered';
  else if (apiMsg.status === 'READ') status = 'read';
  else if (apiMsg.status === 'FAILED') status = 'failed';

  return {
    id: apiMsg.id,
    conversationId,
    type: (apiMsg.type?.toLowerCase() || 'text') as any,
    content: apiMsg.content || '',
    mediaUrl: apiMsg.mediaUrl || undefined,
    isOutgoing: apiMsg.direction === 'OUTBOUND',
    status,
    timestamp: new Date(apiMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
};

const Inbox: React.FC = () => {
  // UI State
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'unread' | 'archived'>('all');

  // Data State
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<WhatsAppConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<InboxStats | null>(null);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Error State
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [hasMoreMessages, setHasMoreMessages] = useState(false);

  // ==========================================
  // FETCH CONVERSATIONS (robust response shape)
  // ==========================================
  const fetchConversations = useCallback(async () => {
    try {
      setError(null);

      const params: any = { page: 1, limit: 50 };

      if (filterBy === 'unread') params.isRead = false;
      if (filterBy === 'archived') params.isArchived = true;
      if (filterBy === 'all') params.isArchived = false;

      if (searchQuery) params.search = searchQuery;

      const response = await inboxApi.conversations(params);

      if (response.data?.success) {
        // backend may return: data = [] OR data = { conversations, meta }
        const rawData = response.data.data;

        const apiConversations: ApiConversation[] = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.conversations)
          ? rawData.conversations
          : [];

        setConversations(apiConversations.map(convertApiConversation));

        const meta = response.data.meta || rawData?.meta;
        if (meta) {
          setStats((prev) => ({
            totalConversations: meta.total ?? prev?.totalConversations ?? 0,
            unreadConversations: meta.unreadTotal ?? prev?.unreadConversations ?? 0,
            archivedConversations: prev?.archivedConversations ?? 0,
            assignedToMe: prev?.assignedToMe ?? 0,
            unassigned: prev?.unassigned ?? 0,
            todayMessages: prev?.todayMessages ?? 0,
            responseRate: prev?.responseRate ?? 0,
            averageResponseTime: prev?.averageResponseTime ?? 0,
          }));
        }
      }
    } catch (err: any) {
      console.error('❌ Fetch conversations error:', err);
      setError(err.response?.data?.message || 'Failed to load conversations');
    }
  }, [filterBy, searchQuery]);

  // ==========================================
  // FETCH STATS
  // ==========================================
  const fetchStats = useCallback(async () => {
    try {
      const response = await inboxApi.stats();
      if (response.data?.success) setStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  // ==========================================
  // FETCH MESSAGES
  // ==========================================
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      setMessagesLoading(true);

      const response = await inboxApi.getMessages(conversationId, { limit: 50 });

      if (response.data?.success) {
        const raw = response.data.data;
        const apiMessages: ApiMessage[] = Array.isArray(raw?.messages)
          ? raw.messages
          : Array.isArray(raw)
          ? raw
          : [];

        setMessages(apiMessages.map((m) => convertApiMessage(m, conversationId)));
        setHasMoreMessages(!!raw?.hasMore);
      }
    } catch (err: any) {
      console.error('❌ Fetch messages error:', err);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // ==========================================
  // SELECT CONVERSATION
  // ==========================================
  const selectConversation = useCallback(async (conversation: Conversation) => {
    setSelectedConversation(conversation as WhatsAppConversation);
    setMessages([]);

    await fetchMessages(conversation.id);

    if (conversation.unreadCount > 0) {
      try {
        await inboxApi.markAsRead(conversation.id);
        setConversations((prev) =>
          prev.map((c) => (c.id === conversation.id ? { ...c, unreadCount: 0 } : c))
        );
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
  }, [fetchMessages]);

  // ==========================================
  // SEND MESSAGE
  // ==========================================
  const sendMessage = useCallback(async (content: string, type: 'text' | 'image' | 'document' = 'text') => {
    if (!selectedConversation || !content.trim()) return;

    setSendingMessage(true);

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: selectedConversation.id,
      type,
      content,
      isOutgoing: true,
      status: 'sending',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const response = await inboxApi.sendMessage(selectedConversation.id, { type, content });

      if (response.data?.success) {
        const newMessage = convertApiMessage(response.data.data, selectedConversation.id);

        setMessages((prev) => prev.map((m) => (m.id === tempMessage.id ? newMessage : m)));

        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConversation.id
              ? { ...c, lastMessage: newMessage, updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
              : c
          )
        );
      }
    } catch (err: any) {
      console.error('❌ Send message error:', err);
      setMessages((prev) => prev.map((m) => (m.id === tempMessage.id ? { ...m, status: 'failed' } : m)));
    } finally {
      setSendingMessage(false);
    }
  }, [selectedConversation]);

  // ==========================================
  // ARCHIVE CONVERSATION
  // ==========================================
  const archiveConversation = useCallback(async (conversationId: string) => {
    try {
      await inboxApi.archive(conversationId);

      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (selectedConversation?.id === conversationId) setSelectedConversation(null);
    } catch (err: any) {
      console.error('Archive error:', err);
    }
  }, [selectedConversation]);

  // ==========================================
  // REFRESH
  // ==========================================
  const refreshConversations = useCallback(async () => {
    setRefreshing(true);
    await fetchConversations();
    await fetchStats();
    setRefreshing(false);
  }, [fetchConversations, fetchStats]);

  // ==========================================
  // INITIAL LOAD
  // ==========================================
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchConversations();
      await fetchStats();
      setLoading(false);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================
  // SEARCH DEBOUNCE
  // ==========================================
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) fetchConversations();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, filterBy, loading, fetchConversations]);

  // ==========================================
  // RENDER: Loading
  // ==========================================
  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================
  return (
    <div className="flex h-[calc(100vh-4rem)] -m-4 lg:-m-6 bg-gray-50">
      {/* Conversation List */}
      <div className={`w-full md:w-96 shrink-0 ${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col bg-white border-r border-gray-200`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Inbox</h1>
            <button
              onClick={refreshConversations}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 mb-3">
            {(['all', 'unread', 'archived'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterBy(filter)}
                className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors capitalize ${
                  filterBy === filter ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {filter}
                {filter === 'unread' && stats?.unreadConversations ? (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {stats.unreadConversations}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-xs text-gray-500">Total</div>
                <div className="font-bold text-gray-900">{stats.totalConversations}</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="text-xs text-blue-600">Unread</div>
                <div className="font-bold text-blue-900">{stats.unreadConversations}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <div className="text-xs text-green-600">Today</div>
                <div className="font-bold text-green-900">{stats.todayMessages || 0}</div>
              </div>
            </div>
          )}
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            <ConversationList
              conversations={conversations}
              activeId={selectedConversation?.id || null}
              onSelect={selectConversation}
              onNewChat={() => {}}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500">No conversations found</p>
              <p className="text-sm text-gray-400 mt-2">
                {searchQuery ? 'Try adjusting your search' : 'Messages will appear here'}
              </p>
              {error && (
                <p className="text-sm text-red-500 mt-3">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-white">
          <button
            onClick={() => setSelectedConversation(null)}
            className="md:hidden absolute top-3 left-2 z-10 p-2 bg-white/90 backdrop-blur rounded-full shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <ChatWindow
            conversation={selectedConversation}
            messages={messages}
            onSendMessage={sendMessage}
            onToggleInfo={() => setShowContactInfo(!showContactInfo)}
            showInfo={showContactInfo}
            loading={messagesLoading}
            sending={sendingMessage}
          />

          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border-t">
            <button
              onClick={() => archiveConversation(selectedConversation.id)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Archive className="w-4 h-4" />
              Archive
            </button>
          </div>

          <ContactInfo
            contact={selectedConversation.contact}
            isOpen={showContactInfo}
            onClose={() => setShowContactInfo(false)}
          />
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Messages</h2>
            <p className="text-gray-500">Select a conversation from the list to start chatting</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;