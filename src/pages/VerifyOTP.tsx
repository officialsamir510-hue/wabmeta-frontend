import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import axios from 'axios';

// ✅ Correct Paths (Relative to src/pages/auth/)
import AuthLayout from '../components/auth/AuthLayout';
import OTPInput from '../components/auth/OTPInput';
import Button from '../components/common/Button';

const VerifyOTP: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Safe Access to Email
  const email = location.state?.email || 'your email';

  // Debug Log
  useEffect(() => {
    console.log("VerifyOTP Page Loaded. Email:", email);
  }, [email]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/verify-email`, {
        email: email,
        otp: otp
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Optional: Save user data if backend sends it
        // localStorage.setItem('user', JSON.stringify(response.data.user)); 
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Verify your account" 
      subtitle="Enter the code sent to your email"
      showBackButton
    >
      <div className="space-y-8 animate-fade-in">
        {/* Info Card */}
        <div className="bg-gray-50 rounded-2xl p-6 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <Mail className="w-7 h-7 text-blue-600" />
          </div>
          <p className="text-gray-600 mb-2">We've sent a 6-digit code to</p>
          <p className="font-semibold text-gray-900 text-lg">{email}</p>
        </div>

        {/* OTP Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
            Enter verification code
          </label>
          <OTPInput
            length={6}
            value={otp}
            onChange={(value: string) => {
              setOtp(value);
              setError('');
            }}
            error={!!error} // Pass boolean
            disabled={loading}
          />
          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}
        </div>

        {/* Verify Button */}
        <Button
          type="button" // Add type
          fullWidth
          onClick={handleVerify}
          loading={loading}
          disabled={otp.length !== 6}
          icon={<ArrowRight className="w-5 h-5" />}
          iconPosition="right"
        >
          Verify & Continue
        </Button>

        {/* Resend Link */}
        <div className="text-center">
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Resend Code
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyOTP;