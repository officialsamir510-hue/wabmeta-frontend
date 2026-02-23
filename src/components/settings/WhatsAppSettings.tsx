// src/components/settings/WhatsAppSettings.tsx - SIMPLIFIED VERSION

import React, { useState, useEffect } from 'react';
import {
    Smartphone,
    CheckCircle,
    XCircle,
    RefreshCw,
    AlertCircle,
    Loader2,
    ExternalLink,
    Shield,
    Zap,
    Phone,
    MessageSquare,
    Settings,
    Link as LinkIcon,
    Unlink,
} from 'lucide-react';
import { whatsapp, meta } from '../../services/api';
import toast from 'react-hot-toast';

interface WhatsAppAccount {
    id: string;
    phoneNumber: string;
    displayName: string;
    phoneNumberId: string;
    wabaId: string;
    status: 'CONNECTED' | 'DISCONNECTED' | 'PENDING' | 'BANNED' | 'RESTRICTED';
    qualityRating?: string;
    verifiedName?: string;
    messagingLimit?: string;
    isDefault: boolean;
    hasAccessToken: boolean;
    createdAt: string;
    updatedAt: string;
}

const WhatsAppSettings: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
    const [disconnecting, setDisconnecting] = useState<string | null>(null);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const response = await whatsapp.accounts();

            if (response.data.success) {
                setAccounts(response.data.data || []);
            }
        } catch (error: any) {
            console.error('Fetch accounts error:', error);
            toast.error('Failed to load WhatsApp accounts');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // CONNECT WITH META
    // ============================================

    const handleConnectWithMeta = async () => {
        try {
            setConnecting(true);

            const orgData = localStorage.getItem('wabmeta_org');
            const org = orgData ? JSON.parse(orgData) : null;
            const organizationId = org?.id || localStorage.getItem('currentOrganizationId');

            if (!organizationId) {
                toast.error('Organization not found. Please refresh and try again.');
                setConnecting(false);
                return;
            }

            const response = await meta.getOAuthUrl(organizationId);

            if (response.data.success && response.data.data?.url) {
                if (response.data.data.state) {
                    localStorage.setItem('meta_oauth_state', response.data.data.state);
                }

                window.location.href = response.data.data.url;
            } else {
                throw new Error(response.data.message || 'Failed to get OAuth URL');
            }
        } catch (error: any) {
            console.error('Connect error:', error);
            toast.error(error.message || 'Failed to start connection');
            setConnecting(false);
        }
    };

    // ============================================
    // DISCONNECT ACCOUNT
    // ============================================

    const handleDisconnect = async (accountId: string) => {
        const confirmed = window.confirm(
            'Are you sure you want to disconnect this WhatsApp account?\n\n' +
            '• Your message history will be preserved\n' +
            '• You can reconnect anytime\n' +
            '• Active campaigns will be paused'
        );

        if (!confirmed) return;

        try {
            setDisconnecting(accountId);

            const response = await whatsapp.disconnect(accountId);

            if (response.data.success) {
                toast.success('WhatsApp account disconnected');
                fetchAccounts();
            } else {
                throw new Error(response.data.message);
            }
        } catch (error: any) {
            console.error('Disconnect error:', error);
            toast.error(error.message || 'Failed to disconnect');
        } finally {
            setDisconnecting(null);
        }
    };

    // ============================================
    // HELPERS
    // ============================================

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONNECTED':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'DISCONNECTED':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'BANNED':
            case 'RESTRICTED':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
        }
    };

    const getQualityColor = (quality?: string) => {
        switch (quality?.toUpperCase()) {
            case 'GREEN':
                return 'text-green-600';
            case 'YELLOW':
                return 'text-yellow-600';
            case 'RED':
                return 'text-red-600';
            default:
                return 'text-gray-500';
        }
    };

    // ============================================
    // RENDER
    // ============================================

    const connectedAccounts = accounts.filter(a => a.status === 'CONNECTED');
    const hasConnectedAccount = connectedAccounts.length > 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                        <Smartphone className="w-6 h-6 mr-2 text-green-600" />
                        WhatsApp Connection
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Connect and manage your WhatsApp Business accounts
                    </p>
                </div>

                <button
                    onClick={() => fetchAccounts()}
                    disabled={loading}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Refresh"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Connection Status Card */}
            <div className={`rounded-xl border-2 p-6 ${hasConnectedAccount
                    ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center">
                        {hasConnectedAccount ? (
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-4">
                                <CheckCircle className="w-7 h-7 text-green-600" />
                            </div>
                        ) : (
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-4">
                                <XCircle className="w-7 h-7 text-gray-400" />
                            </div>
                        )}
                        <div>
                            <h3 className={`text-lg font-semibold ${hasConnectedAccount
                                    ? 'text-green-800 dark:text-green-200'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                {hasConnectedAccount
                                    ? `${connectedAccounts.length} Account${connectedAccounts.length > 1 ? 's' : ''} Connected`
                                    : 'No WhatsApp Account Connected'
                                }
                            </h3>
                            <p className={`text-sm ${hasConnectedAccount
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                {hasConnectedAccount
                                    ? 'Your WhatsApp Business is ready to use'
                                    : 'Connect your WhatsApp Business Account to get started'
                                }
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleConnectWithMeta}
                        disabled={connecting}
                        className={`px-6 py-3 rounded-xl font-semibold flex items-center justify-center transition-all whitespace-nowrap ${hasConnectedAccount
                                ? 'bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                                : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/25'
                            }`}
                    >
                        {connecting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Connecting...
                            </>
                        ) : hasConnectedAccount ? (
                            <>
                                <LinkIcon className="w-5 h-5 mr-2" />
                                Add Another Account
                            </>
                        ) : (
                            <>
                                <Zap className="w-5 h-5 mr-2" />
                                Connect with Meta
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Connected Accounts List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
            ) : accounts.length > 0 ? (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Your Accounts
                    </h3>

                    {accounts.map((account) => (
                        <div
                            key={account.id}
                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
                        >
                            <div className="flex items-start justify-between">
                                {/* Account Info */}
                                <div className="flex items-start">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${account.status === 'CONNECTED'
                                            ? 'bg-green-100 dark:bg-green-900/30'
                                            : 'bg-gray-100 dark:bg-gray-700'
                                        }`}>
                                        <Phone className={`w-6 h-6 ${account.status === 'CONNECTED' ? 'text-green-600' : 'text-gray-400'
                                            }`} />
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                {account.displayName || account.verifiedName || 'WhatsApp Business'}
                                            </h4>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(account.status)}`}>
                                                {account.status}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            +{account.phoneNumber}
                                        </p>

                                        {/* Additional Info */}
                                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            {account.qualityRating && (
                                                <span className="flex items-center">
                                                    <Shield className={`w-3 h-3 mr-1 ${getQualityColor(account.qualityRating)}`} />
                                                    Quality: {account.qualityRating}
                                                </span>
                                            )}
                                            {account.messagingLimit && (
                                                <span className="flex items-center">
                                                    <MessageSquare className="w-3 h-3 mr-1" />
                                                    Tier: {account.messagingLimit}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Disconnect Button */}
                                <button
                                    onClick={() => handleDisconnect(account.id)}
                                    disabled={disconnecting === account.id}
                                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Disconnect"
                                >
                                    {disconnecting === account.id ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Unlink className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            {/* Warning for disconnected */}
                            {account.status === 'DISCONNECTED' && (
                                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                                            Account Disconnected
                                        </p>
                                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">
                                            Reconnect to resume messaging and campaigns.
                                        </p>
                                        <button
                                            onClick={handleConnectWithMeta}
                                            className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 font-medium hover:underline"
                                        >
                                            Reconnect Now →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Token expired warning */}
                            {account.status === 'CONNECTED' && !account.hasAccessToken && (
                                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
                                    <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                                            Token Expired
                                        </p>
                                        <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                                            Your access token has expired. Please reconnect to continue.
                                        </p>
                                        <button
                                            onClick={handleConnectWithMeta}
                                            className="mt-2 text-sm text-red-700 dark:text-red-300 font-medium hover:underline"
                                        >
                                            Reconnect Now →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Smartphone className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No WhatsApp Accounts Connected
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        Connect your WhatsApp Business Account to start sending messages,
                        managing campaigns, and engaging with your customers.
                    </p>

                    <button
                        onClick={handleConnectWithMeta}
                        disabled={connecting}
                        className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors inline-flex items-center shadow-lg shadow-green-600/25"
                    >
                        {connecting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Connecting...
                            </>
                        ) : (
                            <>
                                <Zap className="w-5 h-5 mr-2" />
                                Connect with Meta
                            </>
                        )}
                    </button>

                    {/* Info Box */}
                    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl max-w-md mx-auto">
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                            What you'll need:
                        </h4>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 text-left">
                            <li className="flex items-center">
                                <CheckCircle className="w-3 h-3 mr-2" />
                                Facebook Business Account
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="w-3 h-3 mr-2" />
                                WhatsApp Business API access
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="w-3 h-3 mr-2" />
                                Phone number for WhatsApp Business
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Help Section */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Need Help?
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a
                        href="https://business.facebook.com/latest/settings/whatsapp_account"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                    >
                        <Settings className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Meta Business Settings
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Manage your WhatsApp Business Account
                            </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                    </a>

                    <a
                        href="https://developers.facebook.com/docs/whatsapp/cloud-api"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                    >
                        <ExternalLink className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                WhatsApp API Docs
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Learn about WhatsApp Cloud API
                            </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppSettings;