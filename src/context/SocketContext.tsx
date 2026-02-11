// src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

// Socket type (we'll make it optional)
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

// ✅ ALWAYS provide default values
const defaultContext: SocketContextType = {
  socket: null,
  isConnected: false,
  joinConversation: () => {},
  leaveConversation: () => {},
  emitTyping: () => {},
};

// ✅ Create context with default values (NOT undefined)
const SocketContext = createContext<SocketContextType>(defaultContext);

// ✅ Safe hook that ALWAYS returns valid object
export function useSocket(): SocketContextType {
  const context = useContext(SocketContext);
  // Always return a valid object, never undefined
  return context || defaultContext;
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    let socketInstance: any = null;

    const initSocket = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setIsConnected(false);
          return;
        }

        // Dynamic import to prevent build issues
        const { io } = await import('socket.io-client');
        
        socketInstance = io(SOCKET_URL, {
          auth: { token },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socketInstance.on('connect', () => {
          console.log('[Socket] Connected');
          setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
          console.log('[Socket] Disconnected');
          setIsConnected(false);
        });

        socketInstance.on('connect_error', (err: any) => {
          console.error('[Socket] Error:', err.message);
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

  // ✅ Always provide valid value object
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