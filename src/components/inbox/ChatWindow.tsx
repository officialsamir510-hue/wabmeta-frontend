// src/components/inbox/ChatWindow.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  MoreVertical,
  Phone,
  Info,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { inbox } from '../../services/api';
import toast from 'react-hot-toast';

// Import components
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import WindowStatus from './WindowStatus';
import SendTemplateModal from './SendTemplateModal';
import ContactInfo from './ContactInfo';

interface Message {
  id: string;
  content: string;
  type: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: string;
  createdAt: string;
  mediaUrl?: string;
  conversationId?: string;
  isOutgoing?: boolean;
  timestamp?: string;
}

interface Conversation {
  id: string;
  contact: {
    id: string;
    phone: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    whatsappProfileName?: string;
    name?: string;
    tags?: string[];
  };
  lastMessageAt?: string;
  lastMessagePreview?: string;
  isWindowOpen: boolean;
  windowExpiresAt?: string | null;
  lastCustomerMessageAt?: string | null;
  unreadCount: number;
}

interface ChatWindowProps {
  conversation: Conversation | null;
  onBack?: () => void;
  onConversationUpdate?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  onBack,
  onConversationUpdate,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversation?.id) {
      fetchMessages();
      markAsRead();
    }
  }, [conversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!conversation) return;

    try {
      setLoading(true);
      const response = await inbox.getMessages(conversation.id, { limit: 100 });

      if (response.data.success) {
        const messagesData: any[] = response.data.data?.messages || response.data.data || [];
        const formattedMessages = messagesData.map((m: any) => ({
          ...m,
          isOutgoing: m.direction === 'OUTBOUND',
          timestamp: new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setMessages(formattedMessages.reverse()); // Oldest first
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!conversation || conversation.unreadCount === 0) return;

    try {
      await inbox.markAsRead(conversation.id);
      onConversationUpdate?.();
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string) => {
    if (!conversation) return;

    try {
      const response = await inbox.sendMessage(conversation.id, {
        content,
        type: 'TEXT',
      });

      if (response.data.success) {
        // Add message to list
        const m = response.data.data;
        const newMessage = {
          ...m,
          isOutgoing: m.direction === 'OUTBOUND' || true,
          timestamp: new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, newMessage]);
        onConversationUpdate?.();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error('Send message error:', error);
      toast.error(error.message || 'Failed to send message');
      throw error;
    }
  };

  const handleTemplateSuccess = () => {
    fetchMessages();
    onConversationUpdate?.();
  };

  const getContactName = () => {
    if (!conversation?.contact) return 'Unknown';

    const { firstName, lastName, whatsappProfileName, phone } = conversation.contact;

    if (firstName || lastName) {
      return [firstName, lastName].filter(Boolean).join(' ');
    }

    if (whatsappProfileName) {
      return whatsappProfileName;
    }

    return phone || 'Unknown';
  };

  // Empty state
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Choose a chat from the list to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          {/* Back button for mobile */}
          {onBack && (
            <button
              onClick={onBack}
              className="mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full lg:hidden"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}

          {/* Contact Avatar */}
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
            {conversation.contact.avatar ? (
              <img
                src={conversation.contact.avatar}
                alt=""
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <span className="text-green-600 font-semibold">
                {getContactName().charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {getContactName()}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              +{conversation.contact.phone}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowContactInfo(!showContactInfo)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* 24-Hour Window Status */}
      <WindowStatus
        windowExpiresAt={conversation.windowExpiresAt || null}
        isWindowOpen={conversation.isWindowOpen}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : messages.length > 0 ? (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message as any} />
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onOpenTemplateModal={() => setShowTemplateModal(true)}
        isWindowOpen={conversation.isWindowOpen}
        windowExpiresAt={conversation.windowExpiresAt}
      />

      {/* Contact Info Sidebar */}
      {showContactInfo && (
        <ContactInfo
          isOpen={showContactInfo}
          contact={{ ...conversation.contact, name: getContactName(), tags: conversation.contact.tags || [] }}
          onClose={() => setShowContactInfo(false)}
        />
      )}

      {/* Template Modal */}
      <SendTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSuccess={handleTemplateSuccess}
        conversationId={conversation.id}
        contactPhone={conversation.contact.phone}
        contactName={getContactName()}
      />
    </div>
  );
};

export default ChatWindow;