import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ChevronDown, 
  MessageSquare,
  Zap,
  Users,
  BarChart3,
  Bot,
  Send
} from 'lucide-react';
import Logo from '../common/Logo';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { name: 'Bulk Messaging', icon: Send, description: 'Send thousands of messages instantly' },
    { name: 'Live Chat', icon: MessageSquare, description: 'Real-time customer conversations' },
    { name: 'Chatbot Builder', icon: Bot, description: 'Automate with AI-powered bots' },
    { name: 'Team Inbox', icon: Users, description: 'Collaborate with your team' },
    { name: 'Analytics', icon: BarChart3, description: 'Track performance metrics' },
    { name: 'Automation', icon: Zap, description: 'Workflow automation tools' },
  ];

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isOpen) setIsOpen(false);
    };
    
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-soft' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo variant="full" theme="light" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Features Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('features')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-primary-500 font-medium transition-colors">
                <span>Features</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'features' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'features' && (
                <div className="absolute top-full left-0 w-125 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mt-2 grid grid-cols-2 gap-4 animate-fade-in">
                  {features.map((feature) => (
                    <Link
                      key={feature.name}
                      to={`/features/${feature.name.toLowerCase().replace(' ', '-')}`}
                      className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-500 transition-colors shrink-0">
                        <feature.icon className="w-5 h-5 text-primary-500 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{feature.name}</h4>
                        <p className="text-sm text-gray-500">{feature.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/pricing" className="px-4 py-2 text-gray-700 hover:text-primary-500 font-medium transition-colors">
              Pricing
            </Link>
            
            <Link to="/docs" className="px-4 py-2 text-gray-700 hover:text-primary-500 font-medium transition-colors">
              Documentation
            </Link>
            
            <Link to="/blog" className="px-4 py-2 text-gray-700 hover:text-primary-500 font-medium transition-colors">
              Blog
            </Link>
            
            <Link to="/contact" className="px-4 py-2 text-gray-700 hover:text-primary-500 font-medium transition-colors">
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link 
              to="/login" 
              className="px-5 py-2.5 text-gray-700 hover:text-primary-500 font-semibold transition-colors"
            >
              Log in
            </Link>
            <Link 
              to="/signup" 
              className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="lg:hidden fixed inset-0 top-20 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu Content */}
            <div 
              className="lg:hidden absolute top-20 left-0 right-0 bg-white border-t border-gray-100 shadow-xl z-50 animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-h-[calc(100vh-5rem)] overflow-y-auto py-4">
                <div className="space-y-1 px-4">
                  {/* Features Section */}
                  <div className="py-2">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Features
                    </p>
                    {features.map((feature) => (
                      <Link 
                        key={feature.name}
                        to={`/features/${feature.name.toLowerCase().replace(' ', '-')}`} 
                        className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                          <feature.icon className="w-4 h-4 text-primary-500" />
                        </div>
                        <span className="font-medium">{feature.name}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100 my-2" />

                  {/* Other Links */}
                  <Link 
                    to="/pricing" 
                    className="block px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link 
                    to="/docs" 
                    className="block px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Documentation
                  </Link>
                  <Link 
                    to="/blog" 
                    className="block px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Blog
                  </Link>
                  <Link 
                    to="/contact" 
                    className="block px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Contact
                  </Link>

                  {/* Auth Buttons */}
                  <div className="pt-4 space-y-3">
                    <Link 
                      to="/login" 
                      className="block w-full text-center py-3 text-gray-700 font-semibold border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link 
                      to="/signup" 
                      className="block w-full text-center py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Start Free Trial
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;