// src/pages/Inbox.tsx - COMPLETE (your UI + backend connected features)

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
  Mic,
  X,
  Star,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useInboxSocket } from '../hooks/useInboxSocket';
import api, { inbox as inboxApi, whatsapp as whatsappApi } from '../services/api';
import toast from 'react-hot-toast';

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

const QUICK_REPLIES = [
  { id: '1', text: 'Hello! How can I help you today?', shortcut: '/hello' },
  { id: '2', text: 'Thank you for your message. We will get back to you shortly.', shortcut: '/thanks' },
  { id: '3', text: 'Our business hours are Monday to Friday, 9 AM to 6 PM.', shortcut: '/hours' },
  { id: '4', text: 'Please share your order ID and I will check the status for you.', shortcut: '/order' },
  { id: '5', text: 'Is there anything else I can help you with?', shortcut: '/more' },
];

const EMOJIS = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💯', '🙏', '👋', '😊', '🤔', '👏', '💪', '🎁', '📱', '✅', '❌', '⭐', '💡'];

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
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');

  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState<string | null>(null);
  const [showConversationMenu, setShowConversationMenu] = useState<string | null>(null);

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

  const parseMessageContent = (message: Message): string => {
    if (message.type === 'TEMPLATE' && message.content) {
      try {
        const parsed = JSON.parse(message.content);
        return `📋 Template: ${parsed.templateName || 'Unknown'}`;
      } catch {
        return message.content;
      }
    }
    if (message.type === 'IMAGE') return message.content || '📷 Image';
    if (message.type === 'VIDEO') return message.content || '🎥 Video';
    if (message.type === 'AUDIO') return message.content || '🎵 Audio';
    if (message.type === 'DOCUMENT') return message.content || '📄 Document';
    return message.content || '';
  };

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

      const params: any = { search: searchQuery || undefined, limit: 50 };

      if (filter === 'unread') params.isRead = false;
      else if (filter === 'archived') params.isArchived = true;
      else params.isArchived = false;

      const response = await inboxApi.getConversations(params);

      if (response.data.success) {
        let data: Conversation[] = [];
        if (Array.isArray(response.data.data)) data = response.data.data;
        else if (response.data.data?.conversations) data = response.data.data.conversations;

        const valid = data.filter((c) => c?.id && c?.contact);

        valid.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
        });

        setConversations(valid);
      } else {
        throw new Error(response.data.message || 'Failed to load conversations');
      }
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.message || e.message || 'Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, filter]);

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
  }, []);

  // =========================
  // SEND TEXT (existing flow)
  // =========================
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
      const connected = accounts.find((a: any) => a.status === 'CONNECTED');
      const accountId = connected?.id || accounts[0]?.id;
      if (!accountId) throw new Error('No WhatsApp account connected');

      const response = await whatsappApi.sendText({
        whatsappAccountId: accountId,
        to: selectedConversation.contact.phone,
        message: sentText,
      });

      if (response.data.success) {
        const realMessage = response.data.data;
        setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...realMessage, id: realMessage.id || tempId, status: 'SENT', content: sentText } : m)));

        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConversation.id ? { ...c, lastMessagePreview: sentText, lastMessageAt: new Date().toISOString() } : c
          )
        );

        toast.success('Message sent!');
      } else {
        throw new Error(response.data.message || 'Failed to send message');
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.message || 'Failed to send message');
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, status: 'FAILED' } : m)));
    } finally {
      setSending(false);
    }
  };

  // =========================
  // ✅ MEDIA: upload + send
  // =========================
  const handleUploadAndSendMedia = async (file: File) => {
    if (!selectedConversation) return;

    const tempId = `temp-media-${Date.now()}`;
    const mime = file.type || '';

    const tempType: Message['type'] =
      mime.startsWith('image/') ? 'IMAGE'
        : mime.startsWith('video/') ? 'VIDEO'
          : mime.startsWith('audio/') ? 'AUDIO'
            : 'DOCUMENT';

    // Optimistic message
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

      const uploaded = uploadRes.data?.data; // sendSuccess => {success,data,...}
      const mediaUrl = uploaded?.url;
      const mediaType = uploaded?.mediaType;

      if (!mediaUrl || !mediaType) throw new Error('Upload failed');

      toast.loading('Sending...');
      const sendRes = await api.post(`/inbox/conversations/${selectedConversation.id}/messages/media`, {
        mediaType,
        mediaUrl,
        caption: (mediaType === 'image' || mediaType === 'video' || mediaType === 'document') ? (messageText.trim() || undefined) : undefined,
      });
      toast.dismiss();

      const result = sendRes.data?.data;
      const dbMessage = result?.message || result; // depends on whatsappService response

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

      // Update conversation preview
      const preview =
        mediaType === 'image' ? '📷 Image'
          : mediaType === 'video' ? '🎥 Video'
            : mediaType === 'audio' ? '🎵 Audio'
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
    setShowAttachMenu(false);
    await handleUploadAndSendMedia(file);
  };

  // =========================
  // ✅ PIN persist
  // =========================
  const handlePinConversation = async (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newPinned = !Boolean(conv.isPinned);

      // optimistic
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

  // =========================
  // ✅ ARCHIVE persist
  // =========================
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

  // =========================
  // ✅ LABELS persist
  // =========================
  const handleAddLabel = async (conv: Conversation, label: string) => {
    try {
      await api.post(`/inbox/conversations/${conv.id}/labels`, { labels: [label] });
      toast.success(`Added label: ${label}`);
      setShowLabelPicker(null);

      // optimistic UI
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
        setSelectedConversation({ ...selectedConversation, labels: (selectedConversation.labels || []).filter((l) => l !== label) });
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
  useInboxSocket(
    selectedConversation?.id || null,
    (newMessage: any) => {
      const msg = newMessage?.message || newMessage;
      if (!msg?.conversationId) return;

      if (selectedConversation?.id === msg.conversationId) {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
        scrollToBottom();
      }

      // Update conversation list preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversationId
            ? {
              ...c,
              lastMessagePreview: msg.content?.substring(0, 50) || '[Media]',
              lastMessageAt: msg.createdAt || new Date().toISOString(),
              unreadCount: selectedConversation?.id === msg.conversationId ? 0 : (c.unreadCount || 0) + 1,
            }
            : c
        )
      );
    },
    () => { },
    (statusUpdate: any) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === statusUpdate.messageId || m.waMessageId === statusUpdate.waMessageId
            ? { ...m, status: statusUpdate.status }
            : m
        )
      );
    }
  );

  // =========================
  // EFFECTS
  // =========================
  useEffect(() => { fetchConversations(); }, [filter]);

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
  // RENDER STATES
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

  // =========================
  // MAIN UI (same as yours, just connected)
  // =========================
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-100 dark:bg-gray-900">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        onChange={handleFileSelect}
      />

      {/* LEFT SIDEBAR */}
      <div className="w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Inbox</h2>
            <button
              onClick={() => { setRefreshing(true); fetchConversations(); }}
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
            {(['all', 'unread', 'archived'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all capitalize ${filter === f ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm' : 'text-gray-600 dark:text-gray-400'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div key={conv.id} className="relative">
              <div
                onClick={() => selectConversation(conv)}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedConversation?.id === conv.id ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500' : ''
                  }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {conv.contact.avatar ? <img src={conv.contact.avatar} className="w-full h-full rounded-full object-cover" /> : getContactInitial(conv.contact)}
                  </div>

                  {conv.isPinned && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Pin className="w-3 h-3 text-yellow-900" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <h3 className="font-semibold truncate text-gray-900 dark:text-white">{getContactName(conv.contact)}</h3>
                    <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false })}</span>
                  </div>

                  <p className="text-sm truncate text-gray-500 dark:text-gray-400">{conv.lastMessagePreview || 'No messages yet'}</p>

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
                  onClick={(e) => { e.stopPropagation(); setShowConversationMenu(showConversationMenu === conv.id ? null : conv.id); }}
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
                      onClick={(e) => { e.stopPropagation(); setShowLabelPicker(conv.id); setShowConversationMenu(null); }}
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
                      <img src={selectedConversation.contact.avatar} className="w-full h-full rounded-full object-cover" />
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
                  className={`p-2 rounded-lg ${showContactInfo ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600'}`}
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#efe7dd]">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
              ) : (
                <>
                  {messages.map((m, idx) => {
                    const outbound = m.direction === 'OUTBOUND';
                    const showDate =
                      idx === 0 ||
                      new Date(m.createdAt).toDateString() !== new Date(messages[idx - 1].createdAt).toDateString();

                    return (
                      <React.Fragment key={m.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="px-4 py-1 bg-white text-gray-500 text-xs rounded-full shadow-sm">
                              {format(new Date(m.createdAt), 'MMMM d, yyyy')}
                            </span>
                          </div>
                        )}

                        <div className={`flex ${outbound ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] lg:max-w-md rounded-2xl shadow-sm ${outbound ? 'bg-green-500 text-white rounded-br-md' : 'bg-white text-gray-900 rounded-bl-md'
                            }`}>
                            <div className="px-4 py-2">
                              {m.type === 'IMAGE' && m.mediaUrl && (
                                <img src={m.mediaUrl} className="max-w-full rounded-lg mb-2" />
                              )}
                              <p className="break-words text-sm whitespace-pre-wrap">{parseMessageContent(m)}</p>
                            </div>

                            <div className={`flex items-center justify-end gap-1 px-3 pb-2 ${outbound ? 'text-green-100' : 'text-gray-400'}`}>
                              <span className="text-[11px]">{format(new Date(m.createdAt), 'HH:mm')}</span>
                              {outbound && (
                                <>
                                  {m.status === 'READ' && <CheckCheck className="w-4 h-4 text-blue-300" />}
                                  {m.status === 'DELIVERED' && <CheckCheck className="w-4 h-4" />}
                                  {m.status === 'SENT' && <Check className="w-4 h-4" />}
                                  {m.status === 'PENDING' && <Clock className="w-4 h-4" />}
                                  {m.status === 'FAILED' && <AlertCircle className="w-4 h-4 text-red-300" />}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {showQuickReplies && (
              <div className="bg-white border-t border-gray-200 p-3">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Quick Replies</span>
                  <button onClick={() => setShowQuickReplies(false)}><X className="w-4 h-4 text-gray-500" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_REPLIES.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => { setMessageText(r.text); setShowQuickReplies(false); }}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200"
                    >
                      {r.shortcut}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border-t border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setShowQuickReplies(!showQuickReplies)} className="p-2 rounded-full hover:bg-gray-100" title="Quick Replies">
                  <Star className="w-5 h-5 text-gray-500" />
                </button>

                {/* emoji */}
                <div className="relative">
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 rounded-full hover:bg-gray-100">
                    <Smile className="w-5 h-5 text-gray-500" />
                  </button>
                  {showEmojiPicker && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowEmojiPicker(false)} />
                      <div className="absolute bottom-full left-0 mb-2 p-3 bg-white rounded-xl shadow-lg border z-20">
                        <div className="grid grid-cols-10 gap-1">
                          {EMOJIS.map((emoji, i) => (
                            <button key={i} onClick={() => { setMessageText((p) => p + emoji); setShowEmojiPicker(false); }} className="w-8 h-8 text-xl hover:bg-gray-100 rounded">
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* attach */}
                <div className="relative">
                  <button onClick={() => setShowAttachMenu(!showAttachMenu)} className="p-2 rounded-full hover:bg-gray-100">
                    <Paperclip className="w-5 h-5 text-gray-500" />
                  </button>
                  {showAttachMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowAttachMenu(false)} />
                      <div className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-xl shadow-lg border z-20">
                        <button
                          onClick={() => { fileInputRef.current?.click(); setShowAttachMenu(false); }}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg"
                        >
                          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                            <Image className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-sm font-medium">Photo/Video/Doc</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex-1">
                  <input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                {messageText.trim() ? (
                  <button onClick={handleSendMessage} disabled={sending} className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50">
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                ) : (
                  <button className="p-3 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200">
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </div>
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
                <img src={selectedConversation.contact.avatar} className="w-full h-full rounded-full object-cover" />
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

          <div className="p-4 border-t space-y-2">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <Archive className="w-4 h-4" /> Archive Conversation
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 className="w-4 h-4" /> Delete Conversation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;