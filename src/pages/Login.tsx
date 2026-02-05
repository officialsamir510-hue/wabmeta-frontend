import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Phone, AlertCircle } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import Checkbox from "../components/common/Checkbox";
import SocialLoginButtons from "../components/auth/SocialLoginButtons";
import { auth } from "../services/api";

type LoginMethod = "email" | "phone";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (loginMethod === "email") {
      if (!formData.email) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }
    } else {
      // ✅ Backend currently does NOT support phone login
      newErrors.phone = "Phone login is not supported yet. Please use Email login.";
    }

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = { email: formData.email, password: formData.password };

      // optional platform header
      const platform = /Mobi|Android/i.test(navigator.userAgent) ? "Mobile App" : "Web";

      const response = await auth.login(payload, {
        headers: { "x-platform": platform },
      });

      /**
       * ✅ New backend response structure:
       * response.data = { success, message, data: { user, tokens, organization } }
       */
      const result = response.data?.data;
      const accessToken = result?.tokens?.accessToken;
      const refreshToken = result?.tokens?.refreshToken;
      const user = result?.user;
      const organization = result?.organization;

      if (!accessToken || !user) {
        console.error("Login response unexpected:", response.data);
        setApiError("Login failed: Invalid server response.");
        return;
      }

      // ✅ Store tokens in correct keys for our new api.ts interceptor
      localStorage.setItem("accessToken", accessToken);

      // (Optional) keep old keys temporarily if other code uses them
      localStorage.setItem("token", accessToken);
      localStorage.setItem("wabmeta_token", accessToken);

      // Store user/org for app usage
      localStorage.setItem("wabmeta_user", JSON.stringify(user));
      if (organization) localStorage.setItem("wabmeta_org", JSON.stringify(organization));

      if (rememberMe) localStorage.setItem("remember_me", "true");
      else localStorage.removeItem("remember_me");

      navigate("/dashboard");
    } catch (error: any) {
      console.error("❌ Login Error:", error);
      const message = error.response?.data?.message || "Login failed. Please check your credentials.";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Enter your credentials to access your account">
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
              setLoginMethod("email");
              setErrors({});
              setApiError(null);
            }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg font-medium transition-all duration-300 ${
              loginMethod === "email" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMethod("phone");
              setErrors({});
              setApiError(null);
            }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg font-medium transition-all duration-300 ${
              loginMethod === "phone" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Phone</span>
          </button>
        </div>

        {/* Email/Phone Input */}
        {loginMethod === "email" ? (
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <div className="flex">
              <div className="flex items-center px-4 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl">
                <span className="text-gray-600 font-medium">+91</span>
              </div>
              <input
                type="tel"
                placeholder="Phone login not supported yet"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`flex-1 px-4 py-3.5 border rounded-r-xl transition-all duration-300 focus:outline-none focus:ring-2 ${
                  errors.phone
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-primary-500 focus:ring-primary-500/20"
                }`}
              />
            </div>
            {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
          </div>
        )}

        {/* Password */}
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          icon={<Lock className="w-5 h-5" />}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
        />

        <div className="flex items-center justify-between">
          <Checkbox id="remember-me" checked={rememberMe} onChange={setRememberMe} label="Remember me" />
          <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={loading} icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
          Sign In
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-50 text-gray-500">Or continue with</span>
          </div>
        </div>

        <SocialLoginButtons
          onGoogleLogin={() => console.log("Google")}
          onFacebookLogin={() => console.log("Facebook")}
          loading={loading}
        />

        <p className="text-center text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
            Sign up for free
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;