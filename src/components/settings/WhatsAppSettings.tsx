import { useState, useEffect } from 'react';
import {
    Phone,
    CheckCircle,
    Trash2,
    Loader2,
    Star,
    Cloud,
    Smartphone,
    Plus
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface WhatsAppAccount {
    id: string;
    phoneNumber: string;
    displayName: string;
    verifiedName: string;
    qualityRating: string;
    status: string;
    connectionType: 'CLOUD_API' | 'WHATSAPP_BUSINESS_APP';
    isDefault: boolean;
    createdAt: string;
}

export default function WhatsAppSettings() {
    const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [selectedConnectionType, setSelectedConnectionType] = useState<'CLOUD_API' | 'WHATSAPP_BUSINESS_APP'>('CLOUD_API');

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const { data } = await api.get('/meta/accounts');
            setAccounts(data.data || []);
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (type: 'CLOUD_API' | 'WHATSAPP_BUSINESS_APP') => {
        setSelectedConnectionType(type);
        setConnecting(true);

        try {
            // Get OAuth URL with connection type
            const { data } = await api.get('/meta/oauth-url', {
                params: { connectionType: type }
            });

            // Store connection type for callback
            localStorage.setItem('wabmeta_connection_type', type);

            // Redirect to OAuth
            window.location.href = data.data.url;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to start connection');
            setConnecting(false);
        }
    };

    const handleDisconnect = async (accountId: string) => {
        if (!confirm('Are you sure you want to disconnect this account?')) return;

        try {
            await api.post(`/meta/accounts/${accountId}/disconnect`);
            toast.success('Account disconnected');
            fetchAccounts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to disconnect');
        }
    };

    const handleSetDefault = async (accountId: string) => {
        try {
            await api.post(`/meta/accounts/${accountId}/set-default`);
            toast.success('Default account updated');
            fetchAccounts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to set default');
        }
    };

    const getConnectionIcon = (type: string) => {
        if (type === 'WHATSAPP_BUSINESS_APP') {
            return <Smartphone className="w-5 h-5 text-green-600" />;
        }
        return <Cloud className="w-5 h-5 text-blue-600" />;
    };

    const getConnectionLabel = (type: string) => {
        if (type === 'WHATSAPP_BUSINESS_APP') {
            return 'WhatsApp Business App';
        }
        return 'Cloud API';
    };

    const getConnectionBadgeColor = (type: string) => {
        if (type === 'WHATSAPP_BUSINESS_APP') {
            return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        }
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    const connectedAccounts = accounts.filter(a => a.status === 'CONNECTED');
    const cloudApiAccount = connectedAccounts.find(a => a.connectionType === 'CLOUD_API');
    const businessAppAccount = connectedAccounts.find(a => a.connectionType === 'WHATSAPP_BUSINESS_APP');

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">WhatsApp Connections</h2>
                <p className="text-gray-500 mt-1">Connect your WhatsApp accounts to send messages</p>
            </div>

            {/* ✅ Connection Options */}
            <div className="grid md:grid-cols-2 gap-6">

                {/* Cloud API Connection */}
                <div className={`p-6 rounded-2xl border-2 transition-all ${cloudApiAccount
                    ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                                <Cloud className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Cloud API</h3>
                                <p className="text-sm text-gray-500">Meta's official Cloud API</p>
                            </div>
                        </div>
                        {cloudApiAccount && (
                            <span className="px-2.5 py-1 bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-xs font-semibold rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Connected
                            </span>
                        )}
                    </div>

                    {cloudApiAccount ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <Phone className="w-4 h-4 text-blue-600" />
                                <span className="font-mono font-semibold">{cloudApiAccount.phoneNumber}</span>
                                {cloudApiAccount.isDefault && (
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                )}
                            </div>
                            <p className="text-sm text-gray-500">{cloudApiAccount.displayName || cloudApiAccount.verifiedName}</p>

                            <div className="flex items-center gap-2 mt-4">
                                <button
                                    onClick={() => handleDisconnect(cloudApiAccount.id)}
                                    className="flex items-center gap-2 px-3 py-2 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Disconnect
                                </button>
                                {!cloudApiAccount.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(cloudApiAccount.id)}
                                        className="flex items-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 text-sm"
                                    >
                                        <Star className="w-4 h-4" />
                                        Set Default
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-gray-500 mb-4">
                                Connect using Meta's Cloud API for high-volume messaging with advanced features.
                            </p>
                            <button
                                onClick={() => handleConnect('CLOUD_API')}
                                disabled={connecting}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-semibold"
                            >
                                {connecting && selectedConnectionType === 'CLOUD_API' ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Plus className="w-5 h-5" />
                                )}
                                Connect Cloud API
                            </button>
                        </div>
                    )}
                </div>

                {/* WhatsApp Business App Connection */}
                <div className={`p-6 rounded-2xl border-2 transition-all ${businessAppAccount
                    ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                                <Smartphone className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">WhatsApp Business App</h3>
                                <p className="text-sm text-gray-500">Direct app connection</p>
                            </div>
                        </div>
                        {businessAppAccount && (
                            <span className="px-2.5 py-1 bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-xs font-semibold rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Connected
                            </span>
                        )}
                    </div>

                    {businessAppAccount ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <Phone className="w-4 h-4 text-green-600" />
                                <span className="font-mono font-semibold">{businessAppAccount.phoneNumber}</span>
                                {businessAppAccount.isDefault && (
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                )}
                            </div>
                            <p className="text-sm text-gray-500">{businessAppAccount.displayName || businessAppAccount.verifiedName}</p>

                            <div className="flex items-center gap-2 mt-4">
                                <button
                                    onClick={() => handleDisconnect(businessAppAccount.id)}
                                    className="flex items-center gap-2 px-3 py-2 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Disconnect
                                </button>
                                {!businessAppAccount.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(businessAppAccount.id)}
                                        className="flex items-center gap-2 px-3 py-2 text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 text-sm"
                                    >
                                        <Star className="w-4 h-4" />
                                        Set Default
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-gray-500 mb-4">
                                Connect your existing WhatsApp Business App for seamless integration.
                            </p>
                            <button
                                onClick={() => handleConnect('WHATSAPP_BUSINESS_APP')}
                                disabled={connecting}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-semibold"
                            >
                                {connecting && selectedConnectionType === 'WHATSAPP_BUSINESS_APP' ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Plus className="w-5 h-5" />
                                )}
                                Connect Business App
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* All Connected Accounts Summary */}
            {connectedAccounts.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">All Connected Accounts</h3>

                    <div className="space-y-3">
                        {connectedAccounts.map((account) => (
                            <div
                                key={account.id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl"
                            >
                                <div className="flex items-center gap-4">
                                    {getConnectionIcon(account.connectionType)}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {account.phoneNumber}
                                            </span>
                                            {account.isDefault && (
                                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {account.displayName || account.verifiedName}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getConnectionBadgeColor(account.connectionType)}`}>
                                        {getConnectionLabel(account.connectionType)}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${account.qualityRating === 'GREEN'
                                        ? 'bg-green-100 text-green-700'
                                        : account.qualityRating === 'YELLOW'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-red-100 text-red-700'
                                        }`}>
                                        {account.qualityRating}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}