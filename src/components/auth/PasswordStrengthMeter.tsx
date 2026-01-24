import React, { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const requirements = useMemo(() => [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ], [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter(r => r.met).length;
    if (metCount === 0) return { level: 0, label: '', color: 'bg-gray-200' };
    if (metCount <= 2) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (metCount <= 3) return { level: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (metCount <= 4) return { level: 3, label: 'Good', color: 'bg-blue-500' };
    return { level: 4, label: 'Strong', color: 'bg-green-500' };
  }, [requirements]);

  if (!password) return null;

  return (
    <div className="mt-4 space-y-4">
      {/* Strength Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Password strength</span>
          <span className={`text-sm font-medium ${
            strength.level <= 1 ? 'text-red-600' :
            strength.level === 2 ? 'text-yellow-600' :
            strength.level === 3 ? 'text-blue-600' :
            'text-green-600'
          }`}>
            {strength.label}
          </span>
        </div>
        <div className="flex space-x-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                level <= strength.level ? strength.color : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div className="grid grid-cols-1 gap-2">
        {requirements.map((req, index) => (
          <div 
            key={index} 
            className={`flex items-center text-sm transition-colors ${
              req.met ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            {req.met ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <X className="w-4 h-4 mr-2" />
            )}
            {req.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;