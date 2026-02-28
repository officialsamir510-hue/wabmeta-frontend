// src/components/common/LoadingScreen.tsx
import React, { useState, useEffect } from 'react';
import logo from '../../assets/logo.png';

const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col items-center px-4">

        {/* Logo Container */}
        <div className="relative mb-8">
          {/* Animated Ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-36 h-36 lg:w-44 lg:h-44 border-4 border-green-500/20 rounded-full"></div>
            <div
              className="absolute w-36 h-36 lg:w-44 lg:h-44 border-4 border-transparent border-t-green-500 rounded-full animate-spin"
              style={{ animationDuration: '1.5s' }}
            ></div>
          </div>

          {/* Logo */}
          <div className="relative p-6">
            <img
              src={logo}
              alt="WabMeta"
              className="h-24 w-24 lg:h-32 lg:w-32 object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-48 lg:w-64 mb-4">
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Loading Text */}
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          Loading your experience...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;