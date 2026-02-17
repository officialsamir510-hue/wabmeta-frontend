// src/components/auth/PasswordStrengthMeter.tsx

import React, { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

interface Requirement {
  label: string;
  regex: RegExp;
  met: boolean;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const requirements: Requirement[] = useMemo(() => [
    {
      label: 'At least 8 characters',
      regex: /.{8,}/,
      met: /.{8,}/.test(password),
    },
    {
      label: 'One uppercase letter (A-Z)',
      regex: /[A-Z]/,
      met: /[A-Z]/.test(password),
    },
    {
      label: 'One lowercase letter (a-z)',
      regex: /[a-z]/,
      met: /[a-z]/.test(password),
    },
    {
      label: 'One number (0-9)',
      regex: /\d/,
      met: /\d/.test(password),
    },
    {
      label: 'One special character (@$!%*?&#)',
      regex: /[@$!%*?&#]/,
      met: /[@$!%*?&#]/.test(password),
    },
  ], [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter(r => r.met).length;

    if (metCount === 0) return { level: 0, label: '', color: 'bg-gray-200' };
    if (metCount === 1) return { level: 1, label: 'Very Weak', color: 'bg-red-500' };
    if (metCount === 2) return { level: 2, label: 'Weak', color: 'bg-orange-500' };
    if (metCount === 3) return { level: 3, label: 'Fair', color: 'bg-yellow-500' };
    if (metCount === 4) return { level: 4, label: 'Good', color: 'bg-lime-500' };
    return { level: 5, label: 'Strong', color: 'bg-green-500' };
  }, [requirements]);

  if (!password) {
    return null;
  }

  return (
    <div className="mt-3 space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Password strength</span>
          <span className={`font-medium ${strength.level <= 2 ? 'text-red-600' :
              strength.level === 3 ? 'text-yellow-600' :
                'text-green-600'
            }`}>
            {strength.label}
          </span>
        </div>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${level <= strength.level ? strength.color : 'bg-gray-200'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-1.5">
        {requirements.map((req, index) => (
          <div
            key={index}
            className={`flex items-center space-x-2 text-xs transition-colors duration-200 ${req.met ? 'text-green-600' : 'text-gray-400'
              }`}
          >
            {req.met ? (
              <Check className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;