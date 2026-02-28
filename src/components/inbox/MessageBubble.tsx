// src/components/inbox/MessageBubble.tsx

import React, { useState } from 'react';
import {
  Check,
  CheckCheck,
  Clock,
  Download,
  Play,
  Pause,
  FileText,
  MapPin,
  User,
  Image as ImageIcon,
  Mic,
  X,
  ExternalLink,
  AlertCircle,
  Copy
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  direction: 'INBOUND' | 'OUTBOUND';
  type: string;
  status?: string;
  timestamp: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  mediaMimeType?: string | null;
  mediaId?: string | null;
  fileName?: string | null;
}

interface MessageBubbleProps {
  message: Message;
  onCopy?: (content: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onCopy }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const isOutbound = message.direction === 'OUTBOUND';
  const apiUrl = import.meta.env.VITE_API_URL || '';

  // Get media URL (proxy through backend if needed)
  const getMediaSrc = () => {
    if (!message.mediaUrl) return null;

    // If it's already a base64 string, use directly
    if (message.mediaUrl.startsWith('data:')) {
      return message.mediaUrl;
    }

    // If it's a full URL, use directly
    if (message.mediaUrl.startsWith('http')) {
      return message.mediaUrl;
    }

    // Otherwise, proxy through backend
    if (message.mediaId) {
      return `${apiUrl}/api/inbox/media/${message.mediaId}`;
    }

    return message.mediaUrl;
  };

  // Render status icon
  const renderStatus = () => {
    if (!isOutbound) return null;

    switch (message.status) {
      case 'SENT':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'DELIVERED':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'READ':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      case 'FAILED':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Render image message
  const renderImage = () => {
    const src = getMediaSrc();

    return (
      <div className="relative">
        {imageLoading && !imageError && (
          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center animate-pulse">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {imageError ? (
          <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-500">
            <ImageIcon className="w-8 h-8 mb-2" />
            <span className="text-xs">Failed to load image</span>
            {message.mediaId && (
              <button
                onClick={() => {
                  setImageError(false);
                  setImageLoading(true);
                }}
                className="text-xs text-blue-500 mt-1 hover:underline"
              >
                Retry
              </button>
            )}
          </div>
        ) : (
          <img
            src={src || ''}
            alt="Media"
            className={`max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${imageLoading ? 'hidden' : 'block'
              }`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
            onClick={() => setShowFullImage(true)}
          />
        )}

        {message.content && message.content !== '[Image]' && (
          <p className="mt-2 text-sm">{message.content}</p>
        )}

        {/* Full image modal */}
        {showFullImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setShowFullImage(false)}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={() => setShowFullImage(false)}
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={src || ''}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}
      </div>
    );
  };

  // Render video message
  const renderVideo = () => {
    const src = getMediaSrc();

    return (
      <div className="relative">
        <video
          src={src || ''}
          controls
          className="max-w-xs rounded-lg"
          preload="metadata"
        >
          Your browser does not support video playback.
        </video>

        {message.content && message.content !== '[Video]' && (
          <p className="mt-2 text-sm">{message.content}</p>
        )}
      </div>
    );
  };

  // Render audio message
  const renderAudio = () => {
    const src = getMediaSrc();

    return (
      <div className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg min-w-[200px]">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 bg-green-500 rounded-full text-white hover:bg-green-600 transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <div className="flex-1">
          <div className="h-1 bg-gray-300 dark:bg-gray-600 rounded-full">
            <div className="h-full w-0 bg-green-500 rounded-full"></div>
          </div>
          <audio
            src={src || ''}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
            id={`audio-${message.id}`}
          />
        </div>

        <Mic className="w-4 h-4 text-gray-500" />
      </div>
    );
  };

  // Render document message
  const renderDocument = () => {
    const src = getMediaSrc();
    const fileName = message.fileName || 'Document';

    return (
      <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
          <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{fileName}</p>
          <p className="text-xs text-gray-500">{message.mediaMimeType || 'Document'}</p>
        </div>

        {src && (
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
          >
            <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </a>
        )}
      </div>
    );
  };

  // Render sticker message
  const renderSticker = () => {
    const src = getMediaSrc();

    return (
      <img
        src={src || ''}
        alt="Sticker"
        className="w-32 h-32 object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text y="50" x="50" text-anchor="middle">🎭</text></svg>';
        }}
      />
    );
  };

  // Render location message
  const renderLocation = () => {
    let locationData: any = {};

    try {
      if (message.mediaUrl) {
        locationData = JSON.parse(message.mediaUrl);
      }
    } catch (e) {
      // Parse from content
      const match = message.content.match(/\[Location: ([\d.-]+), ([\d.-]+)\]/);
      if (match) {
        locationData = { latitude: match[1], longitude: match[2] };
      }
    }

    const { latitude, longitude, name, address } = locationData;
    const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

    return (
      <div className="rounded-lg overflow-hidden">
        <div className="bg-gray-200 dark:bg-gray-700 h-32 flex items-center justify-center">
          <MapPin className="w-8 h-8 text-red-500" />
        </div>

        <div className="p-3 bg-gray-100 dark:bg-gray-700">
          {name && <p className="text-sm font-medium">{name}</p>}
          {address && <p className="text-xs text-gray-500">{address}</p>}
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-500 mt-2 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            Open in Maps
          </a>
        </div>
      </div>
    );
  };

  // Render contact card
  const renderContact = () => {
    let contacts: any[] = [];

    try {
      if (message.mediaUrl) {
        contacts = JSON.parse(message.mediaUrl);
      }
    } catch (e) {
      // Ignore
    }

    return (
      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium">Contact Card</p>
            {contacts.length > 0 && contacts[0]?.name?.formatted_name && (
              <p className="text-xs text-gray-500">{contacts[0].name.formatted_name}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render message content based on type
  const renderContent = () => {
    const type = message.type?.toLowerCase() || message.mediaType?.toLowerCase() || 'text';

    switch (type) {
      case 'image':
        return renderImage();
      case 'video':
        return renderVideo();
      case 'audio':
      case 'voice':
      case 'ptt':
        return renderAudio();
      case 'document':
        return renderDocument();
      case 'sticker':
        return renderSticker();
      case 'location':
        return renderLocation();
      case 'contact':
      case 'contacts':
        return renderContact();
      default:
        return <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>;
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-3 group`}>
      <div
        className={`relative max-w-[75%] lg:max-w-[60%] rounded-2xl px-4 py-2 shadow-sm ${isOutbound
          ? 'bg-green-500 text-white rounded-br-md'
          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md border border-gray-200 dark:border-gray-700'
          }`}
      >
        {/* Copy Button (on hover) */}
        {onCopy && message.content && (
          <button
            onClick={() => onCopy(message.content)}
            className={`absolute top-2 ${isOutbound ? '-left-8' : '-right-8'} p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity hover:text-green-500`}
            title="Copy message"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Message Content */}
        {renderContent()}

        {/* Timestamp & Status */}
        <div className={`flex items-center justify-end gap-1 mt-1 ${isOutbound ? 'text-green-100' : 'text-gray-500'
          }`}>
          <span className="text-xs">{formatTime(message.timestamp)}</span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;