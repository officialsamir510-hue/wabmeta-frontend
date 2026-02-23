// src/pages/admin/SubscriptionManagement.tsx

import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    Users,
    TrendingUp,
    Plus,
    Edit,
    Trash2,
    Search,
    RefreshCw,
} from 'lucide-react';
import { admin } from '../../services/api';
import toast from 'react-hot-toast';

// Components
import AssignPlanModal from '../../components/admin/AssignPlanModal';
import ExtendSubscriptionModal from '../../components/admin/ExtendSubscriptionModal';

const SubscriptionManagement: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [planFilter, setPlanFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modals
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [extendModalOpen, setExtendModalOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, [page, statusFilter, planFilter, search]);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [subsRes, statsRes] = await Promise.all([
                admin.getSubscriptions({
                    page,
                    limit: 20,
                    status: statusFilter || undefined,
                    planType: planFilter || undefined,
                    search: search || undefined,
                }),
                admin.getSubscriptionStats(),
            ]);

            if (subsRes.data.success) {
                setSubscriptions(subsRes.data.data.subscriptions || []);
                setTotalPages(subsRes.data.data.meta?.totalPages || 1);
            }

            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }
        } catch (error: any) {
            console.error('Fetch error:', error);
            toast.error('Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignPlan = (org: any) => {
        setSelectedOrg(org);
        setAssignModalOpen(true);
    };

    const handleExtendSubscription = (org: any) => {
        setSelectedOrg(org);
        setExtendModalOpen(true);
    };

    const handleRevokeSubscription = async (org: any) => {
        const confirmed = confirm(
            `Revoke subscription for "${org.organization.name}"?\n\nThis will downgrade them to the free plan.`
        );

        if (!confirmed) return;

        try {
            const loadingToast = toast.loading('Revoking subscription...');

            const response = await admin.revokeSubscription(org.organizationId, {
                reason: 'Revoked by admin',
                immediate: true,
            });

            toast.dismiss(loadingToast);

            if (response.data.success) {
                toast.success('Subscription revoked successfully');
                fetchData();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to revoke subscription');
        }
    };

    if (loading && !subscriptions.length) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <RefreshCw className="w-10 h-10 animate-spin text-green-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading subscriptions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
                    <p className="mt-1 text-gray-600">Manage user subscriptions and plans</p>
                </div>
                <button
                    onClick={() => setAssignModalOpen(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Assign Plan
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        title="Total Subscriptions"
                        value={stats.total}
                        icon={Users}
                        color="blue"
                    />
                    <StatCard
                        title="Active"
                        value={stats.active}
                        icon={TrendingUp}
                        color="green"
                    />
                    <StatCard
                        title="Expired"
                        value={stats.expired}
                        icon={Clock}
                        color="orange"
                    />
                    <StatCard
                        title="Cancelled"
                        value={stats.cancelled}
                        icon={Trash2}
                        color="red"
                    />
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search organizations..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="EXPIRED">Expired</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Plan Type
                        </label>
                        <select
                            value={planFilter}
                            onChange={(e) => setPlanFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="">All Plans</option>
                            <option value="FREE_DEMO">Free Demo</option>
                            <option value="MONTHLY">Monthly</option>
                            <option value="QUARTERLY">3-Month</option>
                            <option value="BIANNUAL">6-Month</option>
                            <option value="ANNUAL">1-Year</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Subscriptions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Organization
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Plan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Expires
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {subscriptions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {sub.organization.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {sub.organization.owner.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-gray-900">
                                            {sub.plan?.name || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${sub.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-800'
                                                : sub.status === 'EXPIRED'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {new Date(sub.currentPeriodEnd).toLocaleDateString('en-IN')}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {sub.daysRemaining > 0 ? `${sub.daysRemaining} days left` : 'Expired'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`text-xs ${sub.isManual ? 'text-purple-600 font-medium' : 'text-gray-500'
                                                }`}
                                        >
                                            {sub.isManual ? '👑 Manual' : 'Auto'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleAssignPlan(sub)}
                                            className="text-blue-600 hover:text-blue-700"
                                            title="Change Plan"
                                        >
                                            <Edit className="w-4 h-4 inline" />
                                        </button>
                                        <button
                                            onClick={() => handleExtendSubscription(sub)}
                                            className="text-green-600 hover:text-green-700"
                                            title="Extend"
                                        >
                                            <Calendar className="w-4 h-4 inline" />
                                        </button>
                                        <button
                                            onClick={() => handleRevokeSubscription(sub)}
                                            className="text-red-600 hover:text-red-700"
                                            title="Revoke"
                                        >
                                            <Trash2 className="w-4 h-4 inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AssignPlanModal
                isOpen={assignModalOpen}
                onClose={() => {
                    setAssignModalOpen(false);
                    setSelectedOrg(null);
                }}
                onSuccess={fetchData}
                organization={selectedOrg}
            />

            <ExtendSubscriptionModal
                isOpen={extendModalOpen}
                onClose={() => {
                    setExtendModalOpen(false);
                    setSelectedOrg(null);
                }}
                onSuccess={fetchData}
                subscription={selectedOrg}
            />
        </div>
    );
};

// ============================================
// STAT CARD COMPONENT
// ============================================

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ElementType;
    color: 'blue' | 'green' | 'orange' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => {
    const colors = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        orange: 'bg-orange-100 text-orange-600',
        red: 'bg-red-100 text-red-600',
    };

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-xl ${colors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};

export default SubscriptionManagement;