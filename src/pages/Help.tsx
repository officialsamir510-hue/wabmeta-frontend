import React, { useState } from 'react';
import {
  HelpCircle,
  PlayCircle,
  Book,
  MessageCircle,
  Mail,
  ChevronDown,
  ChevronUp,
  Video,
  Clock,
  CheckCircle
} from 'lucide-react';

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  thumbnail?: string;
  category: string;
}

// ✅ ADD YOUR VIDEOS HERE
const VIDEO_TUTORIALS: VideoTutorial[] = [
  {
    id: '1',
    title: 'Getting Started with WabMeta',
    description: 'Learn how to set up your account and connect WhatsApp',
    duration: '5:30',
    videoUrl: '/videos/getting-started.mp4', // Your video file
    category: 'Getting Started'
  },
  {
    id: '2',
    title: 'Creating Your First Campaign',
    description: 'Step-by-step guide to create and send bulk campaigns',
    duration: '8:15',
    videoUrl: '/videos/create-campaign.mp4',
    category: 'Campaigns'
  },
  {
    id: '3',
    title: 'Managing Contacts & Groups',
    description: 'Import contacts, create groups, and organize your audience',
    duration: '6:45',
    videoUrl: '/videos/contacts-management.mp4',
    category: 'Contacts'
  },
  {
    id: '4',
    title: 'Setting Up Automation',
    description: 'Automate your messaging with triggers and workflows',
    duration: '10:20',
    videoUrl: '/videos/automation-setup.mp4',
    category: 'Automation'
  }
];

const FAQ_ITEMS = [
  {
    question: 'How do I connect my WhatsApp Business account?',
    answer: 'Go to Settings → WhatsApp, then click "Connect Cloud API" or "Connect Business App". Follow the Meta authorization process to complete the connection.'
  },
  {
    question: 'What is the difference between Cloud API and Business App?',
    answer: 'Cloud API is Meta\'s hosted solution for high-volume messaging. Business App connection uses your existing WhatsApp Business App. Both work seamlessly with WabMeta.'
  },
  {
    question: 'How many messages can I send per day?',
    answer: 'Message limits depend on your plan and WhatsApp quality rating. Starter plans allow 1,000 messages/day, while Enterprise plans offer unlimited messaging.'
  },
  {
    question: 'Why are my messages not being delivered?',
    answer: 'Check your WhatsApp quality rating, ensure templates are approved, and verify recipient numbers have WhatsApp. Also check your daily message limit.'
  },
  {
    question: 'How do I create message templates?',
    answer: 'Go to Templates section, click "Create Template", choose category (Marketing/Utility), add your content with variables, and submit for Meta approval.'
  }
];

export default function Help() {
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());

  const handleVideoComplete = (videoId: string) => {
    setWatchedVideos(prev => new Set(prev).add(videoId));
  };

  const categories = [...new Set(VIDEO_TUTORIALS.map(v => v.category))];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Help & Support
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Learn how to use WabMeta effectively with our video tutorials, guides, and FAQ
        </p>
      </div>

      {/* ✅ VIDEO TUTORIALS SECTION */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Video className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Video Tutorials
          </h2>
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-sm rounded-full">
            {VIDEO_TUTORIALS.length} videos
          </span>
        </div>

        {/* Video Player Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/80"
              onClick={() => setSelectedVideo(null)}
            />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden">
              {/* Video Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {selectedVideo.title}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedVideo.category}</p>
                </div>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  ✕
                </button>
              </div>
              
              {/* Video Player */}
              <div className="aspect-video bg-black">
                <video
                  src={selectedVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                  onEnded={() => handleVideoComplete(selectedVideo.id)}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              
              {/* Video Description */}
              <div className="p-4">
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedVideo.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Video Grid by Category */}
        {categories.map(category => (
          <div key={category} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              {category}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {VIDEO_TUTORIALS.filter(v => v.category === category).map((video) => (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className="group cursor-pointer bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all hover:border-purple-300 dark:hover:border-purple-700"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-purple-500 to-blue-600 relative">
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <PlayCircle className="w-10 h-10 text-white" />
                        </div>
                      </div>
                    )}
                    
                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {video.duration}
                    </div>

                    {/* Watched Badge */}
                    {watchedVideos.has(video.id) && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Watched
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                      {video.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {video.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* FAQ Section */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Book className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white pr-4">
                  {item.question}
                </span>
                {expandedFaq === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
                )}
              </button>
              
              {expandedFaq === index && (
                <div className="px-5 pb-5">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Support */}
      <section>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Still Need Help?</h2>
              <p className="text-white/80">
                Our support team is available 24/7 to assist you
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:support@wabmeta.com"
                className="flex items-center gap-2 px-5 py-3 bg-white text-green-600 rounded-xl hover:bg-gray-100 font-semibold transition-colors"
              >
                <Mail className="w-5 h-5" />
                Email Support
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 font-semibold transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}