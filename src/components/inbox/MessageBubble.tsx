import React, { useState } from 'react';
import {
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  MoreVertical,
  Reply,
  Copy,
  Trash2,
  Forward,
  Download,
  Play,
  Pause,
  File,
  MapPin
} from 'lucide-react';
import type { Message, MessageStatus } from '../../types/chat';

interface MessageBubbleProps {
  message: Message;
  onReply?: (message: Message) => void;
  onCopy?: (content: string) => void;
  onDelete?: (id: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onReply,
  onCopy,
  onDelete
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3.5 h-3.5 text-gray-400" />;
      case 'sent':
        return <Check className="w-3.5 h-3.5 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3.5 h-3.5 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3.5 h-3.5 text-blue-400" />;
      case 'failed':
        return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="relative group">
            <img
              src={message.mediaUrl || '/api/placeholder/300/200'}
              alt="Image"
              className="max-w-70 rounded-lg cursor-pointer"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Download className="w-8 h-8 text-white" />
            </div>
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="relative group">
            <div className="w-70 h-40 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              </div>
            </div>
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        );

      case 'document':
        return (
          <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg min-w-50">
            <div className="w-10 h-12 bg-red-500 rounded flex items-center justify-center">
              <File className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{message.mediaName || 'Document.pdf'}</p>
              <p className="text-xs opacity-70">PDF Document</p>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        );

      case 'audio':
        return (
          <div className="flex items-center space-x-3 min-w-50">
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

      case 'location':
        return (
          <div className="w-62.5">
            <div className="h-30 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm">{message.content || 'Location shared'}</p>
          </div>
        );

      default:
        return (
          <p className="text-sm whitespace-pre-wrap wrap-break-word">{message.content}</p>
        );
    }
  };

  return (
    <div
      className={`flex ${message.isOutgoing ? 'justify-end' : 'justify-start'} mb-2 group`}
    >
      <div className={`relative max-w-[70%] ${message.isOutgoing ? 'order-1' : ''}`}>
        {/* Reply Reference */}
        {message.replyTo && (
          <div 
            className={`px-3 py-2 rounded-t-lg border-l-2 mb-0.5 text-xs ${
              message.isOutgoing 
                ? 'bg-[#025144] border-green-400' 
                : 'bg-gray-100 border-gray-400'
            }`}
          >
            <p className="font-medium opacity-80">
              {message.replyTo.isOutgoing ? 'You' : 'Contact'}
            </p>
            <p className="opacity-60 truncate">{message.replyTo.content}</p>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`relative px-3 py-2 rounded-lg ${
            message.isOutgoing
              ? 'bg-[#005c4b] text-white rounded-tr-none'
              : 'bg-white text-gray-900 rounded-tl-none shadow-sm'
          }`}
        >
          {/* Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity ${
              message.isOutgoing ? 'left-1' : 'right-1'
            }`}
          >
            <MoreVertical className="w-4 h-4 opacity-60" />
          </button>

          {/* Menu */}
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              ></div>
              <div className={`absolute top-0 z-20 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-fade-in ${
                message.isOutgoing ? 'right-full mr-2' : 'left-full ml-2'
              }`}>
                <button
                  onClick={() => {
                    onReply?.(message);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <Reply className="w-4 h-4" />
                  <span className="text-sm">Reply</span>
                </button>
                <button
                  onClick={() => {
                    onCopy?.(message.content);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Copy</span>
                </button>
                <button className="w-full flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-50">
                  <Forward className="w-4 h-4" />
                  <span className="text-sm">Forward</span>
                </button>
                {message.isOutgoing && (
                  <>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => {
                        onDelete?.(message.id);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50"
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
          <div className={`flex items-center justify-end space-x-1 mt-1 ${
            message.isOutgoing ? 'text-green-200' : 'text-gray-400'
          }`}>
            <span className="text-[10px]">{message.timestamp}</span>
            {message.isOutgoing && getStatusIcon(message.status)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;