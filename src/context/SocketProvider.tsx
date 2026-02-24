// src/context/SocketProvider.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketContext } from './SocketContext';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://wabmeta-api.onrender.com';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const orgData = localStorage.getItem('wabmeta_org');
        const organizationId = orgData ? JSON.parse(orgData)?.id : null;

        if (!token) {
            console.log('⚠️ No token, skipping socket connection');
            return;
        }

        console.log('🔌 Connecting to socket...', SOCKET_URL);

        const newSocket = io(SOCKET_URL, {
            auth: {
                token,
                organizationId,
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            console.log('✅ Socket connected:', newSocket.id);
            setIsConnected(true);

            if (organizationId) {
                newSocket.emit('org:join', organizationId);
                console.log(`📂 Joined org room: ${organizationId}`);
            }
        });

        newSocket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error.message);
            setIsConnected(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const joinConversation = useCallback((conversationId: string) => {
        if (socket && isConnected) {
            socket.emit('join:conversation', conversationId);
        }
    }, [socket, isConnected]);

    const leaveConversation = useCallback((conversationId: string) => {
        if (socket && isConnected) {
            socket.emit('leave:conversation', conversationId);
        }
    }, [socket, isConnected]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, joinConversation, leaveConversation }}>
            {children}
        </SocketContext.Provider>
    );
};