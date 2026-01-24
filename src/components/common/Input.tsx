import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, success, icon, rightIcon, type = 'text', className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            className={`
              w-full px-4 py-3.5 
              ${icon ? 'pl-12' : ''} 
              ${isPassword || rightIcon ? 'pr-12' : ''}
              border rounded-xl 
              transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-offset-0
              ${error 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50' 
                : success 
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20 bg-green-50/50'
                  : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500/20 hover:border-gray-300'
              }
              placeholder:text-gray-400
              ${className}
            `}
            {...props}
          />
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
          
          {rightIcon && !isPassword && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </p>
        )}
        
        {success && !error && (
          <p className="mt-2 text-sm text-green-600 flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            {success}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;