import React, { useState } from 'react';
import { 
  Search, 
  Book, 
  Video, 
  MessageCircle, 
  ChevronRight, 
  LifeBuoy,
  FileText,
  Mail
} from 'lucide-react';

const Help: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      title: 'Getting Started',
      icon: Book,
      color: 'bg-blue-100 text-blue-600',
      articles: ['How to connect WhatsApp API?', 'Importing your first contacts', 'Creating your first template']
    },
    {
      title: 'Billing & Account',
      icon: FileText,
      color: 'bg-green-100 text-green-600',
      articles: ['Understanding pricing plans', 'How to download invoices', 'Updating payment methods']
    },
    {
      title: 'Automation & Bots',
      icon: Zap,
      color: 'bg-purple-100 text-purple-600',
      articles: ['Setting up quick replies', 'Building a chatbot flow', 'Automation rules explained']
    },
    {
      title: 'Troubleshooting',
      icon: LifeBuoy,
      color: 'bg-red-100 text-red-600',
      articles: ['Message failed to deliver', 'API connection issues', 'Template rejection reasons']
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-primary-600 to-whatsapp-teal rounded-3xl p-8 text-center text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">How can we help you?</h1>
          <p className="text-primary-100 mb-8">
            Search our knowledge base or contact our support team
          </p>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for articles, guides, and tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary-500/30 shadow-lg"
            />
          </div>
        </div>
        
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {faqCategories.map((category) => (
          <div key={category.title} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${category.color}`}>
              <category.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-4">{category.title}</h3>
            <ul className="space-y-3">
              {category.articles.map((article, index) => (
                <li key={index}>
                  <a href="#" className="text-sm text-gray-600 hover:text-primary-600 flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {article}
                  </a>
                </li>
              ))}
            </ul>
            <a href="#" className="inline-block mt-4 text-sm font-medium text-primary-600 hover:text-primary-700">
              View all articles →
            </a>
          </div>
        ))}
      </div>

      {/* Video Tutorials */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Video Tutorials</h2>
          <a href="#" className="text-primary-600 font-medium hover:text-primary-700">
            View channel
          </a>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-xl border border-gray-200 overflow-hidden group cursor-pointer">
              <div className="aspect-video bg-gray-100 relative flex items-center justify-center">
                <Video className="w-12 h-12 text-gray-400 group-hover:text-primary-500 transition-colors" />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors"></div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-1">Getting Started with WabMeta</h4>
                <p className="text-sm text-gray-500">5 min watch</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Still need help?</h2>
        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
          Our support team is available 24/7 to help you with any issues you might be facing.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-gray-200 hover:border-primary-500 hover:text-primary-600 rounded-xl transition-all shadow-sm">
            <MessageCircle className="w-5 h-5" />
            <span>Chat with Support</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors shadow-lg shadow-primary-500/25">
            <Mail className="w-5 h-5" />
            <span>Submit a Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Need to import Zap since it was missing in imports
import { Zap } from 'lucide-react';

export default Help;