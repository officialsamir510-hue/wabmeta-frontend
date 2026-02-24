// src/context/SocketProvider.tsx - COMPLETE FIXED VERSION

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketContext } from './SocketContext';

// ✅ FIXED: Get correct socket URL
const getSocketUrl = (): string => {
    const apiUrl = import.meta.env.VITE_API_URL || '';

    // Remove /api, /v1, trailing slashes
    let socketUrl = apiUrl
        .replace(/\/api\/?$/i, '')
        .replace(/\/v1\/?$/i, '')
        .replace(/\/+$/, '');

    // If empty or localhost, use default
    if (!socketUrl || socketUrl === 'http://localhost' || socketUrl === 'https://localhost') {
        socketUrl = import.meta.env.DEV
            ? 'http://localhost:5000'
            : 'https://wabmeta-api.onrender.com';
    }

    console.log('🔌 Socket URL configured:', socketUrl);
    return socketUrl;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    useEffect(() => {
        const token = localStorage.getItem('accessToken');

        // Also try legacy token keys
        const accessToken = token ||
            localStorage.getItem('token') ||
            localStorage.getItem('wabmeta_token');

        if (!accessToken) {
            console.log('⚠️ No token found, skipping socket connection');
            return;
        }

        // Get organization ID
        let organizationId: string | null = null;
        try {
            const orgData = localStorage.getItem('wabmeta_org');
            if (orgData) {
                const parsed = JSON.parse(orgData);
                organizationId = parsed?.id || null;
            }
        } catch (e) {
            console.warn('⚠️ Could not parse organization data');
        }

        const SOCKET_URL = getSocketUrl();

        console.log('🔌 Initializing socket connection...', {
            url: SOCKET_URL,
            hasToken: !!accessToken,
            organizationId,
        });

        // ✅ Create socket with correct configuration
        const newSocket = io(SOCKET_URL, {
            auth: {
                token: accessToken,
                organizationId,
            },
            transports: ['websocket', 'polling'], // Try websocket first
            path: '/socket.io', // ✅ Explicit path
            reconnection: true,
            reconnectionAttempts: maxReconnectAttempts,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            forceNew: true, // ✅ Force new connection
        });

        // Connection handlers
        newSocket.on('connect', () => {
            console.log('✅ Socket connected successfully:', newSocket.id);
            setIsConnected(true);
            reconnectAttempts.current = 0;

            // Join organization room
            if (organizationId) {
                newSocket.emit('org:join', organizationId);
                console.log(`📂 Joined org room: org:${organizationId}`);
            }
        });

        newSocket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            reconnectAttempts.current++;
            console.error(`❌ Socket connection error (attempt ${reconnectAttempts.current}):`, error.message);
            setIsConnected(false);

            // Log more details for debugging
            if (reconnectAttempts.current >= maxReconnectAttempts) {
                console.error('🛑 Max reconnection attempts reached. Socket disabled.');
                console.error('Debug info:', {
                    url: SOCKET_URL,
                    error: error.message,
                });
            }
        });

        newSocket.on('reconnect', (attemptNumber) => {
            console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
            setIsConnected(true);
        });

        newSocket.on('reconnect_error', (error) => {
            console.error('❌ Socket reconnection error:', error.message);
        });

        // Pong response
        newSocket.on('pong', (data) => {
            console.log('🏓 Pong received:', data);
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            console.log('🔌 Cleaning up socket connection');
            newSocket.disconnect();
            setSocket(null);
            setIsConnected(false);
        };
    }, []);

    // Join conversation room
    const joinConversation = useCallback((conversationId: string) => {
        if (socket && isConnected && conversationId) {
            socket.emit('join:conversation', conversationId);
            console.log(`💬 Joined conversation: ${conversationId}`);
        }
    }, [socket, isConnected]);

    // Leave conversation room
    const leaveConversation = useCallback((conversationId: string) => {
        if (socket && isConnected && conversationId) {
            socket.emit('leave:conversation', conversationId);
            console.log(`💬 Left conversation: ${conversationId}`);
        }
    }, [socket, isConnected]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, joinConversation, leaveConversation }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;