import React, { useState, useEffect, type ReactNode } from 'react';
import { auth } from '../services/api';
import { AuthContext, type AuthContextType } from './AuthContext';
import type { User } from '../types/auth';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check authentication on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('accessToken') ||
                localStorage.getItem('token') ||
                localStorage.getItem('wabmeta_token');

            if (!token) {
                setIsLoading(false);
                return;
            }

            const response = await auth.me();
            // Ensure the response data matches User type. 
            // If backend returns different shape, we might need mapping.
            // Assuming response.data.data is User object.
            setUser(response.data.data as User);
        } catch (error) {
            console.error('Auth check failed:', error);
            // Clear invalid tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('token');
            localStorage.removeItem('wabmeta_token');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await auth.login({ email, password });
        const { accessToken, refreshToken, user: userData } = response.data.data;

        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('token', accessToken);
        localStorage.setItem('wabmeta_token', accessToken);

        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }

        setUser(userData as User);
    };

    const logout = async () => {
        try {
            await auth.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear all tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('token');
            localStorage.removeItem('wabmeta_token');
            localStorage.removeItem('refreshToken');
            setUser(null);
        }
    };

    const refreshUser = async () => {
        try {
            const response = await auth.me();
            setUser(response.data.data as User);
        } catch (error) {
            console.error('Refresh user failed:', error);
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
