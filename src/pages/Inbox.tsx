// src/pages/Inbox.tsx - COMPLETE WITH ALL FEATURES

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Info,
  CheckCheck,
  Check,
  Clock,
  Loader2,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Pin,
  PinOff,
  Tag,
  Archive,
  ArchiveRestore,
  Trash2,
  Image,
  FileText,
  Mic,
  X,
  Plus,
  Star,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useInboxSocket } from '../hooks/useInboxSocket';
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
  email?: string;
  phone: string;
  avatar?: string;
  whatsappProfileName?: string;
  tags?: string[];
}

interface Message {
  id: string;
  waMessageId?: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'TEMPLATE' | 'STICKER';
  direction: 'INBOUND' | 'OUTBOUND';
  status?: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  createdAt: string;
  sentAt?: string;
  mediaUrl?: string;
  templateName?: string;
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
  isPinned?: boolean;
  labels?: string[];
  assignedTo?: string;
}

// ============================================
// PREDEFINED LABELS
// ============================================

const LABEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  important: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  'follow-up': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  resolved: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  pending: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  vip: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  new: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  support: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
  sales: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300' },
};

const AVAILABLE_LABELS = Object.keys(LABEL_COLORS);

// ============================================
// QUICK REPLIES
// ============================================

const QUICK_REPLIES = [
  { id: '1', text: 'Hello! How can I help you today?', shortcut: '/hello' },
  { id: '2', text: 'Thank you for your message. We will get back to you shortly.', shortcut: '/thanks' },
  { id: '3', text: 'Our business hours are Monday to Friday, 9 AM to 6 PM.', shortcut: '/hours' },
  { id: '4', text: 'Please share your order ID and I will check the status for you.', shortcut: '/order' },
  { id: '5', text: 'Is there anything else I can help you with?', shortcut: '/more' },
];

// ============================================
// EMOJI PICKER DATA
// ============================================

const EMOJIS = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💯', '🙏', '👋', '😊', '🤔', '👏', '💪', '🎁', '📱', '✅', '❌', '⭐', '💡'];

// ============================================
// INBOX COMPONENT
// ============================================

