// src/context/SocketContext.tsx

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// ============================================
// TYPES
// ============================================

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
}

// ============================================
// SOCKET EVENTS
// ============================================

export const SocketEvents = {
  // Messages
  NEW_MESSAGE: 'new_message',
  MESSAGE_SENT: 'message_sent',
  MESSAGE_STATUS_UPDATE: 'message_status_update',
  MESSAGE_FAILED: 'message_failed',

  // Conversations
  CONVERSATION_UPDATED: 'conversation_updated',
  CONVERSATION_NEW: 'new_conversation',
  CONVERSATION_ARCHIVED: 'conversation_archived',

  // Typing
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  USER_TYPING: 'user_typing',

  // Presence
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',

  // Rooms
  JOIN_CONVERSATION: 'join_conversation',
  LEAVE_CONVERSATION: 'leave_conversation',

  // Notifications
  NOTIFICATION: 'notification',
} as const;

// ============================================
// CONTEXT
// ============================================

const SocketContext = createContext<SocketContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Get socket URL
  const getSocketUrl = (): string => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    
    if (apiUrl) {
      // Remove /api/v1 from the URL
      return apiUrl.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');
    }

    if (import.meta.env.PROD) {
      return 'https://wabmeta-api.onrender.com';
    }

    return 'http://localhost:5001';
  };

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('accessToken') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('wabmeta_token');

    if (!token) {
      console.log('🔌 No token found, skipping socket connection');
      return;
    }

    const socketUrl = getSocketUrl();
    console.log('🔌 Connecting to socket:', socketUrl);

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    // Connection handlers
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttempts.current = 0;
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);

      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      setConnectionError(error.message);
      reconnectAttempts.current += 1;

      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
        setConnectionError('Unable to connect to real-time server');
      }
    });

    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      console.log('🔌 Cleaning up socket connection');
      newSocket.disconnect();
    };
  }, []);

  // Reconnect when token changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' || e.key === 'token') {
        if (e.newValue && socket) {
          // Token changed, reconnect
          socket.auth = { token: e.newValue };
          socket.disconnect().connect();
        } else if (!e.newValue && socket) {
          // Token removed, disconnect
          socket.disconnect();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [socket]);

  // Emit event
  const emit = useCallback((event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  }, [socket, isConnected]);

  // Subscribe to event
  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  }, [socket]);

  // Unsubscribe from event
  const off = useCallback((event: string, callback?: (data: any) => void) => {
    if (socket) {
      if (callback) {
        socket.off(event, callback);
      } else {
        socket.off(event);
      }
    }
  }, [socket]);

  // Join conversation room
  const joinConversation = useCallback((conversationId: string) => {
    emit(SocketEvents.JOIN_CONVERSATION, conversationId);
  }, [emit]);

  // Leave conversation room
  const leaveConversation = useCallback((conversationId: string) => {
    emit(SocketEvents.LEAVE_CONVERSATION, conversationId);
  }, [emit]);

  // Typing indicators
  const startTyping = useCallback((conversationId: string) => {
    emit(SocketEvents.TYPING_START, { conversationId });
  }, [emit]);

  const stopTyping = useCallback((conversationId: string) => {
    emit(SocketEvents.TYPING_STOP, { conversationId });
  }, [emit]);

  const value: SocketContextType = {
    socket,
    isConnected,
    connectionError,
    emit,
    on,
    off,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// ============================================
// HOOK
// ============================================

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  return context;
};

export default SocketContext;