import {
    createContext,
    useContext,
} from "react";

export interface UserType {
    role?: string;
    phone?: string;
    name: string;
    email: string;
}

export interface AppContextType {
    user: UserType | null;
    setUser: (user: UserType | null) => void;

    unreadCount: number;
    totalContacts: number;

    responseRate: number;

    refreshStats: (force?: boolean) => Promise<void>;
}

export const AppContext = createContext<AppContextType>({
    user: null,
    setUser: () => { },

    unreadCount: 0,
    totalContacts: 0,

    responseRate: 0,

    refreshStats: async () => { },
});

export const useApp = () => useContext(AppContext);
