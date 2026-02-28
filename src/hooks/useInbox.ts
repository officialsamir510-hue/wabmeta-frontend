// src/hooks/useInbox.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';

interface Message {
  id: string;
  wamId?: string;
  direction: 'INBOUND' | 'OUTBOUND';
  type: string;
  content: any;
  status: string;
  createdAt: string;
  timestamp?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
}

interface Conversation {
  id: string;
  contact: {
    id: string;
    phone: string;
    name?: string;
    profileName?: string;
    profilePicture?: string;
  };
  lastMessageAt?: string;
  lastMessageText?: string;
  unreadCount: number;
  status: string;
  isWindowOpen: boolean;
  windowExpiresAt?: string;
}

interface UseInboxReturn {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  loadConversations: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  sendTemplate: (templateName: string, language: string, variables?: any) => Promise<void>;
  markAsRead: () => Promise<void>;
}

export function useInbox(organizationId: string, accountId: string): UseInboxReturn {
  const { socket, isConnected, joinConversation, leaveConversation } = useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeConversationRef = useRef<string | null>(null);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!organizationId || !accountId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(
        `/inbox/organizations/${organizationId}/accounts/${accountId}/conversations`
      );
      setConversations(response.data.data.conversations);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, accountId]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const response = await api.get(`/inbox/conversations/${conversationId}/messages`);
      setMessages(response.data.data.messages);
    } catch (err: any) {
      console.error('Failed to load messages:', err);
    }
  }, []);

  // Select conversation
  const selectConversation = useCallback(
    async (conversationId: string) => {
      // Leave previous conversation room
      if (activeConversationRef.current) {
        leaveConversation(activeConversationRef.current);
      }

      // Find conversation
      const conversation = conversations.find((c) => c.id === conversationId);
      if (!conversation) return;

      setActiveConversation(conversation);
      activeConversationRef.current = conversationId;

      // Join new conversation room
      joinConversation(conversationId);

      // Load messages
      await loadMessages(conversationId);

      // Mark as read if there are unread messages
      if (conversation.unreadCount > 0) {
        await markAsRead();
      }
    },
    [conversations, joinConversation, leaveConversation, loadMessages]
  );

  // Send text message
  const sendMessage = useCallback(
    async (text: string) => {
      if (!activeConversation || !accountId) return;

      setIsSending(true);
      try {
        const response = await api.post('/whatsapp/send/text', {
          accountId,
          to: activeConversation.contact.phone,
          text,
          conversationId: activeConversation.id,
        });

        // Add message to list
        if (response.data.data.message) {
          setMessages((prev) => [...prev, response.data.data.message]);
        }

        // Update conversation
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id
              ? {
                ...c,
                lastMessageAt: new Date().toISOString(),
                lastMessageText: text.substring(0, 100),
              }
              : c
          )
        );
      } catch (err: any) {
        throw new Error(err.response?.data?.message || 'Failed to send message');
      } finally {
        setIsSending(false);
      }
    },
    [activeConversation, accountId]
  );

  // Send template message
  const sendTemplate = useCallback(
    async (templateName: string, language: string, variables?: any) => {
      if (!activeConversation || !accountId) return;

      setIsSending(true);
      try {
        const response = await api.post('/whatsapp/send/template', {
          accountId,
          to: activeConversation.contact.phone,
          templateName,
          templateLanguage: language,
          components: variables,
          conversationId: activeConversation.id,
        });

        if (response.data.data.message) {
          setMessages((prev) => [...prev, response.data.data.message]);
        }
      } catch (err: any) {
        throw new Error(err.response?.data?.message || 'Failed to send template');
      } finally {
        setIsSending(false);
      }
    },
    [activeConversation, accountId]
  );

  // Mark conversation as read
  const markAsRead = useCallback(async () => {
    if (!activeConversation) return;

    try {
      await api.post(`/inbox/conversations/${activeConversation.id}/read`);

      // Update local state
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConversation.id ? { ...c, unreadCount: 0 } : c))
      );
      setActiveConversation((prev) => (prev ? { ...prev, unreadCount: 0 } : null));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, [activeConversation]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !isConnected) return;

    // New message handler
    const handleNewMessage = (data: { conversationId: string; message: Message }) => {
      // Update messages if it's the active conversation
      if (data.conversationId === activeConversationRef.current) {
        setMessages((prev) => {
          // Check for duplicate
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }

      // Update conversations list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === data.conversationId
            ? {
              ...c,
              lastMessageAt: data.message.createdAt,
              lastMessageText:
                data.message.content?.text?.substring(0, 100) || 'New message',
              unreadCount:
                c.id === activeConversationRef.current ? 0 : c.unreadCount + 1,
            }
            : c
        )
      );
    };

    // Message status handler
    const handleMessageStatus = (data: { messageId: string; wamId: string; status: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId || m.wamId === data.wamId
            ? { ...m, status: data.status.toUpperCase() }
            : m
        )
      );
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:status', handleMessageStatus);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:status', handleMessageStatus);
    };
  }, [socket, isConnected]);

  // Initial load
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isSending,
    error,
    loadConversations,
    selectConversation,
    sendMessage,
    sendTemplate,
    markAsRead,
  };
}

export default useInbox;