// src/pages/Inbox.tsx - COMPLETE FINAL VERSION

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  MoreVertical,
  Info,
  Loader2,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Pin,
  PinOff,
  Tag,
  Archive,
  ArchiveRestore,
  X,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useInboxSocket } from '../hooks/useInboxSocket';
import api, { inbox as inboxApi, whatsapp as whatsappApi } from '../services/api';
import toast from 'react-hot-toast';
import WindowStatus from '../components/inbox/WindowStatus';
import ChatInput from '../components/inbox/ChatInput';
import MessageBubble from '../components/inbox/MessageBubble';
import SendTemplateModal from '../components/inbox/SendTemplateModal';

// ============================================
// SAFE DATE FORMATTING HELPERS
// ============================================
const safeFormatDate = (date: any, formatStr: string, fallback: string = 'N/A'): string => {
  try {
    if (!date) return fallback;
    const d = new Date(date);
    if (isNaN(d.getTime())) return fallback;
    return format(d, formatStr);
  } catch (e) {
    return fallback;
  }
};

const safeFormatDistance = (date: any, fallback: string = 'Just now'): string => {
  try {
    if (!date) return fallback;
    const d = new Date(date);
    if (isNaN(d.getTime())) return fallback;
    return formatDistanceToNow(d, { addSuffix: false });
  } catch (e) {
    return fallback;
  }
};

// TYPES
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
  wamId?: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'TEMPLATE' | 'STICKER';
  direction: 'INBOUND' | 'OUTBOUND';
  status?: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  createdAt: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  statusUpdatedAt?: string;
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
  windowExpiresAt?: string;
  isPinned?: boolean;
  labels?: string[];
  assignedTo?: string;
}

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

