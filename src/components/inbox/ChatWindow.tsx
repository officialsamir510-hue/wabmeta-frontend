// src/components/inbox/ChatWindow.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Phone,
  Video,
  Search,
  Star,
  Archive,
  Trash2,
  Ban,
  Info,
  ChevronDown,
  Zap,
  Loader2,
  CheckCircle,
  Clock,
  Send,
  X
} from 'lucide-react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import QuickReplies from './QuickReplies';
import type { Conversation, Message, QuickReply } from '../../types/chat';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (content: string, type?: 'text' | 'image' | 'document') => void;
  onToggleInfo: () => void;
  showInfo: boolean;
  loading?: boolean;
  sending?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  onSendMessage,
  onToggleInfo,
  showInfo,
  loading = false,
  sending = false,
  onLoadMore,
  hasMore = false
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Quick replies data
  const quickReplies: QuickReply[] = [
    { id: '1', title: 'Greeting', message: 'Hello! How can I help you today?', shortcut: '/hello' },
    { id: '2', title: 'Thank You', message: 'Thank you for your message. We will get back to you shortly.', shortcut: '/thanks' },
    { id: '3', title: 'Business Hours', message: 'Our business hours are Monday to Friday, 9 AM to 6 PM.', shortcut: '/hours' },
    { id: '4', title: 'Order Status', message: 'Please share your order ID and I will check the status for you.', shortcut: '/order' },
    { id: '5', title: 'Catalog', message: 'Here\'s our product catalog. Let me know if you need any information.', shortcut: '/catalog' },
    { id: '6', title: 'Support', message: 'I\'ll connect you with our support team right away.', shortcut: '/support' },
  ];

  // Scroll to bottom
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto'
    });
  };

  // Auto-scroll on new messages
  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, loading]);

  // Handle scroll for "scroll to bottom" button and infinite scroll
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;

      // Show/hide scroll to bottom button
      setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 100);

      // Load more messages when scrolled to top
      if (scrollTop < 100 && hasMore && !isLoadingMore && onLoadMore) {
        setIsLoadingMore(true);
        onLoadMore();
        setTimeout(() => setIsLoadingMore(false), 1000);
      }
    }
  };

  // Handle send message (simplified signature to match parent)
  const handleSend = (content: string) => {
    if (sending || !content.trim()) return;

    onSendMessage(content);
    setReplyTo(null);
    setShowQuickReplies(false);
  };

  // Handle quick reply selection
  const handleQuickReplySelect = (reply: QuickReply) => {
    handleSend(reply.message);
    setShowQuickReplies(false);
  };

  // Handle reply to message
  const handleReply = (message: Message) => {
    setReplyTo(message);
  };

  // Handle copy message
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const { contact } = conversation;

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    return messages.reduce((groups: { date: string; messages: Message[] }[], message) => {
      // eslint-disable-next-line react-hooks/purity
      const messageDate = new Date(message.timestamp || Date.now());
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateLabel = '';
      if (messageDate.toDateString() === today.toDateString()) {
        dateLabel = 'Today';
      } else if (messageDate.toDateString() === yesterday.toDateString()) {
        dateLabel = 'Yesterday';
      } else {
        dateLabel = messageDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }

      const lastGroup = groups[groups.length - 1];

      if (lastGroup && lastGroup.date === dateLabel) {
        lastGroup.messages.push(message);
      } else {
        groups.push({ date: dateLabel, messages: [message] });
      }

      return groups;
    }, []);
  }, [messages]);

  // Check if window is open (24-hour window)
  const isWindowOpen = conversation.isWindowOpen !== false;
  const windowExpiresAt = conversation.windowExpiresAt ? new Date(conversation.windowExpiresAt) : null;
  const windowExpired = windowExpiresAt ? windowExpiresAt < new Date() : false;

  return (
    <div className="flex flex-col h-full bg-[#efeae2]">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={onToggleInfo}
        >
          {contact.avatar ? (
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-linear-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
              {(contact.name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">
              {contact.name || contact.phone}
            </h3>
            <p className="text-xs text-gray-500">
              {contact.lastSeen || contact.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Voice Call"
          >
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Video Call"
          >
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Search Messages"
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={onToggleInfo}
            className={`p-2 rounded-full transition-colors ${showInfo ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-600'
              }`}
            title="Contact Info"
          >
            <Info className="w-5 h-5" />
          </button>

          {/* More Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                ></div>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                  <button className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50">
                    <Star className="w-4 h-4" />
                    <span className="text-sm">Star Messages</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50">
                    <Archive className="w-4 h-4" />
                    <span className="text-sm">Archive Chat</span>
                  </button>
                  <hr className="my-1 border-gray-100" />
                  <button className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50">
                    <Ban className="w-4 h-4" />
                    <span className="text-sm">Block Contact</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Delete Chat</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 relative"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4cfc4' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      >
        {/* Load More Indicator */}
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
          </div>
        )}

        {/* Loading State */}
        {loading && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin mb-4" />
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <Send className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500">No messages yet</p>
            <p className="text-sm text-gray-400 mt-2">Start a conversation!</p>
          </div>
        ) : (
          <>
            {groupedMessages.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* Date Separator */}
                <div className="flex items-center justify-center my-4">
                  <span className="px-4 py-1 bg-white text-gray-500 text-xs rounded-lg shadow-sm">
                    {group.date}
                  </span>
                </div>

                {/* Messages */}
                {group.messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onReply={handleReply}
                    onCopy={handleCopy}
                  />
                ))}
              </div>
            ))}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-24 right-6 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {/* Window Status Banner */}
      {!isWindowOpen || windowExpired ? (
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-200">
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-amber-700">
              24-hour messaging window expired. Customer must message first to reopen.
            </span>
          </div>
        </div>
      ) : windowExpiresAt ? (
        <div className="px-4 py-1 bg-green-50 border-t border-green-200">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="w-3 h-3" />
              <span>Messaging window open</span>
            </div>
            <span className="text-green-600">
              Expires: {windowExpiresAt.toLocaleTimeString()}
            </span>
          </div>
        </div>
      ) : null}

      {/* Chat Input Area */}
      <div className="relative">
        {/* Quick Replies Toggle */}
        {(isWindowOpen && !windowExpired) && (
          <button
            onClick={() => setShowQuickReplies(!showQuickReplies)}
            className={`absolute -top-12 left-4 flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${showQuickReplies
              ? 'bg-green-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
          >
            <Zap className="w-4 h-4" />
            <span>Quick Replies</span>
          </button>
        )}

        {/* Quick Replies Panel */}
        <QuickReplies
          replies={quickReplies}
          onSelect={handleQuickReplySelect}
          isOpen={showQuickReplies}
          onClose={() => setShowQuickReplies(false)}
        />

        {/* Reply To Preview */}
        {replyTo && (
          <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-10 bg-green-500 rounded"></div>
              <div>
                <p className="text-xs text-gray-500">Replying to</p>
                <p className="text-sm text-gray-700 line-clamp-1">
                  {replyTo.content || `[${replyTo.type}]`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}

        {/* Main Chat Input */}
        <ChatInput
          onSend={handleSend}
          disabled={!isWindowOpen || windowExpired || sending}
        />

        {/* Sending Overlay */}
        {sending && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center pointer-events-none">
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-lg">
              <Loader2 className="w-5 h-5 text-green-500 animate-spin" />
              <span className="text-sm text-gray-600">Sending message...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;