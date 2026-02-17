// src/pages/VerifyOTP.tsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { RefreshCw, ShieldCheck, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import Button from '../components/common/Button';
import { auth } from '../services/api';
import OTPInput from '../components/auth/OTPInput';

const VerifyOTP: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email as string | undefined;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async () => {
    if (!email) return;

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await auth.verifyOTP({ email, otp });

      const payload = res.data?.data;
      const tokens = payload?.tokens;

      if (!tokens?.accessToken) {
        throw new Error('Access token not received');
      }

      // Store all tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('token', tokens.accessToken);
      localStorage.setItem('wabmeta_token', tokens.accessToken);

      if (tokens.refreshToken) {
        localStorage.setItem('refreshToken', tokens.refreshToken);
      }

      if (payload?.user) {
        localStorage.setItem('wabmeta_user', JSON.stringify(payload.user));
      }

      if (payload?.organization) {
        localStorage.setItem('wabmeta_org', JSON.stringify(payload.organization));
        localStorage.setItem('currentOrganizationId', payload.organization.id);
      }

      setSuccess('Verification successful! Redirecting...');

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      console.error('Verify Error:', err);

      const message = err?.response?.data?.message || err?.response?.data?.error;

      if (err?.response?.status === 429) {
        setError('Too many attempts. Please request a new OTP.');
      } else if (message?.toLowerCase().includes('expired')) {
        setError('OTP has expired. Please request a new one.');
      } else if (message?.toLowerCase().includes('invalid')) {
        setError('Invalid OTP. Please check and try again.');
      } else {
        setError(message || 'Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || countdown > 0) return;

    setResendLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await auth.sendOTP({ email });
      setSuccess('New OTP sent successfully!');
      setCountdown(60);
      setOtp('');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.response?.data?.error;

      if (err?.response?.status === 429) {
        setError('Please wait before requesting another OTP.');
        setCountdown(60);
      } else {
        setError(message || 'Failed to resend OTP. Please try again.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <AuthLayout title="Verify Your Account" subtitle="">
      <div className="space-y-6">
        <div className="flex justify-center py-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-1">We've sent a 6-digit verification code to</p>
          <p className="font-semibold text-primary-600 text-lg bg-primary-50 py-2 px-4 rounded-lg inline-block">
            {email}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

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
            disabled={loading || !!success}
          />
        </div>

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

        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-3">Didn't receive the code?</p>

          {countdown > 0 ? (
            <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
              <RefreshCw className="w-4 h-4" />
              <span>
                Resend available in{' '}
                <span className="font-bold text-primary-600">{countdown}s</span>
              </span>
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

        <p className="text-center text-sm text-gray-500 mt-4">
          Wrong email address?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:underline">
            Go back
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default VerifyOTP;