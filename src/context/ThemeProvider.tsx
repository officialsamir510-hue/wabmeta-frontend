import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ThemeContext, type ThemeMode, type ThemeContextValue } from './ThemeContext';

const STORAGE_KEY = 'wabmeta_theme_mode';

function getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { pathname } = useLocation();
    const publicPaths = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/verify-otp', '/privacy', '/terms', '/data-deletion'];
    const isPublicPage = publicPaths.includes(pathname) || pathname.startsWith('/features/') || pathname.startsWith('/pricing');

    const [mode, setModeState] = useState<ThemeMode>(() => {
        if (typeof window === 'undefined') return 'system';
        const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
        return saved && ['light', 'dark', 'system'].includes(saved) ? saved : 'system';
    });

    const [resolved, setResolved] = useState<'light' | 'dark'>(() => {
        if (isPublicPage) return 'light';
        return mode === 'system' ? getSystemTheme() : mode;
    });

    useEffect(() => {
        const apply = () => {
            let nextResolved = mode === 'system' ? getSystemTheme() : mode;

            // Force light mode for landing, login, and signup pages
            if (isPublicPage) {
                nextResolved = 'light';
            }

            setResolved(nextResolved);

            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(nextResolved);
        };

        apply();

        // system theme changes
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            if (mode === 'system') apply();
        };

        mq.addEventListener?.('change', handler);
        return () => mq.removeEventListener?.('change', handler);
    }, [mode, isPublicPage]);


    const setMode = useCallback((m: ThemeMode) => {
        setModeState(m);
        if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, m);
    }, []);


    // Real implementation of toggle:
    const handleToggle = useCallback(() => {
        setMode(resolved === 'dark' ? 'light' : 'dark');
    }, [resolved, setMode]);

    const value = useMemo<ThemeContextValue>(() => ({
        mode,
        resolved,
        setMode,
        toggle: handleToggle
    }), [mode, resolved, setMode, handleToggle]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

