import React from 'react';
import { Check, X, Star } from 'lucide-react';

const Pricing: React.FC = () => {
  // Removed unused isAnnual state

  const plans = [
    {
      name: 'Free Demo',
      price: 'Free',
      duration: '/2 days',
      features: [
        '100 Messages',
        'Limited Campaigns',
        'Basic Number Safety',
        'No Automation',
        'No Webhooks'
      ],
      cta: 'Try Now',
      highlight: false
    },
    {
      name: 'Monthly',
      price: '₹899',
      duration: '/month',
      features: [
        'Unlimited Messages*',
        'Unlimited Campaigns',
        'Standard Safety',
        'Webhooks & Flow Builder',
        'Standard Support'
      ],
      cta: 'Choose Monthly',
      highlight: false
    },
    {
      name: '3-Month',
      price: '₹2,500',
      duration: '/3 months',
      features: [
        'All Monthly Features',
        'Basic Automation',
        'Good Number Safety',
        'Standard Support',
        'No Campaign Retry'
      ],
      cta: 'Choose 3-Month',
      highlight: false
    },
    {
      name: '6-Month',
      price: '₹5,000',
      duration: '/6 months',
      features: [
        'Advanced Automation',
        'Mobile + API Same No. ✅',
        'Campaign Retry ✅',
        'High Safety (Active) 🛡️',
        'Priority Support'
      ],
      cta: 'Best Value',
      highlight: true,
      tag: 'RECOMMENDED'
    },
    {
      name: '1-Year',
      price: '₹8,999',
      duration: '/year',
      features: [
        'Full Automation Suite',
        'Mobile + API Same No. ✅',
        'Campaign Retry ✅',
        'Maximum Safety 🛡️',
        'Priority Support'
      ],
      cta: 'Go Annual',
      highlight: true,
      tag: 'SUPER SAVER'
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your business growth.
          </p>
        </div>

        {/* Scrollable Container for Mobile/Desktop */}
        <div className="flex flex-nowrap lg:grid lg:grid-cols-5 gap-6 overflow-x-auto pb-8 lg:pb-0 snap-x">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`flex-none w-80 lg:w-auto snap-center relative bg-white rounded-2xl p-6 border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl flex flex-col ${
                plan.highlight 
                  ? 'border-primary-500 shadow-lg scale-105 z-10' 
                  : 'border-gray-100 hover:border-primary-200'
              }`}
            >
              {plan.highlight && (
                <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white shadow-md flex items-center space-x-1 ${
                  plan.name === '6-Month' ? 'bg-green-600' : 'bg-orange-600'
                }`}>
                  <Star className="w-3 h-3 fill-white" />
                  <span>{plan.tag}</span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline justify-center">
                  <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-500 ml-1">{plan.duration}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-sm">
                    {feature.includes('No ') ? (
                      <X className="w-4 h-4 text-gray-400 mr-2 mt-0.5 shrink-0" />
                    ) : (
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                    )}
                    <span className={feature.includes('No ') ? 'text-gray-400' : 'text-gray-700'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button 
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  plan.highlight
                    ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
        
        <p className="text-center text-sm text-gray-500 mt-8">
          *Unlimited messages subject to Meta Fair Usage Policy & Tier Limits.
        </p>
      </div>
    </section>
  );
};

export default Pricing;