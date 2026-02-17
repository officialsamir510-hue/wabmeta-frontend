import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ThemeContext, type ThemeMode, type ThemeContextValue } from './ThemeContext';

const STORAGE_KEY = 'wabmeta_theme_mode';

function getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Check if a path is a public page that should always be in light mode
function isPublicPath(pathname: string): boolean {
    const publicPaths = [
        '/',
        '/login',
        '/signup',
        '/forgot-password',
        '/reset-password',
        '/verify-email',
        '/verify-otp',
        '/privacy',
        '/terms',
        '/data-deletion'
    ];

    return publicPaths.includes(pathname) ||
        pathname.startsWith('/features/') ||
        pathname.startsWith('/pricing');
}

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { pathname } = useLocation();

    const [mode, setModeState] = useState<ThemeMode>(() => {
        if (typeof window === 'undefined') return 'system';
        const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
        return saved && ['light', 'dark', 'system'].includes(saved) ? saved : 'system';
    });

    const [resolved, setResolved] = useState<'light' | 'dark'>('light');

    // Apply theme whenever pathname or mode changes
    useEffect(() => {
        const isPublic = isPublicPath(pathname);

        let nextResolved: 'light' | 'dark';

        // Force light mode for public pages
        if (isPublic) {
            nextResolved = 'light';
        } else {
            nextResolved = mode === 'system' ? getSystemTheme() : mode;
        }

        setResolved(nextResolved);

        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(nextResolved);
    }, [pathname, mode]);

    // Listen for system theme changes
    useEffect(() => {
        const isPublic = isPublicPath(pathname);

        // Only listen to system theme changes if not on public page and mode is 'system'
        if (isPublic || mode !== 'system') {
            return;
        }

        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            const systemTheme = getSystemTheme();
            setResolved(systemTheme);

            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(systemTheme);
        };

        mq.addEventListener?.('change', handler);
        return () => mq.removeEventListener?.('change', handler);
    }, [pathname, mode]);

    const setMode = useCallback((m: ThemeMode) => {
        setModeState(m);
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, m);
        }
    }, []);

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
