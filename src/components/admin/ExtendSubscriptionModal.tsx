// src/components/admin/ExtendSubscriptionModal.tsx

import React, { useState, useEffect } from 'react';
import {
    X,
    Calendar,
    Plus,
    Clock,
    Loader2,
} from 'lucide-react';
import { admin } from '../../services/api';
import toast from 'react-hot-toast';

interface ExtendSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    subscription: any;
}

const ExtendSubscriptionModal: React.FC<ExtendSubscriptionModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    subscription,
}) => {
    const [loading, setLoading] = useState(false);
    const [additionalDays, setAdditionalDays] = useState(30);
    const [reason, setReason] = useState('');

    // Quick add options
    const quickOptions = [7, 15, 30, 60, 90, 180, 365];

    useEffect(() => {
        if (isOpen) {
            setAdditionalDays(30);
            setReason('');
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!subscription || additionalDays <= 0) {
            toast.error('Invalid extension days');
            return;
        }

        try {
            setLoading(true);

            const response = await admin.extendSubscription(
                subscription.organizationId || subscription.organization?.id,
                {
                    additionalDays,
                    reason: reason || `Extended by ${additionalDays} days by admin`,
                }
            );

            if (response.data.success) {
                toast.success(response.data.message || 'Subscription extended!');
                onSuccess();
                onClose();
            } else {
                throw new Error(response.data.message);
            }
        } catch (error: any) {
            console.error('Extend error:', error);
            toast.error(error.message || 'Failed to extend subscription');
        } finally {
            setLoading(false);
        }
    };

    const getNewEndDate = () => {
        if (!subscription?.currentPeriodEnd) return null;

        const currentEnd = new Date(subscription.currentPeriodEnd);
        const now = new Date();
        const extendFrom = currentEnd > now ? currentEnd : now;

        return new Date(extendFrom.getTime() + additionalDays * 24 * 60 * 60 * 1000);
    };

    if (!isOpen || !subscription) return null;

    const newEndDate = getNewEndDate();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                            <Calendar className="w-6 h-6 mr-2 text-green-600" />
                            Extend Subscription
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Current Info */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Organization:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {subscription.organization?.name || 'Unknown'}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Current Plan:</span>
                            <span className="font-medium text-green-600">
                                {subscription.plan?.name || 'Unknown'}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Current End Date:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN')}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Days Remaining:</span>
                            <span className={`font-medium ${subscription.daysRemaining > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {subscription.daysRemaining > 0 ? `${subscription.daysRemaining} days` : 'Expired'}
                            </span>
                        </div>
                    </div>

                    {/* Quick Options */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Quick Add Days
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {quickOptions.map((days) => (
                                <button
                                    key={days}
                                    onClick={() => setAdditionalDays(days)}
                                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${additionalDays === days
                                        ? 'bg-green-600 text-white border-green-600'
                                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-green-400'
                                        }`}
                                >
                                    +{days} days
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Days Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Or Enter Custom Days
                        </label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                value={additionalDays}
                                onChange={(e) => setAdditionalDays(parseInt(e.target.value) || 0)}
                                min={1}
                                max={730}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            <span className="text-gray-500">days</span>
                        </div>
                    </div>

                    {/* New End Date Preview */}
                    {newEndDate && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Clock className="w-5 h-5 text-green-600 mr-2" />
                                    <span className="text-sm text-green-700 dark:text-green-300">
                                        New End Date:
                                    </span>
                                </div>
                                <span className="font-bold text-green-700 dark:text-green-300">
                                    {newEndDate.toLocaleDateString('en-IN', {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Reason (Optional)
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter reason for extension..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || additionalDays <= 0}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Extending...
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4 mr-2" />
                                Extend by {additionalDays} Days
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExtendSubscriptionModal;