// src/components/landing/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
            ? 'bg-white dark:bg-gray-900 shadow-lg'
            : 'bg-white dark:bg-gray-900 shadow-md'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ✅ Height same - h-16 lg:h-20 */}
          <div className="flex justify-between items-center h-16 lg:h-20">

            {/* ✅ LOGO - Bigger (120px mobile, 160px desktop) */}
            <Link to="/" className="flex items-center -my-4">
              <img
                src={logo}
                alt="WabMeta"
                style={{ height: '120px', width: '120px' }}
                className="lg:!h-[160px] lg:!w-[160px] object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link)}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  {link.name}
                </button>
              ))}
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-md hover:shadow-lg"
              >
                Get Started Free
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isOpen ? (
                <X className="h-6 w-6 text-gray-900 dark:text-white" />
              ) : (
                <Menu className="h-6 w-6 text-gray-900 dark:text-white" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-4">
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link)}
                    className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 rounded-lg transition-colors font-medium"
                  >
                    {link.name}
                  </button>
                ))}
                <hr className="border-gray-200 dark:border-gray-700 my-3" />
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors mt-2"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer - same height */}
      <div className="h-16 lg:h-20"></div>
    </>
  );
};

export default Navbar;