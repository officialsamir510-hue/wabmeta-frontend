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
  ArrowRight,
  Play,
  PlayCircle
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

// ✅ NEW: Video Tutorial Interface
interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  thumbnail?: string; // Optional custom thumbnail
  youtubeId?: string; // YouTube video ID
  videoUrl?: string; // Direct video URL (if self-hosted)
  duration: string;
  category: 'getting-started' | 'features' | 'advanced' | 'troubleshooting';
}

const Help: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // ✅ CONTACT DETAILS
  const SUPPORT_WHATSAPP = '919211938200';
  const SUPPORT_EMAIL = 'wabmetacontact@gmail.com';
  const WHATSAPP_LINK = `https://wa.me/${SUPPORT_WHATSAPP}?text=Hi, I need help with WabMeta!`;

  // ✅ VIDEO TUTORIALS DATA
  const videoTutorials: VideoTutorial[] = [
    {
      id: '1',
      title: 'Getting Started with WabMeta',
      description: 'Learn how to set up your account and connect WhatsApp Business API',
      youtubeId: 'YOUR_YOUTUBE_VIDEO_ID_1', // Replace with actual YouTube ID
      duration: '5:30',
      category: 'getting-started',
    },
    {
      id: '2',
      title: 'How to Connect Meta Business Account',
      description: 'Step-by-step guide to connect your Meta Business account',
      youtubeId: 'YOUR_YOUTUBE_VIDEO_ID_2',
      duration: '8:45',
      category: 'getting-started',
    },
    {
      id: '3',
      title: 'Creating Your First Campaign',
      description: 'Learn how to create and send bulk WhatsApp campaigns',
      youtubeId: 'YOUR_YOUTUBE_VIDEO_ID_3',
      duration: '12:20',
      category: 'features',
    },
    {
      id: '4',
      title: 'WhatsApp Template Management',
      description: 'How to create, edit and get approval for message templates',
      youtubeId: 'YOUR_YOUTUBE_VIDEO_ID_4',
      duration: '10:15',
      category: 'features',
    },
    {
      id: '5',
      title: 'Building Chatbot Flows',
      description: 'Create automated chatbot flows with our visual builder',
      youtubeId: 'YOUR_YOUTUBE_VIDEO_ID_5',
      duration: '15:30',
      category: 'advanced',
    },
    {
      id: '6',
      title: 'Managing Inbox & Conversations',
      description: 'Handle customer conversations efficiently with our inbox',
      youtubeId: 'YOUR_YOUTUBE_VIDEO_ID_6',
      duration: '7:45',
      category: 'features',
    },
    {
      id: '7',
      title: 'Analytics & Reporting',
      description: 'Track campaign performance and conversation metrics',
      youtubeId: 'YOUR_YOUTUBE_VIDEO_ID_7',
      duration: '9:20',
      category: 'features',
    },
    {
      id: '8',
      title: 'Troubleshooting Common Issues',
      description: 'Fix common problems like message delivery failures',
      youtubeId: 'YOUR_YOUTUBE_VIDEO_ID_8',
      duration: '11:00',
      category: 'troubleshooting',
    },
  ];

  const videoCategories = [
    { id: 'all', label: 'All Videos', icon: Video },
    { id: 'getting-started', label: 'Getting Started', icon: PlayCircle },
    { id: 'features', label: 'Features', icon: Book },
    { id: 'advanced', label: 'Advanced', icon: FileText },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: HelpCircle },
  ];

  const filteredVideos = videoTutorials.filter(
    video => activeCategory === 'all' || video.category === activeCategory
  );

  // Video Modal Component
  const VideoModal: React.FC<{ video: VideoTutorial; onClose: () => void }> = ({ video, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="relative w-full max-w-4xl bg-gray-900 rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video Player */}
        <div className="relative pt-[56.25%]"> {/* 16:9 Aspect Ratio */}
          {video.youtubeId ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : video.videoUrl ? (
            <video
              className="absolute inset-0 w-full h-full"
              src={video.videoUrl}
              controls
              autoPlay
            />
          ) : null}
        </div>

        {/* Video Info */}
        <div className="p-6 bg-gray-800">
          <h3 className="text-xl font-bold text-white mb-2">{video.title}</h3>
          <p className="text-gray-400">{video.description}</p>
        </div>
      </div>
    </div>
  );

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
    { icon: Video, title: 'Video Tutorials', link: '#video-tutorials' },
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
              {channel.badge && (
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${channel.badgeColor} mb-3`}>
                  {channel.badge}
                </span>
              )}

              <div className={`inline-flex items-center justify-center w-12 h-12 ${channel.iconBg} rounded-xl mb-4`}>
                <channel.icon className={`w-6 h-6 ${channel.iconColor}`} />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {channel.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                {channel.description}
              </p>

              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3 mr-1" />
                {channel.responseTime}
              </div>
            </div>

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

      {/* ✅ NEW: VIDEO TUTORIALS SECTION */}
      <div id="video-tutorials" className="mb-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <Video className="w-7 h-7 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Video Tutorials
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Learn WabMeta with our step-by-step video guides
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {videoCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeCategory === category.id
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-green-500'
                }`}
            >
              <category.icon className="w-4 h-4" />
              {category.label}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => setSelectedVideo(video)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gradient-to-br from-green-500 to-emerald-600 overflow-hidden">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : video.youtubeId ? (
                  <img
                    src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to default thumbnail if maxres not available
                      e.currentTarget.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-16 h-16 text-white/50" />
                  </div>
                )}

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 rounded-full p-4 transform group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-green-600" fill="currentColor" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>

              {/* Video Info */}
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {video.description}
                </p>

                {/* Category Badge */}
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                    {videoCategories.find(c => c.id === video.category)?.label}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No videos found in this category
            </p>
          </div>
        )}
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
            <p className="text-green-600 dark:text-green-400 font-medium">+91 9211938200</p>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">Click to chat</span>
          </a>

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

          <a
            href={`tel:+${SUPPORT_WHATSAPP}`}
            className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 group"
          >
            <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Phone</h3>
            <p className="text-purple-600 dark:text-purple-400 font-medium">+91 9211938200</p>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">Click to call</span>
          </a>
        </div>

        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Business Hours: Monday - Saturday, 9:00 AM - 6:00 PM IST</span>
          </div>
        </div>
      </div>

      {/* ✅ VIDEO MODAL */}
      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}

      {/* ✅ FLOATING WHATSAPP BUTTON */}
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