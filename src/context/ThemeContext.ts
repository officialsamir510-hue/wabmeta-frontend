import { createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemeContextValue = {
    mode: ThemeMode;
    resolved: 'light' | 'dark';
    setMode: (m: ThemeMode) => void;
    toggle: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
    return ctx;
};
