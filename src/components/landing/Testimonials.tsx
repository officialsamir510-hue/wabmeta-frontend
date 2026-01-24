// src/components/landing/Testimonials.tsx
import React, { useState } from 'react';
import { 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Quote,
  Building2
} from 'lucide-react';

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Marketing Director',
      company: 'TechStart India',
      avatar: 'PS',
      rating: 5,
      text: 'WabMeta has transformed how we communicate with our customers. We\'ve seen a 40% increase in customer engagement since we started using the platform. The bulk messaging feature saves us hours every week.',
      metrics: { messages: '50K+', response: '95%', saved: '20hrs/week' }
    },
    {
      name: 'Rahul Verma',
      role: 'CEO',
      company: 'QuickCommerce',
      avatar: 'RV',
      rating: 5,
      text: 'The chatbot builder is incredibly intuitive. We set up our entire customer support automation in just one afternoon. Our support team can now focus on complex queries while the bot handles routine questions.',
      metrics: { messages: '100K+', response: '98%', saved: '40hrs/week' }
    },
    {
      name: 'Anjali Patel',
      role: 'Operations Head',
      company: 'FoodExpress',
      avatar: 'AP',
      rating: 5,
      text: 'Best WhatsApp API platform we\'ve used. The analytics dashboard gives us real-time insights into our campaigns. Customer support is excellent - they respond within minutes.',
      metrics: { messages: '200K+', response: '99%', saved: '60hrs/week' }
    },
    {
      name: 'Vikram Singh',
      role: 'Founder',
      company: 'EduLearn',
      avatar: 'VS',
      rating: 5,
      text: 'We were looking for a reliable WhatsApp solution for our ed-tech platform. WabMeta exceeded our expectations. The team collaboration features are fantastic for managing student queries.',
      metrics: { messages: '75K+', response: '97%', saved: '30hrs/week' }
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            Customer Stories
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Loved by{' '}
            <span className="gradient-text">10,000+ Businesses</span>
          </h2>
          <p className="text-xl text-gray-600">
            See what our customers have to say about WabMeta
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 relative">
            {/* Quote Icon */}
            <div className="absolute top-8 right-8 w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <Quote className="w-8 h-8 text-primary-500" />
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-1 mb-6">
              {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              ))}
            </div>

            {/* Testimonial Text */}
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8">
              "{testimonials[currentIndex].text}"
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-gray-50 rounded-2xl">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-500">
                  {testimonials[currentIndex].metrics.messages}
                </p>
                <p className="text-sm text-gray-500">Messages Sent</p>
              </div>
              <div className="text-center border-x border-gray-200">
                <p className="text-2xl font-bold text-primary-500">
                  {testimonials[currentIndex].metrics.response}
                </p>
                <p className="text-sm text-gray-500">Delivery Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-500">
                  {testimonials[currentIndex].metrics.saved}
                </p>
                <p className="text-sm text-gray-500">Time Saved</p>
              </div>
            </div>

            {/* Author */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-whatsapp-teal rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonials[currentIndex].avatar}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonials[currentIndex].name}</h4>
                  <p className="text-gray-500">{testimonials[currentIndex].role}</p>
                  <div className="flex items-center text-sm text-gray-400 mt-1">
                    <Building2 className="w-4 h-4 mr-1" />
                    {testimonials[currentIndex].company}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center space-x-2">
                <button 
                  onClick={prevTestimonial}
                  className="p-3 rounded-full bg-gray-100 hover:bg-primary-100 hover:text-primary-500 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={nextTestimonial}
                  className="p-3 rounded-full bg-gray-100 hover:bg-primary-100 hover:text-primary-500 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex items-center justify-center space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-primary-500 w-8' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            ></button>
          ))}
        </div>

        {/* Company Logos */}
        <div className="mt-16">
          <p className="text-center text-gray-500 mb-8">Trusted by leading companies</p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-50 grayscale">
            {['Flipkart', 'Zomato', 'Swiggy', 'PhonePe', 'Razorpay', 'Paytm'].map((company) => (
              <div key={company} className="text-2xl font-bold text-gray-400">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;