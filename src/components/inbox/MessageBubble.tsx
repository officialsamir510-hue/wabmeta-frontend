// src/components/inbox/MessageBubble.tsx - COMPLETE FIXED VERSION

import React, { useState } from 'react';
import {
  Check,
  CheckCheck,
  Clock,
  MoreVertical,
  Reply,
  Copy,
  Trash2,
  Download,
  Play,
  Pause,
  File,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'TEMPLATE' | 'STICKER' | 'LOCATION';
  direction: 'INBOUND' | 'OUTBOUND';
  status?: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  createdAt: string;
  mediaUrl?: string;
  templateName?: string;
  metadata?: any;
}

interface MessageBubbleProps {
  message: Message;
  onReply?: (message: Message) => void;
  onCopy?: (content: string) => void;
  onDelete?: (id: string) => void;
}

// ✅ Helper to safely parse content
const parseContent = (content: string, type: string) => {
  if (type === 'TEMPLATE') {
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      // Backend Fix 1 se 'body' milega, agar nahi mila toh fallback
      return {
        body: parsed.body || parsed.templateName || 'Template Message',
        header: parsed.header || null,
        footer: parsed.footer || null,
        isTemplate: true
      };
    } catch (e) {
      return { body: content, isTemplate: true };
    }
  }
  return { body: content, isTemplate: false };
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onReply,
  onCopy,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const isOutgoing = message.direction === 'OUTBOUND';

  const { body, header, footer, isTemplate } = parseContent(message.content, message.type);

  // ✅ Status Icon Logic (Corrected)
  const getStatusIcon = (status?: string) => {
    const st = status?.toUpperCase();
    if (st === 'READ') return <CheckCheck className="w-3.5 h-3.5 text-blue-400" />;
    if (st === 'DELIVERED') return <CheckCheck className="w-3.5 h-3.5 text-gray-300" />;
    if (st === 'SENT') return <Check className="w-3.5 h-3.5 text-gray-300" />;
    return <Clock className="w-3.5 h-3.5 text-gray-400" />;
  };

  // ✅ FIXED: Render message content based on type
  const renderContent = () => {
    if (isTemplate) {
      return (
        <div className="space-y-1.5">
          {header && <p className="text-sm font-semibold opacity-90 pb-1">{header}</p>}
          <p className="text-sm whitespace-pre-wrap">{body}</p>
          {footer && <p className="text-[10px] opacity-70 pt-1">{footer}</p>}
        </div>
      );
    }

    switch (message.type) {

      case 'IMAGE':
        return (
          <div className="relative group">
            {message.mediaUrl ? (
              <img
                src={message.mediaUrl}
                alt="Image"
                className="max-w-xs rounded-lg cursor-pointer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.png';
                }}
              />
            ) : (
              <div className="w-48 h-32 bg-gray-700 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
            {message.content && message.content !== '[Image]' && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        );

      case 'VIDEO':
        return (
          <div className="relative group">
            <div className="w-64 h-40 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              </div>
            </div>
            {message.content && message.content !== '[Video]' && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        );

      case 'DOCUMENT':
        return (
          <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg min-w-[200px]">
            <div className="w-10 h-12 bg-red-500 rounded flex items-center justify-center">
              <File className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {message.content !== '[Document]' ? message.content : 'Document'}
              </p>
              <p className="text-xs opacity-70">PDF Document</p>
            </div>
            {message.mediaUrl && (
              <a
                href={message.mediaUrl}
                download
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
          </div>
        );

      case 'AUDIO':
        return (
          <div className="flex items-center space-x-3 min-w-[200px]">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            <div className="flex-1 h-1 bg-white/30 rounded-full">
              <div className="w-1/3 h-full bg-white rounded-full"></div>
            </div>
            <span className="text-xs opacity-70">0:32</span>
          </div>
        );

      case 'LOCATION':
        return (
          <div className="w-64">
            <div className="h-32 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm">{message.content || 'Location shared'}</p>
          </div>
        );

      default:
        return (
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {body}
          </p>
        );
    }
  };

  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} mb-2 group`}>
      <div className={`relative max-w-[70%] ${isOutgoing ? 'order-1' : ''}`}>
        {/* Message Bubble */}
        <div
          className={`relative px-3 py-2 rounded-lg shadow-sm ${isOutgoing
            ? 'bg-[#005c4b] text-white rounded-tr-none'
            : 'bg-white text-gray-900 rounded-tl-none border border-gray-100'
            }`}
        >
          {/* Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity ${isOutgoing ? 'left-1' : 'right-1'
              }`}
          >
            <MoreVertical className="w-4 h-4 opacity-60" />
          </button>

          {/* Menu Dropdown */}
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div
                className={`absolute top-0 z-20 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 animate-fade-in ${isOutgoing ? 'right-full mr-2' : 'left-full ml-2'
                  }`}
              >
                <button
                  onClick={() => {
                    onReply?.(message);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Reply className="w-4 h-4" />
                  <span className="text-sm">Reply</span>
                </button>
                <button
                  onClick={() => {
                    onCopy?.(message.content);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Copy</span>
                </button>
                {isOutgoing && (
                  <>
                    <hr className="my-1 border-gray-100 dark:border-gray-700" />
                    <button
                      onClick={() => {
                        onDelete?.(message.id);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Delete</span>
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {/* Content */}
          {renderContent()}

          {/* Timestamp & Status */}
          <div
            className={`flex items-center justify-end space-x-1 mt-1.5 ${isOutgoing ? 'text-white/70' : 'text-gray-400'
              }`}
          >
            <span className="text-[10px]">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {isOutgoing && getStatusIcon(message.status)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;