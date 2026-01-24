import React from 'react';
import { X, Check, Star, AlertCircle } from 'lucide-react';

interface PricingPlansProps {
  isOpen: boolean;
  onClose: () => void;
}

const PricingPlans: React.FC<PricingPlansProps> = ({ isOpen, onClose }) => {
  // Plans Data
  const plans = [
    {
      id: 'demo',
      name: 'Free Demo',
      price: 'Free',
      validity: '2 Days',
      features: [
        { name: '100 Messages', included: true },
        { name: 'Limited Campaigns', included: true },
        { name: 'Limited Contacts', included: true },
        { name: 'Automation', included: false },
        { name: 'Campaign Retry', included: false },
        { name: 'Webhooks', included: false },
        { name: 'Flow Builder', included: false },
        { name: 'Mobile + API Same Number', included: false },
        { name: 'Basic Number Safety', included: true },
        { name: 'Support', included: false },
      ],
      color: 'border-gray-200',
      btnColor: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      recommended: false
    },
    {
      id: 'monthly',
      name: 'Monthly',
      price: '₹899',
      validity: '1 Month',
      features: [
        { name: 'Unlimited Messages*', included: true },
        { name: 'Unlimited Campaigns', included: true },
        { name: 'Unlimited Contacts', included: true },
        { name: 'Automation', included: false },
        { name: 'Campaign Retry', included: false },
        { name: 'Webhooks', included: true },
        { name: 'Flow Builder', included: true },
        { name: 'Mobile + API Same Number', included: false },
        { name: 'Standard Number Safety', included: true },
        { name: 'Standard Support', included: true },
      ],
      color: 'border-blue-200',
      btnColor: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      recommended: false
    },
    {
      id: '3month',
      name: '3-Month',
      price: '₹2,500',
      validity: '3 Months',
      features: [
        { name: 'Unlimited Messages*', included: true },
        { name: 'Unlimited Campaigns', included: true },
        { name: 'Unlimited Contacts', included: true },
        { name: 'Basic Automation', included: true },
        { name: 'Campaign Retry', included: false },
        { name: 'Webhooks', included: true },
        { name: 'Flow Builder', included: true },
        { name: 'Mobile + API Same Number', included: false },
        { name: 'Good Number Safety', included: true },
        { name: 'Standard Support', included: true },
      ],
      color: 'border-purple-200',
      btnColor: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
      recommended: false
    },
    {
      id: '6month',
      name: '6-Month',
      price: '₹5,000',
      validity: '6 Months',
      features: [
        { name: 'Unlimited Messages*', included: true },
        { name: 'Unlimited Campaigns', included: true },
        { name: 'Unlimited Contacts', included: true },
        { name: 'Advanced Automation', included: true },
        { name: 'Campaign Retry ✅', included: true },
        { name: 'Webhooks', included: true },
        { name: 'Flow Builder', included: true },
        { name: 'Mobile + API Same Number ✅', included: true },
        { name: 'High Safety (Active) 🛡️', included: true },
        { name: 'Priority Support', included: true },
      ],
      color: 'border-green-500 shadow-xl shadow-green-100',
      btnColor: 'bg-green-600 text-white hover:bg-green-700',
      recommended: true,
      tag: 'RECOMMENDED'
    },
    {
      id: 'yearly',
      name: '1-Year',
      price: '₹8,999',
      validity: '12 Months',
      features: [
        { name: 'Unlimited Messages*', included: true },
        { name: 'Unlimited Campaigns', included: true },
        { name: 'Unlimited Contacts', included: true },
        { name: 'Full Automation', included: true },
        { name: 'Campaign Retry ✅', included: true },
        { name: 'Webhooks', included: true },
        { name: 'Flow Builder', included: true },
        { name: 'Mobile + API Same Number ✅', included: true },
        { name: 'Maximum Safety 🛡️', included: true },
        { name: 'Priority Support', included: true },
      ],
      color: 'border-orange-500 shadow-xl shadow-orange-100',
      btnColor: 'bg-orange-600 text-white hover:bg-orange-700',
      recommended: true,
      tag: 'BEST VALUE'
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[95vw] h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
            <p className="text-gray-500 text-sm mt-1">Select the best plan for your business needs</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Plans Container */}
        <div className="flex-1 overflow-x-auto overflow-y-auto bg-gray-50/30 p-6">
          <div className="flex space-x-6 min-w-max pb-4">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`relative w-80 bg-white rounded-2xl border-2 p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${plan.color}`}
              >
                {/* Badge */}
                {plan.recommended && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white shadow-md flex items-center space-x-1 ${
                    plan.id === '6month' ? 'bg-green-600' : 'bg-orange-600'
                  }`}>
                    <Star className="w-3 h-3 fill-white" />
                    <span>{plan.tag}</span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline justify-center">
                    <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                    {plan.price !== 'Free' && <span className="text-sm text-gray-500 ml-1">/ {plan.validity}</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Validity: {plan.validity}</p>
                </div>

                {/* Features List */}
                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 mr-2 shrink-0 mt-0.5" />
                      )}
                      <span className={`${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <button 
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${plan.btnColor}`}
                  onClick={() => alert(`Selected ${plan.name} Plan`)}
                >
                  Choose {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-4 border-t border-gray-100 bg-white text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            *Unlimited messages are subject to Meta's Fair Usage Policy and your tier limit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;