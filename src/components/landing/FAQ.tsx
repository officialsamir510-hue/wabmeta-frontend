// src/components/landing/FAQ.tsx
import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What is WabMeta and how does it work?',
      answer: 'WabMeta is a comprehensive WhatsApp Business API platform that allows businesses to send bulk messages, automate conversations with chatbots, manage customer interactions through a team inbox, and track performance with detailed analytics. We integrate directly with Meta\'s official WhatsApp Business API to ensure reliable and compliant messaging.'
    },
    {
      question: 'Do I need a WhatsApp Business Account?',
      answer: 'Yes, you need a WhatsApp Business Account to use WabMeta. If you don\'t have one, we\'ll help you set it up during the onboarding process. The setup typically takes 24-48 hours and our team will guide you through every step.'
    },
    {
      question: 'How much does it cost to send messages?',
      answer: 'Message costs depend on your plan and the type of conversation. Business-initiated conversations have different rates than user-initiated conversations. Our pricing page shows the exact costs, and we offer competitive rates with volume discounts for high-volume senders.'
    },
    {
      question: 'Can I import my existing contacts?',
      answer: 'Absolutely! You can easily import contacts via CSV or Excel files. Our system automatically detects duplicates, validates phone numbers, and allows you to segment contacts with tags and custom fields for targeted messaging.'
    },
    {
      question: 'Is there a free trial available?',
      answer: 'Yes! We offer a 14-day free trial with access to all features. No credit card required to start. You\'ll get 1,000 free messages to test the platform and see how it works for your business.'
    },
    {
      question: 'How secure is my data?',
      answer: 'Security is our top priority. We use end-to-end encryption, comply with GDPR and other data protection regulations, and store all data in secure, SOC 2 certified data centers. Your customer data is never shared with third parties.'
    },
    {
      question: 'Can I use WabMeta with my existing CRM?',
      answer: 'Yes! WabMeta offers native integrations with popular CRMs like Salesforce, HubSpot, and Zoho. We also provide a comprehensive REST API and webhooks for custom integrations with any system.'
    },
    {
      question: 'What kind of support do you offer?',
      answer: 'We offer multiple support channels including email, live chat, and phone support for higher-tier plans. Our knowledge base has extensive documentation, tutorials, and video guides. Enterprise customers get a dedicated account manager.'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked{' '}
            <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about WabMeta
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl border transition-all duration-300 ${
                openIndex === index 
                  ? 'border-primary-200 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-16 bg-gradient-to-r from-primary-50 to-green-50 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-primary-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Still have questions?</h3>
          <p className="text-gray-600 mb-6">
            Can't find the answer you're looking for? Our team is here to help.
          </p>
          <button className="inline-flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300">
            <MessageCircle className="w-5 h-5" />
            <span>Contact Support</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;