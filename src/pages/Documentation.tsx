// src/pages/Documentation.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    MessageCircle,
    Book,
    Code,
    Zap,
    Settings,
    Users,
    Send,
    ChevronRight,
    Search,
    ExternalLink
} from 'lucide-react';

interface DocSection {
    id: string;
    title: string;
    icon: React.ElementType;
    content: {
        title: string;
        description: string;
    }[];
}

const Documentation: React.FC = () => {
    const [activeSection, setActiveSection] = useState('getting-started');
    const [searchQuery, setSearchQuery] = useState('');

    const docSections: DocSection[] = [
        {
            id: 'getting-started',
            title: 'Getting Started',
            icon: Zap,
            content: [
                {
                    title: '1. Create Your Account',
                    description: 'Sign up for WabMeta using your email address. Verify your email to activate your account and access the dashboard.'
                },
                {
                    title: '2. Connect WhatsApp Business',
                    description: 'Link your WhatsApp Business account through Meta Business Suite. You\'ll need a verified Facebook Business account and WhatsApp Business API access.'
                },
                {
                    title: '3. Set Up Your Profile',
                    description: 'Complete your business profile with company name, logo, and contact information. This information will be visible to your customers.'
                },
                {
                    title: '4. Create Your First Template',
                    description: 'Design message templates for marketing, utility, or authentication purposes. Templates need Meta approval before use.'
                }
            ]
        },
        {
            id: 'campaigns',
            title: 'Campaigns',
            icon: Send,
            content: [
                {
                    title: 'Creating a Campaign',
                    description: 'Navigate to Campaigns > Create New. Select your target audience, choose a template, and schedule your campaign for optimal delivery times.'
                },
                {
                    title: 'Audience Selection',
                    description: 'Upload contacts via CSV or select from existing contact groups. Use filters to target specific segments based on tags, location, or engagement history.'
                },
                {
                    title: 'Variable Mapping',
                    description: 'Map dynamic variables like {{name}}, {{order_id}} to your contact data columns for personalized messaging at scale.'
                },
                {
                    title: 'Campaign Analytics',
                    description: 'Track delivery rates, read rates, and response rates in real-time. Export reports for detailed analysis.'
                }
            ]
        },
        {
            id: 'templates',
            title: 'Message Templates',
            icon: Book,
            content: [
                {
                    title: 'Template Categories',
                    description: 'Choose from Marketing (promotional), Utility (transactional), or Authentication (OTP) categories based on your use case.'
                },
                {
                    title: 'Template Components',
                    description: 'Add headers (text/image/video/document), body text with variables, footer text, and interactive buttons (quick reply or call-to-action).'
                },
                {
                    title: 'Approval Process',
                    description: 'Templates are submitted to Meta for review. Approval typically takes 24-48 hours. Ensure compliance with WhatsApp policies.'
                },
                {
                    title: 'Best Practices',
                    description: 'Keep messages concise, use personalization, include clear CTAs, and maintain a friendly professional tone.'
                }
            ]
        },
        {
            id: 'inbox',
            title: 'Inbox & Conversations',
            icon: MessageCircle,
            content: [
                {
                    title: '24-Hour Window',
                    description: 'WhatsApp allows free-form messaging within 24 hours of the last customer message. Outside this window, only approved templates can be sent.'
                },
                {
                    title: 'Quick Replies',
                    description: 'Set up predefined responses for common queries. Access them with shortcuts to improve response time.'
                },
                {
                    title: 'Contact Management',
                    description: 'View contact details, conversation history, and add notes. Tag contacts for better organization and segmentation.'
                },
                {
                    title: 'Media Handling',
                    description: 'Send and receive images, videos, documents, and voice notes. All media is securely stored and accessible in conversation history.'
                }
            ]
        },
        {
            id: 'api',
            title: 'API Integration',
            icon: Code,
            content: [
                {
                    title: 'API Authentication',
                    description: 'Use your API key from Settings > API Configuration. Include it in the Authorization header as Bearer token.'
                },
                {
                    title: 'Sending Messages',
                    description: 'POST to /api/messages with recipient phone number, template name, and variable values. Rate limits apply based on your plan.'
                },
                {
                    title: 'Webhook Events',
                    description: 'Configure webhooks to receive real-time notifications for message delivery, read receipts, and incoming messages.'
                },
                {
                    title: 'Error Handling',
                    description: 'API returns standard HTTP status codes. Check the error object in response for detailed error messages and suggested fixes.'
                }
            ]
        },
        {
            id: 'team',
            title: 'Team Management',
            icon: Users,
            content: [
                {
                    title: 'Inviting Team Members',
                    description: 'Go to Settings > Team > Invite Member. Enter email and assign role (Admin, Manager, or Agent).'
                },
                {
                    title: 'Role Permissions',
                    description: 'Admin: Full access. Manager: Campaign & template management. Agent: Inbox access only.'
                },
                {
                    title: 'Activity Logs',
                    description: 'Monitor team actions including logins, campaign launches, and settings changes for accountability.'
                }
            ]
        },
        {
            id: 'settings',
            title: 'Settings & Configuration',
            icon: Settings,
            content: [
                {
                    title: 'Business Profile',
                    description: 'Update your business name, description, address, and website that appears in WhatsApp Business profile.'
                },
                {
                    title: 'Notification Preferences',
                    description: 'Configure email and in-app notifications for new messages, campaign completions, and account alerts.'
                },
                {
                    title: 'Security Settings',
                    description: 'Enable two-factor authentication, manage API keys, and review active sessions for account security.'
                },
                {
                    title: 'Billing & Subscription',
                    description: 'View current plan, usage statistics, and upgrade options. Manage payment methods and download invoices.'
                }
            ]
        }
    ];

    const filteredSections = docSections.filter(section =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.content.some(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const currentSection = docSections.find(s => s.id === activeSection);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" className="flex items-center">
                            <MessageCircle className="h-8 w-8 text-green-500" />
                            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">WabMeta</span>
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">/ Docs</span>
                        </Link>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/contact"
                                className="text-gray-600 dark:text-gray-300 hover:text-green-500 transition-colors"
                            >
                                Contact Support
                            </Link>
                            <Link
                                to="/"
                                className="text-gray-600 dark:text-gray-300 hover:text-green-500 transition-colors"
                            >
                                ← Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-white">Documentation</h1>
                        <p className="mt-4 text-xl text-green-100">
                            Everything you need to know about using WabMeta
                        </p>
                    </div>

                    {/* Search */}
                    <div className="mt-8 max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search documentation..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-green-300 text-gray-900"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sticky top-24">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contents</h3>
                            <nav className="space-y-1">
                                {filteredSections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${activeSection === section.id
                                                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <section.icon className="w-4 h-4 mr-2" />
                                        {section.title}
                                        {activeSection === section.id && (
                                            <ChevronRight className="w-4 h-4 ml-auto" />
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {currentSection && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                                <div className="flex items-center mb-6">
                                    <currentSection.icon className="w-8 h-8 text-green-500 mr-3" />
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {currentSection.title}
                                    </h2>
                                </div>

                                <div className="space-y-8">
                                    {currentSection.content.map((item, index) => (
                                        <div key={index} className="border-l-4 border-green-500 pl-6">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                {item.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Help Box */}
                                <div className="mt-12 bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                                        Need more help?
                                    </h4>
                                    <p className="text-green-700 dark:text-green-400 mb-4">
                                        Can't find what you're looking for? Our support team is here to help.
                                    </p>
                                    <a
                                        href="https://wa.me/919310010763?text=Hi, I need help with WabMeta documentation"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-green-600 dark:text-green-400 hover:text-green-700 font-medium"
                                    >
                                        Contact Support <ExternalLink className="w-4 h-4 ml-1" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-400">
                        © {new Date().getFullYear()} WabMeta. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Documentation;