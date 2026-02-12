import React from 'react';
import {
  X,
  CheckCheck,
  Phone,
  ExternalLink,
  Image,
  File,
  Play
} from 'lucide-react';
import type { TemplateFormData, TemplateButton } from '../../types/template';

interface TemplatePreviewProps {
  template: TemplateFormData;
  sampleVariables?: Record<string, string>;
  isModal?: boolean;
  onClose?: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  sampleVariables = {},
  isModal = false,
  onClose
}) => {


  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        ></div>
        <div className="relative bg-gray-900 rounded-3xl p-6 animate-fade-in">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <PreviewContent template={template} sampleVariables={sampleVariables} />
        </div>
      </div>
    );
  }

  return <PreviewContent template={template} sampleVariables={sampleVariables} />;
};

interface PreviewContentProps {
  template: TemplateFormData;
  sampleVariables: Record<string, string>;
}

const PreviewContent: React.FC<PreviewContentProps> = ({ template, sampleVariables }) => {
  // Replace variables in text
  const replaceVariables = (text: string): string => {
    let result = text;
    Object.keys(sampleVariables).forEach((key) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), sampleVariables[key] || `{{${key}}}`);
    });
    // Replace any remaining {{number}} patterns
    result = result.replace(/\{\{(\d+)\}\}/g, (_match, num) => {
      return sampleVariables[num] || `[Variable ${num}]`;
    });
    return result;
  };

  const renderButton = (button: TemplateButton, index: number) => {
    const getIcon = () => {
      switch (button.type) {
        case 'phone':
          return <Phone className="w-4 h-4" />;
        case 'url':
          return <ExternalLink className="w-4 h-4" />;
        default:
          return null;
      }
    };

    return (
      <button
        key={button.id || index}
        className="w-full py-2.5 text-[#00a884] font-medium text-sm border-t border-gray-200 flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors"
      >
        {getIcon()}
        <span>{button.text}</span>
      </button>
    );
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Phone Frame */}
      <div className="bg-[#0b141a] rounded-[2.5rem] p-3 shadow-2xl">
        {/* Phone Notch */}
        <div className="bg-[#0b141a] h-6 flex items-center justify-center mb-1">
          <div className="w-20 h-4 bg-black rounded-full"></div>
        </div>

        {/* WhatsApp Header */}
        <div className="bg-[#1f2c34] px-4 py-3 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">WA</span>
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold">Your Business</p>
            <p className="text-gray-400 text-xs">Online</p>
          </div>
        </div>

        {/* Chat Background */}
        <div
          className="min-h-100 p-4 relative"
          style={{
            backgroundColor: '#0b141a',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        >
          {/* Message Bubble */}
          <div className="max-w-[85%] ml-auto">
            <div className="bg-[#005c4b] rounded-lg overflow-hidden shadow-md">
              {/* Header Media/Text */}
              {template.header.type !== 'none' && (
                <div className="relative">
                  {template.header.type === 'image' && (
                    <div className="aspect-video bg-gray-700 flex items-center justify-center">
                      {template.header.mediaUrl ? (
                        <img
                          src={template.header.mediaUrl}
                          alt="Header"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-gray-400">
                          <Image className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm">Image Header</p>
                        </div>
                      )}
                    </div>
                  )}
                  {template.header.type === 'video' && (
                    <div className="aspect-video bg-gray-700 flex items-center justify-center relative">
                      <div className="text-center text-gray-400">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                          <Play className="w-8 h-8 text-white ml-1" fill="white" />
                        </div>
                        <p className="text-sm mt-2">Video Header</p>
                      </div>
                    </div>
                  )}
                  {template.header.type === 'document' && (
                    <div className="p-4 bg-[#1f2c34] flex items-center space-x-3">
                      <div className="w-12 h-14 bg-gray-600 rounded flex items-center justify-center">
                        <File className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">
                          {template.header.fileName || 'Document.pdf'}
                        </p>
                        <p className="text-gray-400 text-xs">PDF Document</p>
                      </div>
                    </div>
                  )}
                  {template.header.type === 'text' && template.header.text && (
                    <div className="px-3 pt-3">
                      <p className="text-white font-semibold">
                        {replaceVariables(template.header.text)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Body */}
              <div className="p-3">
                <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">
                  {replaceVariables(template.body) || 'Your message body will appear here...'}
                </p>

                {/* Footer */}
                {template.footer && (
                  <p className="text-gray-400 text-xs mt-2">
                    {template.footer}
                  </p>
                )}

                {/* Timestamp */}
                <div className="flex items-center justify-end space-x-1 mt-1">
                  <span className="text-[10px] text-gray-400">12:00 PM</span>
                  <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                </div>
              </div>

              {/* Buttons */}
              {template.buttons.length > 0 && (
                <div className="bg-[#005c4b] border-t border-[#0a3d33]">
                  {template.buttons.map((button, index) => renderButton(button, index))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="bg-[#1f2c34] px-4 py-3 flex items-center space-x-3">
          <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2">
            <span className="text-gray-500 text-sm">Type a message</span>
          </div>
          <div className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;