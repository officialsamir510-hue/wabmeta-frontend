// src/components/landing/CTA.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, MessageSquare } from 'lucide-react';

const CTA: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-whatsapp-teal/20 rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-whatsapp-teal rounded-2xl flex items-center justify-center mx-auto mb-8 animate-float">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>

          {/* Headline */}
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Ready to Transform Your{' '}
            <span className="gradient-text">Customer Engagement?</span>
          </h2>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Join 10,000+ businesses already using WabMeta to grow their business with WhatsApp.
          </p>

          {/* Features */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
            {['No credit card required', '14-day free trial', 'Cancel anytime'].map((feature) => (
              <div key={feature} className="flex items-center space-x-2 text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-primary-400" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/signup"
              className="group inline-flex items-center space-x-2 bg-primary-500 hover:bg-primary-400 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-primary-500/25"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              to="/demo"
              className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl border border-white/20 transition-all duration-300"
            >
              <span>Schedule Demo</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;