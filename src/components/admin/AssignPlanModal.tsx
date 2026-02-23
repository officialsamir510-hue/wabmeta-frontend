// src/components/admin/AssignPlanModal.tsx

import React, { useState, useEffect } from 'react';
import {
    X,
    User,
    Award,
    Search,
    Check,
    Star,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import { admin, billing } from '../../services/api';
import toast from 'react-hot-toast';

interface Plan {
    id: string;
    name: string;
    type: string;
    slug: string;
    monthlyPrice: number;
    validityDays?: number;
    isRecommended?: boolean;
}

interface Organization {
    id: string;
    name: string;
    owner?: {
        email: string;
        firstName?: string;
        lastName?: string;
    };
}

interface AssignPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    organization?: any; // Pre-selected organization
}

const AssignPlanModal: React.FC<AssignPlanModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    organization,
}) => {
    const [step, setStep] = useState<'org' | 'plan' | 'confirm'>('org');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Organization search
    const [orgSearch, setOrgSearch] = useState('');
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

    // Plan selection
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

    // Custom validity
    const [validityType, setValidityType] = useState<'default' | 'custom'>('default');
    const [customDays, setCustomDays] = useState<number>(30);
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [reason, setReason] = useState('');

    // Reset on open/close
    useEffect(() => {
        if (isOpen) {
            if (organization?.organization) {
                // Pre-selected organization from table
                setSelectedOrg({
                    id: organization.organizationId || organization.organization.id,
                    name: organization.organization.name,
                    owner: organization.organization.owner,
                });
                setStep('plan');
            } else {
                setStep('org');
                setSelectedOrg(null);
            }
            setSelectedPlan(null);
            setValidityType('default');
            setCustomDays(30);
            setCustomEndDate('');
            setReason('');
            fetchPlans();
        }
    }, [isOpen, organization]);

    // Search organizations
    useEffect(() => {
        if (orgSearch.length >= 2) {
            searchOrganizations();
        } else {
            setOrganizations([]);
        }
    }, [orgSearch]);

    const searchOrganizations = async () => {
        try {
            setLoading(true);
            const response = await admin.getOrganizations({ search: orgSearch, limit: 10 });
            if (response.data.success) {
                setOrganizations(response.data.data.organizations || response.data.data || []);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPlans = async () => {
        try {
            const response = await billing.getPlans();
            if (response.data.success) {
                setPlans(response.data.data || []);
            }
        } catch (error) {
            console.error('Fetch plans error:', error);
        }
    };

    const handleSelectOrg = (org: Organization) => {
        setSelectedOrg(org);
        setStep('plan');
    };

    const handleSelectPlan = (plan: Plan) => {
        setSelectedPlan(plan);
        setCustomDays(plan.validityDays || 30);
        setStep('confirm');
    };

    const handleSubmit = async () => {
        if (!selectedOrg || !selectedPlan) {
            toast.error('Please select organization and plan');
            return;
        }

        try {
            setSubmitting(true);

            const payload: any = {
                organizationId: selectedOrg.id,
                planSlug: selectedPlan.slug,
                reason: reason || `Plan assigned by admin`,
            };

            if (validityType === 'custom') {
                if (customEndDate) {
                    payload.customEndDate = customEndDate;
                } else {
                    payload.validityDays = customDays;
                }
            }

            const response = await admin.assignPlan(payload);

            if (response.data.success) {
                toast.success(response.data.message || 'Plan assigned successfully!');
                onSuccess();
                onClose();
            } else {
                throw new Error(response.data.message);
            }
        } catch (error: any) {
            console.error('Assign plan error:', error);
            toast.error(error.message || 'Failed to assign plan');
        } finally {
            setSubmitting(false);
        }
    };

    const getValidityDisplay = () => {
        if (validityType === 'custom') {
            if (customEndDate) {
                return `Until ${new Date(customEndDate).toLocaleDateString('en-IN')}`;
            }
            return `${customDays} days`;
        }
        return `${selectedPlan?.validityDays || 30} days (default)`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                            <Award className="w-6 h-6 mr-2 text-green-600" />
                            Assign Plan
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {step === 'org' && 'Step 1: Select Organization'}
                            {step === 'plan' && 'Step 2: Select Plan'}
                            {step === 'confirm' && 'Step 3: Confirm Assignment'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {/* Step 1: Select Organization */}
                    {step === 'org' && (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={orgSearch}
                                    onChange={(e) => setOrgSearch(e.target.value)}
                                    placeholder="Search by organization name or email..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    autoFocus
                                />
                            </div>

                            {loading && (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                                </div>
                            )}

                            {!loading && organizations.length > 0 && (
                                <div className="space-y-2">
                                    {organizations.map((org) => (
                                        <button
                                            key={org.id}
                                            onClick={() => handleSelectOrg(org)}
                                            className="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                        >
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                                                    <User className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {org.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {org.owner?.email || 'No email'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Check className="w-5 h-5 text-gray-400" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {!loading && orgSearch.length >= 2 && organizations.length === 0 && (
                                <div className="text-center py-8">
                                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No organizations found</p>
                                </div>
                            )}

                            {!loading && orgSearch.length < 2 && (
                                <div className="text-center py-8">
                                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">
                                        Type at least 2 characters to search
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Select Plan */}
                    {step === 'plan' && (
                        <div className="space-y-4">
                            {/* Selected Organization */}
                            {selectedOrg && (
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <User className="w-5 h-5 text-green-600 mr-2" />
                                            <div>
                                                <p className="font-medium text-green-800 dark:text-green-200">
                                                    {selectedOrg.name}
                                                </p>
                                                <p className="text-sm text-green-600 dark:text-green-400">
                                                    {selectedOrg.owner?.email}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setStep('org')}
                                            className="text-sm text-green-700 hover:underline"
                                        >
                                            Change
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Plans Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {plans.map((plan) => (
                                    <button
                                        key={plan.id}
                                        onClick={() => handleSelectPlan(plan)}
                                        className={`relative p-4 border-2 rounded-xl text-left transition-all hover:shadow-md ${plan.isRecommended
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                                            }`}
                                    >
                                        {plan.isRecommended && (
                                            <span className="absolute -top-2 right-4 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                                                <Star className="w-3 h-3 mr-1" />
                                                Recommended
                                            </span>
                                        )}
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {plan.name}
                                        </h3>
                                        <p className="text-2xl font-bold text-green-600 mt-1">
                                            ₹{plan.monthlyPrice.toLocaleString('en-IN')}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {plan.validityDays} days validity
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Confirm */}
                    {step === 'confirm' && selectedOrg && selectedPlan && (
                        <div className="space-y-6">
                            {/* Summary */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Organization:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {selectedOrg.name}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Plan:</span>
                                    <span className="font-medium text-green-600">{selectedPlan.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Price:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        ₹{selectedPlan.monthlyPrice.toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Validity:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {getValidityDisplay()}
                                    </span>
                                </div>
                            </div>

                            {/* Validity Options */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Subscription Validity
                                </label>
                                <div className="space-y-3">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="validity"
                                            value="default"
                                            checked={validityType === 'default'}
                                            onChange={() => setValidityType('default')}
                                            className="w-4 h-4 text-green-600"
                                        />
                                        <span className="ml-2 text-gray-700 dark:text-gray-300">
                                            Use default validity ({selectedPlan.validityDays || 30} days)
                                        </span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="validity"
                                            value="custom"
                                            checked={validityType === 'custom'}
                                            onChange={() => setValidityType('custom')}
                                            className="w-4 h-4 text-green-600"
                                        />
                                        <span className="ml-2 text-gray-700 dark:text-gray-300">
                                            Custom validity
                                        </span>
                                    </label>

                                    {validityType === 'custom' && (
                                        <div className="ml-6 grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">
                                                    Days
                                                </label>
                                                <input
                                                    type="number"
                                                    value={customDays}
                                                    onChange={(e) => {
                                                        setCustomDays(parseInt(e.target.value) || 30);
                                                        setCustomEndDate('');
                                                    }}
                                                    min={1}
                                                    max={365}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">
                                                    Or End Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={customEndDate}
                                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Reason (Optional)
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Enter reason for this assignment..."
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                />
                            </div>

                            {/* Warning */}
                            <div className="flex items-start p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                                    <p className="font-medium">Important:</p>
                                    <ul className="list-disc list-inside mt-1">
                                        <li>This will immediately activate the subscription</li>
                                        <li>No payment will be collected</li>
                                        <li>This action will be logged for audit</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <button
                        onClick={() => {
                            if (step === 'plan') setStep('org');
                            else if (step === 'confirm') setStep('plan');
                            else onClose();
                        }}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                        {step === 'org' ? 'Cancel' : 'Back'}
                    </button>

                    {step === 'confirm' && (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Assigning...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Confirm Assignment
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignPlanModal;