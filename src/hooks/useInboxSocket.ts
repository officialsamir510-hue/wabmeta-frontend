// src/hooks/useInboxSocket.ts - COMPLETE WORKING VERSION

import { useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

interface Message {
    id: string;
    conversationId: string;
    content: string;
    direction: string;
    status: string;
    createdAt: string;
    type: string;
    contact?: any;
    message?: any;
}

interface ConversationUpdate {
    id: string;
    lastMessageAt: string;
    lastMessagePreview: string;
    unreadCount: number;
    contact?: any;
}

interface MessageStatus {
    messageId: string;
    waMessageId?: string;
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

    // Join/leave conversation room
    useEffect(() => {
        if (!socket || !isConnected) return;

        // Leave previous conversation
        if (previousConversationId.current && previousConversationId.current !== selectedConversationId) {
            console.log(`📤 Leaving conversation room: ${previousConversationId.current}`);
            leaveConversation(previousConversationId.current);
        }

        // Join new conversation
        if (selectedConversationId) {
            console.log(`📥 Joining conversation room: ${selectedConversationId}`);
            joinConversation(selectedConversationId);
            previousConversationId.current = selectedConversationId;
        }

        return () => {
            if (selectedConversationId) {
                console.log(`📤 Cleanup: Leaving conversation room: ${selectedConversationId}`);
                leaveConversation(selectedConversationId);
            }
        };
    }, [socket, isConnected, selectedConversationId, joinConversation, leaveConversation]);

    // Store latest callbacks in refs so we don't need to re-attach listeners on every render
    const onNewMessageRef = useRef(onNewMessage);
    const onConversationUpdateRef = useRef(onConversationUpdate);
    const onMessageStatusRef = useRef(onMessageStatus);

    useEffect(() => {
        onNewMessageRef.current = onNewMessage;
        onConversationUpdateRef.current = onConversationUpdate;
        onMessageStatusRef.current = onMessageStatus;
    });

    // Listen for socket events
    useEffect(() => {
        if (!socket) {
            console.warn('⚠️ Socket not initialized, skipping event listeners');
            return;
        }

        // Handle new message
        const handleNewMessage = (data: any) => {
            console.log('📩 [SOCKET] New message received:', data);

            // Extract actual message from various response formats
            const message: Message = data.message || data;

            if (onNewMessageRef.current) {
                onNewMessageRef.current(message);
            }
        };

        // Handle conversation update
        const handleConversationUpdate = (data: any) => {
            console.log('💬 [SOCKET] Conversation updated:', data);

            if (onConversationUpdateRef.current) {
                onConversationUpdateRef.current(data);
            }
        };

        // Handle message status update
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

        console.log('✅ [SOCKET] Event listeners registered');

        // Cleanup
        return () => {
            socket.off('message:new', handleNewMessage);
            socket.off('conversation:updated', handleConversationUpdate);
            socket.off('message:status', handleMessageStatus);
            console.log('🔌 [SOCKET] Event listeners removed');
        };
    }, [socket]);

    return {
        isConnected,
    };
};

export default useInboxSocket;