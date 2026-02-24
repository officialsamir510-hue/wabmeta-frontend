// src/context/SocketContext.ts - COMPLETE

import { createContext, useContext } from 'react';
import { Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    joinConversation: (conversationId: string) => void;
    leaveConversation: (conversationId: string) => void;
}

export const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    joinConversation: () => { },
    leaveConversation: () => { },
});

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        console.warn('useSocket must be used within SocketProvider');
    }
    return context;
};

export default SocketContext;