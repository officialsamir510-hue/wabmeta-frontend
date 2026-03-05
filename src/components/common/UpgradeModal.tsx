import { X, Crown, Check, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    feature?: string;
    minimumPlan?: string;
    limitType?: string;
    used?: number;
    limit?: number;
    message?: string;
}

export default function UpgradeModal({ isOpen, onClose, feature, minimumPlan, message }: Props) {
    if (!isOpen) return null;

    const plans = [
        {
            id: 'MONTHLY',
            name: 'Monthly',
            price: '₹899',
            period: '/month',
            features: [
                'CSV Import ✅',
                'Simple Bulk Paste ❌',
                '2,500 Contacts',
                '5,000 Messages/month',
                '1 WhatsApp Account'
            ],
            highlight: minimumPlan === 'MONTHLY'
        },
        {
            id: 'QUARTERLY',
            name: 'Quarterly',
            price: '₹2,500',
            period: '/3 months',
            features: [
                'CSV Import ✅',
                'Simple Bulk Paste ✅',
                '10,000 Contacts',
                '25,000 Messages/month',
                '2 WhatsApp Accounts',
                'Priority Support'
            ],
            highlight: minimumPlan === 'QUARTERLY',
            popular: true
        },
        {
            id: 'ANNUAL',
            name: 'Annual',
            price: '₹8,000',
            period: '/year',
            features: [
                'All Features ✅',
                'Unlimited Contacts',
                'Unlimited Messages',
                '5 WhatsApp Accounts',
                'Dedicated Support',
                'API Access'
            ],
            highlight: minimumPlan === 'ANNUAL'
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />

            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="text-center p-8 bg-gradient-to-br from-purple-600 via-blue-600 to-green-500 text-white">
                    <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Crown className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Upgrade Your Plan</h2>
                    <p className="text-white/80 text-lg">
                        {message ? message : (
                            <>Unlock <span className="font-bold text-yellow-300">{feature || 'powerful features'}</span> to level up your business</>
                        )}
                    </p>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Plans Grid */}
                <div className="p-8">
                    <div className="grid md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative p-6 rounded-2xl border-2 transition-all ${plan.popular
                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-xl scale-105'
                                    : plan.highlight
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold rounded-full shadow-lg">
                                        <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                                        MOST POPULAR
                                    </div>
                                )}

                                {plan.highlight && !plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                                        MINIMUM REQUIRED
                                    </div>
                                )}

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {plan.name}
                                </h3>
                                <div className="mb-4">
                                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {plan.price}
                                    </span>
                                    <span className="text-gray-500">{plan.period}</span>
                                </div>

                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((feat, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm">
                                            <Check className="w-4 h-4 text-green-500 shrink-0" />
                                            <span className="text-gray-700 dark:text-gray-300">{feat}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    to="/dashboard/billing"
                                    onClick={onClose}
                                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${plan.popular
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:scale-[1.02]'
                                        : plan.highlight
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    Select Plan
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-900/50">
                    <p className="text-sm text-gray-500">
                        💳 Secure payment via Razorpay • 📧 Questions? <a href="mailto:support@wabmeta.com" className="text-purple-600 hover:underline font-medium">Contact Support</a>
                    </p>
                </div>
            </div>
        </div>
    );
}