// src/pages/Inbox.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, 
  RefreshCw, 
  Archive, 
  UserPlus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';
import ConversationList from '../components/inbox/ConversationList';
import ChatWindow from '../components/inbox/ChatWindow';
import ContactInfo from '../components/inbox/ContactInfo';
import { inbox as inboxApi, whatsapp as whatsappApi } from '../services/api';
import type { Conversation, Message, Contact } from '../types/chat';

// Extend Conversation type to include WhatsApp window properties
interface WhatsAppConversation extends Conversation {
  isWindowOpen?: boolean;
  windowExpiresAt?: string;
  isArchived?: boolean;
  isRead?: boolean;
}

// ==========================================
// TYPES (if not in chat.ts)
// ==========================================
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
  assignedUser?: {
    id: string;
    firstName: string;
    lastName: string | null;
    avatar: string | null;
  };
  labels: string[];
  isWindowOpen?: boolean;
  windowExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiMessage {
  id: string;
  waMessageId: string | null;
  direction: 'INBOUND' | 'OUTBOUND';
  type: string;
  content: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  status: string;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  createdAt: string;
}

// ==========================================
// HELPER: Convert API data to UI format
// ==========================================
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

// ==========================================
// COMPONENT
// ==========================================
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
  const [hasWhatsAppConnected, setHasWhatsAppConnected] = useState<boolean | null>(null);
  
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
  // CHECK WHATSAPP CONNECTION
  // ==========================================
  const checkWhatsAppConnection = useCallback(async () => {
    try {
      const response = await whatsappApi.accounts();
      const accounts = response.data?.data || response.data || [];
      const connectedAccounts = Array.isArray(accounts) 
        ? accounts.filter((a: any) => a.status === 'CONNECTED')
        : [];
      setHasWhatsAppConnected(connectedAccounts.length > 0);
    } catch (err) {
      console.error('Error checking WhatsApp connection:', err);
      setHasWhatsAppConnected(false);
    }
  }, []);

  // ==========================================
  // FETCH CONVERSATIONS
  // ==========================================
  const fetchConversations = useCallback(async () => {
    try {
      setError(null);
      
      const params: any = {
        page: 1,
        limit: 50,
      };

      if (filterBy === 'unread') {
        params.isRead = false;
      } else if (filterBy === 'archived') {
        params.isArchived = true;
      } else {
        params.isArchived = false;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await inboxApi.conversations(params);
      
      if (response.data?.success) {
        const apiConversations = response.data.data || [];
        setConversations(apiConversations.map(convertApiConversation));
        
        if (response.data.meta) {
          setStats(prev => ({
            ...prev,
            totalConversations: response.data.meta.total || 0,
            unreadConversations: response.data.meta.unreadTotal || 0,
            todayMessages: prev?.todayMessages || 0,
            archivedConversations: 0,
            assignedToMe: 0,
            unassigned: 0,
            responseRate: 0,
            averageResponseTime: 0,
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
      if (response.data?.success) {
        setStats(response.data.data);
      }
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
        const apiMessages = response.data.data?.messages || response.data.data || [];
        setMessages(apiMessages.map((m: ApiMessage) => convertApiMessage(m, conversationId)));
        setHasMoreMessages(response.data.data?.hasMore || false);
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
    setSelectedConversation(conversation);
    setMessages([]);
    
    await fetchMessages(conversation.id);
    
    if (conversation.unreadCount > 0) {
      try {
        await inboxApi.markAsRead(conversation.id);
        setConversations(prev => prev.map(c => 
          c.id === conversation.id 
            ? { ...c, unreadCount: 0 }
            : c
        ));
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
  }, [fetchMessages]);

  // ==========================================
  // SEND MESSAGE
  // ==========================================
  const sendMessage = useCallback(async (
    content: string, 
    type: 'text' | 'image' | 'document' = 'text'
  ) => {
    if (!selectedConversation || !content.trim()) return;
    
    setSendingMessage(true);
    
    // Optimistic update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: selectedConversation.id,
      type,
      content,
      isOutgoing: true,
      status: 'sending',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      const response = await inboxApi.sendMessage(selectedConversation.id, {
        type,
        content,
      });
      
      if (response.data?.success) {
        const newMessage = convertApiMessage(response.data.data, selectedConversation.id);
        
        // Replace temp message with real one
        setMessages(prev => prev.map(m => 
          m.id === tempMessage.id ? newMessage : m
        ));
        
        // Update conversation
        setConversations(prev => prev.map(c => 
          c.id === selectedConversation.id
            ? {
                ...c,
                lastMessage: newMessage,
                updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }
            : c
        ));
      }
    } catch (err: any) {
      console.error('❌ Send message error:', err);
      // Mark as failed
      setMessages(prev => prev.map(m => 
        m.id === tempMessage.id ? { ...m, status: 'failed' } : m
      ));
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
      
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
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
      await checkWhatsAppConnection();
      await fetchConversations();
      await fetchStats();
      setLoading(false);
    };
    
    loadData();
  }, []);

  // ==========================================
  // SEARCH DEBOUNCE
  // ==========================================
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        fetchConversations();
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, filterBy]);

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
  // RENDER: No WhatsApp Connected
  // ==========================================
  if (hasWhatsAppConnected === false) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No WhatsApp Account Connected</h2>
          <p className="text-gray-600 mb-6">
            Connect your WhatsApp Business account to start receiving and sending messages.
          </p>
          <a
            href="/settings"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Connect WhatsApp Account
          </a>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: Main Inbox
  // ==========================================
  return (
    <div className="flex h-[calc(100vh-4rem)] -m-4 lg:-m-6 bg-gray-50">
      {/* Conversation List */}
      <div className={`w-full md:w-96 shrink-0 ${
        selectedConversation ? 'hidden md:flex' : 'flex'
      } flex-col bg-white border-r border-gray-200`}>
        
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
                  filterBy === filter
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50'
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
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Mobile back */}
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
          />

          {/* Quick Actions */}
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