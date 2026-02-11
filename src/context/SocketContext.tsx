// src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

interface Socket {
  connected: boolean;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
  disconnect: () => void;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  emitTyping: (conversationId: string, isTyping: boolean) => void;
}

const defaultContext: SocketContextType = {
  socket: null,
  isConnected: false,
  joinConversation: () => {},
  leaveConversation: () => {},
  emitTyping: () => {},
};

const SocketContext = createContext<SocketContextType>(defaultContext);

export function useSocket(): SocketContextType {
  const context = useContext(SocketContext);
  return context || defaultContext;
}

// ✅ FIX: Use VITE_API_URL, not VITE_SOCKET_URL
const getSocketUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  if (apiUrl) {
    // Remove /api/v1 suffix if present
    return apiUrl.replace(/\/api.*$/, '');
  }
  
  // Production default
  if (import.meta.env.PROD) {
    return 'https://wabmeta-api.onrender.com';
  }
  
  // Development default
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

console.log('🔌 Socket URL:', SOCKET_URL);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    let socketInstance: any = null;

    const initSocket = async () => {
      try {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        
        if (!token) {
          console.log('[Socket] No token, skipping connection');
          setIsConnected(false);
          return;
        }

        const { io } = await import('socket.io-client');
        
        socketInstance = io(SOCKET_URL, {
          auth: { token },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        });

        socketInstance.on('connect', () => {
          console.log('[Socket] ✅ Connected:', socketInstance.id);
          setIsConnected(true);
        });

        socketInstance.on('disconnect', (reason: string) => {
          console.log('[Socket] ⚠️ Disconnected:', reason);
          setIsConnected(false);
        });

        socketInstance.on('connect_error', (err: any) => {
          console.warn('[Socket] ❌ Error:', err.message);
          setIsConnected(false);
        });

        setSocket(socketInstance);
      } catch (error) {
        console.error('[Socket] Init failed:', error);
        setIsConnected(false);
      }
    };

    initSocket();

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
      setSocket(null);
      setIsConnected(false);
    };
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    socket?.emit('join:conversation', conversationId);
  }, [socket]);

  const leaveConversation = useCallback((conversationId: string) => {
    socket?.emit('leave:conversation', conversationId);
  }, [socket]);

  const emitTyping = useCallback((conversationId: string, isTyping: boolean) => {
    socket?.emit(isTyping ? 'typing:start' : 'typing:stop', { conversationId });
  }, [socket]);

  const value: SocketContextType = {
    socket,
    isConnected,
    joinConversation,
    leaveConversation,
    emitTyping,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;