// src/pages/Help.tsx
import React, { useState } from 'react';
import {
  MessageCircle,
  Mail,
  Phone,
  FileText,
  HelpCircle,
  Book,
  Video,
  ChevronDown,
  ChevronUp,
  Search,
  Headphones,
  Clock,
  ArrowRight
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const Help: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  // ✅ CONTACT DETAILS
  const SUPPORT_WHATSAPP = '919310010763';
  const SUPPORT_EMAIL = 'wabmetacontact@gmail.com';
  const WHATSAPP_LINK = `https://wa.me/${SUPPORT_WHATSAPP}?text=Hi, I need help with WabMeta!`;

  const supportChannels = [
    {
      icon: MessageCircle,
      title: 'Chat with Support',
      description: 'Get instant help via WhatsApp',
      action: 'Chat Now',
      link: WHATSAPP_LINK,
      color: 'bg-green-500 hover:bg-green-600',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      badge: 'Fastest',
      badgeColor: 'bg-green-100 text-green-700',
      responseTime: 'Usually responds in 5 mins',
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us a detailed message',
      action: 'Send Email',
      link: `mailto:${SUPPORT_EMAIL}?subject=Support Request - WabMeta`,
      color: 'bg-blue-500 hover:bg-blue-600',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      badge: null,
      badgeColor: '',
      responseTime: 'Usually responds in 24 hours',
    },
    {
      icon: Phone,
      title: 'Call Support',
      description: 'Talk to our support team',
      action: 'Call Now',
      link: `tel:+${SUPPORT_WHATSAPP}`,
      color: 'bg-purple-500 hover:bg-purple-600',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      badge: null,
      badgeColor: '',
      responseTime: 'Mon-Sat, 9AM - 6PM IST',
    },
    {
      icon: Book,
      title: 'Documentation',
      description: 'Browse our detailed guides',
      action: 'View Docs',
      link: '/documentation',
      color: 'bg-orange-500 hover:bg-orange-600',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      badge: null,
      badgeColor: '',
      responseTime: 'Self-service',
    },
  ];

  const quickLinks = [
    { icon: FileText, title: 'Getting Started Guide', link: '/documentation#getting-started' },
    { icon: Video, title: 'Video Tutorials', link: '/documentation#tutorials' },
    { icon: HelpCircle, title: 'FAQs', link: '#faqs' },
    { icon: Book, title: 'API Documentation', link: '/documentation#api' },
  ];

  const faqs: FAQItem[] = [
    {
      question: 'How do I connect my WhatsApp Business account?',
      answer: 'Go to Settings > WhatsApp Settings > Connect Account. You\'ll need to log in with your Meta Business account and select the WhatsApp Business number you want to connect. Make sure you have admin access to the Meta Business account.'
    },
    {
      question: 'Why are my messages not being delivered?',
      answer: 'Message delivery issues can occur due to several reasons: 1) Template not approved by Meta, 2) Invalid phone number format, 3) User has blocked your number, 4) WhatsApp account restrictions. Check the campaign analytics for specific error messages.'
    },
    {
      question: 'How do I create a message template?',
      answer: 'Go to Templates > Create Template. Select the template category (Marketing, Utility, or Authentication), add your content with variables like {{1}}, {{2}}, and submit for Meta approval. Approval usually takes 24-48 hours.'
    },
    {
      question: 'What is the 24-hour messaging window?',
      answer: 'WhatsApp allows free-form messaging only within 24 hours of the customer\'s last message. Outside this window, you can only send pre-approved template messages. This is a WhatsApp Business API policy.'
    },
    {
      question: 'How do I upgrade my subscription?',
      answer: 'Go to Billing > Plans and select the plan you want. Click "Upgrade" and complete the payment through Razorpay. Your new plan benefits will be activated immediately after successful payment.'
    },
    {
      question: 'Can I import my existing contacts?',
      answer: 'Yes! Go to Contacts > Import. You can upload a CSV file with columns for phone number, name, and any custom fields. Make sure phone numbers include country code (e.g., 919876543210).'
    },
    {
      question: 'How do I set up automated responses?',
      answer: 'Navigate to Chatbot > Create New. Use the visual flow builder to design your automation. You can set triggers based on keywords, create decision trees, and add delays between messages.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major payment methods through Razorpay including Credit/Debit Cards, UPI, Net Banking, and Wallets. All payments are secure and encrypted.'
    },
  ];

  const filteredFAQs = faqs.filter(
    faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
          <Headphones className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Help & Support
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          Need assistance? We're here to help! Choose your preferred support channel or browse our resources.
        </p>
      </div>

      {/* ✅ SUPPORT CHANNELS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {supportChannels.map((channel, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            <div className="p-6 flex-1">
              {/* Badge */}
              {channel.badge && (
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${channel.badgeColor} mb-3`}>
                  {channel.badge}
                </span>
              )}

              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-12 h-12 ${channel.iconBg} rounded-xl mb-4`}>
                <channel.icon className={`w-6 h-6 ${channel.iconColor}`} />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {channel.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                {channel.description}
              </p>

              {/* Response Time */}
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3 mr-1" />
                {channel.responseTime}
              </div>
            </div>

            {/* Action Button */}
            <div className="px-6 pb-6">
              <a
                href={channel.link}
                target={channel.link.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className={`w-full flex items-center justify-center px-4 py-3 ${channel.color} text-white font-medium rounded-xl transition-colors`}
              >
                {channel.action}
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ QUICK WHATSAPP SUPPORT BANNER */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 md:p-8 mb-12 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-full">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Need Immediate Help?</h3>
              <p className="text-green-100">
                Chat with our support team on WhatsApp for instant assistance
              </p>
            </div>
          </div>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white text-green-600 font-semibold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Quick Links
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <a
              key={index}
              href={link.link}
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:shadow-md transition-all group"
            >
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                <link.icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400" />
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                {link.title}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* FAQs Section */}
      <div id="faqs" className="mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white pr-4">
                  {faq.question}
                </span>
                {openFAQ === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>

              {openFAQ === index && (
                <div className="px-5 pb-5 pt-0">
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No FAQs found matching your search.
              </p>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-green-600 dark:text-green-400 font-medium hover:underline"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask us on WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ✅ CONTACT INFO CARD */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Contact Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* WhatsApp */}
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 group"
          >
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">WhatsApp</h3>
            <p className="text-green-600 dark:text-green-400 font-medium">+91 9310010763</p>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">Click to chat</span>
          </a>

          {/* Email */}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 group"
          >
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h3>
            <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">{SUPPORT_EMAIL}</p>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">Click to email</span>
          </a>

          {/* Phone */}
          <a
            href={`tel:+${SUPPORT_WHATSAPP}`}
            className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 group"
          >
            <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Phone</h3>
            <p className="text-purple-600 dark:text-purple-400 font-medium">+91 9310010763</p>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">Click to call</span>
          </a>
        </div>

        {/* Business Hours */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Business Hours: Monday - Saturday, 9:00 AM - 6:00 PM IST</span>
          </div>
        </div>
      </div>

      {/* ✅ FLOATING WHATSAPP BUTTON (Optional) */}
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-50 group"
        title="Chat with Support"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Chat with Support
        </span>
      </a>
    </div>
  );
};

export default Help;