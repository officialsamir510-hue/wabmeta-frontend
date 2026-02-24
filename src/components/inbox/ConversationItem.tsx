import React from 'react';
import {
  Check,
  CheckCheck,
  Clock,
  Image,
  Video,
  FileText,
  Mic,
  MapPin,
  Pin,
  BellOff
} from 'lucide-react';
import type { Conversation, MessageStatus } from '../../types/chat';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick
}) => {
  const { contact, lastMessage, unreadCount, status, labels, isPinned, isMuted } = conversation;

  const getStatusIcon = (msgStatus: MessageStatus) => {
    switch (msgStatus) {
      case 'sending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getMessagePreview = () => {
    if (!lastMessage) return 'No messages yet';

    let prefix = '';
    if (lastMessage.isOutgoing) {
      prefix = 'You: ';
    }

    switch (lastMessage.type) {
      case 'image':
        return (
          <span className="flex items-center space-x-1">
            <Image className="w-4 h-4" />
            <span>Photo</span>
          </span>
        );
      case 'video':
        return (
          <span className="flex items-center space-x-1">
            <Video className="w-4 h-4" />
            <span>Video</span>
          </span>
        );
      case 'document':
        return (
          <span className="flex items-center space-x-1">
            <FileText className="w-4 h-4" />
            <span>{lastMessage.mediaName || 'Document'}</span>
          </span>
        );
      case 'audio':
        return (
          <span className="flex items-center space-x-1">
            <Mic className="w-4 h-4" />
            <span>Voice message</span>
          </span>
        );
      case 'location':
        return (
          <span className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>Location</span>
          </span>
        );
      default:
        return prefix + lastMessage.content;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'open':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-gray-400';
      case 'spam':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-4 cursor-pointer transition-all border-b border-gray-100 ${isActive
          ? 'bg-primary-50 border-l-4 border-l-primary-500'
          : 'hover:bg-gray-50'
        }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {contact.avatar ? (
          <img
            src={contact.avatar}
            alt={contact.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm">
            {contact.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* ✅ Unread Badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}

        {/* ✅ Online/New Message Indicator */}
        {unreadCount > 0 ? (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        ) : (
          <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${getStatusColor()}`} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 ml-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <h3 className={`font-semibold truncate ${unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
              {contact.name}
            </h3>
            {isPinned && <Pin className="w-3 h-3 text-gray-400" />}
            {isMuted && <BellOff className="w-3 h-3 text-gray-400" />}
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            {lastMessage?.isOutgoing && getStatusIcon(lastMessage.status)}
            <span>{lastMessage?.timestamp}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className={`text-sm truncate flex items-center ${unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
            }`}>
            {getMessagePreview()}
          </p>
          <div className="flex items-center space-x-2 ml-2">
            {/* Labels */}
            {labels.length > 0 && (
              <div className="flex space-x-1">
                {labels.slice(0, 2).map((label, index) => (
                  <span
                    key={index}
                    className="w-2 h-2 rounded-full bg-blue-500"
                    title={label}
                  ></span>
                ))}
              </div>
            )}
            {/* Unread Badge */}
            {unreadCount > 0 && (
              <span className="min-w-5 h-5 px-1.5 bg-primary-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;