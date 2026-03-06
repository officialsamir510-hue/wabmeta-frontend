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
  Star
} from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-300/30 dark:bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-300/30 dark:bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="text-center lg:text-left">
            
            {/* ✅ META PARTNER BADGE */}
            <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
              {/* Meta Logo */}
              <svg 
                className="w-6 h-6" 
                viewBox="0 0 36 36" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M18 0C8.059 0 0 8.059 0 18s8.059 18 18 18 18-8.059 18-18S27.941 0 18 0z" 
                  fill="#0081FB"
                />
                <path 
                  d="M25.5 18c0-4.125-3.375-7.5-7.5-7.5S10.5 13.875 10.5 18s3.375 7.5 7.5 7.5 7.5-3.375 7.5-7.5z" 
                  fill="#fff"
                />
              </svg>
              
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
              
              {/* WabMeta Logo */}
              <img 
                src="/logo.png" 
                alt="WabMeta" 
                className="h-6 w-auto"
              />
              
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Official Partner of Meta
              </span>
              
              <CheckCircle className="w-4 h-4 text-blue-500" />
            </div>

            {/* Alternative Badge Design (More Prominent) */}
            {/* 
            <div className="inline-flex flex-col items-center lg:items-start mb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full shadow-lg mb-2">
                <svg className="w-5 h-5 text-white" viewBox="0 0 36 36" fill="currentColor">
                  <path d="M18 0C8.059 0 0 8.059 0 18s8.059 18 18 18 18-8.059 18-18S27.941 0 18 0z"/>
                </svg>
                <span className="text-white text-sm font-semibold">
                  Official Meta Partner
                </span>
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="WabMeta" className="h-5 w-auto" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Powered by WabMeta
                </span>
              </div>
            </div>
            */}

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Supercharge Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                WhatsApp Marketing
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
              The all-in-one WhatsApp Business API platform for campaigns, 
              chatbots, and customer engagement. Trusted by 10,000+ businesses.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 group"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button
                onClick={() => {/* Open demo video */}}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-500 hover:shadow-lg transition-all duration-300"
              >
                <Play className="w-5 h-5 text-green-600" />
                Watch Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>

            {/* Rating */}
            <div className="mt-8 flex items-center justify-center lg:justify-start gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                4.9/5 from 2,000+ reviews
              </span>
            </div>
          </div>

          {/* Right Content - Hero Image/Illustration */}
          <div className="relative">
            {/* Main Dashboard Preview */}
            <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <img
                src="/dashboard-preview.png"
                alt="WabMeta Dashboard"
                className="w-full h-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              
              {/* Fallback UI if image not available */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Messages Sent</p>
                      <p className="text-sm text-gray-500">Last 30 days</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-green-600">125,432</p>
                </div>
                
                <div className="h-32 bg-gradient-to-t from-green-100 to-transparent dark:from-green-900/20 rounded-lg flex items-end justify-center pb-4">
                  <div className="flex items-end gap-2">
                    {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                      <div
                        key={i}
                        className="w-8 bg-green-500 rounded-t"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">98.5%</p>
                  <p className="text-xs text-gray-500">Delivery Rate</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 animate-bounce-slow delay-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">10,000+</p>
                  <p className="text-xs text-gray-500">Active Users</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trusted By Section */}
        <div className="mt-20 pt-10 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
            Trusted by leading companies worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {/* Add your client logos here */}
            <div className="h-8 w-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
            <div className="h-8 w-28 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
            <div className="h-8 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
            <div className="h-8 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
            <div className="h-8 w-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 rounded-full border-2 border-gray-400 dark:border-gray-600 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-gray-400 dark:bg-gray-600 rounded-full animate-scroll" />
        </div>
      </div>
    </section>
  );
};

export default Hero;