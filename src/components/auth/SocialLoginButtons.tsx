// src/components/auth/SocialLoginButtons.tsx - COMPLETE FIXED

import React, { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface SocialLoginButtonsProps {
  loading?: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ loading = false }) => {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();

  // ✅ FIX #1: Prevent multiple initializations
  const initialized = useRef(false);
  const buttonRendered = useRef(false);

  const handleGoogleCallback = useCallback(async (response: any) => {
    if (!response.credential) {
      toast.error('Google login failed - no credential received');
      return;
    }

    try {
      console.log('🔐 Google login callback triggered');

      const result = await googleLogin(response.credential);

      if (result.success) {
        toast.success('Login successful!');
        navigate('/dashboard', { replace: true });
      } else {
        toast.error(result.error || 'Google login failed');
      }
    } catch (error: any) {
      console.error('❌ Google login error:', error);
      toast.error(error.message || 'Google login failed');
    }
  }, [googleLogin, navigate]);

  useEffect(() => {
    // ✅ FIX #2: Skip if no client ID
    if (!GOOGLE_CLIENT_ID) {
      console.warn('⚠️ Google Client ID not configured');
      return;
    }

    // ✅ FIX #3: Prevent double initialization in React Strict Mode
    if (initialized.current) {
      console.log('ℹ️ Google already initialized, skipping...');
      return;
    }

    const loadGoogleScript = () => {
      // Check if script already exists
      if (document.getElementById('google-signin-script')) {
        console.log('ℹ️ Google script already loaded');
        initializeGoogle();
        return;
      }

      console.log('📥 Loading Google Sign-In script...');

      const script = document.createElement('script');
      script.id = 'google-signin-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('✅ Google script loaded');
        initializeGoogle();
      };
      script.onerror = () => {
        console.error('❌ Failed to load Google script');
      };

      document.head.appendChild(script);
    };

    const initializeGoogle = () => {
      if (!window.google) {
        console.error('❌ Google SDK not available');
        return;
      }

      // ✅ FIX #4: Mark as initialized BEFORE calling initialize
      initialized.current = true;

      console.log('🔧 Initializing Google Sign-In...');

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // ✅ FIX #5: Only render button once
      const buttonDiv = document.getElementById('google-signin-button');
      if (buttonDiv && !buttonRendered.current) {
        console.log('🎨 Rendering Google button...');

        window.google.accounts.id.renderButton(buttonDiv, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: buttonDiv.offsetWidth || 300,
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'center',
        });

        buttonRendered.current = true;
        console.log('✅ Google button rendered');
      }
    };

    loadGoogleScript();

    // ✅ Cleanup (optional, but good practice)
    return () => {
      // Don't reset initialized.current here to prevent re-initialization
      console.log('🧹 SocialLoginButtons unmounted');
    };
  }, [handleGoogleCallback]); // Only re-run if callback changes

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-700 dark:text-yellow-400">
          Google Sign-In not configured
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ✅ Google Sign-in Button Container */}
      <div
        id="google-signin-button"
        className={`flex justify-center min-h-[44px] ${loading ? 'opacity-50 pointer-events-none' : ''
          }`}
      >
        {/* Button will be rendered here by Google SDK */}
      </div>

      {/* ✅ Loading indicator while Google SDK loads */}
      {!buttonRendered.current && (
        <div className="text-center text-sm text-gray-500">
          Loading Google Sign-In...
        </div>
      )}
    </div>
  );
};

export default SocialLoginButtons;