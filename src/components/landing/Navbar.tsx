// src/components/landing/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import logo from '../../assets/logo.png';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features', type: 'scroll' },
    { name: 'Pricing', href: '#pricing', type: 'scroll' },
    { name: 'Documentation', href: '/documentation', type: 'link' },
    { name: 'Blog', href: '/blog', type: 'link' },
    { name: 'Contact', href: '/contact', type: 'link' },
  ];

  const handleNavClick = (link: typeof navLinks[0]) => {
    setIsOpen(false);

    if (link.type === 'scroll') {
      const element = document.querySelector(link.href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          const el = document.querySelector(link.href);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      navigate(link.href);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${isScrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50'
          : 'bg-white dark:bg-gray-900 shadow-md'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">

            {/* ✅ LOGO with Animation */}
            <Link
              to="/"
              className="flex items-center -my-4 group"
            >
              <div className="relative overflow-visible">
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150"></div>
                <img
                  src={logo}
                  alt="WabMeta"
                  style={{ height: '120px', width: '120px' }}
                  className="lg:!h-[160px] lg:!w-[160px] object-contain relative z-10 
                    transition-all duration-500 ease-out
                    group-hover:scale-110 group-hover:rotate-3
                    group-hover:drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                />
              </div>
            </Link>

            {/* Desktop Navigation with Animations */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link, index) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link)}
                  className="relative px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                    hover:text-green-600 dark:hover:text-green-400 
                    transition-all duration-300 ease-out
                    group"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Animated background */}
                  <span className="absolute inset-0 rounded-lg bg-green-50 dark:bg-green-900/20 
                    scale-0 group-hover:scale-100 
                    transition-transform duration-300 ease-out origin-center"></span>

                  {/* Text */}
                  <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                    {link.name}
                  </span>

                  {/* Underline animation */}
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 
                    group-hover:w-full group-hover:left-0 
                    transition-all duration-300 ease-out rounded-full"></span>

                  {/* Arrow indicator */}
                  <ChevronRight className={`absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 
                    opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0
                    transition-all duration-300 text-green-500`} />
                </button>
              ))}
            </div>

            {/* Desktop CTA Buttons with Animations */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Login Button */}
              <Link
                to="/login"
                className="relative text-sm font-medium text-gray-700 dark:text-gray-300 
                  px-4 py-2 rounded-lg overflow-hidden group
                  transition-all duration-300"
              >
                <span className="relative z-10 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                  Login
                </span>
                <span className="absolute inset-0 border-2 border-transparent group-hover:border-green-500/50 rounded-lg transition-all duration-300"></span>
              </Link>

              {/* Get Started Button - Animated */}
              <Link
                to="/signup"
                className="relative bg-gradient-to-r from-green-500 to-emerald-600 
                  text-white px-6 py-2.5 rounded-lg text-sm font-semibold
                  overflow-hidden group
                  shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40
                  transition-all duration-500 ease-out
                  hover:-translate-y-0.5 active:translate-y-0"
              >
                {/* Shine effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                  -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>

                {/* Ripple effect */}
                <span className="absolute inset-0 bg-white/10 scale-0 group-hover:scale-100 rounded-lg transition-transform duration-500 origin-center"></span>

                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Link>
            </div>

            {/* Mobile Menu Button - Animated */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
                transition-all duration-300 relative overflow-hidden group"
            >
              <div className="relative w-6 h-6">
                {/* Animated hamburger to X */}
                <span className={`absolute top-1/2 left-0 w-6 h-0.5 bg-gray-900 dark:bg-white rounded-full
                  transition-all duration-300 ease-out origin-center
                  ${isOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'}`}></span>
                <span className={`absolute top-1/2 left-0 w-6 h-0.5 bg-gray-900 dark:bg-white rounded-full
                  transition-all duration-300 ease-out
                  ${isOpen ? 'opacity-0 translate-x-3' : 'opacity-100'}`}></span>
                <span className={`absolute top-1/2 left-0 w-6 h-0.5 bg-gray-900 dark:bg-white rounded-full
                  transition-all duration-300 ease-out origin-center
                  ${isOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'}`}></span>
              </div>
            </button>
          </div>

          {/* Mobile Menu - Animated Slide Down */}
          <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-out
            ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-4">
              <div className="space-y-1">
                {navLinks.map((link, index) => (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link)}
                    className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 
                      hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent 
                      dark:hover:from-green-900/20 dark:hover:to-transparent
                      hover:text-green-600 dark:hover:text-green-400
                      rounded-lg transition-all duration-300 font-medium
                      hover:translate-x-2 hover:pl-6
                      border-l-2 border-transparent hover:border-green-500"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      transform: isOpen ? 'translateX(0)' : 'translateX(-20px)',
                      opacity: isOpen ? 1 : 0,
                      transition: `all 0.3s ease-out ${index * 50}ms`,
                    }}
                  >
                    <span className="flex items-center justify-between">
                      {link.name}
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </button>
                ))}

                <hr className="border-gray-200 dark:border-gray-700 my-3" />

                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-4 py-3 text-gray-700 dark:text-gray-300 
                    hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg 
                    transition-all duration-300 font-medium
                    hover:scale-[1.02]"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-gradient-to-r from-green-500 to-emerald-600 
                    hover:from-green-600 hover:to-emerald-700
                    text-white px-4 py-3 rounded-lg font-semibold 
                    transition-all duration-300 mt-2
                    hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/25
                    active:scale-100"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-16 lg:h-20"></div>
    </>
  );
};

export default Navbar;