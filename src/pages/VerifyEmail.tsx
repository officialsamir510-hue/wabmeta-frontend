// src/pages/VerifyEmail.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import {
  Mail,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import Button from '../components/common/Button';
import { auth } from '../services/api';

type VerificationState = 'loading' | 'success' | 'error' | 'pending';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const token = searchParams.get('token');
  const emailFromState = location.state?.email as string | undefined;
  const messageFromState = location.state?.message as string | undefined;

  const [state, setState] = useState<VerificationState>(token ? 'loading' : 'pending');
  const [error, setError] = useState('');
  const [email, setEmail] = useState(emailFromState || '');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Auto-verify if token is present
  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const verifyEmail = async (verificationToken: string) => {
    setState('loading');
    setError('');

    try {
      await auth.verifyEmail({ token: verificationToken });
      setState('success');
    } catch (err: any) {
      console.error('Email verification error:', err);
      setState('error');

      const message = err?.response?.data?.message;

      if (message?.toLowerCase().includes('expired')) {
        setError('This verification link has expired. Please request a new one.');
      } else if (message?.toLowerCase().includes('invalid')) {
        setError('Invalid verification link. Please request a new one.');
      } else if (message?.toLowerCase().includes('already verified')) {
        setState('success');
      } else {
        setError(message || 'Verification failed. Please try again.');
      }
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return;

    setResendLoading(true);
    setResendSuccess(false);
    setError('');

    try {
      await auth.resendVerification({ email: email.trim().toLowerCase() });
      setResendSuccess(true);
      setResendCooldown(60);
    } catch (err: any) {
      const message = err?.response?.data?.message;

      if (err?.response?.status === 400 && message?.toLowerCase().includes('already verified')) {
        setState('success');
      } else if (err?.response?.status === 429) {
        setError('Too many requests. Please wait before trying again.');
        setResendCooldown(60);
      } else {
        setError(message || 'Failed to resend verification email.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  // Loading State
  if (state === 'loading') {
    return (
      <AuthLayout title="Verifying Email">
        <div className="text-center space-y-6 py-8">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Verifying your email...
            </h3>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Success State
  if (state === 'success') {
    return (
      <AuthLayout title="Email Verified!">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              You're all set!
            </h3>
            <p className="text-gray-600">
              Your email has been verified successfully.
              You can now access all features of your account.
            </p>
          </div>

          <Button
            fullWidth
            onClick={() => navigate('/dashboard')}
            icon={<ArrowRight className="w-5 h-5" />}
            iconPosition="right"
          >
            Go to Dashboard
          </Button>

          <p className="text-gray-500 text-sm">
            Or{' '}
            <Link to="/login" className="text-primary-600 hover:underline">
              sign in
            </Link>
            {' '}if you need to login again.
          </p>
        </div>
      </AuthLayout>
    );
  }

  // Error State
  if (state === 'error') {
    return (
      <AuthLayout title="Verification Failed">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Verification Failed
            </h3>
            <p className="text-gray-600">{error}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Enter your email to resend verification
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>

            {resendSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Verification email sent successfully!</span>
              </div>
            )}

            <Button
              fullWidth
              onClick={handleResend}
              loading={resendLoading}
              disabled={!email || resendCooldown > 0}
              variant="secondary"
              icon={<RefreshCw className="w-5 h-5" />}
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend Verification Email'
              }
            </Button>
          </div>

          <p className="text-center">
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to login
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  // Pending State (no token, just registered)
  return (
    <AuthLayout title="Verify Your Email">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
          <Mail className="w-10 h-10 text-primary-600" />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Check your inbox
          </h3>
          {email ? (
            <>
              <p className="text-gray-600 mb-2">We've sent a verification link to</p>
              <p className="font-semibold text-gray-900 bg-gray-100 py-2 px-4 rounded-lg inline-block">
                {email}
              </p>
            </>
          ) : (
            <p className="text-gray-600">
              {messageFromState || "We've sent a verification link to your email address."}
            </p>
          )}
        </div>

        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
          <p>
            Click the link in the email to verify your account.
            The link will expire in 24 hours.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {resendSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Verification email sent successfully!</span>
          </div>
        )}

        <div className="space-y-4">
          <Button
            fullWidth
            onClick={() => window.open('https://mail.google.com', '_blank')}
            variant="secondary"
          >
            Open Email App
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Didn't receive the email?</p>

            {!email ? (
              <div className="mb-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
            ) : null}

            <button
              onClick={handleResend}
              disabled={!email || resendLoading || resendCooldown > 0}
              className={`inline-flex items-center space-x-1 text-sm font-medium transition-colors ${!email || resendLoading || resendCooldown > 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-primary-600 hover:text-primary-700'
                }`}
            >
              {resendLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : resendCooldown > 0 ? (
                <span>Resend in {resendCooldown}s</span>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Resend verification email</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-gray-500 text-sm">
            Wrong email?{' '}
            <Link to="/signup" className="text-primary-600 hover:underline font-medium">
              Sign up again
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;