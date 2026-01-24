import React, { useState } from 'react';
import { CheckCircle2, Zap } from 'lucide-react';
import PricingPlans from './PricingPlans';
import { usePlanAccess } from '../../hooks/usePlanAccess';

const CurrentPlan: React.FC = () => {
  const { currentPlan } = usePlanAccess();
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Helper to get Plan Details based on currentPlan key
  const getPlanDetails = (plan: string) => {
    switch (plan) {
      case 'yearly': 
        return { name: '1-Year Plan ⭐', price: '₹8,999', period: '/year', features: ['All Features', 'Priority Support'] };
      case '6month': 
        return { name: '6-Month Plan', price: '₹5,000', period: '/6mo', features: ['Chatbot', 'Automation'] };
      case '3month': 
        return { name: '3-Month Plan', price: '₹2,500', period: '/3mo', features: ['Chatbot'] };
      case 'monthly': 
        return { name: 'Monthly Plan', price: '₹899', period: '/mo', features: ['Basic Features'] };
      default: 
        return { name: 'Free Trial', price: 'Free', period: '', features: ['Limited Features'] };
    }
  };

  const details = getPlanDetails(currentPlan);

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900">{details.name}</h3>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Active
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              Next billing date: <span className="font-medium text-gray-900">Feb 15, 2024</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {details.price}
              <span className="text-sm font-normal text-gray-500">{details.period}</span>
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {details.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>{feature}</span>
            </div>
          ))}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Unlimited Team Members</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Advanced Analytics & Reports</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
          <button 
            onClick={() => setShowUpgrade(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
          >
            <Zap className="w-4 h-4" />
            <span>Upgrade Plan</span>
          </button>
          <button className="text-sm text-gray-500 hover:text-gray-700 font-medium">
            Cancel Subscription
          </button>
        </div>
      </div>

      <PricingPlans isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  );
};

export default CurrentPlan;