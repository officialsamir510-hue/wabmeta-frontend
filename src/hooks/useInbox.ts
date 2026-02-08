// src/hooks/useInbox.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { inbox } from '../services/api';
import { useSocket } from '../context/SocketContext';
import type { Conversation, Message } from '../types/chat';

interface BackendConversation {
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
  status?: string;
  assignedTo: string | null;
  assignedUser?: {
    id: string;
    firstName: string;
    lastName: string | null;
    avatar: string | null;
  };
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

interface BackendMessage {
  id: string;
  wamId?: string | null;
  waMessageId?: string | null;
  conversationId?: string;
  direction: 'INBOUND' | 'OUTBOUND';
  type: string;
  content: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  mediaMimeType: string | null;
  templateName: string | null;
  status: string;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  replyToMessageId: string | null;
  replyToMessage: BackendMessage | null;
  createdAt: string;
}

interface UseInboxReturn {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  messagesLoading: boolean;
  sendingMessage: boolean;
  error: string | null;
  hasWhatsAppConnected: boolean;
  isSocketConnected: boolean;
  typingUsers: Map<string, { name: string; timestamp: number }>;
  stats: {
    totalConversations: number;
    unreadConversations: number;
    assignedToMe: number;
  } | null;
  selectConversation: (conversationId: string) => void;
  sendMessage: (content: string, type?: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  archiveConversation: (conversationId: string) => Promise<void>;
  assignConversation: (conversationId: string, userId: string | null) => Promise<void>;
  startTyping: () => void;
  stopTyping: () => void;
}

export const useInbox = (): UseInboxReturn => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasWhatsAppConnected, setHasWhatsAppConnected] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, { name: string; timestamp: number }>>(new Map());

  // 🔌 Socket integration
  const { 
    isConnected: isSocketConnected,
    onMessage,
    onMessageStatus,
    onConversationUpdate,
    onTyping,
    joinConversation,
    leaveConversation,
    sendTypingIndicator,
  } = useSocket();

  const selectedConversationRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep ref in sync with selected conversation
  useEffect(() => {
    selectedConversationRef.current = selectedConversation?.id || null;
  }, [selectedConversation]);

