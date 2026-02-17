// src/pages/ResetPassword.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft, XCircle } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';
import { auth } from '../services/api';

// ✅ Must match backend validation
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenInvalid, setTokenInvalid] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenInvalid(true);
    }
  }, [token]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!PASSWORD_REGEX.test(password)) {
      newErrors.password =
        'Password must contain uppercase, lowercase, number, and special character (@$!%*?&#)';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    if (!token) {
      setApiError('Invalid reset token');
      return;
    }

    setLoading(true);

    try {
      await auth.resetPassword({
        token,
        password,
        confirmPassword
      });
      setSuccess(true);
    } catch (err: any) {
      console.error('Reset password error:', err);

      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status === 400) {
        if (message?.toLowerCase().includes('expired')) {
          setApiError('This reset link has expired. Please request a new one.');
          setTokenInvalid(true);
        } else if (message?.toLowerCase().includes('invalid')) {
          setApiError('Invalid reset link. Please request a new one.');
          setTokenInvalid(true);
        } else {
          setApiError(message || 'Failed to reset password.');
        }
      } else {
        setApiError(message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Token Invalid State
  if (tokenInvalid && !success) {
    return (
      <AuthLayout title="Invalid Reset Link">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Link Expired or Invalid</h3>
            <p className="text-gray-600">
              This password reset link is invalid or has expired.
              Please request a new one.
            </p>
          </div>

          <Button
            fullWidth
            onClick={() => navigate('/forgot-password')}
            icon={<ArrowRight className="w-5 h-5" />}
            iconPosition="right"
          >
            Request New Link
          </Button>

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

  // Success State
  if (success) {
    return (
      <AuthLayout title="Password Reset Successful!">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All done!</h3>
            <p className="text-gray-600">
              Your password has been reset successfully.
              You can now login with your new password.
            </p>
          </div>

          <Button
            fullWidth
            onClick={() => navigate('/login')}
            icon={<ArrowRight className="w-5 h-5" />}
            iconPosition="right"
          >
            Continue to Login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // Reset Form
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your new password below."
      showBackButton
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {apiError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        <div>
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            icon={<Lock className="w-5 h-5" />}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors({ ...errors, password: '' });
              setApiError('');
            }}
            error={errors.password}
            autoFocus
          />
          <PasswordStrengthMeter password={password} />
        </div>

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Confirm new password"
          icon={<Lock className="w-5 h-5" />}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setErrors({ ...errors, confirmPassword: '' });
          }}
          error={errors.confirmPassword}
        />

        <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
          <p className="font-medium mb-1">Password requirements:</p>
          <ul className="list-disc list-inside space-y-0.5 text-blue-600">
            <li>At least 8 characters</li>
            <li>One uppercase letter (A-Z)</li>
            <li>One lowercase letter (a-z)</li>
            <li>One number (0-9)</li>
            <li>One special character (@$!%*?&#)</li>
          </ul>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={loading}
          icon={<ArrowRight className="w-5 h-5" />}
          iconPosition="right"
        >
          Reset Password
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

export default ResetPassword;