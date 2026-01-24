import React, { useRef, useEffect } from 'react';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({ 
  length = 6, 
  value, 
  onChange, 
  error = false,
  disabled = false
}) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    if (!disabled) {
      inputs.current[0]?.focus();
    }
  }, [disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (isNaN(Number(val))) return;

    const newOtp = value.split('');
    // Allow replacing digit if typing in filled field
    newOtp[index] = val.substring(val.length - 1); 
    const nextOtp = newOtp.join('');
    
    onChange(nextOtp);

    // Auto-focus next input
    if (val && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length).replace(/[^0-9]/g, '');
    if (pastedData) {
      onChange(pastedData);
      // Focus last filled input
      inputs.current[Math.min(pastedData.length, length - 1)]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => { inputs.current[index] = el; }}
          type="text"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`w-10 h-10 sm:w-12 sm:h-12 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all duration-200
            ${error 
              ? 'border-red-300 bg-red-50 text-red-600 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
              : 'border-gray-200 bg-white text-gray-900 focus:border-primary-500 focus:ring-4 focus:ring-primary-100'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}
          `}
        />
      ))}
    </div>
  );
};

export default OTPInput;