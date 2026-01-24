import React, { useState, useRef, useEffect } from 'react';
import {
  Smile,
  Paperclip,
  Mic,
  Send,
  X,
  Image,
  Camera,
  FileText,
  User,
  MapPin,
  StopCircle
} from 'lucide-react';
import type { Message } from '../../types/chat';

interface ChatInputProps {
  onSend: (content: string, type: 'text' | 'image' | 'document') => void;
  replyTo?: Message | null;
  onCancelReply?: () => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  replyTo,
  onCancelReply,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💯', '🙏', '👋', '😊', '🤔', '👏', '💪', '🎁', '📱'];

  const attachmentOptions = [
    { icon: Image, label: 'Photo & Video', color: 'bg-purple-500', accept: 'image/*,video/*' },
    { icon: Camera, label: 'Camera', color: 'bg-pink-500', accept: 'image/*' },
    { icon: FileText, label: 'Document', color: 'bg-blue-500', accept: '.pdf,.doc,.docx,.xls,.xlsx' },
    { icon: User, label: 'Contact', color: 'bg-green-500', accept: '' },
    { icon: MapPin, label: 'Location', color: 'bg-orange-500', accept: '' },
  ];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim(), 'text');
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setMessage(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  const handleFileSelect = (type: string) => {
    // In real app, handle file upload
    console.log('File type:', type);
    setShowAttachMenu(false);
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Reply Preview */}
      {replyTo && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className="w-1 h-10 bg-primary-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-primary-600">
                Replying to {replyTo.isOutgoing ? 'yourself' : 'contact'}
              </p>
              <p className="text-sm text-gray-500 truncate max-w-75">
                {replyTo.content}
              </p>
            </div>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-end space-x-3">
          {/* Emoji Button */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Smile className="w-6 h-6" />
            </button>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowEmojiPicker(false)}
                ></div>
                <div className="absolute bottom-full left-0 mb-2 p-3 bg-white rounded-xl shadow-lg border border-gray-200 z-20 animate-fade-in">
                  <div className="grid grid-cols-8 gap-1">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => handleEmojiClick(emoji)}
                        className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 rounded transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Attachment Button */}
          <div className="relative">
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Paperclip className="w-6 h-6" />
            </button>

            {/* Attachment Menu */}
            {showAttachMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowAttachMenu(false)}
                ></div>
                <div className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-xl shadow-lg border border-gray-200 z-20 animate-fade-in">
                  <div className="flex flex-col space-y-1">
                    {attachmentOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleFileSelect(option.label)}
                        className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className={`w-10 h-10 ${option.color} rounded-full flex items-center justify-center`}>
                          <option.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Input Field */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={disabled || isRecording}
              rows={1}
              className="w-full px-4 py-3 bg-gray-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all disabled:opacity-50"
              style={{ maxHeight: '120px' }}
            />
          </div>

          {/* Send / Voice Button */}
          {message.trim() ? (
            <button
              onClick={handleSend}
              disabled={disabled}
              className="p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`p-3 rounded-full transition-colors ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {isRecording ? (
                <StopCircle className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="flex items-center justify-center space-x-3 mt-3 text-red-600 animate-fade-in">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Recording... 0:05</span>
            <button
              onClick={() => setIsRecording(false)}
              className="text-sm underline"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;