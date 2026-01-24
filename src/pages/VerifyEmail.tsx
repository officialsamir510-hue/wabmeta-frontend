import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import Button from '../components/common/Button';
import api from '../services/api';
import OTPInput from '../components/auth/OTPInput'; // Ensure this path is correct

const VerifyOTP: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  // Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Verify OTP
  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.post('/auth/verify-otp', { email, otp });

      if (res.data.token) {
        setSuccess('Verification successful! Redirecting...');
        
        localStorage.setItem('wabmeta_token', res.data.token);
        localStorage.setItem('token', res.data.token);
        
        if (res.data.user) {
          localStorage.setItem('wabmeta_user', JSON.stringify(res.data.user));
        }

        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Verify Error:', err);
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setResendLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post('/auth/resend-otp', { email });
      setSuccess('New OTP sent successfully!');
      setCountdown(60);
      setOtp(''); // Clear OTP input
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout title="Verify Your Account" subtitle="">
      <div className="space-y-6">
        
        {/* Shield Icon */}
        <div className="flex justify-center py-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce-slow">
            <ShieldCheck className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Info Text */}
        <div className="text-center">
          <p className="text-gray-600 mb-1">
            We've sent a 6-digit verification code to
          </p>
          <p className="font-semibold text-primary-600 text-lg bg-primary-50 py-1 px-3 rounded-lg inline-block">
            {email}
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-600 text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700 text-sm animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* OTP Input Component */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
            Enter verification code
          </label>
          <OTPInput
            length={6}
            value={otp}
            onChange={(val) => {
              setOtp(val);
              setError(null);
            }}
            error={!!error}
            disabled={loading || !!success} // Disable on success or loading
          />
        </div>

        {/* Verify Button */}
        <Button
          fullWidth
          onClick={handleVerify}
          loading={loading}
          disabled={otp.length !== 6 || !!success}
          icon={<ArrowRight className="w-5 h-5" />}
          iconPosition="right"
        >
          Verify & Continue
        </Button>

        {/* Resend Section */}
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-3">Didn't receive the code?</p>
          
          {countdown > 0 ? (
            <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
              <RefreshCw className="w-4 h-4" />
              <span>Resend available in <span className="font-bold text-primary-600">{countdown}s</span></span>
            </div>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-primary-600 hover:text-primary-700 font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center space-x-1 mx-auto"
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
          )}
        </div>

        {/* Change Email Link */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Wrong email address?{' '}
          <Link 
            to="/signup" 
            className="font-semibold text-primary-600 hover:text-primary-500 hover:underline transition-colors"
          >
            Change Email
          </Link>
        </p>

      </div>
    </AuthLayout>
  );
};

export default VerifyOTP;