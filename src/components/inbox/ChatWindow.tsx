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
  Zap
} from 'lucide-react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import QuickReplies from './QuickReplies';
import type { Conversation, Message, QuickReply } from '../../types/chat';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (content: string, type: 'text' | 'image' | 'document') => void;
  onToggleInfo: () => void;
  showInfo: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  onSendMessage,
  onToggleInfo,
  showInfo
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const quickReplies: QuickReply[] = [
    { id: '1', title: 'Greeting', message: 'Hello! How can I help you today?', shortcut: '/hello' },
    { id: '2', title: 'Thank You', message: 'Thank you for your message. We will get back to you shortly.', shortcut: '/thanks' },
    { id: '3', title: 'Business Hours', message: 'Our business hours are Monday to Friday, 9 AM to 6 PM.', shortcut: '/hours' },
    { id: '4', title: 'Order Status', message: 'Please share your order ID and I will check the status for you.', shortcut: '/order' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 100);
    }
  };

  const handleSend = (content: string, type: 'text' | 'image' | 'document') => {
    onSendMessage(content, type);
    setReplyTo(null);
    setShowQuickReplies(false);
  };

  const handleQuickReplySelect = (reply: QuickReply) => {
    onSendMessage(reply.message, 'text');
    setShowQuickReplies(false);
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    // Could show toast here
  };

  const { contact } = conversation;

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { date: string; messages: Message[] }[], message) => {
    const date = message.timestamp.split(' ')[0] || 'Today';
    const lastGroup = groups[groups.length - 1];
    
    if (lastGroup && lastGroup.date === date) {
      lastGroup.messages.push(message);
    } else {
      groups.push({ date, messages: [message] });
    }
    
    return groups;
  }, []);

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
            <div className="w-10 h-10 bg-linear-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
              {contact.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{contact.name}</h3>
            <p className="text-xs text-gray-500">
              {contact.lastSeen ? `Last seen ${contact.lastSeen}` : 'Online'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={onToggleInfo}
            className={`p-2 rounded-full transition-colors ${
              showInfo ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100 text-gray-600'
            }`}
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
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 animate-fade-in">
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
        className="flex-1 overflow-y-auto p-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4cfc4' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      >
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
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all animate-fade-in"
        >
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {/* Chat Input Area */}
      <div className="relative">
        {/* Quick Replies Toggle */}
        <button
          onClick={() => setShowQuickReplies(!showQuickReplies)}
          className={`absolute -top-12 left-4 flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            showQuickReplies 
              ? 'bg-primary-500 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Quick Replies</span>
        </button>

        {/* Quick Replies Panel */}
        <QuickReplies
          replies={quickReplies}
          onSelect={handleQuickReplySelect}
          isOpen={showQuickReplies}
          onClose={() => setShowQuickReplies(false)}
        />

        <ChatInput
          onSend={handleSend}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      </div>
    </div>
  );
};

export default ChatWindow;