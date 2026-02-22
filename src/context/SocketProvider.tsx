// src/context/SocketProvider.tsx - COMPLETE FIXED VERSION

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    joinConversation: (conversationId: string) => void;
    leaveConversation: (conversationId: string) => void;
    emitTyping: (conversationId: string, isTyping: boolean) => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    joinConversation: () => { },
    leaveConversation: () => { },
    emitTyping: () => { },
});

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

interface SocketProviderProps {
    children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    useEffect(() => {
        if (!isAuthenticated) {
            if (socket) {
                console.log('🔌 [SOCKET] Disconnecting (user logged out)');
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.warn('⚠️ [SOCKET] No access token found');
            return;
        }

        // Get socket URL from environment
        const apiUrl = import.meta.env.VITE_API_URL || 'https://wabmeta-api.onrender.com/api';
        const SOCKET_URL = apiUrl.replace(/\/api.*$/, ''); // Remove /api suffix

        console.log('🔌 [SOCKET] Connecting to:', SOCKET_URL);

        const newSocket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: maxReconnectAttempts,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 10000,
        });

        // Connection handlers
        newSocket.on('connect', () => {
            console.log('✅ [SOCKET] Connected:', newSocket.id);
            setIsConnected(true);
            reconnectAttempts.current = 0;
        });

        newSocket.on('connected', (data) => {
            console.log('📡 [SOCKET] Handshake complete:', data);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('🔌 [SOCKET] Disconnected:', reason);
            setIsConnected(false);

            if (reason === 'io server disconnect') {
                // Server forcefully disconnected - try to reconnect
                setTimeout(() => {
                    newSocket.connect();
                }, 1000);
            }
        });

        newSocket.on('connect_error', (error) => {
            reconnectAttempts.current++;
            console.error(
                `❌ [SOCKET] Connection error (attempt ${reconnectAttempts.current}/${maxReconnectAttempts}):`,
                error.message
            );
            setIsConnected(false);

            if (reconnectAttempts.current >= maxReconnectAttempts) {
                console.error('❌ [SOCKET] Max reconnection attempts reached');
            }
        });

        newSocket.on('error', (error) => {
            console.error('❌ [SOCKET] Error:', error);
        });

        // Keep-alive ping
        const pingInterval = setInterval(() => {
            if (newSocket.connected) {
                newSocket.emit('ping');
            }
        }, 30000);

        setSocket(newSocket);

        // Cleanup
        return () => {
            console.log('🔌 [SOCKET] Cleaning up connection');
            clearInterval(pingInterval);
            newSocket.disconnect();
            setSocket(null);
            setIsConnected(false);
        };
    }, [isAuthenticated, user]);

    // Conversation helpers
    const joinConversation = useCallback(
        (conversationId: string) => {
            if (socket && isConnected) {
                socket.emit('join:conversation', conversationId);
                console.log(`📥 [SOCKET] Joined conversation: ${conversationId}`);
            }
        },
        [socket, isConnected]
    );

    const leaveConversation = useCallback(
        (conversationId: string) => {
            if (socket && isConnected) {
                socket.emit('leave:conversation', conversationId);
                console.log(`📤 [SOCKET] Left conversation: ${conversationId}`);
            }
        },
        [socket, isConnected]
    );

    const emitTyping = useCallback(
        (conversationId: string, isTyping: boolean) => {
            if (socket && isConnected) {
                socket.emit(isTyping ? 'typing:start' : 'typing:stop', { conversationId });
            }
        },
        [socket, isConnected]
    );

    const value: SocketContextType = {
        socket,
        isConnected,
        joinConversation,
        leaveConversation,
        emitTyping,
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export { SocketContext };
export default SocketProvider;