import React from 'react';
// Import your images here
// Agar images nahi hain toh ye lines comment karke niche fallback use karein
import logoColor from '../../assets/logo.png'; 
// import logoWhite from '../../assets/logo-white.png'; // Uncomment if you have a white version

interface LogoProps {
  variant?: 'full' | 'icon'; // 'full' = Logo + Name, 'icon' = Logo only
  theme?: 'dark' | 'light';  // 'light' = Dark text (for white bg), 'dark' = White text (for dark bg)
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  variant = 'full', 
  theme = 'light',
  className = '' 
}) => {
  // CONFIGURATION
  const useImage = true; // Set to true if you have uploaded logo.png
  
  if (useImage) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img 
          src={logoColor} 
          alt="WabMeta Logo" 
          className={`object-contain transition-all duration-300 ${
            variant === 'icon' ? 'w-10 h-10' : 'w-32 h-10' // Adjust size here
          } ${theme === 'dark' ? 'brightness-0 invert' : ''}`} // Auto-white filter for dark theme
        />
      </div>
    );
  }

  // FALLBACK: Professional SVG/Text Logo if no image is provided
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon Part */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
        theme === 'dark' 
          ? 'bg-white/20 text-white' 
          : 'bg-linear-to-br from-primary-500 to-whatsapp-teal text-white'
      }`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>

      {/* Text Part */}
      {variant === 'full' && (
        <span className={`text-2xl font-bold tracking-tight ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Wab<span className={theme === 'dark' ? 'text-primary-300' : 'text-primary-500'}>Meta</span>
        </span>
      )}
    </div>
  );
};

export default Logo;