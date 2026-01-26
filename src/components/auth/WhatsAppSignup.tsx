import { useEffect } from 'react';

// Extend the Window interface to include fbAsyncInit
declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB: any;
  }
}

const WhatsAppSignup = () => {
  
  // 1. Facebook SDK Load karna
  useEffect(() => {
    window.fbAsyncInit = function() {
      window.FB.init({
        appId            : '881518987956566', // Aapka App ID
        autoLogAppEvents : true,
        xfbml            : true,
        version          : 'v20.0' // Latest version use karein
      });
    };

    // Script inject karna
    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s) as HTMLScriptElement; js.id = id;
       js.src = "https://connect.facebook.net/en_US/sdk.js";
       if (fjs.parentNode) {
         fjs.parentNode.insertBefore(js, fjs);
       }
     }(document, 'script', 'facebook-jssdk'));
  }, []);

  // 2. Button Click Handler
  const launchWhatsAppSignup = () => {
    // Ye 'extras' parameter hi magic create karta hai
    const config = {
      scope: 'whatsapp_business_management, whatsapp_business_messaging',
      extras: {
        "feature": "whatsapp_embedded_signup",
        "version": 2
      }
    };

    interface FBAuthResponse {
      accessToken?: string;
      code?: string;
      expiresIn?: number;
      signedRequest?: string;
      userID?: string;
    }

    interface FBLoginResponse {
      authResponse?: FBAuthResponse;
      status?: string;
    }

    window.FB.login(function(response: FBLoginResponse) {
      if (response.authResponse) {
        const code = response.authResponse.code;
        console.log('WhatsApp Onboarding Code:', code);
        
        // Yahan se ye code apne Backend bhejein exchange karne ke liye
        // await sendCodeToBackend(code);
        
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    }, config); // Config pass karna zaroori hai
  };

  return (
    <button 
      onClick={launchWhatsAppSignup}
      className="bg-[#1877F2] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#166fe5] transition-all"
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
      Connect with Facebook
    </button>
  );
};

export default WhatsAppSignup;