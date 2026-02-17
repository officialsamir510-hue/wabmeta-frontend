// src/pages/Signup.tsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Building2,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import Checkbox from "../components/common/Checkbox";
import SocialLoginButtons from "../components/auth/SocialLoginButtons";
import PasswordStrengthMeter from "../components/auth/PasswordStrengthMeter";
import { auth } from "../services/api";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
}

// ✅ Password validation regex - matches backend
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    subscribeNewsletter: true,
  });

  const totalSteps = 3;

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s\-\']+$/.test(formData.firstName)) {
      newErrors.firstName = "First name can only contain letters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    } else if (formData.companyName.trim().length < 2) {
      newErrors.companyName = "Company name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!PASSWORD_REGEX.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, number, and special character (@$!%*?&#)";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    if (step === 1) isValid = validateStep1();
    else if (step === 2) isValid = validateStep2();
    if (isValid && step < totalSteps) {
      setStep(step + 1);
      setApiError(null);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
      setApiError(null);
    }
  };

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
    if (apiError) {
      setApiError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateStep3()) return;

    setLoading(true);

    try {
      // ✅ Convert phone to E.164 format
      const phoneE164 = `+91${formData.phone}`;

      // ✅ Include confirmPassword in request
      const response = await auth.register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: phoneE164,
        organizationName: formData.companyName.trim(),
      });

      const result = response.data?.data;
      const accessToken = result?.tokens?.accessToken;
      const refreshToken = result?.tokens?.refreshToken;
      const user = result?.user;
      const organization = result?.organization;

      if (!accessToken || !user) {
        console.error("Unexpected register response:", response.data);
        setApiError("Registration failed: invalid server response.");
        return;
      }

      // ✅ Store all tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("token", accessToken);
      localStorage.setItem("wabmeta_token", accessToken);

      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      localStorage.setItem("wabmeta_user", JSON.stringify(user));

      if (organization) {
        localStorage.setItem("wabmeta_org", JSON.stringify(organization));
        localStorage.setItem("currentOrganizationId", organization.id);
      }

      // ✅ Check if email verification is required
      if (!user.emailVerified) {
        // Navigate to verification page or show message
        navigate("/verify-email", {
          state: {
            email: formData.email.trim().toLowerCase(),
            message: "Please check your email to verify your account."
          }
        });
      } else {
        navigate("/dashboard");
      }

    } catch (error: any) {
      console.error("Signup Error:", error);

      const message = error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed. Please try again.";

      // Handle specific error cases
      if (error.response?.status === 409) {
        setApiError("This email is already registered. Please login or use a different email.");
      } else if (error.response?.status === 400) {
        setApiError(message);
      } else {
        setApiError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={
        step === 1
          ? "Create your account"
          : step === 2
            ? "Business Information"
            : "Set your password"
      }
      subtitle={
        step === 1
          ? "Start your free trial. No credit card required."
          : step === 2
            ? "Tell us about your business"
            : "Choose a secure password for your account"
      }
    >
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${s < step
                    ? "bg-primary-500 text-white"
                    : s === step
                      ? "bg-primary-500 text-white ring-4 ring-primary-100"
                      : "bg-gray-200 text-gray-500"
                  }`}
              >
                {s < step ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 h-1 mx-2 rounded transition-all duration-300 ${s < step ? "bg-primary-500" : "bg-gray-200"
                    }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 px-2">
          <span>Personal Info</span>
          <span>Business</span>
          <span>Security</span>
        </div>
      </div>

      {apiError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-600 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                icon={<User className="w-5 h-5" />}
                value={formData.firstName}
                onChange={(e) => updateFormData("firstName", e.target.value)}
                error={errors.firstName}
                autoFocus
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => updateFormData("lastName", e.target.value)}
                error={errors.lastName}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="john@company.com"
              icon={<Mail className="w-5 h-5" />}
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              error={errors.email}
            />

            <Button
              type="button"
              fullWidth
              onClick={handleNext}
              icon={<ArrowRight className="w-5 h-5" />}
              iconPosition="right"
            >
              Continue
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">Or sign up with</span>
              </div>
            </div>

            <SocialLoginButtons />
          </div>
        )}

        {/* Step 2: Business Information */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
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
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    updateFormData("phone", value);
                  }}
                  maxLength={10}
                  className={`flex-1 px-4 py-3.5 border rounded-r-xl transition-all focus:outline-none focus:ring-2 ${errors.phone
                      ? "border-red-300 focus:ring-red-500/20"
                      : "border-gray-200 focus:ring-primary-500/20 focus:border-primary-500"
                    }`}
                />
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <Input
              label="Company Name"
              placeholder="Acme Inc."
              icon={<Building2 className="w-5 h-5" />}
              value={formData.companyName}
              onChange={(e) => updateFormData("companyName", e.target.value)}
              error={errors.companyName}
            />

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                icon={<ArrowLeft className="w-5 h-5" />}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Password */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Create a strong password"
                icon={<Lock className="w-5 h-5" />}
                value={formData.password}
                onChange={(e) => updateFormData("password", e.target.value)}
                error={errors.password}
              />
              <PasswordStrengthMeter password={formData.password} />
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              icon={<Lock className="w-5 h-5" />}
              value={formData.confirmPassword}
              onChange={(e) => updateFormData("confirmPassword", e.target.value)}
              error={errors.confirmPassword}
            />

            <div className="space-y-3">
              <Checkbox
                id="agree-terms"
                checked={formData.agreeToTerms}
                onChange={(checked) => updateFormData("agreeToTerms", checked)}
                error={errors.agreeToTerms}
                label={
                  <span>
                    I agree to the{" "}
                    <Link to="/terms" className="text-primary-600 hover:underline">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-primary-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                }
              />
              <Checkbox
                id="subscribe"
                checked={formData.subscribeNewsletter}
                onChange={(checked) => updateFormData("subscribeNewsletter", checked)}
                label="Send me product updates and tips"
              />
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                icon={<ArrowLeft className="w-5 h-5" />}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                loading={loading}
                icon={<Sparkles className="w-5 h-5" />}
                iconPosition="right"
                className="flex-1"
              >
                Create Account
              </Button>
            </div>
          </div>
        )}

        <p className="text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Signup;