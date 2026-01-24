import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import ConversationList from '../components/inbox/ConversationList';
import ChatWindow from '../components/inbox/ChatWindow';
import ContactInfo from '../components/inbox/ContactInfo';
import type { Conversation, Message } from '../types/chat';

const Inbox: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showContactInfo, setShowContactInfo] = useState(false);

  // Sample conversations data
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      contact: {
        id: 'c1',
        name: 'Priya Sharma',
        phone: '+91 98765 43210',
        email: 'priya@email.com',
        tags: ['VIP', 'Customer'],
        notes: 'Interested in premium plan',
        lastSeen: '2 min ago'
      },
      lastMessage: {
        id: 'm1',
        conversationId: '1',
        type: 'text',
        content: 'Thank you! I will check and get back to you.',
        isOutgoing: false,
        status: 'read',
        timestamp: '10:30 AM'
      },
      unreadCount: 3,
      status: 'open',
      labels: ['Sales', 'Priority'],
      isPinned: true,
      isMuted: false,
      updatedAt: '10:30 AM'
    },
    {
      id: '2',
      contact: {
        id: 'c2',
        name: 'Rahul Kumar',
        phone: '+91 87654 32109',
        tags: ['Lead'],
        lastSeen: '1 hour ago'
      },
      lastMessage: {
        id: 'm2',
        conversationId: '2',
        type: 'text',
        content: 'Hi, I wanted to inquire about your services.',
        isOutgoing: false,
        status: 'delivered',
        timestamp: '9:45 AM'
      },
      unreadCount: 1,
      status: 'pending',
      labels: [],
      isPinned: false,
      isMuted: false,
      updatedAt: '9:45 AM'
    },
    {
      id: '3',
      contact: {
        id: 'c3',
        name: 'Anjali Patel',
        phone: '+91 76543 21098',
        tags: ['Customer'],
        lastSeen: 'Yesterday'
      },
      lastMessage: {
        id: 'm3',
        conversationId: '3',
        type: 'image',
        content: '',
        mediaUrl: '/image.jpg',
        isOutgoing: true,
        status: 'read',
        timestamp: 'Yesterday'
      },
      unreadCount: 0,
      status: 'resolved',
      labels: ['Support'],
      isPinned: false,
      isMuted: false,
      updatedAt: 'Yesterday'
    },
    {
      id: '4',
      contact: {
        id: 'c4',
        name: 'Vikram Singh',
        phone: '+91 65432 10987',
        tags: ['VIP'],
        lastSeen: '3 days ago'
      },
      lastMessage: {
        id: 'm4',
        conversationId: '4',
        type: 'text',
        content: 'Your order has been shipped!',
        isOutgoing: true,
        status: 'delivered',
        timestamp: 'Dec 20'
      },
      unreadCount: 0,
      status: 'resolved',
      labels: [],
      isPinned: false,
      isMuted: true,
      updatedAt: 'Dec 20'
    },
    {
      id: '5',
      contact: {
        id: 'c5',
        name: 'Neha Gupta',
        phone: '+91 54321 09876',
        tags: ['Lead', 'Hot Lead'],
        lastSeen: 'Online'
      },
      lastMessage: {
        id: 'm5',
        conversationId: '5',
        type: 'document',
        content: '',
        mediaName: 'Proposal.pdf',
        isOutgoing: true,
        status: 'sent',
        timestamp: '8:15 AM'
      },
      unreadCount: 0,
      status: 'open',
      labels: ['Sales'],
      isPinned: false,
      isMuted: false,
      updatedAt: '8:15 AM'
    },
  ]);

  // Sample messages for selected conversation
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      conversationId: '1',
      type: 'text',
      content: 'Hello! I am interested in your WhatsApp API solution.',
      isOutgoing: false,
      status: 'read',
      timestamp: '10:00 AM'
    },
    {
      id: '2',
      conversationId: '1',
      type: 'text',
      content: 'Hi Priya! 👋 Thank you for reaching out. I would be happy to help you with our WhatsApp API solution.',
      isOutgoing: true,
      status: 'read',
      timestamp: '10:02 AM'
    },
    {
      id: '3',
      conversationId: '1',
      type: 'text',
      content: 'Could you tell me more about the pricing plans?',
      isOutgoing: false,
      status: 'read',
      timestamp: '10:05 AM'
    },
    {
      id: '4',
      conversationId: '1',
      type: 'text',
      content: 'Of course! We have three plans:\n\n📱 Starter - ₹1,999/month\n🚀 Professional - ₹4,999/month\n🏢 Enterprise - Custom pricing\n\nWould you like me to send you a detailed brochure?',
      isOutgoing: true,
      status: 'read',
      timestamp: '10:08 AM'
    },
    {
      id: '5',
      conversationId: '1',
      type: 'text',
      content: 'Yes, please send me the brochure.',
      isOutgoing: false,
      status: 'read',
      timestamp: '10:10 AM'
    },
    {
      id: '6',
      conversationId: '1',
      type: 'document',
      content: '',
      mediaUrl: '/brochure.pdf',
      mediaName: 'WabMeta_Pricing_Brochure.pdf',
      isOutgoing: true,
      status: 'delivered',
      timestamp: '10:12 AM'
    },
    {
      id: '7',
      conversationId: '1',
      type: 'text',
      content: 'Here is our detailed pricing brochure. Let me know if you have any questions!',
      isOutgoing: true,
      status: 'delivered',
      timestamp: '10:12 AM'
    },
    {
      id: '8',
      conversationId: '1',
      type: 'text',
      content: 'Thank you! I will check and get back to you.',
      isOutgoing: false,
      status: 'read',
      timestamp: '10:30 AM'
    },
  ]);

  const handleSendMessage = (content: string, type: 'text' | 'image' | 'document') => {
    if (!selectedConversation) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      conversationId: selectedConversation.id,
      type,
      content,
      isOutgoing: true,
      status: 'sending',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate message being sent
    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        m.id === newMessage.id ? { ...m, status: 'sent' } : m
      ));
    }, 500);

    // Simulate delivery
    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        m.id === newMessage.id ? { ...m, status: 'delivered' } : m
      ));
    }, 1500);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Mark as read
    setConversations(prev => prev.map(c => 
      c.id === conversation.id ? { ...c, unreadCount: 0 } : c
    ));
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-4 lg:-m-6">
      {/* Conversation List - Always visible on desktop, hidden when chat selected on mobile */}
      <div className={`w-full md:w-96 shrink-0 ${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col`}>
        <ConversationList
          conversations={conversations}
          activeId={selectedConversation?.id || null}
          onSelect={handleSelectConversation}
          onNewChat={() => console.log('New chat')}
        />
      </div>

      {/* Chat Window */}
      {selectedConversation ? (
        <>
          <div className="flex-1 flex flex-col relative">
            {/* Back button for mobile */}
            <button
              onClick={() => setSelectedConversation(null)}
              className="md:hidden absolute top-3 left-2 z-10 p-2 bg-white/80 backdrop-blur rounded-full shadow"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <ChatWindow
              conversation={selectedConversation}
              messages={messages}
              onSendMessage={handleSendMessage}
              onToggleInfo={() => setShowContactInfo(!showContactInfo)}
              showInfo={showContactInfo}
            />
          </div>

          {/* Contact Info Sidebar */}
          <ContactInfo
            contact={selectedConversation.contact}
            isOpen={showContactInfo}
            onClose={() => setShowContactInfo(false)}
          />
        </>
      ) : (
        /* Empty State - Desktop Only */
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Messages</h2>
            <p className="text-gray-500 max-w-sm">
              Select a conversation from the list to start chatting or create a new message.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;