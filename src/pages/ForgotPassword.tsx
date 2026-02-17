// src/pages/ForgotPassword.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { auth } from '../services/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setApiError('');

    if (!validateEmail()) return;

    setLoading(true);

    try {
      await auth.forgotPassword({ email: email.trim().toLowerCase() });
      setSubmitted(true);
      startResendCooldown();
    } catch (err: any) {
      console.error('Forgot password error:', err);

      const status = err?.response?.status;

      if (status === 429) {
        setApiError('Too many requests. Please try again later.');
      } else {
        // Don't reveal if email exists or not for security
        setSubmitted(true);
        startResendCooldown();
      }
    } finally {
      setLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setApiError('');

    try {
      await auth.forgotPassword({ email: email.trim().toLowerCase() });
      startResendCooldown();
    } catch (err: any) {
      setApiError(err?.response?.data?.message || 'Failed to resend. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout title="Check your email" showBackButton>
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>

          <div>
            <p className="text-gray-600 mb-2">We've sent a password reset link to</p>
            <p className="font-semibold text-gray-900 bg-gray-100 py-2 px-4 rounded-lg inline-block">
              {email}
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
            <p>
              Click the link in the email to reset your password.
              The link will expire in 1 hour.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <p className="font-medium mb-2">Didn't receive the email?</p>
            <ul className="list-disc list-inside space-y-1 text-left">
              <li>Check your spam or junk folder</li>
              <li>Make sure the email address is correct</li>
              <li>Wait a few minutes and check again</li>
            </ul>
          </div>

          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <div className="space-y-3">
            <Button
              fullWidth
              onClick={() => window.open('https://mail.google.com', '_blank')}
              variant="secondary"
            >
              Open Email App
            </Button>

            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || loading}
              className={`w-full py-2 text-sm font-medium transition-colors ${resendCooldown > 0 || loading
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-primary-600 hover:text-primary-700'
                }`}
            >
              {loading
                ? 'Sending...'
                : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend email'
              }
            </button>
          </div>

          <p className="text-center">
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="No worries, we'll send you reset instructions."
      showBackButton
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {apiError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          icon={<Mail className="w-5 h-5" />}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
            setApiError('');
          }}
          error={error}
          autoFocus
        />

        <Button
          type="submit"
          fullWidth
          loading={loading}
          icon={<ArrowRight className="w-5 h-5" />}
          iconPosition="right"
        >
          Send Reset Link
        </Button>

        <p className="text-center">
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;