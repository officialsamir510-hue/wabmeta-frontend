// src/pages/Inbox.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, 
  RefreshCw, 
  Archive, 
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import ConversationList from '../components/inbox/ConversationList';
import ChatWindow from '../components/inbox/ChatWindow';
import ContactInfo from '../components/inbox/ContactInfo';
import { inbox as inboxApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import type { 
  Conversation, 
  Message, 
  Contact,
  InboxStats 
} from '../types/inbox';

const Inbox: React.FC = () => {
  // Auth context
  const { user } = useAuth();
  
  // UI State
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'unread' | 'archived'>('all');
  
  // Data State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
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
  const [messagesCursor, setMessagesCursor] = useState<string | null>(null);

  // ==========================================
  // FETCH CONVERSATIONS
  // ==========================================
  const fetchConversations = useCallback(async () => {
    try {
      setError(null);
      
      const params: any = {
        page: 1,
        limit: 50,
        sortBy: 'lastMessageAt',
        sortOrder: 'desc',
      };

      // Apply filters
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

      const response = await inboxApi.getConversations(params);
      
      if (response.data?.success) {
        setConversations(response.data.data.conversations || []);
        
        // Update stats if available
        if (response.data.data.meta) {
          setStats({
            totalConversations: response.data.data.meta.total,
            unreadConversations: response.data.data.meta.unreadTotal,
            assignedToMe: 0, // Will be updated from stats endpoint
            ...stats,
          });
        }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch conversations');
      }
    } catch (err: any) {
      console.error('❌ Fetch conversations error:', err);
      setError(err.response?.data?.message || 'Failed to load conversations');
      toast.error('Failed to load conversations');
    }
  }, [filterBy, searchQuery]);

  // ==========================================
  // FETCH STATS
  // ==========================================
  const fetchStats = useCallback(async () => {
    try {
      const response = await inboxApi.getStats();
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
  const fetchMessages = useCallback(async (conversationId: string, cursor?: string) => {
    try {
      setMessagesLoading(true);
      
      const params: any = {
        page: 1,
        limit: 50,
      };
      
      if (cursor) {
        params.before = cursor;
      }

      const response = await inboxApi.getMessages(conversationId, params);
      
      if (response.data?.success) {
        const newMessages = response.data.data.messages || [];
        
        if (cursor) {
          // Append older messages
          setMessages(prev => [...newMessages, ...prev]);
        } else {
          // Initial load
          setMessages(newMessages);
        }
        
        setHasMoreMessages(response.data.data.hasMore || false);
        if (newMessages.length > 0) {
          setMessagesCursor(newMessages[0].id);
        }
      }
    } catch (err: any) {
      console.error('❌ Fetch messages error:', err);
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // ==========================================
  // SELECT CONVERSATION
  // ==========================================
  const selectConversation = useCallback(async (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;

    setSelectedConversation(conversation);
    setMessages([]);
    setMessagesCursor(null);
    
    // Fetch messages
    await fetchMessages(conversationId);
    
    // Mark as read
    if (conversation.unreadCount > 0) {
      try {
        await inboxApi.markAsRead(conversationId);
        
        // Update local state
        setConversations(prev => prev.map(c => 
          c.id === conversationId 
            ? { ...c, isRead: true, unreadCount: 0 }
            : c
        ));
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
  }, [conversations, fetchMessages]);

  // ==========================================
  // SEND MESSAGE
  // ==========================================
  const sendMessage = useCallback(async (
    content: string, 
    type: 'text' | 'image' | 'document' | 'audio' | 'video' = 'text',
    mediaUrl?: string
  ) => {
    if (!selectedConversation) return;
    
    try {
      setSendingMessage(true);
      
      const payload: any = {
        type,
        content: type === 'text' ? content : undefined,
        mediaUrl: type !== 'text' ? mediaUrl : undefined,
      };

      const response = await inboxApi.sendMessage(selectedConversation.id, payload);
      
      if (response.data?.success) {
        const newMessage = response.data.data;
        
        // Add message to UI immediately
        setMessages(prev => [...prev, newMessage]);
        
        // Update conversation preview
        setConversations(prev => prev.map(c => 
          c.id === selectedConversation.id
            ? {
                ...c,
                lastMessageAt: new Date().toISOString(),
                lastMessagePreview: content.substring(0, 100),
              }
            : c
        ));
        
        toast.success('Message sent');
      } else {
        throw new Error(response.data?.message || 'Failed to send message');
      }
    } catch (err: any) {
      console.error('❌ Send message error:', err);
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  }, [selectedConversation]);

  // ==========================================
  // ARCHIVE CONVERSATION
  // ==========================================
  const archiveConversation = useCallback(async (conversationId: string, archive = true) => {
    try {
      const response = await inboxApi.archiveConversation(conversationId, archive);
      
      if (response.data?.success) {
        // Remove from list or update
        if (archive && filterBy !== 'archived') {
          setConversations(prev => prev.filter(c => c.id !== conversationId));
        } else {
          setConversations(prev => prev.map(c => 
            c.id === conversationId ? { ...c, isArchived: archive } : c
          ));
        }
        
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null);
        }
        
        toast.success(archive ? 'Conversation archived' : 'Conversation unarchived');
      }
    } catch (err: any) {
      console.error('Archive error:', err);
      toast.error('Failed to archive conversation');
    }
  }, [filterBy, selectedConversation]);

  // ==========================================
  // ASSIGN CONVERSATION
  // ==========================================
  const assignConversation = useCallback(async (conversationId: string, userId: string | null) => {
    try {
      const response = await inboxApi.assignConversation(conversationId, userId);
      
      if (response.data?.success) {
        setConversations(prev => prev.map(c => 
          c.id === conversationId 
            ? { ...c, assignedTo: userId, assignedUser: response.data.data.assignedUser }
            : c
        ));
        
        toast.success(userId ? 'Conversation assigned' : 'Assignment removed');
      }
    } catch (err: any) {
      console.error('Assign error:', err);
      toast.error('Failed to assign conversation');
    }
  }, []);

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
  // LOAD MORE MESSAGES
  // ==========================================
  const loadMoreMessages = useCallback(async () => {
    if (!selectedConversation || !hasMoreMessages || messagesLoading) return;
    await fetchMessages(selectedConversation.id, messagesCursor || undefined);
  }, [selectedConversation, hasMoreMessages, messagesLoading, messagesCursor, fetchMessages]);

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
  // CHECK WHATSAPP CONNECTION
  // ==========================================
  const hasWhatsAppConnected = true; // TODO: Check from settings/meta connection

  // ==========================================
  // RENDER STATES
  // ==========================================

  // Loading state
  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  // No WhatsApp connected
  if (!hasWhatsAppConnected && conversations.length === 0) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            No WhatsApp Account Connected
          </h2>
          <p className="text-gray-600 mb-6">
            Connect your WhatsApp Business account to start receiving and sending messages.
          </p>
          <a
            href="/dashboard/whatsapp"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Connect WhatsApp Account
          </a>
        </div>
      </div>
    );
  }

  // Main Inbox UI
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
            <div className="flex items-center space-x-2">
              <button
                onClick={refreshConversations}
                disabled={refreshing}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Filter"
              >
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 mb-3">
            <button
              onClick={() => setFilterBy('all')}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filterBy === 'all'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterBy('unread')}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filterBy === 'unread'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Unread
              {stats?.unreadConversations ? (
                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {stats.unreadConversations}
                </span>
              ) : null}
            </button>
            <button
              onClick={() => setFilterBy('archived')}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filterBy === 'archived'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Archived
            </button>
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
                <div className="font-bold text-green-900">{stats.todayMessages}</div>
              </div>
            </div>
          )}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            <ConversationList
              conversations={conversations}
              activeId={selectedConversation?.id || null}
              onSelect={(conv) => selectConversation(conv.id)}
              onNewChat={() => console.log('New chat')}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500">No conversations found</p>
              <p className="text-sm text-gray-400 mt-2">
                {searchQuery 
                  ? 'Try adjusting your search' 
                  : 'Messages will appear here'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <>
          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-white">
            {/* Mobile back button */}
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
              onLoadMore={loadMoreMessages}
              hasMore={hasMoreMessages}
            />

            {/* Quick Actions Bar */}
            <div className="hidden md:flex items-center justify-between px-4 py-2 bg-white border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => archiveConversation(selectedConversation.id)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Archive className="w-4 h-4" />
                  {selectedConversation.isArchived ? 'Unarchive' : 'Archive'}
                </button>
                <button
                  onClick={() => assignConversation(selectedConversation.id, user?.id || null)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  {selectedConversation.assignedTo ? 'Unassign' : 'Assign to me'}
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {selectedConversation.isWindowOpen ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Window open
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-yellow-500" />
                    Window expires soon
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info Sidebar */}
          <ContactInfo
            contact={selectedConversation.contact}
            conversation={selectedConversation}
            isOpen={showContactInfo}
            onClose={() => setShowContactInfo(false)}
            onUpdateContact={(data) => {
              // Update contact info
              console.log('Update contact:', data);
            }}
          />
        </>
      ) : (
        /* Empty State - Desktop Only */
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Messages</h2>
            <p className="text-gray-500">
              Select a conversation from the list to start chatting
            </p>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;