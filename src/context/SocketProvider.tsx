// src/context/SocketProvider.tsx - FINAL WORKING VERSION

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketContext } from './SocketContext';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const connectionAttempted = useRef(false);

    useEffect(() => {
        // Prevent double connection in React Strict Mode
        if (connectionAttempted.current) return;
        connectionAttempted.current = true;

        const token =
            localStorage.getItem('accessToken') ||
            localStorage.getItem('token') ||
            localStorage.getItem('wabmeta_token');

        if (!token) {
            console.log('⚠️ No auth token, skipping socket connection');
            return;
        }

        // Get organization ID
        let organizationId: string | null = null;
        try {
            const orgData = localStorage.getItem('wabmeta_org');
            if (orgData) {
                organizationId = JSON.parse(orgData)?.id || null;
            }
            if (!organizationId) {
                organizationId = localStorage.getItem('currentOrganizationId');
            }
        } catch (e) {
            console.warn('Could not parse org data');
            organizationId = localStorage.getItem('currentOrganizationId');
        }

        // Resolve Socket URL from environment or predefined defaults
        let socketBase = import.meta.env.PROD
            ? 'https://wabmeta-api.onrender.com'
            : 'http://localhost:10000';
            
        if (import.meta.env.VITE_API_URL) {
            // Strip any trailing /api or /v1
            socketBase = import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '')
                                                     .replace(/\/api\/?$/, '')
                                                     .replace(/\/v1\/?$/, '')
                                                     .replace(/\/$/, '');
        }

        const SOCKET_URL = socketBase;

        console.log('🔌 Connecting to socket:', SOCKET_URL, 'Org:', organizationId);

        // ✅ FIXED: Simple connection without namespace issues
        const newSocket = io(SOCKET_URL, {
            // ✅ Auth
            auth: {
                token,
                organizationId,
            },
            // ✅ Transport settings
            transports: ['polling', 'websocket'], // Polling first for reliability
            // ✅ Path - default socket.io path
            path: '/socket.io/',
            // ✅ Reconnection
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            // ✅ Timeout
            timeout: 20000,
            // ✅ Force new connection
            forceNew: true,
            // ✅ Auto connect
            autoConnect: true,
        });

        socketRef.current = newSocket;

        newSocket.on('connect', () => {
            console.log('✅ Socket connected:', newSocket.id);
            setIsConnected(true);

            // Join org room after connection
            if (organizationId) {
                newSocket.emit('org:join', organizationId);
                console.log(`📂 Joined org: ${organizationId}`);
            }
        });

        newSocket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Socket error:', error.message);
            setIsConnected(false);
        });

        newSocket.on('reconnect', (attempt) => {
            console.log(`🔄 Reconnected after ${attempt} attempts`);
        });

        setSocket(newSocket);

        return () => {
            console.log('🔌 Cleaning up socket');
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    const joinConversation = useCallback((conversationId: string) => {
        if (socketRef.current?.connected && conversationId) {
            socketRef.current.emit('join:conversation', conversationId);
        }
    }, []);

    const leaveConversation = useCallback((conversationId: string) => {
        if (socketRef.current?.connected && conversationId) {
            socketRef.current.emit('leave:conversation', conversationId);
        }
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected, joinConversation, leaveConversation }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;