const Inbox: React.FC = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState<string | null>(null);
  const [showConversationMenu, setShowConversationMenu] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const conversationListRef = useRef<HTMLDivElement>(null);

  const fetchingMessagesRef = useRef(false);
  const lastFetchedConvId = useRef<string | null>(null);

  const scrollToBottom = (smooth = true) => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }, 100);
  };

  const getContactName = (contact: Contact): string => {
    if (contact.whatsappProfileName) return contact.whatsappProfileName;
    if (contact.name) return contact.name;
    if (contact.firstName || contact.lastName) return [contact.firstName, contact.lastName].filter(Boolean).join(' ');
    return contact.phone;
  };

  const getContactInitial = (contact: Contact): string => getContactName(contact).charAt(0).toUpperCase();

  const getLabelStyle = (label: string) => LABEL_COLORS[label.toLowerCase()] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
  };

  // =========================
  // API: conversations
  // =========================
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setPage(1);
      setHasMore(true);

      const params: any = {
        limit: 200,  // ✅ Increased limit
      };

      // ✅ Only add search if provided
      if (searchQuery?.trim()) {
        params.search = searchQuery.trim();
      }

      // ✅ FIXED: Filter logic
      if (filter === 'unread') {
        params.isRead = false;
        params.isArchived = false;  // Unread should exclude archived
      } else if (filter === 'archived') {
        params.isArchived = true;
      }
      // ✅ For 'all' filter - don't pass isArchived at all (show everything except archived)
      else {
        params.isArchived = false;  // 'all' = all non-archived
      }

      console.log('📥 Fetching conversations with params:', params);

      const response = await inboxApi.getConversations(params);

      if (response.data.success) {
        let data: Conversation[] = [];

        if (Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (response.data.data?.conversations) {
          data = response.data.data.conversations;
        }

        // Filter out invalid entries
        const valid = data.filter((c) => c?.id && c?.contact);

        // Sort: Pinned first, then by lastMessageAt
        valid.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;

          const dateA = new Date(a.lastMessageAt || 0).getTime();
          const dateB = new Date(b.lastMessageAt || 0).getTime();
          return dateB - dateA;
        });

        console.log(`✅ Loaded ${valid.length} conversations`);
        setConversations(valid);
      } else {
        throw new Error(response.data.message || 'Failed to load conversations');
      }
    } catch (e: any) {
      console.error('❌ Fetch conversations error:', e);
      setError(e.response?.data?.message || e.message || 'Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, filter]);

  // Load more function
  const loadMoreConversations = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;

      const params: any = {
        page: nextPage,
        limit: 50,
      };

      if (filter === 'unread') params.isRead = false;
      else if (filter === 'archived') params.isArchived = true;
      else params.isArchived = false;

      const response = await inboxApi.getConversations(params);

      if (response.data.success) {
        let newData: Conversation[] = [];
        if (Array.isArray(response.data.data)) {
          newData = response.data.data;
        } else if (response.data.data?.conversations) {
          newData = response.data.data.conversations;
        }

        if (newData.length === 0) {
          setHasMore(false);
        } else {
          setConversations(prev => [...prev, ...newData.filter((c: any) => c?.id && c?.contact)]);
          setPage(nextPage);
        }
      }
    } catch (e) {
      console.error('Load more error:', e);
    } finally {
      setLoadingMore(false);
    }
  };

  // Scroll handler
  const handleConversationScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    // Load more when 80% scrolled
    if (scrollTop + clientHeight >= scrollHeight * 0.8) {
      loadMoreConversations();
    }
  };

  const fetchMessages = useCallback(async (convId: string) => {
    if (fetchingMessagesRef.current) return;
    if (lastFetchedConvId.current === convId && messages.length > 0) return;

    try {
      fetchingMessagesRef.current = true;
      setLoadingMessages(true);

      const response = await inboxApi.getMessages(convId, { limit: 100 });

      if (response.data.success) {
        let messagesData: Message[] = [];
        const d = response.data.data;

        if (Array.isArray(d)) messagesData = d;
        else if (d?.messages) messagesData = d.messages;
        else if (d?.data?.messages) messagesData = d.data.messages;

        messagesData.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        setMessages(messagesData);
        lastFetchedConvId.current = convId;

        scrollToBottom(false);
        inboxApi.markAsRead(convId).catch(() => { });
        setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0, isRead: true } : c)));
      }
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to load messages');
      setMessages([]);
    } finally {
      setLoadingMessages(false);
      fetchingMessagesRef.current = false;
    }
  }, [messages.length]);

  // =========================
  // SEND TEXT
  // =========================
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || messageText;
    if (!text.trim() || !selectedConversation) return;

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const now = new Date().toISOString();

    // ✅ Create optimistic message
    const tempMessage: Message = {
      id: tempId,
      content: text,
      type: 'TEXT',
      direction: 'OUTBOUND',
      status: 'PENDING',
      createdAt: now,
      sentAt: now,
    };

    // ✅ IMMEDIATELY add to UI (no await)
    setMessages((prev) => [...prev, tempMessage]);
    const sentText = text;
    setMessageText(''); // Clear input immediately
    scrollToBottom();

    try {
      const accountsRes = await whatsappApi.accounts();
      const accounts = accountsRes.data?.data || [];
      const connected = accounts.find((a: any) => a.status === 'CONNECTED');
      const accountId = connected?.id || accounts[0]?.id;

      if (!accountId) throw new Error('No WhatsApp account connected');

      // ✅ Send in background
      const response = await whatsappApi.sendText({
        whatsappAccountId: accountId,
        to: selectedConversation.contact.phone,
        message: sentText,
      });

      if (response.data.success) {
        const realMessage = response.data.data;

        // ✅ Update temp message with real data
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? {
                ...m,
                id: realMessage.id || tempId,
                waMessageId: realMessage.waMessageId || realMessage.wamId,
                wamId: realMessage.wamId || realMessage.waMessageId,
                status: 'SENT', // ✅ Update to SENT
                sentAt: realMessage.sentAt || now,
              }
              : m
          )
        );

        // Update conversation preview
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConversation.id
              ? { ...c, lastMessagePreview: sentText, lastMessageAt: now }
              : c
          )
        );

        // ✅ Success feedback (subtle, no toast spam)
        console.log('✅ Message sent successfully');
      } else {
        throw new Error(response.data.message || 'Failed to send message');
      }
    } catch (e: any) {
      // ✅ Only show error toast
      toast.error(e.response?.data?.message || e.message || 'Failed to send message');

      // ✅ Mark as FAILED (don't remove message)
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'FAILED' } : m))
      );
    }
  };

  // =========================
  // MEDIA UPLOAD
  // =========================
  const handleUploadAndSendMedia = async (file: File) => {
    if (!selectedConversation) return;

    const tempId = `temp-media-${Date.now()}`;
    const mime = file.type || '';

    const tempType: Message['type'] =
      mime.startsWith('image/')
        ? 'IMAGE'
        : mime.startsWith('video/')
          ? 'VIDEO'
          : mime.startsWith('audio/')
            ? 'AUDIO'
            : 'DOCUMENT';

    const tempMsg: Message = {
      id: tempId,
      content: file.name,
      type: tempType,
      direction: 'OUTBOUND',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      mediaUrl: mime.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    };

    setMessages((prev) => [...prev, tempMsg]);
    scrollToBottom();

    try {
      toast.loading('Uploading...');
      const form = new FormData();
      form.append('file', file);

      const uploadRes = await api.post('/inbox/media/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.dismiss();

      const uploaded = uploadRes.data?.data;
      const mediaUrl = uploaded?.url;
      const mediaType = uploaded?.mediaType;

      if (!mediaUrl || !mediaType) throw new Error('Upload failed');

      toast.loading('Sending...');
      const sendRes = await api.post(`/inbox/conversations/${selectedConversation.id}/messages/media`, {
        mediaType,
        mediaUrl,
        caption: messageText.trim() || undefined,
      });
      toast.dismiss();

      const result = sendRes.data?.data;
      const dbMessage = result?.message || result;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
              ...(dbMessage || m),
              id: dbMessage?.id || m.id,
              status: 'SENT',
              mediaUrl: mediaUrl,
              content: dbMessage?.content || m.content,
              type: (dbMessage?.type || m.type) as any,
            }
            : m
        )
      );

      const preview =
        mediaType === 'image'
          ? '📷 Image'
          : mediaType === 'video'
            ? '🎥 Video'
            : mediaType === 'audio'
              ? '🎵 Audio'
              : '📄 Document';

      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? { ...c, lastMessagePreview: preview, lastMessageAt: new Date().toISOString() }
            : c
        )
      );

      toast.success('Media sent!');
      setMessageText('');
    } catch (e: any) {
      toast.dismiss();
      toast.error(e.response?.data?.message || e.message || 'Failed to send media');
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, status: 'FAILED' } : m)));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleUploadAndSendMedia(file);
  };

  // =========================
  // PIN/ARCHIVE/LABELS
  // =========================
  const handlePinConversation = async (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newPinned = !Boolean(conv.isPinned);
      setConversations((prev) => prev.map((c) => (c.id === conv.id ? { ...c, isPinned: newPinned } : c)));
      if (selectedConversation?.id === conv.id) setSelectedConversation({ ...selectedConversation, isPinned: newPinned });

      await api.patch(`/inbox/conversations/${conv.id}/pin`, { isPinned: newPinned });
      toast.success(newPinned ? 'Pinned conversation' : 'Unpinned conversation');
      fetchConversations();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Pin failed');
      fetchConversations();
    } finally {
      setShowConversationMenu(null);
    }
  };

  const handleArchiveConversation = async (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (conv.isArchived) {
        await api.post(`/inbox/conversations/${conv.id}/unarchive`);
      } else {
        await api.post(`/inbox/conversations/${conv.id}/archive`);
      }
      toast.success(conv.isArchived ? 'Unarchived' : 'Archived');

      if (selectedConversation?.id === conv.id) {
        setSelectedConversation(null);
        setMessages([]);
        navigate('/dashboard/inbox');
      }

      fetchConversations();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Archive failed');
    } finally {
      setShowConversationMenu(null);
    }
  };

  const handleAddLabel = async (conv: Conversation, label: string) => {
    try {
      await api.post(`/inbox/conversations/${conv.id}/labels`, { labels: [label] });
      toast.success(`Added label: ${label}`);
      setShowLabelPicker(null);

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conv.id ? { ...c, labels: Array.from(new Set([...(c.labels || []), label])) } : c
        )
      );
      if (selectedConversation?.id === conv.id) {
        setSelectedConversation({
          ...selectedConversation,
          labels: Array.from(new Set([...(selectedConversation.labels || []), label])),
        });
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to add label');
    }
  };

  const handleRemoveLabel = async (conv: Conversation, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/inbox/conversations/${conv.id}/labels/${encodeURIComponent(label)}`);
      toast.success(`Removed label: ${label}`);

      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, labels: (c.labels || []).filter((l) => l !== label) } : c))
      );
      if (selectedConversation?.id === conv.id) {
        setSelectedConversation({
          ...selectedConversation,
          labels: (selectedConversation.labels || []).filter((l) => l !== label),
        });
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to remove label');
    }
  };

  // =========================
  // SELECT CONVERSATION
  // =========================
  const selectConversation = (conv: Conversation) => {
    if (selectedConversation?.id === conv.id) return;
    setMessages([]);
    lastFetchedConvId.current = null;
    setSelectedConversation(conv);
    setShowContactInfo(false);
    navigate(`/dashboard/inbox/${conv.id}`);
    fetchMessages(conv.id);
  };

  // =========================
  // SOCKET LISTENERS
  // =========================
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => { });
    } catch (e) { }
  };

  useInboxSocket(
    selectedConversation?.id || null,
    (newMessage: any) => {
      const msg = newMessage?.message || newMessage;
      if (!msg?.conversationId) return;

      if (selectedConversation?.id === msg.conversationId) {
        // Check duplicate
        setMessages((prev) => {
          if (prev.some(m => m.id === msg.id || m.waMessageId === msg.waMessageId)) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
        inboxApi.markAsRead(msg.conversationId).catch(() => { });
      }

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === msg.conversationId) {
            return {
              ...c,
              lastMessagePreview: msg.type === 'TEMPLATE'
                ? '📋 Template Message'
                : (msg.content?.substring(0, 50) || 'New message'),
              lastMessageAt: msg.createdAt || new Date().toISOString(),
              unreadCount: selectedConversation?.id === msg.conversationId ? 0 : (c.unreadCount || 0) + 1,
            };
          }
          return c;
        })
      );

      if (msg.direction === 'INBOUND' && selectedConversation?.id !== msg.conversationId) {
        playNotificationSound();
      }
    },
    (updatedConv: any) => {
      setConversations((prev) => prev.map((c) => (c.id === updatedConv.id ? { ...c, ...updatedConv } : c)));
      if (selectedConversation?.id === updatedConv.id) {
        setSelectedConversation((prev) => (prev ? { ...prev, ...updatedConv } : prev));
      }
    },
    // ✅ FIXED: Status update handler with better ID matching
    (statusUpdate: any) => {
      console.log('🔄 [INBOX] Status Update:', statusUpdate);

      setMessages((prev) =>
        prev.map((m) => {
          // ✅ Match by ALL possible IDs
          const isMatch =
            m.id === statusUpdate.messageId ||
            m.waMessageId === statusUpdate.waMessageId ||
            m.wamId === statusUpdate.wamId ||
            m.waMessageId === statusUpdate.wamId ||
            m.wamId === statusUpdate.waMessageId;

          if (isMatch) {
            console.log(`✅ Updating message ${m.id} status: ${m.status} → ${statusUpdate.status}`);

            const newStatus = statusUpdate.status.toUpperCase() as Message['status'];

            return {
              ...m,
              status: newStatus,
              statusUpdatedAt: statusUpdate.timestamp,
              ...(newStatus === 'SENT' && { sentAt: statusUpdate.timestamp }),
              ...(newStatus === 'DELIVERED' && {
                deliveredAt: statusUpdate.timestamp,
                status: 'DELIVERED' as const
              }),
              ...(newStatus === 'READ' && {
                readAt: statusUpdate.timestamp,
                status: 'READ' as const
              }),
            };
          }
          return m;
        })
      );
    }
  );

  // =========================
  // EFFECTS
  // =========================
  useEffect(() => {
    fetchConversations();
  }, [filter]);

  useEffect(() => {
    const t = setTimeout(() => fetchConversations(), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    if (!conversationId || conversations.length === 0) return;
    if (selectedConversation?.id === conversationId) return;

    const conv = conversations.find((c) => c.id === conversationId);
    if (conv) {
      setSelectedConversation(conv);
      if (lastFetchedConvId.current !== conversationId) fetchMessages(conversationId);
    }
  }, [conversationId, conversations]);

  // =========================
  // RENDER
  // =========================
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

  if (error && conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Failed to Load Inbox</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">{error}</p>
        <button onClick={fetchConversations} className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <RefreshCw className="w-5 h-5" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-100 dark:bg-gray-900">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*,audio/*,.pdf,.doc,.docx" onChange={handleFileSelect} />

      {/* LEFT SIDEBAR */}
      <div className="w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Inbox</h2>
            <button
              onClick={() => {
                setRefreshing(true);
                fetchConversations();
              }}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <RefreshCw className={`w-5 h-5 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
            {[
              { key: 'all', label: 'All Chats' },
              { key: 'unread', label: 'Unread' },
              { key: 'archived', label: 'Archived' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as 'all' | 'unread' | 'archived')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${filter === f.key
                  ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
                  }`}
              >
                {f.label}
                {/* ✅ Show count badge */}
                {f.key === 'unread' && conversations.filter(c => c.unreadCount > 0).length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-green-500 text-white rounded-full">
                    {conversations.filter(c => c.unreadCount > 0).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={conversationListRef}
          onScroll={handleConversationScroll}
          className="flex-1 overflow-y-auto"
        >
          {conversations.map((conv) => (
            <div key={conv.id} className="relative">
              <div
                onClick={() => selectConversation(conv)}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedConversation?.id === conv.id
                  ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500'
                  : ''
                  }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                    {conv.contact.avatar ? (
                      <img src={conv.contact.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                    ) : (
                      getContactInitial(conv.contact)
                    )}
                  </div>

                  {conv.isPinned && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                      <Pin className="w-3 h-3 text-yellow-900" />
                    </div>
                  )}

                  {conv.unreadCount > 0 && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <h3
                      className={`font-semibold truncate ${conv.unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}
                    >
                      {getContactName(conv.contact)}
                    </h3>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-xs ${conv.unreadCount > 0 ? 'text-green-600 font-semibold' : 'text-gray-500'
                          }`}
                      >
                        {safeFormatDistance(conv.lastMessageAt, 'now')}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className="min-w-[1.25rem] h-5 px-1.5 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                          {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <p
                    className={`text-sm truncate ${conv.unreadCount > 0
                      ? 'text-gray-900 dark:text-gray-200 font-medium'
                      : 'text-gray-500 dark:text-gray-400'
                      }`}
                  >
                    {conv.lastMessagePreview || 'No messages yet'}
                  </p>

                  {conv.labels?.length ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {conv.labels.slice(0, 3).map((label) => {
                        const style = getLabelStyle(label);
                        return (
                          <span
                            key={label}
                            onClick={(e) => handleRemoveLabel(conv, label, e)}
                            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full cursor-pointer ${style.bg} ${style.text}`}
                          >
                            {label} <X className="w-3 h-3 ml-1" />
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConversationMenu(showConversationMenu === conv.id ? null : conv.id);
                  }}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {showConversationMenu === conv.id && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowConversationMenu(null)} />
                  <div className="absolute right-4 top-12 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                    <button
                      onClick={(e) => handlePinConversation(conv, e)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
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
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Tag className="w-4 h-4" />
                      Add Label
                    </button>

                    <button
                      onClick={(e) => handleArchiveConversation(conv, e)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {conv.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                      {conv.isArchived ? 'Unarchive' : 'Archive'}
                    </button>
                  </div>
                </>
              )}

              {showLabelPicker === conv.id && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowLabelPicker(null)} />
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
          ))}

          {/* ✅ Loading more indicator */}
          {loadingMore && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-green-600" />
            </div>
          )}

          {/* ✅ No more conversations */}
          {!hasMore && conversations.length > 0 && (
            <div className="text-center py-4 text-gray-400 text-sm">
              No more conversations
            </div>
          )}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {selectedConversation ? (
          <>
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowContactInfo(!showContactInfo)}>
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedConversation.contact.avatar ? (
                      <img src={selectedConversation.contact.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                    ) : (
                      getContactInitial(selectedConversation.contact)
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">{getContactName(selectedConversation.contact)}</h2>
                    <p className="text-xs text-gray-500">{selectedConversation.contact.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowContactInfo(!showContactInfo)}
                  className={`p-2 rounded-lg ${showContactInfo ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600'
                    }`}
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-none z-10 w-full shrink-0">
              <WindowStatus
                windowExpiresAt={selectedConversation.windowExpiresAt || null}
                isWindowOpen={selectedConversation.isWindowOpen || false}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#efe7dd]">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
              ) : (
                <>
                  {messages.map((m, idx) => {
                    const currentDate = m.createdAt ? new Date(m.createdAt) : null;
                    const prevDate = idx > 0 && messages[idx - 1].createdAt ? new Date(messages[idx - 1].createdAt) : null;

                    const showDate =
                      idx === 0 ||
                      (currentDate &&
                        prevDate &&
                        !isNaN(currentDate.getTime()) &&
                        !isNaN(prevDate.getTime()) &&
                        currentDate.toDateString() !== prevDate.toDateString());

                    return (
                      <React.Fragment key={m.id}>
                        {showDate && currentDate && !isNaN(currentDate.getTime()) && (
                          <div className="flex justify-center my-4">
                            <span className="px-4 py-1 bg-white text-gray-500 text-xs rounded-full shadow-sm">
                              {safeFormatDate(m.createdAt, 'MMMM d, yyyy', 'Today')}
                            </span>
                          </div>
                        )}

                        <MessageBubble
                          message={m as any}
                          onCopy={(content) => {
                            navigator.clipboard.writeText(content);
                            toast.success('Copied to clipboard');
                          }}
                        />
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="flex-none z-20 w-full shrink-0">
              <ChatInput
                onSendMessage={async (msg) => {
                  await handleSendMessage(msg);
                }}
                onMediaUpload={handleUploadAndSendMedia}
                onOpenTemplateModal={() => {
                  setShowTemplateModal(true);
                }}
                isWindowOpen={selectedConversation.isWindowOpen || false}
                windowExpiresAt={selectedConversation.windowExpiresAt}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Conversation</h3>
              <p className="text-gray-600 max-w-sm">Choose a conversation from the list</p>
            </div>
          </div>
        )}
      </div>

      {showContactInfo && selectedConversation && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Contact Info</h3>
            <button onClick={() => setShowContactInfo(false)} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6 text-center border-b">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              {selectedConversation.contact.avatar ? (
                <img src={selectedConversation.contact.avatar} className="w-full h-full rounded-full object-cover" alt="" />
              ) : (
                getContactInitial(selectedConversation.contact)
              )}
            </div>
            <h4 className="text-xl font-bold">{getContactName(selectedConversation.contact)}</h4>
            <p className="text-gray-500 mt-1">{selectedConversation.contact.phone}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedConversation.contact.email && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                <p className="mt-1">{selectedConversation.contact.email}</p>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Labels</label>
              <div className="flex flex-wrap gap-2">
                {(selectedConversation.labels || []).map((label) => {
                  const style = getLabelStyle(label);
                  return (
                    <span key={label} className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      {showTemplateModal && selectedConversation && (
        <SendTemplateModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          conversationId={selectedConversation.id}
          contactPhone={selectedConversation.contact.phone}
          contactName={getContactName(selectedConversation.contact)}
          onSuccess={() => {
            fetchConversations();
            fetchMessages(selectedConversation.id);
          }}
        />
      )}
    </div>
  );
};

export default Inbox;