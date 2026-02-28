// src/components/landing/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  MessageCircle
} from 'lucide-react';
import logo from '../../assets/logo.png';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

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

  const handleScrollLink = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* ✅ BRAND COLUMN - Logo with fixed height container */}
          <div className="lg:col-span-2">
            {/* Logo Container - Fixed height, logo overflows */}
            <Link to="/" className="inline-block mb-4 h-16 lg:h-20 overflow-visible">
              <img
                src={logo}
                alt="WabMeta"
                style={{ height: '140px', width: '140px', marginTop: '-30px' }}
                className="lg:!h-[180px] lg:!w-[180px] lg:!mt-[-40px] object-contain"
              />
            </Link>

            <p className="text-gray-400 mb-5 max-w-sm text-sm">
              Powerful WhatsApp Business API platform for marketing, support, and automation.
              Connect with your customers like never before.
            </p>

            {/* Contact Info */}
            <div className="space-y-2">
              <a
                href={contactInfo.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-400 hover:text-green-500 transition-colors text-sm"
              >
                <Phone className="w-4 h-4 mr-2 text-green-500" />
                <span>{contactInfo.whatsapp}</span>
              </a>
              <a
                href={`mailto:${contactInfo.email}`}
                className="flex items-center text-gray-400 hover:text-green-500 transition-colors text-sm"
              >
                <Mail className="w-4 h-4 mr-2 text-green-500" />
                <span>{contactInfo.email}</span>
              </a>
              <div className="flex items-center text-gray-400 text-sm">
                <MapPin className="w-4 h-4 mr-2 text-green-500" />
                <span>{contactInfo.location}</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-base font-semibold mb-3">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  {link.type === 'scroll' ? (
                    <button
                      onClick={() => handleScrollLink(link.href)}
                      className="text-gray-400 hover:text-green-500 transition-colors text-sm"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-green-500 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-base font-semibold mb-3">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  {link.type === 'scroll' ? (
                    <button
                      onClick={() => handleScrollLink(link.href)}
                      className="text-gray-400 hover:text-green-500 transition-colors text-sm"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-green-500 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-base font-semibold mb-3">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-green-500 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} WabMeta. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href={contactInfo.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-500 transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-500 transition-colors"
                title="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                title="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-600 transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-pink-500 transition-colors"
                title="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;