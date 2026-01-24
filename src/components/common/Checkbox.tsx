import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  error?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ id, checked, onChange, label, error }) => {
  return (
    <div>
      <label htmlFor={id} className="flex items-start cursor-pointer group">
        <div className="relative shrink-0">
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only"
          />
          <div 
            className={`
              w-5 h-5 rounded-md border-2 transition-all duration-200
              flex items-center justify-center
              ${checked 
                ? 'bg-primary-500 border-primary-500' 
                : 'border-gray-300 group-hover:border-primary-400'
              }
              ${error ? 'border-red-500' : ''}
            `}
          >
            {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
          </div>
        </div>
        {label && (
          <span className="ml-3 text-sm text-gray-600 leading-tight">{label}</span>
        )}
      </label>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Checkbox;