  // Convert backend conversation to frontend format
  const convertConversation = useCallback((backendConv: BackendConversation): Conversation => {
    let messageStatus: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' = 'sent';
    
    return {
      id: backendConv.id,
      contact: {
        id: backendConv.contact.id,
        name: backendConv.contact.fullName,
        phone: backendConv.contact.fullPhone,
        email: backendConv.contact.email || undefined,
        avatar: backendConv.contact.avatar || undefined,
        tags: backendConv.contact.tags || [],
        lastSeen: backendConv.lastMessageAt || undefined,
      },
      lastMessage: {
        id: backendConv.id + '_last',
        conversationId: backendConv.id,
        type: 'text',
        content: backendConv.lastMessagePreview || '',
        isOutgoing: false,
        status: messageStatus,
        timestamp: backendConv.lastMessageAt 
          ? new Date(backendConv.lastMessageAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          : '',
      },
      unreadCount: backendConv.unreadCount,
      status: (backendConv.status as any) || (backendConv.isArchived ? 'resolved' : 'open'),
      assignedTo: backendConv.assignedTo || undefined,
      labels: backendConv.labels || [],
      isPinned: false,
      isMuted: false,
      updatedAt: new Date(backendConv.updatedAt).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    };
  }, []);

  // Convert backend message to frontend format
  const convertMessage = useCallback((backendMsg: BackendMessage, conversationId?: string): Message => {
    let status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' = 'sent';
    
    if (backendMsg.status === 'PENDING') status = 'sending';
    else if (backendMsg.status === 'SENT') status = 'sent';
    else if (backendMsg.status === 'DELIVERED') status = 'delivered';
    else if (backendMsg.status === 'READ') status = 'read';
    else if (backendMsg.status === 'FAILED') status = 'failed';

    const type = backendMsg.type?.toLowerCase() as any || 'text';

    return {
      id: backendMsg.id,
      conversationId: backendMsg.conversationId || conversationId || '',
      type,
      content: backendMsg.content || '',
      mediaUrl: backendMsg.mediaUrl || undefined,
      mediaName: backendMsg.templateName || undefined,
      isOutgoing: backendMsg.direction === 'OUTBOUND',
      status,
      timestamp: backendMsg.createdAt 
        ? new Date(backendMsg.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        : '',
      replyTo: backendMsg.replyToMessage ? convertMessage(backendMsg.replyToMessage, conversationId) : undefined,
    };
  }, []);

  // ========================================
  // 🔌 SOCKET EVENT HANDLERS
  // ========================================

  // Setup socket listeners
  useEffect(() => {
    if (!isSocketConnected) return;

    console.log('🔌 Setting up inbox socket listeners');

    // Listen for new messages
    const unsubscribeMessage = onMessage((data) => {
      console.log('📥 New message via socket:', data);
      
      const { message, conversation } = data;
      const convertedMessage = convertMessage(message, conversation.id);
      const convertedConversation = convertConversation(conversation);

      // Update messages if this is the selected conversation
      if (selectedConversationRef.current === conversation.id) {
        setMessages(prev => {
          // Check if message already exists
          if (prev.some(m => m.id === convertedMessage.id)) {
            return prev;
          }
          return [...prev, convertedMessage];
        });
      }

      // Update conversations list
      setConversations(prev => {
        const existingIndex = prev.findIndex(c => c.id === conversation.id);
        
        if (existingIndex >= 0) {
          // Update existing conversation
          const updated = [...prev];
          updated[existingIndex] = {
            ...convertedConversation,
            unreadCount: selectedConversationRef.current === conversation.id 
              ? 0 
              : convertedConversation.unreadCount,
          };
          
          // Move to top if new message
          if (message.direction === 'INBOUND') {
            const [movedConv] = updated.splice(existingIndex, 1);
            return [movedConv, ...updated];
          }
          
          return updated;
        } else {
          // New conversation
          return [convertedConversation, ...prev];
        }
      });

      // Play notification sound for incoming messages
      if (message.direction === 'INBOUND' && selectedConversationRef.current !== conversation.id) {
        try {
          // Optional: Add notification sound
          // new Audio('/notification.mp3').play();
        } catch (error) {
          console.log('Could not play notification sound');
        }
      }
    });

    // Listen for message status updates
    const unsubscribeStatus = onMessageStatus((data) => {
      console.log('📥 Message status update:', data);
      
      const { messageId, conversationId, status } = data;

      // Update message status if in current conversation
      if (selectedConversationRef.current === conversationId) {
        setMessages(prev => 
          prev.map(m => 
            m.id === messageId 
              ? { ...m, status: status.toLowerCase() as any }
              : m
          )
        );
      }

      // Update last message status in conversations list
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId && c.lastMessage.id === messageId
            ? { ...c, lastMessage: { ...c.lastMessage, status: status.toLowerCase() as any } }
            : c
        )
      );
    });

    // Listen for conversation updates
    const unsubscribeConversation = onConversationUpdate((data) => {
      console.log('📥 Conversation update:', data);
      
      const { conversation } = data;
      const convertedConversation = convertConversation(conversation);

      setConversations(prev => 
        prev.map(c => 
          c.id === convertedConversation.id ? convertedConversation : c
        )
      );

      // Update selected conversation if it's the one that was updated
      if (selectedConversationRef.current === convertedConversation.id) {
        setSelectedConversation(convertedConversation);
      }
    });

    // Listen for typing indicators
    const unsubscribeTyping = onTyping((data) => {
      const { conversationId, user, isTyping } = data;

      if (selectedConversationRef.current !== conversationId) return;

      setTypingUsers(prev => {
        const newMap = new Map(prev);
        
        if (isTyping) {
          newMap.set(user.id, { 
            name: user.firstName || 'User', 
            timestamp: Date.now() 
          });
        } else {
          newMap.delete(user.id);
        }
        
        return newMap;
      });
    });

    // Cleanup
    return () => {
      console.log('🔌 Cleaning up inbox socket listeners');
      unsubscribeMessage();
      unsubscribeStatus();
      unsubscribeConversation();
      unsubscribeTyping();
    };
  }, [isSocketConnected, onMessage, onMessageStatus, onConversationUpdate, onTyping, convertMessage, convertConversation]);

  // Join/leave conversation rooms
  useEffect(() => {
    if (!isSocketConnected || !selectedConversation) return;

    console.log(`🔌 Joining conversation room: ${selectedConversation.id}`);
    joinConversation(selectedConversation.id);

    return () => {
      console.log(`🔌 Leaving conversation room: ${selectedConversation.id}`);
      leaveConversation(selectedConversation.id);
    };
  }, [isSocketConnected, selectedConversation, joinConversation, leaveConversation]);

  // Clean up stale typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers(prev => {
        const now = Date.now();
        const newMap = new Map(prev);
        let changed = false;
        
        for (const [userId, data] of prev.entries()) {
          if (now - data.timestamp > 5000) {
            newMap.delete(userId);
            changed = true;
          }
        }
        
        return changed ? newMap : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ========================================
  // API METHODS
  // ========================================

