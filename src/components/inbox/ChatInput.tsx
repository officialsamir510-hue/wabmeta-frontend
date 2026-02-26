import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  FileText,
  Loader2,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmojiPicker, { type EmojiClickData, Theme } from 'emoji-picker-react';

interface ChatInputProps {
  onSendMessage: (message: string, type?: string) => Promise<void>;
  onOpenTemplateModal: () => void;
  onMediaUpload?: (file: File) => Promise<void>;
  disabled?: boolean;
  isWindowOpen: boolean;
  windowExpiresAt?: string | Date | null;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onOpenTemplateModal,
  onMediaUpload,
  disabled = false,
  isWindowOpen,
  windowExpiresAt,
  placeholder = 'Type a message...',
}) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const checkWindowOpen = () => {
    if (!isWindowOpen) return false;
    if (!windowExpiresAt) return false;
    const expiresAt = new Date(windowExpiresAt);
    return expiresAt > new Date();
  };

  const windowOpen = checkWindowOpen();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending || disabled) return;
    if (!windowOpen) {
      onOpenTemplateModal();
      return;
    }

    const textToSend = message.trim();
    // ✅ NO try/catch here, let handleSendMessage handle it if needed
    // or keep it for sending logic
    try {
      setSending(true);

      // ✅ Call parent's onSendMessage (which handles optimistic update)
      await onSendMessage(textToSend);

      // ✅ Clear input AFTER successful send
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Send message error:', error);
      // ✅ Don't clear message on error so user can retry
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

  // ✅ NEW: Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (16MB max)
    if (file.size > 16 * 1024 * 1024) {
      toast.error('File size must be less than 16MB');
      return;
    }

    if (!onMediaUpload) {
      toast.error('Media upload not configured');
      return;
    }

    try {
      setUploading(true);
      await onMediaUpload(file);
      toast.success('Media sent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload media');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ✅ NEW: Trigger file input
  const handleAttachClick = () => {
    if (!windowOpen) {
      toast.error('Session expired. Send a template first.');
      return;
    }
    fileInputRef.current?.click();
  };

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

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      {/* ✅ Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-end gap-3">
        {/* ✅ FIXED: Attachment Button */}
        <button
          type="button"
          onClick={handleAttachClick}
          disabled={uploading || disabled}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Attach media"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Paperclip className="w-5 h-5" />
          )}
        </button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || sending || uploading}
            rows={1}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
        </div>

        {/* Emoji Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            title="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* ✅ Emoji Picker Popup */}
          {showEmojiPicker && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowEmojiPicker(false)}
              />
              <div className="absolute bottom-full right-0 mb-2 z-20">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme={Theme.AUTO}
                  width={320}
                  height={400}
                />
              </div>
            </>
          )}
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || sending || disabled || uploading}
          className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Character count */}
      {message.length > 0 && (
        <div className="flex justify-end mt-2">
          <span
            className={`text-xs ${message.length > 4000 ? 'text-red-500' : 'text-gray-400'
              }`}
          >
            {message.length}/4096
          </span>
        </div>
      )}
    </form>
  );
};

export default ChatInput;