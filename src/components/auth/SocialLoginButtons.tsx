import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { auth } from "../../services/api";

interface SocialLoginButtonsProps {
  loading?: boolean;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ loading = false }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const isDisabled = loading || isLoading;

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);

      const credential = credentialResponse?.credential;
      if (!credential) {
        throw new Error("Google credential not received");
      }

      const response = await auth.googleLogin({ credential });

      // sendSuccess wrapper => { success, message, data }
      const result = response.data?.data;
      const accessToken = result?.tokens?.accessToken;
      const refreshToken = result?.tokens?.refreshToken;
      const user = result?.user;
      const organization = result?.organization;

      if (!accessToken || !user) {
        console.error("Unexpected google login response:", response.data);
        throw new Error("Invalid server response");
      }

      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      // optional compatibility keys
      localStorage.setItem("token", accessToken);
      localStorage.setItem("wabmeta_token", accessToken);

      localStorage.setItem("wabmeta_user", JSON.stringify(user));
      if (organization) localStorage.setItem("wabmeta_org", JSON.stringify(organization));

      navigate("/dashboard");
    } catch (err) {
      console.error("Google Login Failed:", err);
      alert("Google login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className={`w-full ${isDisabled ? "opacity-60 pointer-events-none" : ""}`}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            console.error("Google Login Error");
            alert("Google login failed. Please try again.");
          }}
          useOneTap={false}
        />
      </div>

      <button
        type="button"
        disabled={isDisabled}
        className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => alert("Facebook login coming soon!")}
      >
        <span className="font-medium">{isLoading ? "Connecting..." : "Continue with Facebook"}</span>
      </button>
    </div>
  );
};

export default SocialLoginButtons;