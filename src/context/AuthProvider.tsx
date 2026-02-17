// src/context/AuthProvider.tsx

import React, { useState, useEffect, type ReactNode, useCallback } from "react";
import { auth, organizations } from "../services/api";
import { AuthContext, type AuthContextType } from "./AuthContext";
import type { User } from "../types/auth";

interface AuthProviderProps {
    children: ReactNode;
}

const TOKEN_KEYS = {
    ACCESS: 'accessToken',
    REFRESH: 'refreshToken',
    USER: 'wabmeta_user',
    ORG: 'wabmeta_org',
    ORG_ID: 'currentOrganizationId',
    LEGACY_TOKEN: 'token',
    LEGACY_WABMETA: 'wabmeta_token',
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const u = localStorage.getItem(TOKEN_KEYS.USER);
            return u ? (JSON.parse(u) as User) : null;
        } catch {
            return null;
        }
    });

    const [isLoading, setIsLoading] = useState(true);

    const hasAccessToken = useCallback(() => {
        const t =
            localStorage.getItem(TOKEN_KEYS.ACCESS) ||
            localStorage.getItem(TOKEN_KEYS.LEGACY_TOKEN) ||
            localStorage.getItem(TOKEN_KEYS.LEGACY_WABMETA);
        return !!t;
    }, []);

    const storeTokens = useCallback((accessToken: string, refreshToken?: string | null) => {
        localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
        localStorage.setItem(TOKEN_KEYS.LEGACY_TOKEN, accessToken);
        localStorage.setItem(TOKEN_KEYS.LEGACY_WABMETA, accessToken);

        if (refreshToken) {
            localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
        }
    }, []);

    const storeUser = useCallback((u: User | null) => {
        if (!u) {
            localStorage.removeItem(TOKEN_KEYS.USER);
            setUser(null);
            return;
        }
        localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(u));
        setUser(u);
    }, []);

    const storeOrg = useCallback((org: any) => {
        if (!org?.id) return;
        localStorage.setItem(TOKEN_KEYS.ORG, JSON.stringify(org));
        localStorage.setItem(TOKEN_KEYS.ORG_ID, org.id);
    }, []);

    const clearAuthStorage = useCallback(() => {
        Object.values(TOKEN_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        setUser(null);
    }, []);

    const checkAuth = useCallback(async () => {
        try {
            if (!hasAccessToken()) {
                setIsLoading(false);
                return;
            }

            const response = await auth.me();

            if (response.data?.success && response.data?.data) {
                storeUser(response.data.data as User);
            } else {
                clearAuthStorage();
            }
        } catch (error: any) {
            console.error("Auth check failed:", error);

            // Only clear if it's a 401 error
            if (error?.response?.status === 401) {
                clearAuthStorage();
            }
        } finally {
            setIsLoading(false);
        }
    }, [hasAccessToken, storeUser, clearAuthStorage]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (email: string, password: string) => {
        const response = await auth.login({ email, password });

        if (!response.data?.success) {
            throw new Error(response.data?.message || "Login failed");
        }

        const data = response.data.data;

        const accessToken = data?.tokens?.accessToken;
        const refreshToken = data?.tokens?.refreshToken;
        const userData = data?.user;
        const org = data?.organization;

        if (!accessToken) {
            throw new Error("Access token missing from login response");
        }

        storeTokens(accessToken, refreshToken);

        if (userData) {
            storeUser(userData as User);
        }

        if (org?.id) {
            storeOrg(org);
        }

        // Fallback: get current org if not returned
        if (!org?.id) {
            try {
                const orgRes = await organizations.getCurrent();
                if (orgRes.data?.success && orgRes.data?.data?.id) {
                    storeOrg(orgRes.data.data);
                }
            } catch {
                // ignore - org is optional
            }
        }

        // Fallback: get user if not returned
        if (!userData) {
            await refreshUser();
        }
    };

    const logout = async () => {
        try {
            await auth.logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            clearAuthStorage();
        }
    };

    const refreshUser = async () => {
        try {
            const response = await auth.me();
            if (response.data?.success && response.data?.data) {
                storeUser(response.data.data as User);
            }
        } catch (error) {
            console.error("Refresh user failed:", error);
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user && hasAccessToken(),
        isLoading,
        login,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};