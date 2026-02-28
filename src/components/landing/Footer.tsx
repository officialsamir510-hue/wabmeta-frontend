// src/components/landing/Footer.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  MessageCircle,
  ArrowRight,
  Heart,
  ExternalLink
} from 'lucide-react';
import logo from '../../assets/logo.png';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features', type: 'scroll' },
      { name: 'Pricing', href: '#pricing', type: 'scroll' },
      { name: 'Documentation', href: '/documentation', type: 'link' },
      { name: 'Blog', href: '/blog', type: 'link' },
    ],
    company: [
      { name: 'About Us', href: '#team', type: 'scroll' },
      { name: 'Contact', href: '/contact', type: 'link' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy', type: 'link' },
      { name: 'Terms of Service', href: '/terms', type: 'link' },
      { name: 'Data Deletion', href: '/data-deletion', type: 'link' },
    ],
  };

  const contactInfo = {
    whatsapp: '+91 9310010763',
    whatsappLink: 'https://wa.me/919310010763?text=Hi, I have a query about WabMeta!',
    email: 'wabmetacontact@gmail.com',
    location: 'New Delhi, India',
  };

  const socialLinks = [
    { name: 'WhatsApp', icon: MessageCircle, href: contactInfo.whatsappLink, color: 'hover:text-green-500 hover:bg-green-500/10', hoverBg: 'group-hover:bg-green-500' },
    { name: 'Facebook', icon: Facebook, href: '#', color: 'hover:text-blue-500 hover:bg-blue-500/10', hoverBg: 'group-hover:bg-blue-500' },
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-sky-400 hover:bg-sky-400/10', hoverBg: 'group-hover:bg-sky-400' },
    { name: 'LinkedIn', icon: Linkedin, href: '#', color: 'hover:text-blue-600 hover:bg-blue-600/10', hoverBg: 'group-hover:bg-blue-600' },
    { name: 'Instagram', icon: Instagram, href: '#', color: 'hover:text-pink-500 hover:bg-pink-500/10', hoverBg: 'group-hover:bg-pink-500' },
  ];

  const handleScrollLink = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 to-gray-950 text-white overflow-hidden">

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Footer */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            {/* Animated Logo */}
            <Link
              to="/"
              className="inline-block mb-4 h-16 lg:h-20 overflow-visible group"
            >
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-700 scale-150"></div>
                <img
                  src={logo}
                  alt="WabMeta"
                  style={{ height: '140px', width: '140px', marginTop: '-30px' }}
                  className="lg:!h-[180px] lg:!w-[180px] lg:!mt-[-40px] object-contain relative z-10
                    transition-all duration-500 ease-out
                    group-hover:scale-110 group-hover:rotate-6
                    group-hover:drop-shadow-[0_0_25px_rgba(34,197,94,0.5)]"
                />
              </div>
            </Link>

            <p className="text-gray-400 mb-6 max-w-sm text-sm leading-relaxed
              hover:text-gray-300 transition-colors duration-300">
              Powerful WhatsApp Business API platform for marketing, support, and automation.
              Connect with your customers like never before.
            </p>

            {/* Animated Contact Info */}
            <div className="space-y-3">
              <a
                href={contactInfo.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-400 hover:text-green-400 
                  transition-all duration-300 text-sm group
                  hover:translate-x-2"
              >
                <span className="relative mr-3">
                  <Phone className="w-4 h-4 text-green-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                  <span className="absolute inset-0 bg-green-500/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </span>
                <span className="group-hover:underline underline-offset-2">{contactInfo.whatsapp}</span>
                <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" />
              </a>

              <a
                href={`mailto:${contactInfo.email}`}
                className="flex items-center text-gray-400 hover:text-green-400 
                  transition-all duration-300 text-sm group
                  hover:translate-x-2"
              >
                <span className="relative mr-3">
                  <Mail className="w-4 h-4 text-green-500 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" />
                  <span className="absolute inset-0 bg-green-500/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </span>
                <span className="group-hover:underline underline-offset-2">{contactInfo.email}</span>
              </a>

              <div className="flex items-center text-gray-400 text-sm group hover:text-gray-300 transition-colors duration-300">
                <span className="relative mr-3">
                  <MapPin className="w-4 h-4 text-green-500 transition-transform duration-300 group-hover:scale-110 group-hover:bounce" />
                  <span className="absolute inset-0 bg-green-500/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </span>
                <span>{contactInfo.location}</span>
              </div>
            </div>
          </div>

          {/* Product Links - Animated */}
          <div>
            <h3 className="text-base font-semibold mb-4 relative inline-block">
              Product
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-green-500 to-transparent rounded-full"></span>
            </h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link, index) => (
                <li key={link.name} style={{ animationDelay: `${index * 100}ms` }}>
                  {link.type === 'scroll' ? (
                    <button
                      onClick={() => handleScrollLink(link.href)}
                      className="text-gray-400 hover:text-green-400 transition-all duration-300 text-sm
                        flex items-center group hover:translate-x-2"
                    >
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 
                        group-hover:opacity-100 group-hover:translate-x-0 
                        transition-all duration-300 text-green-500" />
                      <span className="relative">
                        {link.name}
                        <span className="absolute bottom-0 left-0 w-0 h-px bg-green-500 
                          group-hover:w-full transition-all duration-300"></span>
                      </span>
                    </button>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-green-400 transition-all duration-300 text-sm
                        flex items-center group hover:translate-x-2"
                    >
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 
                        group-hover:opacity-100 group-hover:translate-x-0 
                        transition-all duration-300 text-green-500" />
                      <span className="relative">
                        {link.name}
                        <span className="absolute bottom-0 left-0 w-0 h-px bg-green-500 
                          group-hover:w-full transition-all duration-300"></span>
                      </span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links - Animated */}
          <div>
            <h3 className="text-base font-semibold mb-4 relative inline-block">
              Company
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-green-500 to-transparent rounded-full"></span>
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={link.name} style={{ animationDelay: `${index * 100}ms` }}>
                  {link.type === 'scroll' ? (
                    <button
                      onClick={() => handleScrollLink(link.href)}
                      className="text-gray-400 hover:text-green-400 transition-all duration-300 text-sm
                        flex items-center group hover:translate-x-2"
                    >
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 
                        group-hover:opacity-100 group-hover:translate-x-0 
                        transition-all duration-300 text-green-500" />
                      <span className="relative">
                        {link.name}
                        <span className="absolute bottom-0 left-0 w-0 h-px bg-green-500 
                          group-hover:w-full transition-all duration-300"></span>
                      </span>
                    </button>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-green-400 transition-all duration-300 text-sm
                        flex items-center group hover:translate-x-2"
                    >
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 
                        group-hover:opacity-100 group-hover:translate-x-0 
                        transition-all duration-300 text-green-500" />
                      <span className="relative">
                        {link.name}
                        <span className="absolute bottom-0 left-0 w-0 h-px bg-green-500 
                          group-hover:w-full transition-all duration-300"></span>
                      </span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links - Animated */}
          <div>
            <h3 className="text-base font-semibold mb-4 relative inline-block">
              Legal
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-green-500 to-transparent rounded-full"></span>
            </h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={link.name} style={{ animationDelay: `${index * 100}ms` }}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-green-400 transition-all duration-300 text-sm
                      flex items-center group hover:translate-x-2"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 
                      group-hover:opacity-100 group-hover:translate-x-0 
                      transition-all duration-300 text-green-500" />
                    <span className="relative">
                      {link.name}
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-green-500 
                        group-hover:w-full transition-all duration-300"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Animated */}
      <div className="relative border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">

            {/* Copyright with Animation */}
            <p className="text-gray-400 text-sm flex items-center gap-1 group">
              © {currentYear} WabMeta. Made with
              <Heart className="w-4 h-4 text-red-500 mx-1 
                animate-pulse group-hover:scale-125 
                transition-transform duration-300"
              />
              in India
            </p>

            {/* Animated Social Links */}
            <div className="flex items-center space-x-2">
              {socialLinks.map((social, index) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setHoveredSocial(social.name)}
                  onMouseLeave={() => setHoveredSocial(null)}
                  className={`relative p-2.5 rounded-full text-gray-400 
                    transition-all duration-300 ease-out
                    ${social.color}
                    hover:scale-110 hover:-translate-y-1
                    active:scale-95
                    group`}
                  title={social.name}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Background glow */}
                  <span className={`absolute inset-0 rounded-full opacity-0 
                    group-hover:opacity-100 transition-opacity duration-300
                    ${social.hoverBg} blur-md scale-150`}></span>

                  {/* Icon */}
                  <social.icon className="w-5 h-5 relative z-10 
                    transition-transform duration-300 
                    group-hover:rotate-12" />

                  {/* Tooltip */}
                  <span className={`absolute -top-8 left-1/2 -translate-x-1/2 
                    px-2 py-1 bg-gray-800 text-white text-xs rounded 
                    whitespace-nowrap pointer-events-none
                    transition-all duration-300
                    ${hoveredSocial === social.name ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-1'}`}>
                    {social.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom line */}
      <div className="h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>
    </footer>
  );
};

export default Footer;