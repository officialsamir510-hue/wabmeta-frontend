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
  Video,
  Mic,
  X,
  ExternalLink,
  AlertCircle,
  MessageSquare,
  RefreshCw,
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
  const [retryCount, setRetryCount] = useState(0);

  const isOutbound = message.direction === 'OUTBOUND';
  const apiUrl = import.meta.env.VITE_API_URL || '';

  // ==========================================
  // ✅ PARSE TEMPLATE CONTENT
  // ==========================================

  const parseTemplateContent = (content: string): { isTemplate: boolean; displayText: string; templateName?: string } => {
    // Check if content is JSON template
    if (!content) return { isTemplate: false, displayText: '' };

    try {
      // Try parsing as JSON
      if (content.startsWith('{') && content.includes('templateName')) {
        const parsed = JSON.parse(content);

        // It's a template message
        if (parsed.templateName) {
          // Get the body text or construct display text
          const bodyText = parsed.body || parsed.bodyText || '';
          const templateName = parsed.templateName || 'Template';

          // If body exists, show it
          if (bodyText) {
            return {
              isTemplate: true,
              displayText: bodyText,
              templateName: templateName.replace(/_/g, ' ').trim(),
            };
          }

          // Otherwise show template name
          return {
            isTemplate: true,
            displayText: `📋 Template: ${templateName.replace(/_/g, ' ').trim()}`,
            templateName: templateName,
          };
        }
      }
    } catch (e) {
      // Not JSON, return as-is
    }

    return { isTemplate: false, displayText: content };
  };

  // ==========================================
  // ✅ GET MEDIA SOURCE WITH RETRY
  // ==========================================

  const getMediaSrc = (): string | null => {
    if (!message.mediaUrl && !message.mediaId) return null;

    // If it's already a base64 string
    if (message.mediaUrl?.startsWith('data:')) {
      return message.mediaUrl;
    }

    // If it's a full URL (http/https)
    if (message.mediaUrl?.startsWith('http')) {
      // Add retry parameter to bust cache
      const url = new URL(message.mediaUrl);
      if (retryCount > 0) {
        url.searchParams.set('retry', retryCount.toString());
      }
      return url.toString();
    }

    // Proxy through backend using mediaId
    if (message.mediaId) {
      return `${apiUrl}/api/inbox/media/${message.mediaId}${retryCount > 0 ? `?retry=${retryCount}` : ''}`;
    }

    // Fallback to mediaUrl
    if (message.mediaUrl) {
      return `${apiUrl}/api/inbox/media-proxy?url=${encodeURIComponent(message.mediaUrl)}`;
    }

    return null;
  };

  // ==========================================
  // RETRY MEDIA LOAD
  // ==========================================

  const handleRetry = () => {
    setImageError(false);
    setImageLoading(true);
    setRetryCount(prev => prev + 1);
  };

  // ==========================================
  // RENDER STATUS ICON
  // ==========================================

  const renderStatus = () => {
    if (!isOutbound) return null;

    switch (message.status?.toUpperCase()) {
      case 'SENT':
        return <Check className="w-3.5 h-3.5 text-gray-400" />;
      case 'DELIVERED':
        return <CheckCheck className="w-3.5 h-3.5 text-gray-400" />;
      case 'READ':
        return <CheckCheck className="w-3.5 h-3.5 text-blue-400" />;
      case 'FAILED':
        return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-gray-400 animate-pulse" />;
    }
  };

  // ==========================================
  // ✅ RENDER IMAGE WITH BETTER ERROR HANDLING
  // ==========================================

  const renderImage = () => {
    const src = getMediaSrc();

    if (!src) {
      return (
        <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-500">
          <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-xs">No image available</span>
        </div>
      );
    }

    return (
      <div className="relative max-w-xs">
        {/* Loading State */}
        {imageLoading && !imageError && (
          <div className="w-64 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <span className="text-xs text-gray-500">Loading...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {imageError ? (
          <div className="w-64 h-40 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-500 border border-gray-200 dark:border-gray-600">
            <ImageIcon className="w-10 h-10 mb-2 opacity-40" />
            <span className="text-sm font-medium">Failed to load image</span>
            <span className="text-xs text-gray-400 mb-3">Media may have expired</span>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        ) : (
          <img
            src={src}
            alt="Media"
            className={`max-w-full rounded-lg cursor-pointer hover:opacity-95 transition-all shadow-sm ${imageLoading ? 'hidden' : 'block'
              }`}
            onLoad={() => {
              setImageLoading(false);
              setImageError(false);
            }}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
            onClick={() => setShowFullImage(true)}
          />
        )}

        {/* Caption */}
        {message.content && !['[Image]', '[image]'].includes(message.content) && !message.content.startsWith('{') && (
          <p className="mt-2 text-sm">{message.content}</p>
        )}

        {/* Full Image Modal */}
        {showFullImage && !imageError && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setShowFullImage(false)}
          >
            <button
              className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setShowFullImage(false)}
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={src}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <a
              href={src}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-6 h-6" />
            </a>
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // RENDER VIDEO
  // ==========================================

  const renderVideo = () => {
    const src = getMediaSrc();

    if (!src) {
      return (
        <div className="w-64 h-40 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-500">
          <Video className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-xs">No video available</span>
        </div>
      );
    }

    return (
      <div className="relative max-w-xs">
        <video
          src={src}
          controls
          className="max-w-full rounded-lg shadow-sm"
          preload="metadata"
          poster=""
        >
          Your browser does not support video.
        </video>

        {message.content && !['[Video]', '[video]'].includes(message.content) && !message.content.startsWith('{') && (
          <p className="mt-2 text-sm">{message.content}</p>
        )}
      </div>
    );
  };

  // ==========================================
  // RENDER AUDIO
  // ==========================================

  const renderAudio = () => {
    const src = getMediaSrc();
    const audioId = `audio-${message.id}`;

    const togglePlay = () => {
      const audio = document.getElementById(audioId) as HTMLAudioElement;
      if (audio) {
        if (isPlaying) {
          audio.pause();
        } else {
          audio.play();
        }
      }
    };

    return (
      <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl min-w-[220px]">
        <button
          onClick={togglePlay}
          className="p-2.5 bg-green-500 hover:bg-green-600 rounded-full text-white transition-colors shadow-sm"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <div className="flex-1">
          <div className="h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
            <div className="h-full w-0 bg-green-500 rounded-full transition-all duration-100"></div>
          </div>
          <span className="text-xs text-gray-500 mt-1 block">Voice message</span>

          {src && (
            <audio
              id={audioId}
              src={src}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}
        </div>

        <Mic className="w-4 h-4 text-gray-400" />
      </div>
    );
  };

  // ==========================================
  // RENDER DOCUMENT
  // ==========================================

  const renderDocument = () => {
    const src = getMediaSrc();
    const fileName = message.fileName || 'Document';
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    const getDocIcon = () => {
      switch (ext) {
        case 'pdf':
          return <FileText className="w-6 h-6 text-red-600" />;
        case 'doc':
        case 'docx':
          return <FileText className="w-6 h-6 text-blue-600" />;
        case 'xls':
        case 'xlsx':
          return <FileText className="w-6 h-6 text-green-600" />;
        default:
          return <FileText className="w-6 h-6 text-gray-600" />;
      }
    };

    return (
      <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl min-w-[240px]">
        <div className="p-2.5 bg-white dark:bg-gray-600 rounded-lg shadow-sm">
          {getDocIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{fileName}</p>
          <p className="text-xs text-gray-500 uppercase">{ext || 'Document'}</p>
        </div>

        {src && (
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            download={fileName}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
          >
            <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </a>
        )}
      </div>
    );
  };

  // ==========================================
  // RENDER STICKER
  // ==========================================

  const renderSticker = () => {
    const src = getMediaSrc();

    return (
      <div className="relative">
        {imageLoading && (
          <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        )}
        <img
          src={src || ''}
          alt="Sticker"
          className={`w-32 h-32 object-contain ${imageLoading ? 'hidden' : 'block'}`}
          onLoad={() => setImageLoading(false)}
          onError={(e) => {
            setImageLoading(false);
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    );
  };

  // ==========================================
  // RENDER LOCATION
  // ==========================================

  const renderLocation = () => {
    let locationData: any = {};

    try {
      if (message.mediaUrl && message.mediaUrl.startsWith('{')) {
        locationData = JSON.parse(message.mediaUrl);
      }
    } catch (e) {
      const match = message.content?.match(/\[Location: ([\d.-]+), ([\d.-]+)\]/);
      if (match) {
        locationData = { latitude: parseFloat(match[1]), longitude: parseFloat(match[2]) };
      }
    }

    const { latitude, longitude, name, address } = locationData;

    if (!latitude || !longitude) {
      return (
        <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <MapPin className="w-5 h-5 text-red-500" />
          <span className="text-sm">Location shared</span>
        </div>
      );
    }

    const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

    return (
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 max-w-xs">
        <div className="bg-gradient-to-br from-green-100 to-blue-100 dark:from-gray-700 dark:to-gray-600 h-28 flex items-center justify-center relative">
          <MapPin className="w-10 h-10 text-red-500 drop-shadow-md" />
          <div className="absolute bottom-2 right-2 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded text-xs">
            📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </div>
        </div>

        <div className="p-3 bg-white dark:bg-gray-800">
          {name && <p className="text-sm font-medium">{name}</p>}
          {address && <p className="text-xs text-gray-500 mt-1">{address}</p>}
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-blue-500 mt-2 hover:underline font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open in Google Maps
          </a>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER CONTACT CARD
  // ==========================================

  const renderContact = () => {
    let contacts: any[] = [];

    try {
      if (message.mediaUrl && message.mediaUrl.startsWith('[')) {
        contacts = JSON.parse(message.mediaUrl);
      }
    } catch (e) { }

    const contactName = contacts[0]?.name?.formatted_name || 'Contact';
    const phone = contacts[0]?.phones?.[0]?.phone || '';

    return (
      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl min-w-[200px]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-full">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium">{contactName}</p>
            {phone && <p className="text-xs text-gray-500">{phone}</p>}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // ✅ RENDER TEMPLATE MESSAGE
  // ==========================================

  const renderTemplate = (displayText: string, templateName?: string) => {
    return (
      <div className="space-y-2">
        {templateName && (
          <div className="flex items-center gap-1.5 text-xs opacity-70">
            <MessageSquare className="w-3 h-3" />
            <span>Template</span>
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{displayText}</p>
      </div>
    );
  };

  // ==========================================
  // ✅ RENDER CONTENT (MAIN)
  // ==========================================

  const renderContent = () => {
    const type = (message.type?.toLowerCase() || message.mediaType?.toLowerCase() || 'text');

    // Check for template message
    const { isTemplate, displayText, templateName } = parseTemplateContent(message.content);

    if (isTemplate) {
      return renderTemplate(displayText, templateName);
    }

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
      case 'template':
        return renderTemplate(displayText, templateName);
      default:
        // Check if text looks like template JSON
        if (message.content?.startsWith('{') && message.content?.includes('templateName')) {
          const parsed = parseTemplateContent(message.content);
          return renderTemplate(parsed.displayText, parsed.templateName);
        }
        return <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>;
    }
  };

  // ==========================================
  // FORMAT TIMESTAMP
  // ==========================================

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '';
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-2 px-2 group`}>
      <div
        className={`relative max-w-[80%] lg:max-w-[65%] rounded-2xl px-3.5 py-2.5 shadow-sm ${isOutbound
          ? 'bg-green-500 text-white rounded-br-sm'
          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm border border-gray-100 dark:border-gray-700'
          }`}
      >
        {/* Copy Button (on hover) */}
        {onCopy && message.content && !message.content.startsWith('{') && (
          <button
            onClick={() => onCopy(message.content)}
            className={`absolute top-2 ${isOutbound ? '-left-8' : '-right-8'} p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity hover:text-green-500 z-10`}
            title="Copy message"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}
        {/* Message Content */}
        {renderContent()}

        {/* Timestamp & Status */}
        <div className={`flex items-center justify-end gap-1 mt-1.5 ${isOutbound ? 'text-green-100' : 'text-gray-400'
          }`}>
          <span className="text-[10px]">{formatTime(message.timestamp)}</span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;