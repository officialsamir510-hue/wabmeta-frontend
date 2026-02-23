// src/components/billing/PricingPlans.tsx - COMPLETE NEW VERSION

import React from 'react';
import { X, Check, Star, Shield, Zap } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  type: string;
  slug: string;
  price: string;
  validity: string;
  features: { name: string; included: boolean }[];
  color: string;
  btnColor: string;
  recommended?: boolean;
  tag?: string;
  badge?: string;
}

interface PricingPlansProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (planSlug: string) => void;
}

const PricingPlans: React.FC<PricingPlansProps> = ({ isOpen, onClose, onSelect }) => {
  const plans: Plan[] = [
    {
      id: 'free-demo',
      name: 'Free Demo',
      type: 'FREE_DEMO',
      slug: 'free-demo',
      price: 'Free',
      validity: '2 Days',
      features: [
        { name: '100 Messages', included: true },
        { name: 'Limited Campaigns (1)', included: true },
        { name: 'Limited Contacts (50)', included: true },
        { name: 'Automation', included: false },
        { name: 'Campaign Retry', included: false },
        { name: 'Webhooks', included: false },
        { name: 'Flow Builder', included: false },
        { name: 'Mobile + API Same Number', included: false },
        { name: 'Basic Number Safety', included: true },
        { name: 'Support', included: false },
      ],
      color: 'border-gray-200 hover:border-gray-300',
      btnColor: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      recommended: false,
    },
    {
      id: 'monthly',
      name: 'Monthly',
      type: 'MONTHLY',
      slug: 'monthly',
      price: '₹899',
      validity: '1 Month',
      features: [
        { name: 'Unlimited* Messages', included: true },
        { name: 'Unlimited Campaigns', included: true },
        { name: 'Unlimited Contacts', included: true },
        { name: 'Automation', included: false },
        { name: 'Campaign Retry', included: false },
        { name: 'Webhooks ✅', included: true },
        { name: 'Flow Builder ✅', included: true },
        { name: 'Mobile + API Same Number', included: false },
        { name: 'Standard Number Safety', included: true },
        { name: 'Standard Support', included: true },
      ],
      color: 'border-blue-200 hover:border-blue-300',
      btnColor: 'bg-blue-600 text-white hover:bg-blue-700',
      recommended: false,
    },
    {
      id: '3-month',
      name: '3-Month',
      type: 'QUARTERLY',
      slug: '3-month',
      price: '₹2,500',
      validity: '3 Months',
      badge: 'Save ₹197',
      features: [
        { name: 'Unlimited* Messages', included: true },
        { name: 'Unlimited Campaigns', included: true },
        { name: 'Unlimited Contacts', included: true },
        { name: 'Basic Automation ✅', included: true },
        { name: 'Campaign Retry', included: false },
        { name: 'Webhooks ✅', included: true },
        { name: 'Flow Builder ✅', included: true },
        { name: 'Mobile + API Same Number', included: false },
        { name: 'Good Number Safety', included: true },
        { name: 'Standard Support', included: true },
      ],
      color: 'border-purple-200 hover:border-purple-300',
      btnColor: 'bg-purple-600 text-white hover:bg-purple-700',
      recommended: false,
    },
    {
      id: '6-month',
      name: '6-Month Plan',
      type: 'BIANNUAL',
      slug: '6-month',
      price: '₹5,000',
      validity: '6 Months',
      badge: 'Save ₹394',
      features: [
        { name: 'Unlimited* Messages', included: true },
        { name: 'Unlimited Campaigns', included: true },
        { name: 'Unlimited Contacts', included: true },
        { name: 'Advanced Automation ⚡', included: true },
        { name: 'Campaign Retry ✅', included: true },
        { name: 'Webhooks ✅', included: true },
        { name: 'Flow Builder ✅', included: true },
        { name: 'Mobile + API Same Number ✅', included: true },
        { name: 'High Safety (Active) 🛡️', included: true },
        { name: 'Priority Support 🎯', included: true },
      ],
      color: 'border-green-500 hover:border-green-600 shadow-xl shadow-green-100',
      btnColor: 'bg-green-600 text-white hover:bg-green-700',
      recommended: true,
      tag: 'RECOMMENDED',
    },
    {
      id: '1-year',
      name: '1-Year Plan',
      type: 'ANNUAL',
      slug: '1-year',
      price: '₹8,999',
      validity: '12 Months',
      badge: 'Save ₹1,789',
      features: [
        { name: 'Unlimited* Messages', included: true },
        { name: 'Unlimited Campaigns', included: true },
        { name: 'Unlimited Contacts', included: true },
        { name: 'Full Automation ⚡⚡', included: true },
        { name: 'Campaign Retry ✅', included: true },
        { name: 'Webhooks ✅', included: true },
        { name: 'Flow Builder ✅', included: true },
        { name: 'Mobile + API Same Number ✅', included: true },
        { name: 'Maximum Safety 🛡️🛡️', included: true },
        { name: 'Priority Support 🎯', included: true },
      ],
      color: 'border-orange-500 hover:border-orange-600 shadow-xl shadow-orange-100',
      btnColor: 'bg-orange-600 text-white hover:bg-orange-700',
      recommended: true,
      tag: 'BEST VALUE',
    },
  ];

  const handleSelect = (planSlug: string) => {
    if (onSelect) {
      onSelect(planSlug);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-[95vw] h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Zap className="w-6 h-6 mr-2 text-green-600" />
              Choose Your Perfect Plan
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Select the best plan for your business needs • All plans include core WhatsApp features
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Plans Container */}
        <div className="flex-1 overflow-x-auto overflow-y-auto bg-gray-50/30 dark:bg-gray-900/30 p-6">
          <div className="flex space-x-6 min-w-max pb-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative w-80 bg-white dark:bg-gray-800 rounded-2xl border-2 p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${plan.color}`}
              >
                {/* Recommended Badge */}
                {plan.recommended && (
                  <div
                    className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white shadow-md flex items-center space-x-1 ${plan.id === '6-month' ? 'bg-green-600' : 'bg-orange-600'
                      }`}
                  >
                    <Star className="w-3 h-3 fill-white" />
                    <span>{plan.tag}</span>
                  </div>
                )}

                {/* Savings Badge */}
                {plan.badge && !plan.recommended && (
                  <div className="absolute -top-3 right-4 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow">
                    {plan.badge}
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6 pt-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <div className="mt-2 flex items-baseline justify-center">
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    {plan.price !== 'Free' && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                        / {plan.validity}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Validity: {plan.validity}
                  </p>
                </div>

                {/* Features List */}
                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 dark:text-gray-600 mr-2 shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`${feature.included
                            ? 'text-gray-700 dark:text-gray-300'
                            : 'text-gray-400 dark:text-gray-600 line-through'
                          }`}
                      >
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Select Button */}
                <button
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${plan.btnColor}`}
                  onClick={() => handleSelect(plan.slug)}
                >
                  Choose {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Shield className="w-3 h-3 mr-1 text-green-600" />
              Secure payment via Razorpay
            </div>
            <div className="flex items-center">
              <Star className="w-3 h-3 mr-1 text-yellow-500" />
              *Subject to Meta's Fair Usage Policy
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;