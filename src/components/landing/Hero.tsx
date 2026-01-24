// src/components/landing/Hero.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  MessageSquare,
  Users,
  Zap,
  Star
} from 'lucide-react';

const Hero: React.FC = () => {
  const stats = [
    { value: '50M+', label: 'Messages Sent' },
    { value: '10K+', label: 'Active Users' },
    { value: '99.9%', label: 'Uptime' },
    { value: '150+', label: 'Countries' },
  ];


  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-linear-to-br from-gray-50 via-white to-primary-50"></div>
      
      {/* Animated Background Shapes */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-whatsapp-light rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-float" style={{ animationDelay: '4s' }}></div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
              <Zap className="w-4 h-4" />
              <span>Official WhatsApp Business API Partner</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
              Scale Your Business with{' '}
              <span className="gradient-text">WhatsApp</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
              The most powerful WhatsApp Business API platform. Send bulk messages, 
              automate conversations, and grow your business with our enterprise-grade solution.
            </p>

            {/* Features List */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Bulk Messaging',
                'Chatbot Automation',
                'Team Collaboration',
                'Analytics Dashboard'
              ].map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-500" />
                  <span className="text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/signup" 
                className="group inline-flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="group inline-flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-8 rounded-xl border-2 border-gray-200 transition-all duration-300">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-500 transition-colors">
                  <Play className="w-4 h-4 text-primary-500 group-hover:text-white transition-colors ml-0.5" />
                </div>
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Trusted by 10,000+ businesses worldwide</p>
              <div className="flex items-center space-x-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                      key={i} 
                      className="w-10 h-10 rounded-full border-2 border-white bg-linear-to-br from-gray-200 to-gray-300"
                    ></div>
                  ))}
                </div>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                  <span className="text-gray-700 font-medium ml-2">4.9/5</span>
                  <span className="text-gray-500">(2,000+ reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative lg:pl-8">
            {/* Main Dashboard Card */}
            <div className="relative bg-white rounded-3xl shadow-2xl p-6 transform rotate-1 hover:rotate-0 transition-transform duration-500">
              {/* Browser Header */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="flex-1 bg-gray-100 rounded-lg h-8 ml-4"></div>
              </div>

              {/* Dashboard Preview */}
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Dashboard</h3>
                      <p className="text-sm text-gray-500">Welcome back, John</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Connected
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-linear-to-br from-primary-500 to-whatsapp-teal p-4 rounded-xl text-white">
                    <p className="text-sm opacity-80">Messages Sent</p>
                    <p className="text-2xl font-bold">12,543</p>
                    <p className="text-xs mt-1 opacity-80">↑ 12% this week</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Delivered</p>
                    <p className="text-2xl font-bold text-gray-800">98.5%</p>
                    <p className="text-xs mt-1 text-green-600">↑ 2.1%</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Responses</p>
                    <p className="text-2xl font-bold text-gray-800">4,521</p>
                    <p className="text-xs mt-1 text-green-600">↑ 8.3%</p>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="bg-gray-50 rounded-xl p-4 h-32">
                  <div className="flex items-end justify-between h-full space-x-2">
                    {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                      <div 
                        key={i}
                        className="flex-1 bg-primary-500 rounded-t-lg opacity-80 hover:opacity-100 transition-opacity"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Recent Messages */}
                <div className="space-y-2">
                  {[
                    { name: 'Priya Sharma', message: 'Thank you for your quick response!', time: '2m' },
                    { name: 'Rahul Kumar', message: 'I would like to place an order', time: '5m' },
                  ].map((msg, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm">{msg.name}</p>
                        <p className="text-xs text-gray-500 truncate">{msg.message}</p>
                      </div>
                      <span className="text-xs text-gray-400">{msg.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 animate-float">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Message Delivered</p>
                  <p className="text-sm text-gray-500">10,234 recipients</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 animate-float" style={{ animationDelay: '1s' }}>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Automation Active</p>
                  <p className="text-sm text-gray-500">15 workflows running</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-gray-200">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-bold gradient-text">{stat.value}</p>
              <p className="text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;