// src/context/SocketProvider.tsx - COMPLETE FINAL

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SocketContext } from './SocketContext';

const TOKEN_KEYS = {
    ACCESS: 'accessToken',
    LEGACY_TOKEN: 'token',
    LEGACY_WABMETA: 'wabmeta_token',
    ORG: 'wabmeta_org',
    ORG_ID: 'currentOrganizationId',
} as const;

const isValidJWT = (token: string): boolean => token?.split('.').length === 3;

const getAccessToken = (): string | null => {
    let t =
        localStorage.getItem(TOKEN_KEYS.ACCESS) ||
        localStorage.getItem(TOKEN_KEYS.LEGACY_TOKEN) ||
        localStorage.getItem(TOKEN_KEYS.LEGACY_WABMETA);

    return t && isValidJWT(t) ? t : null;
};

const getOrgId = (): string | null => {
    try {
        const orgRaw = localStorage.getItem(TOKEN_KEYS.ORG);
        if (orgRaw) {
            const org = JSON.parse(orgRaw);
            if (org?.id) return org.id;
        }
    } catch { }
    return localStorage.getItem(TOKEN_KEYS.ORG_ID);
};

const getSocketUrl = (): string => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://wabmeta-api.onrender.com/api';
    return String(apiUrl).replace(/\/api.*$/i, '').replace(/\/+$/, '');
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const SOCKET_URL = useMemo(() => getSocketUrl(), []);

    useEffect(() => {
        if (!isAuthenticated) {
            if (socket) socket.disconnect();
            setSocket(null);
            setIsConnected(false);
            return;
        }

        const token = getAccessToken();
        const organizationId = getOrgId();

        if (!token) {
            console.warn('⚠️ [SOCKET] No valid token. Socket will not connect.');
            return;
        }

        console.log('🔌 [SOCKET] Connecting to:', SOCKET_URL);

        const s = io(SOCKET_URL, {
            path: '/socket.io',
            transports: ['polling', 'websocket'], // ✅ polling first reduces early ws error
            auth: { token, organizationId },      // ✅ important
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            timeout: 10000,
        });

        s.on('connect', () => {
            console.log('✅ Socket connected:', s.id);
            setIsConnected(true);

            // ✅ Explicitly join org room
            if (organizationId) {
                s.emit('org:join', organizationId);
                console.log(`📂 Joined org room: ${organizationId}`);
            }
        });

        s.on('disconnect', (reason) => {
            console.log('🔌 [SOCKET] Disconnected:', reason);
            setIsConnected(false);
        });

        s.on('connect_error', (err: any) => {
            console.error('❌ [SOCKET] connect_error:', err?.message || err);
            setIsConnected(false);
        });

        setSocket(s);

        return () => {
            s.disconnect();
            setSocket(null);
            setIsConnected(false);
        };
    }, [SOCKET_URL, isAuthenticated]);

    const joinConversation = useCallback(
        (conversationId: string) => {
            if (!socket) return;
            socket.emit('join:conversation', conversationId);
        },
        [socket]
    );

    const leaveConversation = useCallback(
        (conversationId: string) => {
            if (!socket) return;
            socket.emit('leave:conversation', conversationId);
        },
        [socket]
    );

    const emitTyping = useCallback(
        (conversationId: string, isTyping: boolean) => {
            if (!socket) return;
            socket.emit(isTyping ? 'typing:start' : 'typing:stop', { conversationId });
        },
        [socket]
    );

    return (
        <SocketContext.Provider value={{ socket, isConnected, joinConversation, leaveConversation, emitTyping }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;