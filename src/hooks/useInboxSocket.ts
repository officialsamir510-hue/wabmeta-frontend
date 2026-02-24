// src/hooks/useInboxSocket.ts - COMPLETE FIXED VERSION

import { useEffect, useRef, useCallback } from 'react';
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
    const { socket, isConnected } = useSocket();
    const previousConversationId = useRef<string | null>(null);

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
        if (!socket || !isConnected) return;

        if (previousConversationId.current && previousConversationId.current !== selectedConversationId) {
            socket.emit('leave:conversation', previousConversationId.current);
        }

        if (selectedConversationId) {
            socket.emit('join:conversation', selectedConversationId);
            previousConversationId.current = selectedConversationId;
        }

        return () => {
            if (selectedConversationId) {
                socket.emit('leave:conversation', selectedConversationId);
            }
        };
    }, [socket, isConnected, selectedConversationId]);

    // Listen for socket events
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (data: any) => {
            console.log('📩 [SOCKET] New message received:', data);
            const message = data.message || data;
            if (onNewMessageRef.current) {
                onNewMessageRef.current(message);
            }
        };

        const handleConversationUpdate = (data: any) => {
            console.log('💬 [SOCKET] Conversation updated:', data);
            const update = data.conversation || data;
            if (onConversationUpdateRef.current) {
                onConversationUpdateRef.current(update);
            }
        };

        // ✅ CRITICAL: Handle message status updates
        const handleMessageStatus = (data: any) => {
            console.log('📊 [SOCKET] Message status update:', data);
            if (onMessageStatusRef.current) {
                onMessageStatusRef.current(data);
            }
        };

        // Register event listeners
        socket.on('message:new', handleNewMessage);
        socket.on('conversation:updated', handleConversationUpdate);
        socket.on('message:status', handleMessageStatus);

        console.log('✅ [SOCKET] Inbox event listeners registered');

        return () => {
            socket.off('message:new', handleNewMessage);
            socket.off('conversation:updated', handleConversationUpdate);
            socket.off('message:status', handleMessageStatus);
        };
    }, [socket]);

    return { isConnected };
};

export default useInboxSocket;