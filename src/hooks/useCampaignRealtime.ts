// src/hooks/useCampaignRealtime.ts - COMPLETE

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

interface CampaignProgress {
    sent: number;
    failed: number;
    total: number;
    percentage: number;
    status: string;
}

interface CompletedStats {
    sentCount: number;
    failedCount: number;
    deliveredCount: number;
    readCount: number;
    totalRecipients: number;
}

interface ContactUpdate {
    contactId: string;
    phone: string;
    status: string;
    messageId?: string;
    error?: string;
    timestamp: string;
}

export const useCampaignRealtime = (campaignId: string | null) => {
    const { socket, isConnected } = useSocket();

    const [progress, setProgress] = useState<CampaignProgress | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [completedStats, setCompletedStats] = useState<CompletedStats | null>(null);
    const [contactUpdates, setContactUpdates] = useState<ContactUpdate[]>([]);

    // Join campaign room on mount
    useEffect(() => {
        if (!socket || !isConnected || !campaignId) return;

        console.log(`🔌 [SOCKET] Joining campaign room: ${campaignId}`);
        socket.emit('campaign:join', campaignId);

        return () => {
            console.log(`🔌 [SOCKET] Leaving campaign room: ${campaignId}`);
            socket.emit('campaign:leave', campaignId);
        };
    }, [socket, isConnected, campaignId]);

    // Listen for campaign updates
    useEffect(() => {
        if (!socket || !campaignId) return;

        const handleUpdate = (data: any) => {
            if (data.campaignId !== campaignId) return;

            console.log('📡 [REALTIME] Campaign update:', data);

            if (data.status === 'RUNNING') {
                setIsProcessing(true);
            } else if (['COMPLETED', 'FAILED', 'PAUSED'].includes(data.status)) {
                setIsProcessing(false);
            }
        };

        const handleProgress = (data: any) => {
            if (data.campaignId !== campaignId) return;

            console.log('📊 [REALTIME] Campaign progress:', data);

            setProgress({
                sent: data.sent || 0,
                failed: data.failed || 0,
                total: data.total || 0,
                percentage: data.percentage || 0,
                status: data.status || 'RUNNING',
            });

            setIsProcessing(true);
        };

        const handleContactStatus = (data: any) => {
            if (data.campaignId !== campaignId) return;

            console.log('👤 [REALTIME] Contact status:', data);

            const newUpdate: ContactUpdate = {
                contactId: data.contactId,
                phone: data.phone,
                status: data.status,
                messageId: data.messageId,
                error: data.error,
                timestamp: data.timestamp || new Date().toISOString(),
            };

            setContactUpdates((prev) => [...prev, newUpdate].slice(-100)); // Keep last 100
        };

        const handleCompleted = (data: any) => {
            if (data.campaignId !== campaignId) return;

            console.log('🎉 [REALTIME] Campaign completed:', data);

            setCompletedStats({
                sentCount: data.sentCount || 0,
                failedCount: data.failedCount || 0,
                deliveredCount: data.deliveredCount || 0,
                readCount: data.readCount || 0,
                totalRecipients: data.totalRecipients || 0,
            });

            setIsProcessing(false);
        };

        // Register event listeners
        socket.on('campaign:update', handleUpdate);
        socket.on('campaign:progress', handleProgress);
        socket.on('campaign:contact', handleContactStatus);
        socket.on('campaign:contact:status', handleContactStatus);
        socket.on('campaign:completed', handleCompleted);

        console.log(`✅ [SOCKET] Subscribed to campaign events: ${campaignId}`);

        // Cleanup
        return () => {
            socket.off('campaign:update', handleUpdate);
            socket.off('campaign:progress', handleProgress);
            socket.off('campaign:contact', handleContactStatus);
            socket.off('campaign:contact:status', handleContactStatus);
            socket.off('campaign:completed', handleCompleted);

            console.log(`🔌 [SOCKET] Unsubscribed from campaign events: ${campaignId}`);
        };
    }, [socket, campaignId]);

    const clearUpdates = useCallback(() => {
        setContactUpdates([]);
    }, []);

    const resetStats = useCallback(() => {
        setProgress(null);
        setCompletedStats(null);
        setIsProcessing(false);
        setContactUpdates([]);
    }, []);

    return {
        progress,
        isProcessing,
        completedStats,
        contactUpdates,
        isConnected,
        clearUpdates,
        resetStats,
    };
};

export default useCampaignRealtime;