// src/pages/auth/VerifyOTP.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, RefreshCw, Phone, Mail } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import OTPInput from '../../components/auth/OTPInput';
import Button from '../common/Button';

const VerifyOTP: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const verificationType = location.state?.type || 'phone'; // 'phone' or 'email'
  const verificationValue = location.state?.value || '+91 98765 43210';

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0 && !canResend) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, canResend]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate verification (use '123456' as valid OTP for demo)
    if (otp === '123456') {
      setLoading(false);
      navigate('/dashboard');
    } else {
      setLoading(false);
      setError('Invalid OTP. Please try again.');
      setOtp('');
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setResendLoading(false);
    setCountdown(30);
    setCanResend(false);
    setError('');
    setOtp('');
  };

  const formatPhoneNumber = (phone: string) => {
    // Add spaces for better readability
    return phone.replace(/(\d{2})(\d{5})(\d{5})/, '+$1 $2 $3');
  };

  return (
    <AuthLayout 
      title="Verify your account" 
      subtitle=""
      showBackButton
    >
      <div className="space-y-8">
        {/* Info Card */}
        <div className="bg-gray-50 rounded-2xl p-6 text-center">
          <div className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center ${
            verificationType === 'phone' ? 'bg-blue-100' : 'bg-green-100'
          }`}>
            {verificationType === 'phone' ? (
              <Phone className="w-7 h-7 text-blue-600" />
            ) : (
              <Mail className="w-7 h-7 text-green-600" />
            )}
          </div>
          <p className="text-gray-600 mb-2">
            We've sent a 6-digit code to
          </p>
          <p className="font-semibold text-gray-900 text-lg">
            {verificationType === 'phone' 
              ? formatPhoneNumber(verificationValue)
              : verificationValue
            }
          </p>
        </div>

        {/* OTP Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
            Enter verification code
          </label>
          <OTPInput
            length={6}
            value={otp}
            onChange={(value) => {
              setOtp(value);
              setError('');
            }}
            error={!!error}
            disabled={loading}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
          )}
        </div>

        {/* Verify Button */}
        <Button
          fullWidth
          onClick={handleVerify}
          loading={loading}
          disabled={otp.length !== 6}
          icon={<ArrowRight className="w-5 h-5" />}
          iconPosition="right"
        >
          Verify & Continue
        </Button>

        {/* Resend Code */}
        <div className="text-center">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-500 font-medium transition-colors disabled:opacity-50"
            >
              {resendLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Resend Code</span>
                </>
              )}
            </button>
          ) : (
            <p className="text-gray-500">
              Resend code in{' '}
              <span className="font-semibold text-gray-900">{countdown}s</span>
            </p>
          )}
        </div>

        {/* Change Number/Email */}
        <p className="text-center text-sm text-gray-500">
          Wrong {verificationType === 'phone' ? 'number' : 'email'}?{' '}
          <button
            onClick={() => navigate(-1)}
            className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
          >
            Change
          </button>
        </p>

        {/* Demo Hint */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">Demo:</span> Use code{' '}
            <span className="font-mono font-bold">123456</span> to verify
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyOTP;