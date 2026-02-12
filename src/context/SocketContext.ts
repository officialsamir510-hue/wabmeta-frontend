import { createContext, useContext } from 'react';

export interface Socket {
    connected: boolean;
    emit: (event: string, data?: any) => void;
    on: (event: string, callback: (...args: any[]) => void) => void;
    off: (event: string, callback?: (...args: any[]) => void) => void;
    disconnect: () => void;
}

export interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    joinConversation: (conversationId: string) => void;
    leaveConversation: (conversationId: string) => void;
    emitTyping: (conversationId: string, isTyping: boolean) => void;
}

const defaultContext: SocketContextType = {
    socket: null,
    isConnected: false,
    joinConversation: () => { },
    leaveConversation: () => { },
    emitTyping: () => { },
};

export const SocketContext = createContext<SocketContextType>(defaultContext);

export function useSocket(): SocketContextType {
    const context = useContext(SocketContext);
    return context || defaultContext;
}
