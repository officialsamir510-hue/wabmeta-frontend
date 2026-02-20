// src/hooks/useCampaignRealtime.ts

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

interface CampaignProgress {
    sent: number;
    failed: number;
    total: number;
    percentage: number;
    status: string;
}

interface CampaignStats {
    sentCount: number;
    failedCount: number;
    deliveredCount: number;
    readCount: number;
    totalRecipients: number;
}

interface ContactStatus {
    contactId: string;
    phone: string;
    status: string;
    messageId?: string;
    error?: string;
}

export function useCampaignRealtime(campaignId: string | null) {
    const { socket, isConnected } = useSocket();
    const [progress, setProgress] = useState<CampaignProgress | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [completedStats, setCompletedStats] = useState<CampaignStats | null>(null);
    const [contactUpdates, setContactUpdates] = useState<ContactStatus[]>([]);

    // Join campaign room
    useEffect(() => {
        if (!socket || !isConnected || !campaignId) return;

        console.log(`📢 Joining campaign room: ${campaignId}`);
        socket.emit('campaign:join', campaignId);

        return () => {
            console.log(`📢 Leaving campaign room: ${campaignId}`);
            socket.emit('campaign:leave', campaignId);
        };
    }, [socket, isConnected, campaignId]);

    // Listen for campaign updates
    useEffect(() => {
        if (!socket || !isConnected) return;

        // Campaign status update
        const handleCampaignUpdate = (data: any) => {
            if (data.campaignId !== campaignId) return;

            console.log('📢 Campaign update:', data);

            if (data.status === 'RUNNING') {
                setIsProcessing(true);
                toast.success(data.message || 'Campaign started');
            } else if (data.status === 'PAUSED') {
                setIsProcessing(false);
                toast('Campaign paused', { icon: 'ℹ️' });
            } else if (data.status === 'CANCELLED') {
                setIsProcessing(false);
                toast.error('Campaign cancelled');
            }
        };

        // Campaign progress
        const handleCampaignProgress = (data: CampaignProgress & { campaignId: string }) => {
            if (data.campaignId !== campaignId) return;

            console.log(`📊 Campaign progress: ${data.percentage}%`, data);

            setProgress({
                sent: data.sent,
                failed: data.failed,
                total: data.total,
                percentage: data.percentage,
                status: data.status,
            });

            setIsProcessing(data.status === 'RUNNING');
        };

        // Contact status update
        const handleContactStatus = (data: ContactStatus & { campaignId: string }) => {
            if (data.campaignId !== campaignId) return;

            console.log('📱 Contact status:', data.phone, data.status);

            setContactUpdates((prev) => [
                ...prev.slice(-99), // Keep last 100
                {
                    contactId: data.contactId,
                    phone: data.phone,
                    status: data.status,
                    messageId: data.messageId,
                    error: data.error,
                },
            ]);
        };

        // Campaign completed
        const handleCampaignCompleted = (data: CampaignStats & { campaignId: string }) => {
            if (data.campaignId !== campaignId) return;

            console.log('✅ Campaign completed:', data);

            setIsProcessing(false);
            setCompletedStats({
                sentCount: data.sentCount,
                failedCount: data.failedCount,
                deliveredCount: data.deliveredCount,
                readCount: data.readCount,
                totalRecipients: data.totalRecipients,
            });

            toast.success(
                `Campaign completed! Sent: ${data.sentCount}, Failed: ${data.failedCount}`,
                { duration: 5000 }
            );
        };

        // Campaign error
        const handleCampaignError = (data: { campaignId: string; message: string; code?: string }) => {
            if (data.campaignId !== campaignId) return;

            console.error('❌ Campaign error:', data);
            setIsProcessing(false);
            toast.error(`Campaign error: ${data.message}`);
        };

        // Register listeners
        socket.on('campaign:update', handleCampaignUpdate);
        socket.on('campaign:progress', handleCampaignProgress);
        socket.on('campaign:contact:status', handleContactStatus);
        socket.on('campaign:completed', handleCampaignCompleted);
        socket.on('campaign:error', handleCampaignError);

        return () => {
            socket.off('campaign:update', handleCampaignUpdate);
            socket.off('campaign:progress', handleCampaignProgress);
            socket.off('campaign:contact:status', handleContactStatus);
            socket.off('campaign:completed', handleCampaignCompleted);
            socket.off('campaign:error', handleCampaignError);
        };
    }, [socket, isConnected, campaignId]);

    const reset = useCallback(() => {
        setProgress(null);
        setIsProcessing(false);
        setCompletedStats(null);
        setContactUpdates([]);
    }, []);

    return {
        progress,
        isProcessing,
        completedStats,
        contactUpdates,
        isConnected,
        reset,
    };
}