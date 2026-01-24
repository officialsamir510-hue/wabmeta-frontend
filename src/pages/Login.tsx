import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Phone, AlertCircle } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Checkbox from '../components/common/Checkbox';
import SocialLoginButtons from '../components/auth/SocialLoginButtons';
import { auth } from '../services/api'; // Assuming you added custom headers logic to api.ts or using direct axios

type LoginMethod = 'email' | 'phone';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (loginMethod === 'email') {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
    } else {
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      console.log("🚀 Attempting Login...");
      
      const payload = loginMethod === 'email' 
        ? { email: formData.email, password: formData.password }
        : { phone: formData.phone, password: formData.password }; 

      // Detect Platform
      const platform = /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile App' : 'Web';

      // Send Login Request (Make sure your auth.login method accepts headers or modify it)
      // If using axios instance directly: axios.post('/auth/login', payload, { headers: ... })
      // If using api service:
      const response = await auth.login(payload, {
        headers: { 'x-platform': platform }
      });

      console.log("✅ Server Response:", response.data);

      const token = response.data.token || response.data.accessToken;
      const user = response.data.user || response.data.data || response.data; // Sometimes user is at root
      
      if (token) {
        console.log("💾 Saving Token to LocalStorage:", token);
        
        localStorage.setItem('wabmeta_token', token);
        localStorage.setItem('token', token);
        
        // Remove password from stored user object if present
        if (user.password) delete user.password;
        
        if (user) {
          localStorage.setItem('wabmeta_user', JSON.stringify(user));
        }
        
        if (rememberMe) {
          localStorage.setItem('remember_me', 'true');
        } else {
          localStorage.removeItem('remember_me');
        }
        
        console.log("🔍 Read Token back:", localStorage.getItem('wabmeta_token'));
        
        if (user?.role === 'admin' || user?.role === 'superadmin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        console.error("❌ Token missing in response data!", response.data);
        setApiError("Login failed: No token received from server.");
      }

    } catch (error: any) {
      console.error("❌ Login Error:", error);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Enter your credentials to access your account"
    >
      {apiError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-600 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Login Method Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            type="button"
            onClick={() => {
              setLoginMethod('email');
              setErrors({});
              setApiError(null);
            }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg font-medium transition-all duration-300 ${
              loginMethod === 'email'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod('phone');
              setErrors({});
              setApiError(null);
            }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg font-medium transition-all duration-300 ${
              loginMethod === 'phone'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Phone</span>
          </button>
        </div>

        {/* Email/Phone Input */}
        {loginMethod === 'email' ? (
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            icon={<Mail className="w-5 h-5" />}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="flex">
              <div className="flex items-center px-4 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl">
                <span className="text-gray-600 font-medium">+91</span>
              </div>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`flex-1 px-4 py-3.5 border rounded-r-xl transition-all duration-300 focus:outline-none focus:ring-2 ${
                  errors.phone 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500/20'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
        )}

        {/* Password Input */}
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          icon={<Lock className="w-5 h-5" />}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onChange={setRememberMe}
            label="Remember me"
          />
          <Link 
            to="/forgot-password" 
            className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          loading={loading}
          icon={<ArrowRight className="w-5 h-5" />}
          iconPosition="right"
        >
          Sign In
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-50 text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Social Login */}
        <SocialLoginButtons
          onGoogleLogin={() => console.log('Google')}
          onFacebookLogin={() => console.log('Facebook')}
          loading={loading}
        />

        {/* Sign Up Link */}
        <p className="text-center text-gray-600">
          Don't have an account?{' '}
          <Link 
            to="/signup" 
            className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
          >
            Sign up for free
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;