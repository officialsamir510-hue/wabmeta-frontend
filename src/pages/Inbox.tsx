import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  Info,
  CheckCheck,
  Check,
  Clock,
  Loader2,
  MessageSquare,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSocket } from '../context/SocketContext';
import { inbox as inboxApi, whatsapp as whatsappApi } from '../services/api';
import toast from 'react-hot-toast';

// ============================================
// TYPES
// ============================================

interface Contact {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  avatar?: string;
  lastSeen?: string;
}

interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'TEMPLATE';
  direction: 'INBOUND' | 'OUTBOUND';
  status?: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  createdAt: string;
  sentAt?: string;
  mediaUrl?: string;
  templateId?: string;
  metadata?: any;
}

interface Conversation {
  id: string;
  contact: Contact;
  lastMessageAt: string;
  lastMessagePreview?: string;
  unreadCount: number;
  isArchived: boolean;
  isRead?: boolean;
  isWindowOpen?: boolean;
  labels?: string[];
  assignedTo?: string;
}

// ============================================
// INBOX COMPONENT
// ============================================

const Inbox: React.FC = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');

  // ✅ Refs to prevent infinite loops
  const fetchingMessagesRef = useRef(false);
  const lastFetchedConvId = useRef<string | null>(null);

  // ============================================
  // HELPERS
  // ============================================

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const getContactName = (contact: Contact): string => {
    if (contact.name) return contact.name;
    if (contact.firstName || contact.lastName) {
      return [contact.firstName, contact.lastName].filter(Boolean).join(' ');
    }
    return contact.phone;
  };

  const getContactInitial = (contact: Contact): string => {
    const name = getContactName(contact);
    return name.charAt(0).toUpperCase();
  };

  const parseMessageContent = (message: Message): string => {
    if (message.type === 'TEMPLATE' && message.content) {
      try {
        const parsed = JSON.parse(message.content);
        return `📋 Template: ${parsed.templateName || 'Unknown'}`;
      } catch {
        return message.content;
      }
    }
    return message.content || '';
  };

  // ============================================
  // FETCH CONVERSATIONS
  // ============================================
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        search: searchQuery || undefined,
        limit: 50,
      };

      if (filter === 'unread') {
        params.isRead = false;
      } else if (filter === 'archived') {
        params.isArchived = true;
      } else {
        params.isArchived = false;
      }

      const response = await inboxApi.getConversations(params);

      console.log('🔍 Conversations API Response:', response.data);

      if (response.data.success) {
        // ✅ Handle multiple response structures
        let conversationsData: Conversation[] = [];

        if (Array.isArray(response.data.data)) {
          conversationsData = response.data.data;
        } else if (response.data.data?.conversations) {
          conversationsData = response.data.data.conversations;
        } else if (Array.isArray((response.data as any).conversations)) {
          conversationsData = (response.data as any).conversations;
        }

        const validConversations = conversationsData.filter(
          (conv) => conv && conv.id && conv.contact
        );

        setConversations(validConversations);
        console.log(`✅ Loaded ${validConversations.length} conversations`);
      } else {
        throw new Error(response.data.message || 'Failed to load conversations');
      }
    } catch (error: any) {
      console.error('❌ Fetch conversations error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, filter]);

  // ============================================
  // FETCH MESSAGES - ✅ FIXED INFINITE LOOP
  // ============================================
  const fetchMessages = useCallback(async (convId: string) => {
    // ✅ Prevent duplicate/concurrent fetches
    if (fetchingMessagesRef.current) {
      console.log('⚠️ Already fetching messages, skipping...');
      return;
    }

    // ✅ Prevent re-fetching same conversation
    if (lastFetchedConvId.current === convId && messages.length > 0) {
      console.log('⚠️ Already loaded this conversation, skipping...');
      return;
    }

    try {
      fetchingMessagesRef.current = true;
      setLoadingMessages(true);

      const response = await inboxApi.getMessages(convId, {
        limit: 100,
      });

      console.log('🔍 Messages API Response:', response.data);

      if (response.data.success) {
        // ✅ FIX: Handle nested data structure { data: { messages: [...] } }
        let messagesData: Message[] = [];

        if (Array.isArray(response.data.data)) {
          // Direct array: { data: [...] }
          messagesData = response.data.data;
        } else if (response.data.data?.messages && Array.isArray(response.data.data.messages)) {
          // Nested: { data: { messages: [...] } }
          messagesData = response.data.data.messages;
        } else if (Array.isArray((response.data as any).messages)) {
          // Alternative: { messages: [...] }
          messagesData = (response.data as any).messages;
        } else {
          console.warn('⚠️ Unknown messages data structure:', response.data.data);
          messagesData = [];
        }

        // Sort by date (oldest first)
        messagesData.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        setMessages(messagesData);
        lastFetchedConvId.current = convId;
        console.log(`✅ Loaded ${messagesData.length} messages for conversation ${convId}`);

        scrollToBottom();

        // Mark as read (silent)
        inboxApi.markAsRead(convId).catch(() => { });

        // Update unread count in conversations list
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === convId ? { ...conv, unreadCount: 0, isRead: true } : conv
          )
        );
      }
    } catch (error: any) {
      console.error('❌ Fetch messages error:', error);
      toast.error('Failed to load messages');
      setMessages([]);
    } finally {
      setLoadingMessages(false);
      fetchingMessagesRef.current = false;
    }
  }, []); // ✅ No dependencies to prevent re-creation

  // ============================================
  // SEND MESSAGE
  // ============================================
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      content: messageText,
      type: 'TEXT',
      direction: 'OUTBOUND',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    const sentText = messageText;
    setMessageText('');
    setSending(true);
    scrollToBottom();

    try {
      const accountsRes = await whatsappApi.accounts();
      const accounts = accountsRes.data?.data || [];
      const connectedAccount = accounts.find((a: any) => a.status === 'CONNECTED');
      const accountId = connectedAccount?.id || accounts[0]?.id;

      if (!accountId) {
        throw new Error('No WhatsApp account connected. Please connect in Settings → WhatsApp.');
      }

      const response = await whatsappApi.sendText({
        whatsappAccountId: accountId,
        to: selectedConversation.contact.phone,
        message: sentText,
      });

      if (response.data.success) {
        const realMessage = response.data.data;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? {
                ...realMessage,
                id: realMessage.id || tempId,
                status: 'SENT',
                content: sentText,
              }
              : msg
          )
        );

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation.id
              ? {
                ...conv,
                lastMessagePreview: sentText,
                lastMessageAt: new Date().toISOString(),
              }
              : conv
          )
        );

        toast.success('Message sent!');
      } else {
        throw new Error(response.data.message || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('❌ Send message error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to send message');

      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? { ...msg, status: 'FAILED' } : msg))
      );
    } finally {
      setSending(false);
    }
  };

  // ============================================
  // SELECT CONVERSATION
  // ============================================
  const selectConversation = (conv: Conversation) => {
    // ✅ Prevent re-selecting same conversation
    if (selectedConversation?.id === conv.id) {
      return;
    }

    // Reset messages and refs for new conversation
    setMessages([]);
    lastFetchedConvId.current = null;
    setSelectedConversation(conv);
    navigate(`/dashboard/inbox/${conv.id}`);
    fetchMessages(conv.id);
  };

  // ============================================
  // REFRESH
  // ============================================
  const handleRefresh = async () => {
    setRefreshing(true);
    lastFetchedConvId.current = null; // Reset to allow re-fetch
    await fetchConversations();
    if (selectedConversation) {
      await fetchMessages(selectedConversation.id);
    }
  };

  // ============================================
  // SOCKET LISTENERS
  // ============================================
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (data: any) => {
      console.log('📨 New message received:', data);

      if (selectedConversation?.id === data.conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message?.id || m.id === data.id)) {
            return prev;
          }
          return [...prev, data.message || data];
        });
        scrollToBottom();
      }

      fetchConversations();
    };

    const handleMessageStatus = (data: any) => {
      console.log('📊 Message status update:', data);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId || msg.id === data.waMessageId
            ? { ...msg, status: data.status }
            : msg
        )
      );
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:status', handleMessageStatus);
    socket.on('newMessage', handleNewMessage);
    socket.on('messageStatus', handleMessageStatus);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:status', handleMessageStatus);
      socket.off('newMessage', handleNewMessage);
      socket.off('messageStatus', handleMessageStatus);
    };
  }, [socket, isConnected, selectedConversation, fetchConversations]);

  // ============================================
  // INITIAL LOAD - ✅ FIXED
  // ============================================
  useEffect(() => {
    fetchConversations();
  }, [filter, searchQuery]); // ✅ Only re-fetch when filter/search changes

  // ============================================
  // LOAD CONVERSATION FROM URL - ✅ FIXED
  // ============================================
  useEffect(() => {
    if (!conversationId || conversations.length === 0) return;

    // ✅ Prevent selecting if already selected
    if (selectedConversation?.id === conversationId) return;

    const conv = conversations.find((c) => c.id === conversationId);
    if (conv) {
      setSelectedConversation(conv);

      // ✅ Only fetch if not already loaded
      if (lastFetchedConvId.current !== conversationId) {
        fetchMessages(conversationId);
      }
    }
  }, [conversationId, conversations]); // ✅ Removed fetchMessages from deps

  // ============================================
  // RENDER: LOADING STATE
  // ============================================
  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading conversations...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: ERROR STATE
  // ============================================
  if (error && conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Failed to Load Inbox
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">{error}</p>
        <button
          onClick={fetchConversations}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </button>
      </div>
    );
  }

  // ============================================
  // RENDER: MAIN UI
  // ============================================
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
      {/* ============================================ */}
      {/* LEFT SIDEBAR: CONVERSATIONS LIST */}
      {/* ============================================ */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">Inbox</h2>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-500 ${refreshing ? 'animate-spin' : ''}`}
              />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 mt-3">
            {(['all', 'unread', 'archived'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 px-3 py-1.5 text-sm rounded-lg transition-colors capitalize ${filter === f
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700/50 ${selectedConversation?.id === conv.id
                  ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500'
                  : ''
                  } ${!conv.isRead && conv.unreadCount > 0 ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {conv.contact.avatar ? (
                      <img
                        src={conv.contact.avatar}
                        alt={getContactName(conv.contact)}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getContactInitial(conv.contact)
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-sm">
                      {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`font-medium truncate ${conv.unreadCount > 0
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300'
                        }`}
                    >
                      {getContactName(conv.contact)}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                      {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false })}
                    </span>
                  </div>
                  <p
                    className={`text-sm truncate ${conv.unreadCount > 0
                      ? 'text-gray-700 dark:text-gray-300 font-medium'
                      : 'text-gray-500 dark:text-gray-400'
                      }`}
                  >
                    {conv.lastMessagePreview || 'No messages yet'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">No conversations</p>
              <p className="text-sm mt-1">
                {filter === 'unread'
                  ? 'No unread messages'
                  : filter === 'archived'
                    ? 'No archived conversations'
                    : 'Start a campaign to see conversations'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* RIGHT SIDE: CHAT AREA */}
      {/* ============================================ */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedConversation.contact.avatar ? (
                      <img
                        src={selectedConversation.contact.avatar}
                        alt={getContactName(selectedConversation.contact)}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getContactInitial(selectedConversation.contact)
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {getContactName(selectedConversation.contact)}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedConversation.contact.phone}
                      {selectedConversation.isWindowOpen && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Window Open
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Call"
                  >
                    <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Video"
                  >
                    <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Info"
                  >
                    <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="More"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundColor: '#efe7dd',
              }}
            >
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
              ) : messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'
                      }`}
                  >
                    <div
                      className={`max-w-[70%] lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${message.direction === 'OUTBOUND'
                        ? 'bg-[#d9fdd3] dark:bg-green-700 text-gray-900 dark:text-white rounded-br-none'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'
                        }`}
                    >
                      {/* Message Content */}
                      <p className="break-words text-sm whitespace-pre-wrap">
                        {parseMessageContent(message)}
                      </p>

                      {/* Message Footer */}
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] opacity-60">
                          {new Date(message.createdAt || message.sentAt || '').toLocaleTimeString(
                            [],
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </span>

                        {/* Status Icons */}
                        {message.direction === 'OUTBOUND' && (
                          <span className="ml-1">
                            {message.status === 'READ' && (
                              <CheckCheck className="w-4 h-4 text-blue-500" />
                            )}
                            {message.status === 'DELIVERED' && (
                              <CheckCheck className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            )}
                            {message.status === 'SENT' && (
                              <Check className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            )}
                            {message.status === 'PENDING' && (
                              <Clock className="w-4 h-4 text-gray-400" />
                            )}
                            {message.status === 'FAILED' && (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No messages yet</p>
                  <p className="text-sm mt-1">Send a message to start the conversation</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                <button
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  title="Emoji"
                >
                  <Smile className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  title="Attach"
                >
                  <Paperclip className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>

                <div className="flex-1">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    disabled={sending}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-none rounded-full focus:ring-2 focus:ring-green-500 outline-none text-gray-900 dark:text-white placeholder-gray-500"
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sending}
                  className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Select a Conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                Choose a conversation from the list to view messages and start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;