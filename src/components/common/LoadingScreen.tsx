import React from 'react';
import Logo from './Logo';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      {/* Logo with Animation */}
      <div className="relative">
        <div className="animate-pulse">
          <Logo variant="icon" />
        </div>
        
        {/* Online Indicator */}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
        </div>
      </div>

      {/* Brand Name */}
      <h2 className="mt-6 text-xl font-bold text-gray-900">
        Wab<span className="text-primary-500">Meta</span>
      </h2>
      
      {/* Loading Text */}
      <p className="text-gray-500 text-sm mt-1">Loading your workspace...</p>

      {/* Loading Dots */}
      <div className="flex items-center space-x-1.5 mt-6">
        <div 
          className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" 
          style={{ animationDelay: '0ms' }}
        ></div>
        <div 
          className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" 
          style={{ animationDelay: '150ms' }}
        ></div>
        <div 
          className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" 
          style={{ animationDelay: '300ms' }}
        ></div>
      </div>
    </div>
  );
};

export default LoadingScreen;