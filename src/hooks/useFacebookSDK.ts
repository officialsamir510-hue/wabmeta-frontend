// src/hooks/useFacebookSDK.ts

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    FB: any;
    fbAsyncInit?: (() => void) | undefined;
  }
}

export const useFacebookSDK = () => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if SDK already loaded
    if (window.FB) {
      setIsReady(true);
      setIsLoading(false);
      return;
    }

    // Wait for SDK to load
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds

    const checkSDK = setInterval(() => {
      attempts++;
      
      if (window.FB) {
        console.log('✅ Facebook SDK loaded');
        setIsReady(true);
        setIsLoading(false);
        clearInterval(checkSDK);
      } else if (attempts >= maxAttempts) {
        console.error('❌ Facebook SDK timeout');
        setIsLoading(false);
        clearInterval(checkSDK);
      }
    }, 100);

    return () => clearInterval(checkSDK);
  }, []);

  return { 
    isReady, 
    isLoading,
    FB: window.FB 
  };
};