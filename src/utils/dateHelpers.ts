// src/utils/dateHelpers.ts - ✅ Reusable date utilities

/**
 * Safely format timestamp to readable time
 */
export const formatMessageTime = (timestamp: any): string => {
    try {
        if (!timestamp) return '';

        const date = new Date(timestamp);

        if (isNaN(date.getTime())) {
            return '';
        }

        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch {
        return '';
    }
};

/**
 * Format full date with time
 */
export const formatMessageDateTime = (timestamp: any): string => {
    try {
        if (!timestamp) return 'Unknown';

        const date = new Date(timestamp);

        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        // Check if today
        if (messageDate.getTime() === today.getTime()) {
            return `Today at ${formatMessageTime(timestamp)}`;
        }

        // Check if yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (messageDate.getTime() === yesterday.getTime()) {
            return `Yesterday at ${formatMessageTime(timestamp)}`;
        }

        // Older messages
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        }) + ' at ' + formatMessageTime(timestamp);

    } catch {
        return 'Invalid Date';
    }
};

/**
 * Check if timestamp is valid
 */
export const isValidTimestamp = (timestamp: any): boolean => {
    if (!timestamp) return false;
    const date = new Date(timestamp);
    return !isNaN(date.getTime());
};

/**
 * Safely parse timestamp
 */
export const safeParseDate = (timestamp: any): Date | null => {
    try {
        if (!timestamp) return null;
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? null : date;
    } catch {
        return null;
    }
};
