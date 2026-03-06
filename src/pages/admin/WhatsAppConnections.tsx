import { useEffect, useState } from 'react';
import { Phone, Trash2, CheckCircle, XCircle, Building2, RefreshCw } from 'lucide-react';
import { admin } from '../../services/api';
import toast from 'react-hot-toast';

interface Connection {
    id: string;
    phoneNumber: string;
    displayName: string;
    verifiedName: string;
    qualityRating: string;
    status: string;
    isActive: boolean;
    createdAt: string;
    connectionType?: string;
    organization: {
        id: string;
        name: string;
        owner: {
            email: string;
            firstName: string;
            lastName: string;
        };
    };
}

export default function WhatsAppConnections() {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConnections();
    }, []);

    const fetchConnections = async () => {
        try {
            setLoading(true);
            const { data } = await admin.getWhatsAppConnections();
            setConnections(data.data || data);
        } catch (error) {
            toast.error('Failed to fetch connections');
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async (accountId: string, orgName: string) => {
        if (!window.confirm(`Disconnect WhatsApp for ${orgName}?`)) return;

        try {
            await admin.disconnectWhatsApp(accountId);
            toast.success('Account disconnected');
            fetchConnections();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        WhatsApp Connections
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Manage all connected WhatsApp accounts
                    </p>
                </div>
                <button
                    onClick={fetchConnections}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                Organization
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                Phone
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                Quality
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                Type
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                Status
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {connections.map((conn) => (
                            <tr key={conn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                            <Building2 className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {conn.organization.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {conn.organization.owner.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span className="font-mono font-medium text-gray-900 dark:text-white">
                                            {conn.phoneNumber}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {conn.verifiedName || conn.displayName}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${conn.qualityRating === 'GREEN' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            conn.qualityRating === 'YELLOW' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {conn.qualityRating}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {conn.connectionType || 'CLOUD_API'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {conn.status === 'CONNECTED' && conn.isActive ? (
                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="text-sm font-medium">Active</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                            <XCircle className="w-4 h-4" />
                                            <span className="text-sm font-medium">Inactive</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {conn.isActive && (
                                        <button
                                            onClick={() => handleDisconnect(conn.id, conn.organization.name)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Disconnect"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {connections.length === 0 && (
                    <div className="text-center py-12">
                        <Phone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">No WhatsApp connections found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
