// src/components/common/Loader.tsx
import React from 'react';
import logo from '../../assets/logo.png';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  fullScreen = false,
  text = 'Loading...'
}) => {
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-28 w-28'
  };

  const spinnerSizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-36 h-36'
  };

  const content = (
    <div className="flex flex-col items-center justify-center">
      {/* Logo with Spinner */}
      <div className="relative mb-4">
        {/* Spinning Border */}
        <div className={`absolute inset-0 flex items-center justify-center`}>
          <div
            className={`${spinnerSizes[size]} border-4 border-gray-200 dark:border-gray-700 border-t-green-500 rounded-full animate-spin`}
          ></div>
        </div>

        {/* Logo */}
        <div className="p-4">
          <img
            src={logo}
            alt="WabMeta"
            className={`${sizeClasses[size]} object-contain`}
          />
        </div>
      </div>

      {/* Text */}
      {text && (
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
};

export default Loader;