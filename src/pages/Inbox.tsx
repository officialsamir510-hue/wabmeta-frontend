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
  Users
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSocket } from '../context/SocketContext';
import { inbox as inboxApi, whatsapp as whatsappApi } from '../services/api';
import toast from 'react-hot-toast';

interface Contact {
  id: string;
  name?: string;
  phone: string;
  avatar?: string;
  lastSeen?: string;
}

interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  direction: 'INBOUND' | 'OUTBOUND';
  status?: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  createdAt: string;
  mediaUrl?: string;
}

interface Conversation {
  id: string;
  contact: Contact;
  lastMessageAt: string;
  lastMessagePreview?: string;
  unreadCount: number;
  isArchived: boolean;
  labels?: string[];
}

const Inbox: React.FC = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await inboxApi.getConversations({
        search: searchQuery || undefined,
        limit: 50
      });

      if (response.data.success) {
        const conversationsData = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setConversations(conversationsData);
      } else {
        throw new Error(response.data.message || 'Failed to load conversations');
      }
    } catch (error: any) {
      console.error('❌ Fetch conversations error:', error);
      setError(error.message || 'Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (convId: string) => {
    try {
      setLoadingMessages(true);

      const response = await inboxApi.getMessages(convId, {
        limit: 100
      });

      if (response.data.success) {
        const messagesData = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setMessages(messagesData);
        scrollToBottom();

        // Mark as read
        await inboxApi.markAsRead(convId).catch(console.error);
      }
    } catch (error: any) {
      console.error('❌ Fetch messages error:', error);
      toast.error('Failed to load messages');
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // ✅ Send Message Implementation
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      content: messageText,
      type: 'TEXT',
      direction: 'OUTBOUND',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    // Optimistic UI Update
    setMessages(prev => [...prev, tempMessage]);
    setMessageText('');
    setSending(true);
    scrollToBottom();

    try {
      // Get Default WhatsApp Account
      const accountsRes = await whatsappApi.accounts();
      const accountId = accountsRes.data?.data?.[0]?.id;

      if (!accountId) {
        throw new Error('No WhatsApp account connected. Please connect in Settings.');
      }

      // Send API Call
      const response = await whatsappApi.sendText({
        whatsappAccountId: accountId,
        to: selectedConversation.contact.phone,
        message: tempMessage.content
      });

      if (response.data.success) {
        // Update temp message with real data
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempId
              ? { ...response.data.data, status: 'SENT' }
              : msg
          )
        );

        // Update conversation preview
        setConversations(prev =>
          prev.map(conv =>
            conv.id === selectedConversation.id
              ? {
                ...conv,
                lastMessagePreview: tempMessage.content,
                lastMessageAt: new Date().toISOString()
              }
              : conv
          )
        );
      }
    } catch (error: any) {
      console.error('❌ Send message error:', error);
      toast.error(error.message || 'Failed to send message');

      // Mark as failed
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempId
            ? { ...msg, status: 'FAILED' }
            : msg
        )
      );
    } finally {
      setSending(false);
    }
  };

  // Socket listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (data: any) => {
      console.log('📨 New message:', data);

      if (selectedConversation?.id === data.conversationId) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }

      fetchConversations();
    };

    const handleMessageStatus = (data: any) => {
      console.log('📊 Message status update:', data);

      setMessages(prev =>
        prev.map(msg =>
          msg.id === data.messageId
            ? { ...msg, status: data.status }
            : msg
        )
      );
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:status', handleMessageStatus);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:status', handleMessageStatus);
    };
  }, [socket, isConnected, selectedConversation, fetchConversations]);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load conversation from URL
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) {
        setSelectedConversation(conv);
        fetchMessages(conversationId);
      }
    }
  }, [conversationId, conversations, fetchMessages]);

  const selectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    navigate(`/dashboard/inbox/${conv.id}`);
    fetchMessages(conv.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Failed to Load Inbox
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={fetchConversations}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
      {/* Conversations List */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${selectedConversation?.id === conv.id
                  ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500'
                  : ''
                  }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    {conv.contact.avatar ? (
                      <img
                        src={conv.contact.avatar}
                        alt={conv.contact.name || conv.contact.phone}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      <Users className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {conv.contact.name || conv.contact.phone}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {conv.lastMessagePreview || 'No messages'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <MessageSquare className="w-12 h-12 mb-2" />
              <p>No conversations</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    {selectedConversation.contact.avatar ? (
                      <img
                        src={selectedConversation.contact.avatar}
                        alt={selectedConversation.contact.name}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      <Users className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {selectedConversation.contact.name || selectedConversation.contact.phone}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedConversation.contact.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#efe7dd] dark:bg-gray-900/50">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'
                      }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${message.direction === 'OUTBOUND'
                        ? 'bg-[#d9fdd3] dark:bg-green-700 text-gray-900 dark:text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                        }`}
                    >
                      <p className="break-words text-sm">{message.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] opacity-70">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {message.direction === 'OUTBOUND' && (
                          <span>
                            {message.status === 'READ' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                            {message.status === 'DELIVERED' && <CheckCheck className="w-3 h-3 text-gray-500" />}
                            {message.status === 'SENT' && <Check className="w-3 h-3 text-gray-500" />}
                            {message.status === 'PENDING' && <Clock className="w-3 h-3 text-gray-400" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageSquare className="w-12 h-12 mb-2" />
                  <p>No messages yet</p>
                  <p className="text-sm">Send a message to start conversation</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <Smile className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <Paperclip className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    disabled={sending}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-900 dark:text-white placeholder-gray-500"
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sending}
                  className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-105"
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
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                Select a conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;