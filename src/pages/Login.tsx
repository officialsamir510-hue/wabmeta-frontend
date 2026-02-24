// src/pages/Login.tsx - FINAL FIXED

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import Checkbox from "../components/common/Checkbox";
import SocialLoginButtons from "../components/auth/SocialLoginButtons";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, clearError } = useAuth();

  const [rememberMe, setRememberMe] = useState(true); // ✅ Default to true for persistent login

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    clearError();

    if (!validateForm()) return;

    try {
      const result = await login(
        formData.email.trim().toLowerCase(),
        formData.password
      );

      if (result.success) {
        // ✅ Save remember me preference
        if (rememberMe) {
          localStorage.setItem("remember_me", "true");
        } else {
          localStorage.removeItem("remember_me");
        }

        toast.success("Welcome back!");

        // ✅ Redirect to saved location or dashboard
        const from = (location.state as any)?.from || "/dashboard";
        navigate(from, { replace: true });
      } else {
        // ✅ Handle specific error cases
        const errorMessage = result.error || "Login failed";
        setApiError(errorMessage);

        // Don't show toast for validation errors
        if (!errorMessage.includes("password") && !errorMessage.includes("email")) {
          toast.error(errorMessage);
        }
      }
    } catch (error: any) {
      console.error("❌ Login Error:", error);

      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;

      if (status === 401) {
        setApiError("Invalid email or password. Please try again.");
      } else if (status === 403) {
        if (message?.toLowerCase().includes("verify")) {
          setApiError("Please verify your email before logging in.");
        } else if (message?.toLowerCase().includes("suspend")) {
          setApiError("Your account has been suspended. Please contact support.");
        } else {
          setApiError(message || "Access denied.");
        }
      } else if (status === 429) {
        setApiError("Too many login attempts. Please try again later.");
      } else {
        setApiError(message || "Login failed. Please check your credentials.");
      }
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
    if (apiError) {
      setApiError(null);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your dashboard"
    >
      {apiError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start space-x-3 text-red-600 dark:text-red-400 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          icon={<Mail className="w-5 h-5" />}
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          error={errors.email}
          autoFocus
          disabled={isLoading}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          icon={<Lock className="w-5 h-5" />}
          value={formData.password}
          onChange={(e) => updateField("password", e.target.value)}
          error={errors.password}
          disabled={isLoading}
        />

        <div className="flex items-center justify-between">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onChange={setRememberMe}
            label="Keep me logged in"
          />
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          icon={<ArrowRight className="w-5 h-5" />}
          iconPosition="right"
          disabled={isLoading}
        >
          Sign In
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-50 dark:bg-gray-900 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <SocialLoginButtons loading={isLoading} />

        <p className="text-center text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
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