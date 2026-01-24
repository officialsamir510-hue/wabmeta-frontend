import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, RefreshCw, ExternalLink, ArrowRight } from 'lucide-react';
import AuthLayout from './AuthLayout';
import Button from '../common/Button';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your@email.com';
  
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = async () => {
    setResendLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setResendLoading(false);
    setCountdown(60);
  };

  const emailProviders = [
    { name: 'Gmail', url: 'https://mail.google.com' },
    { name: 'Outlook', url: 'https://outlook.live.com' },
    { name: 'Yahoo', url: 'https://mail.yahoo.com' },
  ];

  return (
    <AuthLayout title="Verify your email">
      <div className="space-y-8">
        <div className="relative flex justify-center">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
            <Mail className="w-12 h-12 text-primary-500" />
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Check your inbox</h3>
          <p className="text-gray-600">We've sent a verification link to</p>
          <p className="font-semibold text-gray-900 mt-1">{email}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          {[1, 2, 3].map((num, i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-medium">{num}</div>
              <p className="text-gray-600 text-sm">
                {num === 1 && 'Open your email inbox'}
                {num === 2 && 'Find the email from WabMeta'}
                {num === 3 && 'Click the verification link'}
              </p>
            </div>
          ))}
        </div>

        <div>
          <p className="text-sm text-gray-500 text-center mb-3">Quick access:</p>
          <div className="grid grid-cols-3 gap-3">
            {emailProviders.map((provider) => (
              <a
                key={provider.name}
                href={provider.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{provider.name}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="text-center">
          {countdown > 0 ? (
            <p className="text-sm text-gray-500">Resend in <span className="font-semibold">{countdown}s</span></p>
          ) : (
            <button onClick={handleResend} disabled={resendLoading} className="inline-flex items-center space-x-2 text-primary-600 font-medium">
              <RefreshCw className={`w-4 h-4 ${resendLoading ? 'animate-spin' : ''}`} />
              <span>{resendLoading ? 'Sending...' : 'Resend verification email'}</span>
            </button>
          )}
        </div>

        <Button variant="outline" fullWidth onClick={() => navigate('/dashboard')} icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
          Skip for now (Demo)
        </Button>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;