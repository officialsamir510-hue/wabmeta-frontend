// src/context/AuthContext.ts

import { createContext, useContext } from 'react';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
    emailVerified: boolean;
    role?: string;
}

export interface Organization {
    id: string;
    name: string;
    slug: string;
    planType: string;
}

export interface AuthContextType {
    user: User | null;
    organization: Organization | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (data: any) => Promise<{ success: boolean; error?: string }>;
    googleLogin: (credential: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    updateUser: (user: Partial<User>) => void;
    updateOrganization: (org: Partial<Organization>) => void;
    setOrganization: (org: Organization | null) => void;
    clearError: () => void;
    refreshSession: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

export default AuthContext;