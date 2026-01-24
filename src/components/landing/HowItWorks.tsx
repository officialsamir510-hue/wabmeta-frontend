// src/components/landing/HowItWorks.tsx
import React from 'react';
import { 
  UserPlus, 
  Link2, 
  MessageSquare, 
  Rocket,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      icon: UserPlus,
      title: 'Create Account',
      description: 'Sign up for free and complete your profile setup in under 2 minutes.',
      details: [
        'No credit card required',
        'Instant account activation',
        '14-day free trial included'
      ]
    },
    {
      step: '02',
      icon: Link2,
      title: 'Connect WhatsApp',
      description: 'Link your WhatsApp Business account using Meta Business API integration.',
      details: [
        'Easy API connection',
        'Secure authentication',
        'Full Meta compliance'
      ]
    },
    {
      step: '03',
      icon: MessageSquare,
      title: 'Import Contacts',
      description: 'Upload your contact list and organize them with tags and segments.',
      details: [
        'CSV/Excel upload',
        'Smart segmentation',
        'Duplicate detection'
      ]
    },
    {
      step: '04',
      icon: Rocket,
      title: 'Start Messaging',
      description: 'Create campaigns, set up automations, and start engaging with customers.',
      details: [
        'Template library',
        'Personalization',
        'Real-time analytics'
      ]
    }
  ];

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Get Started in{' '}
            <span className="gradient-text">4 Easy Steps</span>
          </h2>
          <p className="text-xl text-gray-600">
            From sign-up to sending your first campaign in minutes, not hours.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] h-1 bg-gradient-to-r from-primary-500 via-whatsapp-teal to-primary-500 rounded-full"></div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-whatsapp-teal rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                      {step.step}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="mt-6 mb-6">
                    <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center">
                      <step.icon className="w-8 h-8 text-primary-500" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {step.description}
                  </p>

                  {/* Details */}
                  <ul className="space-y-2">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center text-sm text-gray-500">
                        <CheckCircle2 className="w-4 h-4 text-primary-500 mr-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Arrow for larger screens */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-4 top-24 z-10">
                    <ArrowRight className="w-8 h-8 text-primary-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <button className="inline-flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
            <span>Start Your Free Trial</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="mt-4 text-gray-500">No credit card required • 14-day free trial</p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;