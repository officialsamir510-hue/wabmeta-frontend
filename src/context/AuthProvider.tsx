import React, { useState, useEffect, type ReactNode, useCallback } from "react";
import { auth, organizations } from "../services/api";
import { AuthContext, type AuthContextType } from "./AuthContext";
import type { User } from "../types/auth";

interface AuthProviderProps {
    children: ReactNode;
}

type LoginResponseData = any;

const extractAccessToken = (data: LoginResponseData): string | null => {
    return data?.accessToken || data?.tokens?.accessToken || data?.tokens?.access_token || null;
};

const extractRefreshToken = (data: LoginResponseData): string | null => {
    return data?.refreshToken || data?.tokens?.refreshToken || data?.tokens?.refresh_token || null;
};

const extractUser = (data: LoginResponseData): any => {
    return data?.user || data?.profile || null;
};

const extractOrg = (data: LoginResponseData): any => {
    return data?.organization || data?.org || data?.currentOrganization || null;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const u = localStorage.getItem("wabmeta_user");
            return u ? (JSON.parse(u) as User) : null;
        } catch {
            return null;
        }
    });

    const [isLoading, setIsLoading] = useState(true);

    const hasAccessToken = () => {
        const t =
            localStorage.getItem("accessToken") ||
            localStorage.getItem("token") ||
            localStorage.getItem("wabmeta_token");
        return !!t;
    };

    const storeTokens = (accessToken: string, refreshToken?: string | null) => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("token", accessToken);
        localStorage.setItem("wabmeta_token", accessToken);

        if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
        }
    };

    const storeUser = (u: any) => {
        if (!u) return;
        localStorage.setItem("wabmeta_user", JSON.stringify(u));
        setUser(u as User);
    };

    const storeOrg = (org: any) => {
        if (!org?.id) return;
        localStorage.setItem("wabmeta_org", JSON.stringify(org));
        localStorage.setItem("currentOrganizationId", org.id);
    };

    const clearAuthStorage = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        localStorage.removeItem("wabmeta_token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("wabmeta_user");
        localStorage.removeItem("wabmeta_org");
        localStorage.removeItem("currentOrganizationId");
    };

    const checkAuth = useCallback(async () => {
        try {
            if (!hasAccessToken()) {
                setIsLoading(false);
                return;
            }

            const response = await auth.me();
            if (response.data?.success && response.data?.data) {
                storeUser(response.data.data);
            } else {
                clearAuthStorage();
                setUser(null);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            clearAuthStorage();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (email: string, password: string) => {
        const response = await auth.login({ email, password });

        if (!response.data?.success) {
            throw new Error(response.data?.message || "Login failed");
        }

        const data = response.data.data;

        const accessToken = extractAccessToken(data);
        const refreshToken = extractRefreshToken(data);
        const userData = extractUser(data);
        const org = extractOrg(data);

        if (!accessToken) {
            throw new Error("Access token missing from login response");
        }

        storeTokens(accessToken, refreshToken);

        if (userData) storeUser(userData);
        if (org?.id) storeOrg(org);

        // fallback: get current org if not returned
        if (!org?.id) {
            try {
                const orgRes = await organizations.getCurrent();
                if (orgRes.data?.success && orgRes.data?.data?.id) {
                    storeOrg(orgRes.data.data);
                }
            } catch {
                // ignore
            }
        }

        // fallback: get user if not returned
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
            setUser(null);
        }
    };

    const refreshUser = async () => {
        try {
            const response = await auth.me();
            if (response.data?.success && response.data?.data) {
                storeUser(response.data.data);
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