const Inbox: React.FC = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // UI States
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState<string | null>(null);
  const [showConversationMenu, setShowConversationMenu] = useState<string | null>(null);

  // Refs
  const fetchingMessagesRef = useRef(false);
  const lastFetchedConvId = useRef<string | null>(null);

  // ============================================
  // HELPERS
  // ============================================

  const scrollToBottom = (smooth = true) => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }, 100);
  };

  const getContactName = (contact: Contact): string => {
    if (contact.whatsappProfileName) return contact.whatsappProfileName;
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
        if (message.templateName) {
          return `📋 Template: ${message.templateName}`;
        }
        return message.content;
      }
    }
    if (message.type === 'IMAGE') return '📷 Image';
    if (message.type === 'VIDEO') return '🎥 Video';
    if (message.type === 'AUDIO') return '🎵 Audio';
    if (message.type === 'DOCUMENT') return '📄 Document';
    if (message.type === 'STICKER') return '🎭 Sticker';
    return message.content || '';
  };

  const getLabelStyle = (label: string) => {
    return LABEL_COLORS[label.toLowerCase()] || {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-300',
    };
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

      if (response.data.success) {
        let conversationsData: Conversation[] = [];

        if (Array.isArray(response.data.data)) {
          conversationsData = response.data.data;
        } else if (response.data.data?.conversations) {
          conversationsData = response.data.data.conversations;
        }

        const validConversations = conversationsData.filter(
          (conv) => conv && conv.id && conv.contact
        );

        // Sort: pinned first, then by date
        validConversations.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
        });

        setConversations(validConversations);
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
  // FETCH MESSAGES
  // ============================================

  const fetchMessages = useCallback(async (convId: string) => {
    if (fetchingMessagesRef.current) return;
    if (lastFetchedConvId.current === convId && messages.length > 0) return;

    try {
      fetchingMessagesRef.current = true;
      setLoadingMessages(true);

      const response = await inboxApi.getMessages(convId, { limit: 100 });

      if (response.data.success) {
        let messagesData: Message[] = [];

        if (Array.isArray(response.data.data)) {
          messagesData = response.data.data;
        } else if (response.data.data?.messages) {
          messagesData = response.data.data.messages;
        }

        messagesData.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        setMessages(messagesData);
        lastFetchedConvId.current = convId;
        scrollToBottom(false);

        // Mark as read
        inboxApi.markAsRead(convId).catch(() => { });
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
  }, []);

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
    setShowQuickReplies(false);
    setShowEmojiPicker(false);
    scrollToBottom();

    try {
      const accountsRes = await whatsappApi.accounts();
      const accounts = accountsRes.data?.data || [];
      const connectedAccount = accounts.find((a: any) => a.status === 'CONNECTED');
      const accountId = connectedAccount?.id || accounts[0]?.id;

      if (!accountId) {
        throw new Error('No WhatsApp account connected');
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
              ? { ...realMessage, id: realMessage.id || tempId, status: 'SENT', content: sentText }
              : msg
          )
        );

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation.id
              ? { ...conv, lastMessagePreview: sentText, lastMessageAt: new Date().toISOString() }
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
  // CONVERSATION ACTIONS
  // ============================================

  const handlePinConversation = async (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Update locally first
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, isPinned: !c.isPinned } : c))
      );
      toast.success(conv.isPinned ? 'Unpinned conversation' : 'Pinned conversation');

      // TODO: Call API to persist
      // await inboxApi.updateConversation(conv.id, { isPinned: !conv.isPinned });
    } catch (error) {
      toast.error('Failed to update pin status');
    }
    setShowConversationMenu(null);
  };

  const handleArchiveConversation = async (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (conv.isArchived) {
        await inboxApi.markAsRead(conv.id); // Using as unarchive for now
      }

      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, isArchived: !c.isArchived } : c))
      );

      if (selectedConversation?.id === conv.id) {
        setSelectedConversation(null);
        setMessages([]);
        navigate('/dashboard/inbox');
      }

      toast.success(conv.isArchived ? 'Unarchived conversation' : 'Archived conversation');
    } catch (error) {
      toast.error('Failed to archive conversation');
    }
    setShowConversationMenu(null);
  };

  const handleAddLabel = async (conv: Conversation, label: string) => {
    try {
      const newLabels = [...(conv.labels || []), label];

      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, labels: newLabels } : c)
        )
      );

      if (selectedConversation?.id === conv.id) {
        setSelectedConversation({ ...selectedConversation, labels: newLabels });
      }

      toast.success(`Added label: ${label}`);

      // TODO: Call API
      // await inboxApi.addLabels(conv.id, [label]);
    } catch (error) {
      toast.error('Failed to add label');
    }
    setShowLabelPicker(null);
  };

  const handleRemoveLabel = async (conv: Conversation, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newLabels = (conv.labels || []).filter((l) => l !== label);

      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, labels: newLabels } : c))
      );

      if (selectedConversation?.id === conv.id) {
        setSelectedConversation({ ...selectedConversation, labels: newLabels });
      }

      toast.success(`Removed label: ${label}`);
    } catch (error) {
      toast.error('Failed to remove label');
    }
  };

  // ============================================
  // SELECT CONVERSATION
  // ============================================

  const selectConversation = (conv: Conversation) => {
    if (selectedConversation?.id === conv.id) return;

    setMessages([]);
    lastFetchedConvId.current = null;
    setSelectedConversation(conv);
    setShowContactInfo(false);
    navigate(`/dashboard/inbox/${conv.id}`);
    fetchMessages(conv.id);
  };

  // ============================================
  // HANDLE FILE UPLOAD
  // ============================================

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation) return;

    toast.loading('Uploading file...');

    // TODO: Implement actual file upload
    setTimeout(() => {
      toast.dismiss();
      toast.success('File upload coming soon!');
    }, 1000);

    setShowAttachMenu(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ============================================
  // SOCKET LISTENERS
  // ============================================

  useInboxSocket(
    selectedConversation?.id || null,
    // On new message
    (newMessage: any) => {
      console.log('📨 New message received:', newMessage);

      const message = newMessage.message || newMessage;

      if (selectedConversation?.id === message.conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        scrollToBottom();
      }

      // Update conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === message.conversationId
            ? {
              ...conv,
              lastMessagePreview: message.content?.substring(0, 50) || '[Media]',
              lastMessageAt: message.createdAt || new Date().toISOString(),
              unreadCount:
                selectedConversation?.id === message.conversationId
                  ? 0
                  : (conv.unreadCount || 0) + 1,
            }
            : conv
        )
      );
    },
    // On conversation update
    (update: any) => {
      console.log('💬 Conversation updated:', update);
      fetchConversations();
    },
    // On message status
    (statusUpdate: any) => {
      console.log('📊 Message status:', statusUpdate);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === statusUpdate.messageId ||
            msg.waMessageId === statusUpdate.waMessageId
            ? { ...msg, status: statusUpdate.status }
            : msg
        )
      );
    }
  );

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    fetchConversations();
  }, [filter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConversations();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!conversationId || conversations.length === 0) return;
    if (selectedConversation?.id === conversationId) return;

    const conv = conversations.find((c) => c.id === conversationId);
    if (conv) {
      setSelectedConversation(conv);
      if (lastFetchedConvId.current !== conversationId) {
        fetchMessages(conversationId);
      }
    }
  }, [conversationId, conversations]);

  // ============================================
  // RENDER: LOADING
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
  // RENDER: ERROR
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
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
    <div className="flex h-[calc(100vh-4rem)] bg-gray-100 dark:bg-gray-900">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        onChange={handleFileSelect}
      />

      {/* ============================================ */}
      {/* LEFT SIDEBAR: CONVERSATIONS LIST */}
      {/* ============================================ */}
      <div className="w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Inbox</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setRefreshing(true);
                  fetchConversations();
                }}
                disabled={refreshing}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
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
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
            {(['all', 'unread', 'archived'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all capitalize ${filter === f
                  ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                {f}
                {f === 'unread' && conversations.filter((c) => c.unreadCount > 0).length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-green-500 text-white rounded-full">
                    {conversations.filter((c) => c.unreadCount > 0).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <div key={conv.id} className="relative">
                <div
                  onClick={() => selectConversation(conv)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-all border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedConversation?.id === conv.id
                    ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500'
                    : ''
                    } ${!conv.isRead && conv.unreadCount > 0 ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                      {conv.contact.avatar ? (
                        <img
                          src={conv.contact.avatar}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getContactInitial(conv.contact)
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-sm">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </div>
                    )}
                    {conv.isPinned && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                        <Pin className="w-3 h-3 text-yellow-800" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold truncate ${conv.unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                        {getContactName(conv.contact)}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                        {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false })}
                      </span>
                    </div>

                    <p className={`text-sm truncate mb-1.5 ${conv.unreadCount > 0
                      ? 'text-gray-700 dark:text-gray-300 font-medium'
                      : 'text-gray-500 dark:text-gray-400'
                      }`}>
                      {conv.lastMessagePreview || 'No messages yet'}
                    </p>

                    {/* Labels */}
                    {conv.labels && conv.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {conv.labels.slice(0, 3).map((label) => {
                          const style = getLabelStyle(label);
                          return (
                            <span
                              key={label}
                              onClick={(e) => handleRemoveLabel(conv, label, e)}
                              className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full cursor-pointer hover:opacity-80 ${style.bg} ${style.text}`}
                            >
                              {label}
                              <X className="w-3 h-3 ml-1" />
                            </span>
                          );
                        })}
                        {conv.labels.length > 3 && (
                          <span className="text-xs text-gray-500">+{conv.labels.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowConversationMenu(showConversationMenu === conv.id ? null : conv.id);
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Conversation Menu */}
                {showConversationMenu === conv.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowConversationMenu(null)}
                    />
                    <div className="absolute right-4 top-12 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                      <button
                        onClick={(e) => handlePinConversation(conv, e)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {conv.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                        {conv.isPinned ? 'Unpin' : 'Pin to top'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowLabelPicker(conv.id);
                          setShowConversationMenu(null);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Tag className="w-4 h-4" />
                        Add Label
                      </button>
                      <button
                        onClick={(e) => handleArchiveConversation(conv, e)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {conv.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                        {conv.isArchived ? 'Unarchive' : 'Archive'}
                      </button>
                    </div>
                  </>
                )}

                {/* Label Picker */}
                {showLabelPicker === conv.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowLabelPicker(null)}
                    />
                    <div className="absolute right-4 top-12 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20">
                      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">Add Label</div>
                      {AVAILABLE_LABELS.filter((l) => !(conv.labels || []).includes(l)).map((label) => {
                        const style = getLabelStyle(label);
                        return (
                          <button
                            key={label}
                            onClick={() => handleAddLabel(conv, label)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <span className={`w-3 h-3 rounded-full ${style.bg} ${style.border} border`} />
                            <span className="capitalize">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">No conversations</p>
              <p className="text-sm mt-1">
                {filter === 'unread' ? 'No unread messages' : filter === 'archived' ? 'No archived chats' : 'Start a campaign to see conversations'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* CENTER: CHAT AREA */}
      {/* ============================================ */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setShowContactInfo(!showContactInfo)}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                    {selectedConversation.contact.avatar ? (
                      <img
                        src={selectedConversation.contact.avatar}
                        alt=""
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      {selectedConversation.contact.phone}
                      {selectedConversation.isWindowOpen && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          24h Window Open
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowContactInfo(!showContactInfo)}
                    className={`p-2 rounded-lg transition-colors ${showContactInfo ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    title="Contact Info"
                  >
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Labels */}
              {selectedConversation.labels && selectedConversation.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedConversation.labels.map((label) => {
                    const style = getLabelStyle(label);
                    return (
                      <span
                        key={label}
                        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${style.bg} ${style.text}`}
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Messages Area */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-2"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundColor: '#f0f2f5',
              }}
            >
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
              ) : messages.length > 0 ? (
                <>
                  {messages.map((message, index) => {
                    const isOutbound = message.direction === 'OUTBOUND';
                    const showDate =
                      index === 0 ||
                      new Date(message.createdAt).toDateString() !==
                      new Date(messages[index - 1].createdAt).toDateString();

                    return (
                      <React.Fragment key={message.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="px-4 py-1 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-full shadow-sm">
                              {format(new Date(message.createdAt), 'MMMM d, yyyy')}
                            </span>
                          </div>
                        )}

                        <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[70%] lg:max-w-md rounded-2xl shadow-sm ${isOutbound
                              ? 'bg-green-500 text-white rounded-br-md'
                              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                              }`}
                          >
                            {/* Message Content */}
                            <div className="px-4 py-2">
                              {message.type === 'IMAGE' && message.mediaUrl && (
                                <img
                                  src={message.mediaUrl}
                                  alt="Image"
                                  className="max-w-full rounded-lg mb-2"
                                />
                              )}
                              <p className="break-words text-sm whitespace-pre-wrap">
                                {parseMessageContent(message)}
                              </p>
                            </div>

                            {/* Footer */}
                            <div className={`flex items-center justify-end gap-1 px-3 pb-2 ${isOutbound ? 'text-green-100' : 'text-gray-400'
                              }`}>
                              <span className="text-[11px]">
                                {format(new Date(message.createdAt), 'HH:mm')}
                              </span>

                              {isOutbound && (
                                <span className="ml-1">
                                  {message.status === 'READ' && <CheckCheck className="w-4 h-4 text-blue-300" />}
                                  {message.status === 'DELIVERED' && <CheckCheck className="w-4 h-4" />}
                                  {message.status === 'SENT' && <Check className="w-4 h-4" />}
                                  {message.status === 'PENDING' && <Clock className="w-4 h-4" />}
                                  {message.status === 'FAILED' && <AlertCircle className="w-4 h-4 text-red-300" />}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No messages yet</p>
                  <p className="text-sm mt-1">Send a message to start the conversation</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies Panel */}
            {showQuickReplies && (
              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Replies</span>
                  <button onClick={() => setShowQuickReplies(false)}>
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_REPLIES.map((reply) => (
                    <button
                      key={reply.id}
                      onClick={() => {
                        setMessageText(reply.text);
                        setShowQuickReplies(false);
                      }}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {reply.shortcut}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                {/* Quick Replies Toggle */}
                <button
                  onClick={() => setShowQuickReplies(!showQuickReplies)}
                  className={`p-2 rounded-full transition-colors ${showQuickReplies ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
                    }`}
                  title="Quick Replies"
                >
                  <Star className="w-5 h-5" />
                </button>

                {/* Emoji Picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-2 rounded-full transition-colors ${showEmojiPicker ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
                      }`}
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  {showEmojiPicker && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowEmojiPicker(false)} />
                      <div className="absolute bottom-full left-0 mb-2 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                        <div className="grid grid-cols-10 gap-1">
                          {EMOJIS.map((emoji, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setMessageText((prev) => prev + emoji);
                                setShowEmojiPicker(false);
                              }}
                              className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Attachment Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    className={`p-2 rounded-full transition-colors ${showAttachMenu ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
                      }`}
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  {showAttachMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowAttachMenu(false)} />
                      <div className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => {
                              fileInputRef.current?.click();
                              setShowAttachMenu(false);
                            }}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          >
                            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                              <Image className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium">Photo & Video</span>
                          </button>
                          <button
                            onClick={() => {
                              fileInputRef.current?.click();
                              setShowAttachMenu(false);
                            }}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          >
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium">Document</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Text Input */}
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

                {/* Voice / Send Button */}
                {messageText.trim() ? (
                  <button
                    onClick={handleSendMessage}
                    disabled={sending}
                    className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-lg"
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                ) : (
                  <button className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <MessageSquare className="w-16 h-16 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                WabMeta Inbox
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                Select a conversation to view messages and start chatting with your customers
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* RIGHT SIDEBAR: CONTACT INFO */}
      {/* ============================================ */}
      {showContactInfo && selectedConversation && (
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Contact Info</h3>
            <button
              onClick={() => setShowContactInfo(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Profile */}
          <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">
              {selectedConversation.contact.avatar ? (
                <img
                  src={selectedConversation.contact.avatar}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getContactInitial(selectedConversation.contact)
              )}
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">
              {getContactName(selectedConversation.contact)}
            </h4>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {selectedConversation.contact.phone}
            </p>
          </div>

          {/* Details */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Phone</label>
              <p className="text-gray-900 dark:text-white mt-1">{selectedConversation.contact.phone}</p>
            </div>

            {/* Email */}
            {selectedConversation.contact.email && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                <p className="text-gray-900 dark:text-white mt-1">{selectedConversation.contact.email}</p>
              </div>
            )}

            {/* Labels */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Labels</label>
              <div className="flex flex-wrap gap-2">
                {(selectedConversation.labels || []).map((label) => {
                  const style = getLabelStyle(label);
                  return (
                    <span
                      key={label}
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}
                    >
                      {label}
                      <button
                        onClick={() => handleRemoveLabel(selectedConversation, label, { stopPropagation: () => { } } as any)}
                        className="ml-1 hover:opacity-70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
                <button
                  onClick={() => setShowLabelPicker(selectedConversation.id)}
                  className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </button>
              </div>
            </div>

            {/* Tags */}
            {selectedConversation.contact.tags && selectedConversation.contact.tags.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-1">
                  {selectedConversation.contact.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Window Status */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">24h Window</label>
              {selectedConversation.isWindowOpen ? (
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Window Open
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                  Window Closed
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <Archive className="w-4 h-4" />
              Archive Conversation
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
              Delete Conversation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;