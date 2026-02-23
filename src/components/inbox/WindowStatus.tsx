// src/components/inbox/WindowStatus.tsx

import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface WindowStatusProps {
    windowExpiresAt: string | Date | null;
    isWindowOpen: boolean;
}

const WindowStatus: React.FC<WindowStatusProps> = ({
    windowExpiresAt,
    isWindowOpen,
}) => {
    const getTimeRemaining = () => {
        if (!windowExpiresAt) return null;

        const expiresAt = new Date(windowExpiresAt);
        const now = new Date();
        const diff = expiresAt.getTime() - now.getTime();

        if (diff <= 0) return null;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m remaining`;
        }
        return `${minutes}m remaining`;
    };

    const timeRemaining = getTimeRemaining();
    const windowOpen = isWindowOpen && timeRemaining;

    if (windowOpen) {
        // Window is open - show green indicator
        return (
            <div className="flex items-center justify-center py-2 px-4 bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-800">
                <div className="flex items-center text-sm">
                    <div className="relative mr-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </div>
                    <span className="text-green-700 dark:text-green-400 font-medium">
                        24h Window Open
                    </span>
                    <span className="mx-2 text-green-400 dark:text-green-600">•</span>
                    <span className="text-green-600 dark:text-green-500">
                        {timeRemaining}
                    </span>
                </div>
            </div>
        );
    }

    // Window is closed - show warning
    return (
        <div className="flex items-center justify-center py-2 px-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-100 dark:border-yellow-800">
            <div className="flex items-center text-sm">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-yellow-700 dark:text-yellow-400 font-medium">
                    24h Window Closed
                </span>
                <span className="mx-2 text-yellow-400 dark:text-yellow-600">•</span>
                <span className="text-yellow-600 dark:text-yellow-500 text-xs">
                    Only template messages allowed
                </span>
            </div>
        </div>
    );
};

export default WindowStatus;