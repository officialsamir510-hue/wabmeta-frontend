import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setSubmitted(true);
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
            <p className="font-semibold text-gray-900">{email}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <p>Click the link in the email to reset your password. Check spam if not found.</p>
          </div>
          <Button fullWidth onClick={() => window.open('https://mail.google.com', '_blank')}>
            Open Email App
          </Button>
          <button onClick={() => setSubmitted(false)} className="text-sm text-primary-600 hover:underline">
            Didn't receive? Click to resend
          </button>
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
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          icon={<Mail className="w-5 h-5" />}
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          error={error}
        />
        <Button type="submit" fullWidth loading={loading} icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
          Reset Password
        </Button>
        <p className="text-center">
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">← Back to login</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;