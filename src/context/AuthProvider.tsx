// src/context/AuthProvider.tsx - PERSISTENT LOGIN FINAL

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, type User, type Organization } from './AuthContext';
import api, { auth, setAuthToken, removeAuthToken } from '../services/api';
import toast from 'react-hot-toast';

interface AuthState {
    user: User | null;
    organization: Organization | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const TOKEN_KEYS = {
    ACCESS: 'accessToken',
    REFRESH: 'refreshToken',
    USER: 'wabmeta_user',
    ORG: 'wabmeta_org',
    LEGACY_TOKEN: 'token',
    LEGACY_WABMETA: 'wabmeta_token',
} as const;

// Authentication routes logic and public route definitions


// Removed isPublicRoute as redirection is now handled by ProtectedRoute component logic


// ✅ Check if JWT token is valid format
const isValidJWT = (token: string | null): boolean => {
    if (!token || typeof token !== 'string') return false;
    const parts = token.split('.');
    return parts.length === 3;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();

    const [state, setState] = useState<AuthState>({
        user: null,
        organization: null,
        isAuthenticated: false,
        isLoading: true, // ✅ Start with loading = true
        error: null,
    });

    const initialCheckDone = useRef(false);
    const isRefreshing = useRef(false);

    // ✅ Get access token from storage
    const getAccessToken = useCallback((): string | null => {
        const token =
            localStorage.getItem(TOKEN_KEYS.ACCESS) ||
            localStorage.getItem(TOKEN_KEYS.LEGACY_TOKEN) ||
            localStorage.getItem(TOKEN_KEYS.LEGACY_WABMETA);

        return isValidJWT(token) ? token : null;
    }, []);

    // ✅ Get refresh token from storage
    const getRefreshToken = useCallback((): string | null => {
        return localStorage.getItem(TOKEN_KEYS.REFRESH);
    }, []);

    // ✅ Load saved user from localStorage (for instant UI)
    const loadSavedData = useCallback((): { user: User | null; org: Organization | null } => {
        try {
            const savedUser = localStorage.getItem(TOKEN_KEYS.USER);
            const savedOrg = localStorage.getItem(TOKEN_KEYS.ORG);

            return {
                user: savedUser ? JSON.parse(savedUser) : null,
                org: savedOrg ? JSON.parse(savedOrg) : null,
            };
        } catch (e) {
            console.warn('⚠️ Failed to parse saved auth data');
            return { user: null, org: null };
        }
    }, []);

    // ✅ Save user/org to localStorage
    const saveToStorage = useCallback((user: User | null, org: Organization | null) => {
        if (user) {
            localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
        } else {
            localStorage.removeItem(TOKEN_KEYS.USER);
        }

        if (org) {
            localStorage.setItem(TOKEN_KEYS.ORG, JSON.stringify(org));
        } else {
            localStorage.removeItem(TOKEN_KEYS.ORG);
        }
    }, []);

    // ✅ Clear all auth data
    const clearAuthData = useCallback(() => {
        Object.values(TOKEN_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        // Also clear any other auth-related items
        localStorage.removeItem('remember_me');
        localStorage.removeItem('currentOrganizationId');
    }, []);

    // ✅ Refresh access token using refresh token
    const refreshAccessToken = useCallback(async (): Promise<boolean> => {
        if (isRefreshing.current) {
            console.log('⏳ Already refreshing token...');
            return false;
        }

        const refreshToken = getRefreshToken();

        if (!refreshToken) {
            console.log('❌ No refresh token available');
            return false;
        }

        try {
            isRefreshing.current = true;
            console.log('🔄 Refreshing access token...');

            const response = await auth.refresh(refreshToken);

            if (response.data?.success && response.data?.data?.accessToken) {
                const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                setAuthToken(accessToken, newRefreshToken || refreshToken);
                console.log('✅ Token refreshed successfully');
                return true;
            }

            console.log('❌ Token refresh response invalid');
            return false;
        } catch (error: any) {
            console.error('❌ Token refresh failed:', error?.message);
            return false;
        } finally {
            isRefreshing.current = false;
        }
    }, [getRefreshToken]);

    // ✅ Verify session with server
    const verifySession = useCallback(async (): Promise<boolean> => {
        const accessToken = getAccessToken();

        if (!accessToken) {
            console.log('📭 No access token found');
            return false;
        }

        try {
            console.log('🔍 Verifying session with server...');

            // Get current user from server
            const userResponse = await auth.me();

            if (userResponse.data?.success && userResponse.data?.data) {
                const user = userResponse.data.data;

                // Try to get organization
                let org: Organization | null = null;
                try {
                    const orgResponse = await api.get('/organizations/current');
                    if (orgResponse.data?.success && orgResponse.data?.data) {
                        org = orgResponse.data.data;
                    }
                } catch (e) {
                    // Use saved org if API fails
                    const saved = loadSavedData();
                    org = saved.org;
                    console.log('ℹ️ Using saved organization data');
                }

                // Save to storage for next time
                saveToStorage(user, org);

                // ✅ Verify organization exists
                if (!org) {
                    console.warn('⚠️ No organization, failing session verification');
                    return false;
                }

                // Update state
                setState({
                    user,
                    organization: org,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });

                console.log('✅ Session verified:', user.email);
                return true;
            }

            return false;
        } catch (error: any) {
            console.log('⚠️ Session verification failed:', error?.response?.status);

            // If 401, try to refresh token
            if (error?.response?.status === 401) {
                const refreshed = await refreshAccessToken();

                if (refreshed) {
                    // Retry verification after refresh
                    return await verifySession();
                }
            }

            return false;
        }
    }, [getAccessToken, loadSavedData, saveToStorage, refreshAccessToken]);

    // ✅ Initial auth check on app load
    useEffect(() => {
        let isMounted = true;

        const initAuth = async () => {
            try {
                console.log('🚀 Initializing authentication...');
                const accessToken = getAccessToken();

                if (!accessToken) {
                    console.log('📭 No token found');
                    if (isMounted) {
                        setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
                    }
                    return;
                }

                // Restore saved UI data for speed
                const { user: savedUser, org: savedOrg } = loadSavedData();
                if (savedUser && isMounted) {
                    setState(prev => ({
                        ...prev,
                        user: savedUser,
                        organization: savedOrg,
                        isAuthenticated: true,
                    }));
                }

                // Verify with server in background
                try {
                    const isValid = await verifySession();

                    if (!isValid && isMounted) {
                        console.log('❌ Session invalid - triggering logout cleanup');
                        clearAuthData();
                        setState({
                            user: null,
                            organization: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: null,
                        });
                        navigate('/login', { replace: true });
                    } else if (isMounted) {
                        setState(prev => ({ ...prev, isLoading: false }));
                    }
                } catch (verifyError: any) {
                    // Ignore transient network errors during server restarts
                    if (verifyError?.code === 'NETWORK_ERROR' || verifyError?.status >= 500) {
                        console.warn('⏱️ Server is restarting. Keeping local session.');
                        setState(prev => ({ ...prev, isLoading: false }));
                    } else {
                        throw verifyError;
                    }
                }
            } catch (error) {
                console.error('💥 Auth Initialization failed:', error);
                if (isMounted) {
                    setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
                    navigate('/login', { replace: true });
                }
            }
        };

        if (!initialCheckDone.current) {
            initialCheckDone.current = true;
            initAuth();
        }

        return () => { isMounted = false; };
    }, [getAccessToken, loadSavedData, verifySession, clearAuthData]);

    // ✅ Login function
    const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            console.log('🔐 Logging in:', email);

            const response = await auth.login({ email, password });

            if (response.data?.success && response.data?.data) {
                const { user, tokens, organization } = response.data.data;

                // ✅ Validate organizationId
                if (!organization) {
                    console.error('❌ No organization received');
                    toast.error('Login failed: Organization not assigned. Please contact support.');
                    throw new Error('Login failed: Organization not assigned. Please contact support.');
                }

                // Save tokens
                setAuthToken(tokens.accessToken, tokens.refreshToken);

                // Save to storage
                saveToStorage(user, organization || null);

                // Update state
                setState({
                    user,
                    organization: organization || null,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });

                console.log('✅ Login successful:', user.email);
                return { success: true };
            }

            throw new Error(response.data?.message || 'Login failed');
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Login failed';

            setState(prev => ({
                ...prev,
                isLoading: false,
                error: message,
            }));

            console.error('❌ Login error:', message);
            return { success: false, error: message };
        }
    }, [saveToStorage]);

    // ✅ Register function
    const register = useCallback(async (data: any): Promise<{ success: boolean; error?: string }> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await auth.register(data);

            if (response.data?.success && response.data?.data) {
                const { user, tokens, organization } = response.data.data;

                setAuthToken(tokens.accessToken, tokens.refreshToken);
                saveToStorage(user, organization || null);

                setState({
                    user,
                    organization: organization || null,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });

                console.log('✅ Registration successful:', user.email);
                return { success: true };
            }

            throw new Error(response.data?.message || 'Registration failed');
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Registration failed';

            setState(prev => ({
                ...prev,
                isLoading: false,
                error: message,
            }));

            return { success: false, error: message };
        }
    }, [saveToStorage]);

    // ✅ Google login
    const googleLogin = useCallback(async (credential: string): Promise<{ success: boolean; error?: string }> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await auth.googleLogin({ credential });

            if (response.data?.success && response.data?.data) {
                const { user, tokens, organization } = response.data.data;

                // ✅ Validate organizationId
                if (!organization) {
                    console.error('❌ No organization received');
                    toast.error('Login failed: Organization not assigned. Please contact support.');
                    throw new Error('Login failed: Organization not assigned. Please contact support.');
                }

                setAuthToken(tokens.accessToken, tokens.refreshToken);
                saveToStorage(user, organization || null);

                setState({
                    user,
                    organization: organization || null,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });

                return { success: true };
            }

            throw new Error(response.data?.message || 'Google login failed');
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Google login failed';

            setState(prev => ({
                ...prev,
                isLoading: false,
                error: message,
            }));

            return { success: false, error: message };
        }
    }, [saveToStorage]);

    // ✅ Logout function
    const logout = useCallback(async () => {
        console.log('👋 Logging out...');

        try {
            await auth.logout();
        } catch (e) {
            console.warn('⚠️ Logout API call failed, clearing locally');
        }

        // Clear everything
        clearAuthData();
        removeAuthToken();

        setState({
            user: null,
            organization: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
        });

        navigate('/login', { replace: true });
    }, [navigate, clearAuthData]);

    // ✅ Update user
    const updateUser = useCallback((updatedUser: Partial<User>) => {
        setState(prev => {
            if (!prev.user) return prev;

            const newUser = { ...prev.user, ...updatedUser };
            saveToStorage(newUser, prev.organization);

            return { ...prev, user: newUser };
        });
    }, [saveToStorage]);

    // ✅ Update organization
    const updateOrganization = useCallback((updatedOrg: Partial<Organization>) => {
        setState(prev => {
            if (!prev.organization) return prev;

            const newOrg = { ...prev.organization, ...updatedOrg };
            saveToStorage(prev.user, newOrg);

            return { ...prev, organization: newOrg };
        });
    }, [saveToStorage]);

    // ✅ Set organization (after switching)
    const setOrganization = useCallback((org: Organization | null) => {
        setState(prev => {
            saveToStorage(prev.user, org);
            return { ...prev, organization: org };
        });
    }, [saveToStorage]);

    // ✅ Clear error
    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    // ✅ Refresh session (can be called manually)
    const refreshSession = useCallback(async (): Promise<boolean> => {
        return await verifySession();
    }, [verifySession]);

    const value = {
        ...state,
        login,
        register,
        googleLogin,
        logout,
        updateUser,
        updateOrganization,
        setOrganization,
        clearError,
        refreshSession,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;