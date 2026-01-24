import React from 'react';
import { X, Phone, ExternalLink, MessageSquare, GripVertical } from 'lucide-react';
import type { TemplateButton, ButtonType } from '../../types/template';

interface ButtonBuilderProps {
  buttons: TemplateButton[];
  onChange: (buttons: TemplateButton[]) => void;
  maxButtons?: number;
}

const ButtonBuilder: React.FC<ButtonBuilderProps> = ({
  buttons,
  onChange,
  maxButtons = 3
}) => {
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addButton = (type: ButtonType) => {
    if (buttons.length >= maxButtons) return;

    const newButton: TemplateButton = {
      id: generateId(),
      type,
      text: '',
      url: type === 'url' ? 'https://' : undefined,
      phoneNumber: type === 'phone' ? '+91' : undefined,
    };

    onChange([...buttons, newButton]);
  };

  const updateButton = (id: string, updates: Partial<TemplateButton>) => {
    onChange(buttons.map(btn => 
      btn.id === id ? { ...btn, ...updates } : btn
    ));
  };

  const removeButton = (id: string) => {
    onChange(buttons.filter(btn => btn.id !== id));
  };

  const getButtonIcon = (type: ButtonType) => {
    switch (type) {
      case 'phone': return Phone;
      case 'url': return ExternalLink;
      default: return MessageSquare;
    }
  };

  const getButtonLabel = (type: ButtonType) => {
    switch (type) {
      case 'phone': return 'Call Phone Number';
      case 'url': return 'Visit Website';
      default: return 'Quick Reply';
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing Buttons */}
      {buttons.map((button, index) => {
        const Icon = getButtonIcon(button.type);
        
        return (
          <div 
            key={button.id}
            className="bg-gray-50 rounded-xl p-4 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Button {index + 1}: {getButtonLabel(button.type)}
                </span>
              </div>
              <button
                onClick={() => removeButton(button.id)}
                className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Button Text */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Button Text *
                </label>
                <input
                  type="text"
                  placeholder="Enter button text"
                  value={button.text}
                  onChange={(e) => updateButton(button.id, { text: e.target.value })}
                  maxLength={25}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {button.text.length}/25 characters
                </p>
              </div>

              {/* URL for URL type */}
              {button.type === 'url' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Website URL *
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={button.url || ''}
                    onChange={(e) => updateButton(button.id, { url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  />
                </div>
              )}

              {/* Phone for Phone type */}
              {button.type === 'phone' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={button.phoneNumber || ''}
                    onChange={(e) => updateButton(button.id, { phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Add Button Options */}
      {buttons.length < maxButtons && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500 mb-3 text-center">
            Add Button ({buttons.length}/{maxButtons})
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => addButton('quick_reply')}
              className="flex flex-col items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-gray-600 mb-1" />
              <span className="text-xs text-gray-600">Quick Reply</span>
            </button>
            <button
              onClick={() => addButton('url')}
              className="flex flex-col items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ExternalLink className="w-5 h-5 text-blue-600 mb-1" />
              <span className="text-xs text-gray-600">Website</span>
            </button>
            <button
              onClick={() => addButton('phone')}
              className="flex flex-col items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Phone className="w-5 h-5 text-green-600 mb-1" />
              <span className="text-xs text-gray-600">Call</span>
            </button>
          </div>
        </div>
      )}

      {buttons.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Buttons are optional but can improve engagement
        </div>
      )}
    </div>
  );
};

export default ButtonBuilder;