import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!password || password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <AuthLayout title="Password Reset Successful!">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All done!</h3>
            <p className="text-gray-600">Your password has been reset successfully.</p>
          </div>
          <Button fullWidth onClick={() => navigate('/login')} icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
            Continue to Login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your new password below." showBackButton>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            icon={<Lock className="w-5 h-5" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <PasswordStrengthMeter password={password} />
        </div>

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Confirm new password"
          icon={<Lock className="w-5 h-5" />}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />

        <Button type="submit" fullWidth loading={loading} icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
          Reset Password
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;