  // Check WhatsApp connection
  const checkWhatsAppConnection = async () => {
    try {
      const response = await inbox.stats();
      setStats(response.data.data);
      setHasWhatsAppConnected(true);
    } catch (error: any) {
      console.error('Error checking WhatsApp connection:', error);
      setHasWhatsAppConnected(false);
      setError('Failed to connect to WhatsApp. Please connect your account.');
    }
  };

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!hasWhatsAppConnected) return;

    try {
      setLoading(true);
      setError(null);

      const response = await inbox.conversations({
        page: 1,
        limit: 50,
        isArchived: false,
      });

      const convs = response.data.data.conversations.map(convertConversation);
      setConversations(convs);
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      setError(error.response?.data?.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [hasWhatsAppConnected, convertConversation]);

  // Fetch messages for conversation
  const fetchMessages = async (conversationId: string, page: number = 1) => {
    try {
      setMessagesLoading(true);
      setError(null);

      const response = await inbox.getMessages(conversationId, {
        page,
        limit: 50,
      });

      const msgs = response.data.data.messages.map((msg: BackendMessage) => 
        convertMessage(msg, conversationId)
      );
      
      if (page === 1) {
        setMessages(msgs);
      } else {
        setMessages(prev => [...msgs, ...prev]);
      }

      setHasMoreMessages(response.data.data.hasMore);
      setCurrentPage(page);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      setError(error.response?.data?.message || 'Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  // Select conversation
  const selectConversation = useCallback(async (conversationId: string) => {
    const conv = conversations.find(c => c.id === conversationId);
    if (!conv) return;

    setSelectedConversation(conv);
    await fetchMessages(conversationId);

    // Mark as read
    if (conv.unreadCount > 0) {
      try {
        await inbox.markAsRead(conversationId);
        
        setConversations(prev =>
          prev.map(c =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
          )
        );

        setStats(prev => prev ? {
          ...prev,
          unreadConversations: Math.max(0, prev.unreadConversations - 1),
        } : prev);
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  }, [conversations, convertMessage]);

  // Send message
  const sendMessage = async (content: string, type: string = 'text') => {
    if (!selectedConversation || !content.trim()) return;

    setSendingMessage(true);
    stopTyping(); // Stop typing indicator

    // Optimistic update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: selectedConversation.id,
      type: type as any,
      content,
      isOutgoing: true,
      status: 'sending',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await inbox.sendMessage(selectedConversation.id, {
        content,
        type,
      });

      const sentMessage = convertMessage(response.data.data, selectedConversation.id);

      // Replace temp message with real one
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempMessage.id && m.id !== sentMessage.id);
        return [...filtered, sentMessage];
      });

      // Update conversation's last message
      setConversations(prev =>
        prev.map(c =>
          c.id === selectedConversation.id
            ? {
                ...c,
                lastMessage: sentMessage,
                updatedAt: new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              }
            : c
        )
      );
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Mark message as failed
      setMessages(prev =>
        prev.map(m =>
          m.id === tempMessage.id ? { ...m, status: 'failed' } : m
        )
      );

      setError(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  // Other existing methods remain the same...
  const markAsRead = async (conversationId: string) => {
    try {
      await inbox.markAsRead(conversationId);
      
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const loadMoreMessages = async () => {
    if (!selectedConversation || !hasMoreMessages || messagesLoading) return;
    await fetchMessages(selectedConversation.id, currentPage + 1);
  };

  const refreshConversations = async () => {
    await fetchConversations();
  };

  const archiveConversation = async (conversationId: string) => {
    try {
      await inbox.archive(conversationId);
      
      setConversations(prev =>
        prev.filter(c => c.id !== conversationId)
      );

      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (error: any) {
      console.error('Error archiving conversation:', error);
      setError(error.response?.data?.message || 'Failed to archive conversation');
    }
  };

  const assignConversation = async (conversationId: string, userId: string | null) => {
    try {
      await inbox.assign(conversationId, userId || '');
      
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId ? { ...c, assignedTo: userId || undefined } : c
        )
      );

      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(prev =>
          prev ? { ...prev, assignedTo: userId || undefined } : null
        );
      }
    } catch (error: any) {
      console.error('Error assigning conversation:', error);
      setError(error.response?.data?.message || 'Failed to assign conversation');
    }
  };

  // Typing indicators
  const startTyping = useCallback(() => {
    if (selectedConversation && isSocketConnected) {
      sendTypingIndicator(selectedConversation.id, true);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Auto stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 3000);
    }
  }, [selectedConversation, isSocketConnected, sendTypingIndicator]);

  const stopTyping = useCallback(() => {
    if (selectedConversation && isSocketConnected) {
      sendTypingIndicator(selectedConversation.id, false);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  }, [selectedConversation, isSocketConnected, sendTypingIndicator]);

  // Initial load
  useEffect(() => {
    checkWhatsAppConnection();
  }, []);

  useEffect(() => {
    if (hasWhatsAppConnected) {
      fetchConversations();
    }
  }, [hasWhatsAppConnected, fetchConversations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    conversations,
    selectedConversation,
    messages,
    loading,
    messagesLoading,
    sendingMessage,
    error,
    hasWhatsAppConnected,
    isSocketConnected,
    typingUsers,
    stats,
    selectConversation,
    sendMessage,
    markAsRead,
    loadMoreMessages,
    refreshConversations,
    archiveConversation,
    assignConversation,
    startTyping,
    stopTyping,
  };
};