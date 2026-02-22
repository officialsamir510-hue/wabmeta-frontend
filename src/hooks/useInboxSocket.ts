// src/hooks/useInboxSocket.ts

import { useEffect, useCallback, useState } from 'react';
import { useSocket } from '../context/SocketContext';

interface Message {
    id: string;
    conversationId: string;
    content: string;
    direction: string;
    status: string;
    createdAt: string;
    contact?: any;
}

interface ConversationUpdate {
    id: string;
    lastMessageAt: string;
    lastMessagePreview: string;
    unreadCount: number;
}

export const useInboxSocket = (
    selectedConversationId: string | null,
    onNewMessage?: (message: Message) => void,
    onConversationUpdate?: (update: ConversationUpdate) => void,
    onMessageStatus?: (status: any) => void
) => {
    const { socket, isConnected, joinConversation, leaveConversation } = useSocket();
    const [lastMessage, setLastMessage] = useState<Message | null>(null);

    // Join conversation room when selected
    useEffect(() => {
        if (!socket || !isConnected || !selectedConversationId) return;

        console.log(`📥 Joining conversation room: ${selectedConversationId}`);
        joinConversation(selectedConversationId);

        return () => {
            console.log(`📤 Leaving conversation room: ${selectedConversationId}`);
            leaveConversation(selectedConversationId);
        };
    }, [socket, isConnected, selectedConversationId, joinConversation, leaveConversation]);

    // Listen for events
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleNewMessage = (data: Message) => {
            console.log('📩 [SOCKET] New message:', data);
            setLastMessage(data);

            if (onNewMessage) {
                onNewMessage(data);
            }
        };

        const handleConversationUpdate = (data: ConversationUpdate) => {
            console.log('💬 [SOCKET] Conversation update:', data);

            if (onConversationUpdate) {
                onConversationUpdate(data);
            }
        };

        const handleMessageStatus = (data: any) => {
            console.log('📊 [SOCKET] Message status:', data);

            if (onMessageStatus) {
                onMessageStatus(data);
            }
        };

        socket.on('message:new', handleNewMessage);
        socket.on('conversation:updated', handleConversationUpdate);
        socket.on('message:status', handleMessageStatus);

        return () => {
            socket.off('message:new', handleNewMessage);
            socket.off('conversation:updated', handleConversationUpdate);
            socket.off('message:status', handleMessageStatus);
        };
    }, [socket, isConnected, onNewMessage, onConversationUpdate, onMessageStatus]);

    return {
        isConnected,
        lastMessage,
    };
};

export default useInboxSocket;