// src/components/common/UpgradeModal.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Zap, AlertTriangle } from 'lucide-react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    limitType: string;
    used: number;
    limit: number;
    message?: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
    isOpen,
    onClose,
    limitType,
    used,
    limit,
    message,
}) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleUpgrade = () => {
        onClose();
        navigate('/dashboard/settings/billing');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                    Plan Limit Reached
                </h2>

                {/* Message */}
                <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
                    {message || `You've reached your ${limitType} limit.`}
                </p>

                {/* Usage Stats */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {limitType} Used
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {used} / {limit}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                            className="h-2 rounded-full bg-red-500"
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>

                {/* Upgrade Benefits */}
                <div className="space-y-2 mb-6">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Upgrade to unlock:
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li className="flex items-center">
                            <Zap className="w-4 h-4 text-green-500 mr-2" />
                            Unlimited {limitType}
                        </li>
                        <li className="flex items-center">
                            <Zap className="w-4 h-4 text-green-500 mr-2" />
                            Advanced automation
                        </li>
                        <li className="flex items-center">
                            <Zap className="w-4 h-4 text-green-500 mr-2" />
                            Priority support
                        </li>
                    </ul>
                </div>

                {/* Buttons */}
                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        Maybe Later
                    </button>
                    <button
                        onClick={handleUpgrade}
                        className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 flex items-center justify-center"
                    >
                        <Zap className="w-4 h-4 mr-2" />
                        Upgrade Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;