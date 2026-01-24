// src/components/landing/Features.tsx
import React from 'react';
import { 
  MessageSquare, 
  Users, 
  Bot, 
  Zap, 
  BarChart3, 
  Shield,
  Send,
  Clock,
  Globe,
  Layers,
  Smartphone,
  FileText
} from 'lucide-react';

const Features: React.FC = () => {
  const mainFeatures = [
    {
      icon: Send,
      title: 'Bulk Messaging',
      description: 'Send personalized messages to thousands of contacts instantly with our powerful bulk messaging engine.',
      color: 'from-green-500 to-emerald-500',
      features: ['CSV Upload', 'Variable Mapping', 'Scheduled Sending', 'Template Support']
    },
    {
      icon: MessageSquare,
      title: 'Live Chat Inbox',
      description: 'Manage all your WhatsApp conversations in one unified inbox with team collaboration features.',
      color: 'from-blue-500 to-cyan-500',
      features: ['Real-time Chat', 'Agent Assignment', 'Quick Replies', 'Chat Labels']
    },
    {
      icon: Bot,
      title: 'Chatbot Builder',
      description: 'Create powerful chatbots with our visual flow builder. No coding required.',
      color: 'from-purple-500 to-pink-500',
      features: ['Drag & Drop Builder', 'AI Integration', 'Conditional Logic', 'API Webhooks']
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together with your team efficiently with role-based access and assignment rules.',
      color: 'from-orange-500 to-red-500',
      features: ['Multi-agent Support', 'Role Management', 'Performance Tracking', 'Internal Notes']
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track message delivery, engagement rates, and team performance with detailed analytics.',
      color: 'from-indigo-500 to-purple-500',
      features: ['Real-time Stats', 'Custom Reports', 'Export Data', 'Trend Analysis']
    },
    {
      icon: Zap,
      title: 'Automation Workflows',
      description: 'Automate repetitive tasks and create powerful workflows to save time.',
      color: 'from-yellow-500 to-orange-500',
      features: ['Trigger Actions', 'Auto-responses', 'Scheduled Tasks', 'API Integration']
    }
  ];

  const additionalFeatures = [
    { icon: Globe, title: 'Multi-language Support', description: 'Support customers in 100+ languages' },
    { icon: Shield, title: 'Enterprise Security', description: 'End-to-end encryption & compliance' },
    { icon: Clock, title: '24/7 Availability', description: 'Never miss a customer message' },
    { icon: Layers, title: 'Template Management', description: 'Pre-approved message templates' },
    { icon: Smartphone, title: 'Mobile App', description: 'Manage on the go with our app' },
    { icon: FileText, title: 'Rich Media Support', description: 'Send images, videos, documents' },
  ];

  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[20px_20px] opacity-50"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            Powerful Features
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to{' '}
            <span className="gradient-text">Scale Your Business</span>
          </h2>
          <p className="text-xl text-gray-600">
            Our comprehensive suite of tools helps you engage customers, automate workflows, 
            and grow your business with WhatsApp.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {mainFeatures.map((feature) => (
            <div 
              key={feature.title}
              className="group bg-white rounded-2xl p-8 shadow-soft hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-primary-200 relative overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-linear-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              <div className="relative">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-6">
                  {feature.description}
                </p>

                {/* Feature Points */}
                <ul className="space-y-2">
                  {feature.features.map((point) => (
                    <li key={point} className="flex items-center text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2"></div>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-3xl p-12 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-4">
                And Many More Features
              </h3>
              <p className="text-gray-400">
                Everything you need in one powerful platform
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {additionalFeatures.map((feature) => (
                <div 
                  key={feature.title}
                  className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
                    <feature.icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;