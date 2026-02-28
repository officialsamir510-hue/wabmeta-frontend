// src/components/inbox/ChatWindow.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
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

// ... interfaces same as before ...
interface Message {
  id: string;
  content: string;
  type: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: string;
  createdAt: string;
  timestamp?: string;
  mediaUrl?: string;
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
  };
  lastMessageAt?: string;
  lastMessagePreview?: string;
  isWindowOpen: boolean;
  windowExpiresAt?: string;
  lastCustomerMessageAt?: string;
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
        const msgs = response.data.data?.messages || response.data.data || [];
        setMessages(Array.isArray(msgs) ? msgs.reverse() : []);
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (conversation?.unreadCount && conversation.unreadCount > 0) {
      inbox.markAsRead(conversation.id).then(() => onConversationUpdate?.());
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  const handleSendMessage = async (content: string) => {
    if (!conversation) return;
    try {
      const response = await inbox.sendMessage(conversation.id, { content, type: 'TEXT' });
      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.data]);
        onConversationUpdate?.();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send');
    }
  };

  const getContactName = () => {
    if (!conversation?.contact) return 'Unknown';
    const { firstName, lastName, whatsappProfileName, phone } = conversation.contact;
    return [firstName, lastName].filter(Boolean).join(' ') || whatsappProfileName || phone || 'Unknown';
  };

  // EMPTY STATE
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 h-full">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">
            Select a conversation
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 relative">
      {/* 1. HEADER (Fixed Height) */}
      <div className="flex-none h-16 px-4 flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-20">
        <div className="flex items-center">
          {onBack && (
            <button onClick={onBack} className="mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full lg:hidden">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
            <span className="text-green-600 font-semibold text-lg">
              {getContactName().charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white leading-tight">
              {getContactName()}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              +{conversation.contact.phone}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowContactInfo(!showContactInfo)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <Info className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* 2. WINDOW STATUS (Sticky under header) */}
      <div className="flex-none z-10">
        <WindowStatus
          windowExpiresAt={conversation.windowExpiresAt || null}
          isWindowOpen={conversation.isWindowOpen}
        />
      </div>

      {/* 3. MESSAGES AREA (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg as any} />
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            No messages yet. Start chatting!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. CHAT INPUT (Fixed at bottom) */}
      <div className="flex-none z-20">
        <ChatInput
          onSendMessage={handleSendMessage}
          onOpenTemplateModal={() => setShowTemplateModal(true)}
          isWindowOpen={conversation.isWindowOpen}
          windowExpiresAt={conversation.windowExpiresAt}
        />
      </div>

      {/* 5. SLIDE-OVERS & MODALS */}
      {showContactInfo && (
        <ContactInfo
          isOpen={showContactInfo}
          contact={{
            ...conversation.contact,
            name: getContactName(),
            tags: []
          }}
          onClose={() => setShowContactInfo(false)}
        />
      )}

      <SendTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSuccess={() => {
          fetchMessages();
          onConversationUpdate?.();
        }}
        conversationId={conversation.id}
        contactPhone={conversation.contact.phone}
        contactName={getContactName()}
      />
    </div>
  );
};

export default ChatWindow;