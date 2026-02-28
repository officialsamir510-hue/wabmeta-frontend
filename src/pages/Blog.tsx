// src/pages/Blog.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Calendar, User, ArrowRight, Clock } from 'lucide-react';

interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    author: string;
    date: string;
    readTime: string;
    category: string;
    image: string;
    featured?: boolean;
}

const Blog: React.FC = () => {
    const blogPosts: BlogPost[] = [
        {
            id: 1,
            title: 'Getting Started with WhatsApp Business API in 2024',
            excerpt: 'Learn how to set up and configure WhatsApp Business API for your business. A complete guide from registration to sending your first message.',
            author: 'Ankit Verma',
            date: 'Feb 25, 2024',
            readTime: '8 min read',
            category: 'Tutorial',
            image: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=800&h=400&fit=crop',
            featured: true
        },
        {
            id: 2,
            title: '10 WhatsApp Marketing Strategies That Actually Work',
            excerpt: 'Discover proven strategies to boost engagement and conversions through WhatsApp marketing campaigns.',
            author: 'Samir Thakur',
            date: 'Feb 20, 2024',
            readTime: '6 min read',
            category: 'Marketing',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop'
        },
        {
            id: 3,
            title: 'WhatsApp Template Best Practices for Higher Approval Rates',
            excerpt: 'Tips and tricks to create message templates that get approved by Meta quickly and effectively.',
            author: 'Ankit Verma',
            date: 'Feb 15, 2024',
            readTime: '5 min read',
            category: 'Guide',
            image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=400&fit=crop'
        },
        {
            id: 4,
            title: 'Automating Customer Support with WhatsApp Chatbots',
            excerpt: 'How to build effective chatbots that handle customer queries and improve response times.',
            author: 'Samir Thakur',
            date: 'Feb 10, 2024',
            readTime: '7 min read',
            category: 'Automation',
            image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&h=400&fit=crop'
        },
        {
            id: 5,
            title: 'Understanding WhatsApp Business API Pricing in India',
            excerpt: 'A complete breakdown of conversation-based pricing and how to optimize your messaging costs.',
            author: 'Ankit Verma',
            date: 'Feb 5, 2024',
            readTime: '4 min read',
            category: 'Business',
            image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop'
        },
        {
            id: 6,
            title: 'Case Study: How E-commerce Brands Use WhatsApp for Sales',
            excerpt: 'Real examples of businesses that increased their sales by 40% using WhatsApp Business API.',
            author: 'Samir Thakur',
            date: 'Jan 30, 2024',
            readTime: '10 min read',
            category: 'Case Study',
            image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop'
        }
    ];

    const featuredPost = blogPosts.find(post => post.featured);
    const regularPosts = blogPosts.filter(post => !post.featured);

    const categories = ['All', 'Tutorial', 'Marketing', 'Guide', 'Automation', 'Business', 'Case Study'];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" className="flex items-center">
                            <MessageCircle className="h-8 w-8 text-green-500" />
                            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">WabMeta</span>
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">/ Blog</span>
                        </Link>
                        <Link
                            to="/"
                            className="text-gray-600 dark:text-gray-300 hover:text-green-500 transition-colors"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
                        WabMeta Blog
                    </h1>
                    <p className="mt-4 text-xl text-green-100 max-w-2xl mx-auto">
                        Insights, tutorials, and best practices for WhatsApp Business API
                    </p>
                </div>
            </div>

            {/* Categories */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-wrap gap-2 justify-center">
                    {categories.map((category) => (
                        <button
                            key={category}
                            className="px-4 py-2 rounded-full text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900 hover:text-green-700 dark:hover:text-green-300 transition-colors shadow-sm"
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Featured Post */}
            {featuredPost && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                        <div className="md:flex">
                            <div className="md:w-1/2">
                                <img
                                    src={featuredPost.image}
                                    alt={featuredPost.title}
                                    className="h-64 md:h-full w-full object-cover"
                                />
                            </div>
                            <div className="md:w-1/2 p-8 flex flex-col justify-center">
                                <span className="inline-block bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold px-3 py-1 rounded-full mb-4 w-fit">
                                    Featured
                                </span>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    {featuredPost.title}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {featuredPost.excerpt}
                                </p>
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                                    <User className="w-4 h-4 mr-1" />
                                    <span className="mr-4">{featuredPost.author}</span>
                                    <Calendar className="w-4 h-4 mr-1" />
                                    <span className="mr-4">{featuredPost.date}</span>
                                    <Clock className="w-4 h-4 mr-1" />
                                    <span>{featuredPost.readTime}</span>
                                </div>
                                <button className="inline-flex items-center text-green-600 dark:text-green-400 font-semibold hover:text-green-700 transition-colors">
                                    Read More <ArrowRight className="w-4 h-4 ml-2" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Blog Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                    Latest Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {regularPosts.map((post) => (
                        <article
                            key={post.id}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                        >
                            <img
                                src={post.image}
                                alt={post.title}
                                className="h-48 w-full object-cover"
                            />
                            <div className="p-6">
                                <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                                    {post.category}
                                </span>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center">
                                        <User className="w-3 h-3 mr-1" />
                                        <span>{post.author}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        <span>{post.readTime}</span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Load More */}
                <div className="text-center mt-12">
                    <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
                        Load More Articles
                    </button>
                </div>
            </div>

            {/* Newsletter */}
            <div className="bg-green-600 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Subscribe to Our Newsletter
                    </h2>
                    <p className="text-green-100 mb-8 max-w-2xl mx-auto">
                        Get the latest WhatsApp Business tips and updates delivered to your inbox
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-300 border-0"
                        />
                        <button className="bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-400">
                        © {new Date().getFullYear()} WabMeta. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Blog;