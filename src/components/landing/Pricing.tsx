// src/components/landing/Pricing.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Star, Sparkles, Zap, Shield, Crown, Rocket, ArrowRight, BadgeCheck } from 'lucide-react';

interface Feature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface Plan {
  name: string;
  icon: React.ElementType;
  price: string;
  originalPrice: string | null;
  duration: string;
  description: string;
  features: Feature[];
  cta: string;
  highlight: boolean;
  gradient: string;
  bgGradient: string;
  tag?: string;
  tagColor?: string;
}

const Pricing: React.FC = () => {
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const plans: Plan[] = [
    {
      name: 'Free Demo',
      icon: Zap,
      price: 'Free',
      originalPrice: null,
      duration: '2 days trial',
      description: 'Perfect to test the waters',
      features: [
        { text: '100 Messages', included: true },
        { text: 'Limited Campaigns', included: true },
        { text: 'Basic Number Safety', included: true },
        { text: 'Automation', included: false },
        { text: 'Webhooks', included: false },
      ],
      cta: 'Start Free Trial',
      highlight: false,
      gradient: 'from-gray-500 to-gray-600',
      bgGradient: 'from-gray-50 to-white',
    },
    {
      name: 'Monthly',
      icon: Rocket,
      price: '₹899',
      originalPrice: null,
      duration: 'per month',
      description: 'For growing businesses',
      features: [
        { text: 'Unlimited Messages*', included: true },
        { text: 'Unlimited Campaigns', included: true },
        { text: 'Standard Safety', included: true },
        { text: 'Webhooks & Flow Builder', included: true },
        { text: 'Standard Support', included: true },
      ],
      cta: 'Choose Monthly',
      highlight: false,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-white',
    },
    {
      name: '3-Month',
      icon: Shield,
      price: '₹2,500',
      originalPrice: '₹2,697',
      duration: 'one-time',
      description: 'Save 7% vs monthly',
      features: [
        { text: 'All Monthly Features', included: true },
        { text: 'Basic Automation', included: true },
        { text: 'Good Number Safety', included: true },
        { text: 'Standard Support', included: true },
        { text: 'Campaign Retry', included: false },
      ],
      cta: 'Choose 3-Month',
      highlight: false,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-white',
    },
    {
      name: '6-Month',
      icon: Crown,
      price: '₹5,000',
      originalPrice: '₹5,394',
      duration: 'one-time',
      description: 'Most Popular Choice',
      features: [
        { text: 'Advanced Automation', included: true },
        { text: 'Mobile + API Same No.', included: true, highlight: true },
        { text: 'Campaign Retry', included: true, highlight: true },
        { text: 'High Safety (Active)', included: true, highlight: true },
        { text: 'Priority Support', included: true },
      ],
      cta: 'Get Best Value',
      highlight: true,
      tag: 'RECOMMENDED',
      tagColor: 'bg-gradient-to-r from-green-500 to-emerald-600',
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
    },
    {
      name: '1-Year',
      icon: Sparkles,
      price: '₹8,999',
      originalPrice: '₹10,788',
      duration: 'one-time',
      description: 'Save 17% - Best Deal!',
      features: [
        { text: 'Full Automation Suite', included: true },
        { text: 'Mobile + API Same No.', included: true, highlight: true },
        { text: 'Campaign Retry', included: true, highlight: true },
        { text: 'Maximum Safety', included: true, highlight: true },
        { text: '2 WhatsApp Accounts', included: true, highlight: true },
      ],
      cta: 'Go Annual',
      highlight: true,
      tag: 'BEST DEAL',
      tagColor: 'bg-gradient-to-r from-orange-500 to-red-500',
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
    }
  ];

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-green-500/30 rounded-full animate-bounce"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + i * 0.5}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
        >
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium 
            bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 mb-4
            border border-green-200 shadow-sm">
            <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
            Simple & Transparent
          </span>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your{' '}
            <span className="relative">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                Perfect Plan
              </span>
              <span className="absolute bottom-1 left-0 w-full h-3 bg-green-200/50 -z-0 rounded"></span>
            </span>
          </h2>

          <p className="text-xl text-gray-600 leading-relaxed">
            Start free, scale as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="flex flex-nowrap lg:grid lg:grid-cols-5 gap-4 lg:gap-6 overflow-x-auto pb-8 lg:pb-0 snap-x snap-mandatory scrollbar-hide">
          {plans.map((plan, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredPlan(index)}
              onMouseLeave={() => setHoveredPlan(null)}
              className={`flex-none w-72 lg:w-auto snap-center transition-all duration-500 ${isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-20'
                }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div
                className={`relative h-full bg-white rounded-2xl p-6 flex flex-col
                  transition-all duration-500 ease-out
                  ${plan.highlight
                    ? 'border-2 border-transparent shadow-2xl lg:scale-105 z-10'
                    : 'border border-gray-200 shadow-lg hover:shadow-xl'
                  }
                  ${hoveredPlan === index ? '-translate-y-3' : ''}
                `}
                style={{
                  background: plan.highlight
                    ? `linear-gradient(white, white) padding-box, linear-gradient(135deg, ${plan.gradient.includes('green') ? '#22c55e, #10b981' : plan.gradient.includes('orange') ? '#f97316, #ef4444' : '#6b7280, #4b5563'}) border-box`
                    : undefined,
                }}
              >
                {/* Highlight Tag */}
                {plan.highlight && plan.tag && (
                  <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 
                    px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg
                    ${plan.tagColor} flex items-center space-x-1.5
                    animate-pulse`}
                  >
                    <Star className="w-3.5 h-3.5 fill-white" />
                    <span>{plan.tag}</span>
                  </div>
                )}

                {/* Gradient Overlay on Hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${plan.bgGradient} 
                  opacity-0 transition-opacity duration-500
                  ${hoveredPlan === index ? 'opacity-100' : ''}`}
                ></div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon & Name */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${plan.gradient} 
                      shadow-lg transition-transform duration-500
                      ${hoveredPlan === index ? 'scale-110 rotate-6' : ''}`}
                    >
                      <plan.icon className="w-5 h-5 text-white" />
                    </div>
                    {plan.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">{plan.originalPrice}</span>
                    )}
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-xs text-gray-500 mb-4">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className={`text-3xl font-extrabold bg-gradient-to-r ${plan.gradient} 
                        text-transparent bg-clip-text`}>
                        {plan.price}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{plan.duration}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className={`flex items-start text-sm transition-all duration-300
                          ${hoveredPlan === index ? 'translate-x-1' : ''}`}
                        style={{ transitionDelay: `${idx * 50}ms` }}
                      >
                        {feature.included ? (
                          <span className={`shrink-0 mr-2 mt-0.5 p-0.5 rounded-full 
                            ${feature.highlight
                              ? `bg-gradient-to-r ${plan.gradient}`
                              : 'bg-green-100'}`}
                          >
                            <Check className={`w-3 h-3 ${feature.highlight ? 'text-white' : 'text-green-600'}`} />
                          </span>
                        ) : (
                          <span className="shrink-0 mr-2 mt-0.5 p-0.5 rounded-full bg-gray-100">
                            <X className="w-3 h-3 text-gray-400" />
                          </span>
                        )}
                        <span className={`${feature.included
                          ? feature.highlight ? 'text-gray-900 font-medium' : 'text-gray-700'
                          : 'text-gray-400'}`}
                        >
                          {feature.text}
                          {feature.highlight && (
                            <BadgeCheck className="w-3.5 h-3.5 inline ml-1 text-green-500" />
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-sm
                      transition-all duration-300 flex items-center justify-center gap-2
                      group overflow-hidden relative
                      ${plan.highlight
                        ? `bg-gradient-to-r ${plan.gradient} text-white 
                           shadow-lg hover:shadow-xl hover:scale-[1.02]
                           ${plan.gradient.includes('green') ? 'shadow-green-500/30 hover:shadow-green-500/50' : 'shadow-orange-500/30 hover:shadow-orange-500/50'}`
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900 hover:scale-[1.02]'
                      }`}
                  >
                    {/* Shine effect */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                      -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>

                    <span className="relative z-10">{plan.cta}</span>
                    <ArrowRight className={`w-4 h-4 relative z-10 transition-transform duration-300 
                      group-hover:translate-x-1 ${plan.highlight ? 'text-white' : 'text-gray-600'}`} />
                  </button>
                </div>

                {/* Decorative corner */}
                {plan.highlight && (
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${plan.gradient} 
                    opacity-10 rounded-bl-full`}></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className={`mt-12 text-center transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
          <div className="inline-flex items-center gap-6 flex-wrap justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Instant Activation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BadgeCheck className="w-4 h-4 text-blue-500" />
              <span>Cancel Anytime</span>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            *Unlimited messages subject to Meta Fair Usage Policy & Tier Limits.
          </p>
        </div>

        {/* Enterprise CTA */}
        <div className={`mt-16 text-center transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 
            bg-gradient-to-r from-gray-900 to-gray-800 
            rounded-2xl px-8 py-6 shadow-2xl">
            <div className="text-left">
              <h4 className="text-white font-bold text-lg">Need a Custom Plan?</h4>
              <p className="text-gray-400 text-sm">Get tailored solutions for your enterprise</p>
            </div>
            <a
              href="https://wa.me/919310010763?text=Hi, I need a custom enterprise plan for WabMeta!"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold text-sm
                hover:bg-green-50 transition-all duration-300
                flex items-center gap-2 group hover:scale-105"
            >
              Contact Sales
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* Hide scrollbar CSS */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default Pricing;