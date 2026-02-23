// src/components/inbox/ChatInput.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  FileText,
  Loader2,
  Clock,
} from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string, type?: string) => Promise<void>;
  onOpenTemplateModal: () => void;
  disabled?: boolean;
  isWindowOpen: boolean;
  windowExpiresAt?: string | Date | null;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onOpenTemplateModal,
  disabled = false,
  isWindowOpen,
  windowExpiresAt,
  placeholder = 'Type a message...',
}) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check if window is actually open
  const checkWindowOpen = () => {
    if (!isWindowOpen) return false;
    if (!windowExpiresAt) return false;

    const expiresAt = new Date(windowExpiresAt);
    return expiresAt > new Date();
  };

  const windowOpen = checkWindowOpen();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || sending || disabled) return;

    // Check if window is open for free-form messages
    if (!windowOpen) {
      onOpenTemplateModal();
      return;
    }

    try {
      setSending(true);
      await onSendMessage(message.trim());
      setMessage('');

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Send message error:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // If window is closed, show template message prompt
  if (!windowOpen) {
    return (
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center text-center sm:text-left">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                24-Hour Session Expired
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Start a new session with a template message.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenTemplateModal}
            className="w-full sm:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4 mr-2" />
            Browse Templates
          </button>
        </div>
      </div>
    );
  }

  // Normal input when window is open
  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="flex items-end gap-3">
        {/* Attachment Button */}
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || sending}
            rows={1}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
        </div>

        {/* Emoji Button */}
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          title="Add emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || sending || disabled}
          className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Character count or hint */}
      {message.length > 0 && (
        <div className="flex justify-end mt-2">
          <span className={`text-xs ${message.length > 4000 ? 'text-red-500' : 'text-gray-400'
            }`}>
            {message.length}/4096
          </span>
        </div>
      )}
    </form>
  );
};

export default ChatInput;