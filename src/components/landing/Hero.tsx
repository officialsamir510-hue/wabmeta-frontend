// src/components/landing/Hero.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  MessageCircle, 
  Users, 
  Zap, 
  CheckCircle,
  Play,
  Star,
  Shield,
  BarChart3
} from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-300/20 dark:bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-300/20 dark:bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            
            {/* ✅ META OFFICIAL PARTNER BADGE */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
              {/* Meta Logo SVG */}
              <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="24" fill="url(#metaGradient)"/>
                <path d="M24 10C16.268 10 10 16.268 10 24s6.268 14 14 14 14-6.268 14-14-6.268-14-14-14zm0 21a7 7 0 110-14 7 7 0 010 14z" fill="white"/>
                <defs>
                  <linearGradient id="metaGradient" x1="0" y1="0" x2="48" y2="48">
                    <stop offset="0%" stopColor="#0081FB"/>
                    <stop offset="100%" stopColor="#0064E1"/>
                  </linearGradient>
                </defs>
              </svg>

              <div className="h-5 w-px bg-gray-300 dark:bg-gray-600" />

              {/* WabMeta Logo */}
              <img 
                src="/logo.png" 
                alt="WabMeta Logo" 
                className="h-6 w-auto object-contain"
                onError={(e) => {
                  // Fallback to text if image not found
                  e.currentTarget.style.display = 'none';
                  const textSpan = document.createElement('span');
                  textSpan.className = 'font-bold text-green-600 dark:text-green-400';
                  textSpan.textContent = 'WabMeta';
                  e.currentTarget.parentElement?.appendChild(textSpan);
                }}
              />

              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Official Partner of Meta
              </span>

              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>

            {/* Main Heading */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
                Supercharge Your
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                  WhatsApp Marketing
                </span>
              </h1>
            </div>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-xl mx-auto lg:mx-0">
              The all-in-one WhatsApp Business API platform for campaigns, 
              chatbots, and customer engagement. Trusted by 10,000+ businesses worldwide.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button
                onClick={() => {
                  // Scroll to demo video or open modal
                  document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-500 hover:shadow-lg transition-all duration-300"
              >
                <Play className="w-5 h-5 text-green-600" />
                Watch Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Cancel anytime</span>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                4.9/5 from 2,000+ reviews
              </span>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative">
            {/* Main Dashboard Card */}
            <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Dashboard Preview Window */}
              <div className="relative bg-white dark:bg-gray-800">
                <img
                  src="/dashboard-preview.png"
                  alt="WabMeta Dashboard Preview"
                  className="w-full h-auto hidden" // Keep it hidden if you want to use the CSS UI
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                
                
                {/* High-Fidelity Dashboard UI */}
                <div className="bg-white dark:bg-gray-800 h-full p-6 shadow-inner">
                  {/* Browser-like Header */}
                  <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400/80 shadow-sm" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400/80 shadow-sm" />
                      <div className="w-3 h-3 rounded-full bg-green-400/80 shadow-sm" />
                    </div>
                    <div className="flex-1 max-w-xs h-6 bg-gray-100/80 dark:bg-gray-700/50 rounded-lg mx-auto border border-gray-200/20" />
                  </div>

                  <div className="space-y-6">
                    {/* Stats Summary */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-green-500/10 dark:bg-green-500/20 rounded-2xl flex items-center justify-center shadow-sm border border-green-500/20">
                          <MessageCircle className="w-7 h-7 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">Engagement Overview</h3>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">125,432</span>
                            <span className="text-sm font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-md">↑ 12.5%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="hidden sm:flex flex-col items-end">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-full text-[10px] font-bold border border-green-100 dark:border-green-800/50">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-sm"></span>
                          </span>
                          LIVE STREAMING
                        </div>
                      </div>
                    </div>
                    
                    {/* Primary Analytics Graph Area - MODIFIED GRAPH */}
                    <div className="relative group bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl p-5 border border-gray-100 dark:border-gray-800/50 shadow-sm overflow-hidden">
                      <div className="absolute top-0 right-0 p-4">
                        <BarChart3 className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                      </div>
                      
                      <div className="h-44 relative">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between py-2">
                          {[0, 1, 2, 3, 4].map(i => (
                            <div key={i} className="border-t border-gray-200/30 dark:border-gray-700/30 w-full h-px" />
                          ))}
                        </div>

                        {/* SVG Line Graph */}
                        <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 400 160">
                          <defs>
                            <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          
                          {/* Animated Area under line */}
                          <path 
                            d="M 0,160 L 0,100 C 50,110 80,40 130,70 C 180,100 220,10 270,50 C 320,80 350,20 400,30 L 400,160 Z" 
                            fill="url(#lineFill)" 
                            className="transition-all duration-1000 ease-in-out"
                          />
                          
                          {/* Main Line with Pulse Effect */}
                          <path 
                            d="M 0,100 C 50,110 80,40 130,70 C 180,100 220,10 270,50 C 320,80 350,20 400,30" 
                            fill="none" 
                            stroke="#10B981" 
                            strokeWidth="4" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                          />

                          {/* Interactive Points */}
                          {[
                            {x: 0, y: 100}, {x: 130, y: 70}, {x: 270, y: 50}, {x: 400, y: 30}
                          ].map((p, i) => (
                            <g key={i} className="cursor-pointer group/dot">
                              <circle cx={p.x} cy={p.y} r="10" fill="#10B981" fillOpacity="0.1" className="animate-ping" style={{animationDuration: '3s', animationDelay: `${i * 500}ms`}} />
                              <circle cx={p.x} cy={p.y} r="5" fill="white" stroke="#10B981" strokeWidth="3" />
                            </g>
                          ))}
                        </svg>
                      </div>
                      
                      <div className="flex justify-between mt-4 text-[9px] text-gray-400 font-black px-1 uppercase tracking-widest">
                        <span>MAY 01</span>
                        <span>MAY 02</span>
                        <span>MAY 03</span>
                        <span>MAY 04</span>
                        <span>MAY 05</span>
                        <span>MAY 06</span>
                        <span>MAY 07</span>
                      </div>
                    </div>

                    {/* Recent Broadcasts simulation */}
                    <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Dispatch</h4>
                        <div className="flex items-center gap-1 text-[9px] font-bold text-green-500 uppercase tracking-tighter">
                          <CheckCircle className="w-2.5 h-2.5" />
                          Authenticated
                        </div>
                      </div>
                      {[
                        { name: "Rahul Sharma", status: "Delivered", time: "Just now", color: "bg-green-500", progress: 100 },
                        { name: "Priya Kapoor", status: "Read", time: "2m ago", color: "bg-blue-500", progress: 100 },
                        { name: "Amit Hegde", status: "Sending", time: "In progress", color: "bg-yellow-500", progress: 65 },
                      ].map((msg, idx) => (
                        <div key={idx} className="group relative flex flex-col p-3 rounded-xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/50 hover:border-green-500/30 transition-all duration-300">
                           <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-2.5 h-2.5 rounded-full ${msg.color} shadow-sm shadow-inherit`} />
                              <span className="text-xs font-bold text-gray-900 dark:text-white">{msg.name}</span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{msg.time}</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${msg.color} rounded-full transition-all duration-1000`} 
                              style={{ width: `${msg.progress}%` }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ FLOATING CARDS - BROUGHT FORWARD WITH HIGHER Z-INDEX AND SCALE */}
            <div className="absolute -top-12 -left-12 z-[40] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-5 transform hover:scale-105 transition-transform duration-500 group">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-11 h-11 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 overflow-hidden shadow-sm group-hover:-translate-y-1 transition-transform" style={{ transitionDelay: `${i * 100}ms` }}>
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                    </div>
                  ))}
                  <div className="w-11 h-11 rounded-full border-2 border-white dark:border-gray-800 bg-green-500 flex items-center justify-center text-white text-[10px] font-black shadow-sm">+12k</div>
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-white">Live Agents</p>
                  <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Active Conversations</p>
                </div>
              </div>
            </div>

            <div className="absolute top-10 -right-16 z-[30] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-5 animate-float transform hover:rotate-3 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">98.5%</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Instant Delivery</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-10 -right-8 z-[35] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-5 animate-float transition-transform" style={{ animationDelay: '0.7s' }}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">1.2M+</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contacts Managed</p>
                </div>
              </div>
            </div>

            {/* Meta Verified Badge - Enlarged and popped out */}
            <div className="absolute top-1/2 -right-8 transform translate-x-1/2 -translate-y-1/2 z-[45] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-4 border-white dark:border-gray-700 p-4 animate-pulse">
              <div className="flex flex-col items-center gap-2">
                <Shield className="w-10 h-10 text-blue-600" />
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trusted By Section */}
        <div className="mt-24 pt-12 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 uppercase tracking-wider">
            Trusted by leading companies worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {/* Add your client logos here */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 rounded-full border-2 border-gray-400 dark:border-gray-600 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-gray-400 dark:bg-gray-600 rounded-full animate-scroll" />
        </div>
      </div>
    </section>
  );
};

export default Hero;