// src/hooks/useInboxSocket.ts - COMPLETE FIXED

import { useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

interface Message {
    id: string;
    conversationId: string;
    waMessageId?: string;
    wamId?: string;
    content: string;
    direction: string;
    status: string;
    createdAt: string;
    type: string;
}

interface ConversationUpdate {
    id: string;
    lastMessageAt: string;
    lastMessagePreview: string;
    unreadCount: number;
    isWindowOpen?: boolean;
    windowExpiresAt?: string;
}

interface MessageStatus {
    messageId: string;
    waMessageId?: string;
    wamId?: string;
    conversationId: string;
    status: string;
    timestamp: string;
}

export const useInboxSocket = (
    selectedConversationId: string | null,
    onNewMessage?: (message: Message) => void,
    onConversationUpdate?: (update: ConversationUpdate) => void,
    onMessageStatus?: (status: MessageStatus) => void
) => {
    const { socket, isConnected, joinConversation, leaveConversation } = useSocket();
    const previousConversationId = useRef<string | null>(null);
    const listenersAttached = useRef(false);

    // Store callbacks in refs
    const onNewMessageRef = useRef(onNewMessage);
    const onConversationUpdateRef = useRef(onConversationUpdate);
    const onMessageStatusRef = useRef(onMessageStatus);

    useEffect(() => {
        onNewMessageRef.current = onNewMessage;
        onConversationUpdateRef.current = onConversationUpdate;
        onMessageStatusRef.current = onMessageStatus;
    });

    // Join/leave conversation room
    useEffect(() => {
        if (!socket || !isConnected) {
            console.log('⚠️ Socket not ready for conversation join');
            return;
        }

        // Leave previous conversation
        if (previousConversationId.current && previousConversationId.current !== selectedConversationId) {
            leaveConversation(previousConversationId.current);
        }

        // Join new conversation
        if (selectedConversationId) {
            joinConversation(selectedConversationId);
            previousConversationId.current = selectedConversationId;
        }

        return () => {
            if (selectedConversationId) {
                leaveConversation(selectedConversationId);
            }
        };
    }, [socket, isConnected, selectedConversationId, joinConversation, leaveConversation]);

    // Listen for socket events
    useEffect(() => {
        if (!socket) {
            console.log('⚠️ Socket not available');
            return;
        }

        // Avoid duplicate listeners
        if (listenersAttached.current) return;

        const handleNewMessage = (data: any) => {
            console.log('📩 [SOCKET] message:new received:', data);
            const message = data.message || data;
            if (onNewMessageRef.current) {
                onNewMessageRef.current(message);
            }
        };

        const handleConversationUpdate = (data: any) => {
            console.log('💬 [SOCKET] conversation:updated received:', data);
            const update = data.conversation || data;
            if (onConversationUpdateRef.current) {
                onConversationUpdateRef.current(update);
            }
        };

        const handleMessageStatus = (data: any) => {
            console.log('📊 [SOCKET] message:status received:', {
                messageId: data.messageId,
                waMessageId: data.waMessageId,
                wamId: data.wamId,
                status: data.status,
            });

            if (onMessageStatusRef.current) {
                onMessageStatusRef.current(data);
            }
        };

        // Register listeners
        socket.on('message:new', handleNewMessage);
        socket.on('conversation:updated', handleConversationUpdate);
        socket.on('message:status', handleMessageStatus);

        listenersAttached.current = true;
        console.log('✅ [SOCKET] Inbox event listeners registered');

        return () => {
            socket.off('message:new', handleNewMessage);
            socket.off('conversation:updated', handleConversationUpdate);
            socket.off('message:status', handleMessageStatus);
            listenersAttached.current = false;
            console.log('🔌 [SOCKET] Inbox event listeners removed');
        };
    }, [socket]);

    return { isConnected };
};

export default useInboxSocket;