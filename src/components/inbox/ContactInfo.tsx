import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  Edit2,
  Trash2,
  Ban,
  Star,
  MessageSquare,
  Clock,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Image,
  FileText,
  Link2
} from 'lucide-react';
import type { Contact } from '../../types/chat';

interface ContactInfoProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onBlock?: () => void;
}

const ContactInfo: React.FC<ContactInfoProps> = ({
  contact,
  isOpen,
  onClose,
  onEdit,
  onBlock
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['info', 'media']);
  const [showActions, setShowActions] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const sharedMedia = [
    { type: 'image', count: 24 },
    { type: 'document', count: 8 },
    { type: 'link', count: 15 },
  ];

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Contact Info</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Avatar & Name */}
        <div className="text-center">
          {contact.avatar ? (
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-24 h-24 rounded-full mx-auto object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-linear-to-br from-primary-500 to-primary-600 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold">
              {contact.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h2 className="text-xl font-bold text-gray-900 mt-3">{contact.name}</h2>
          <p className="text-gray-500">{contact.phone}</p>
          
          {/* Quick Actions */}
          <div className="flex items-center justify-center space-x-3 mt-4">
            <button className="flex flex-col items-center p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mb-1">
                <MessageSquare className="w-5 h-5 text-primary-600" />
              </div>
              <span className="text-xs text-gray-600">Message</span>
            </button>
            <button className="flex flex-col items-center p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-1">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs text-gray-600">Call</span>
            </button>
            <button className="flex flex-col items-center p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mb-1">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-xs text-gray-600">Favorite</span>
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowActions(!showActions)}
                className="flex flex-col items-center p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-xs text-gray-600">More</span>
              </button>
              
              {showActions && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowActions(false)}
                  ></div>
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 animate-fade-in">
                    <button
                      onClick={onEdit}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="text-sm">Edit</span>
                    </button>
                    <button
                      onClick={onBlock}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50"
                    >
                      <Ban className="w-4 h-4" />
                      <span className="text-sm">Block</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Contact Info Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('info')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Contact Information</span>
            {expandedSections.includes('info') ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {expandedSections.includes('info') && (
            <div className="px-4 pb-4 space-y-3 animate-fade-in">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{contact.phone}</p>
                </div>
              </div>
              {contact.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{contact.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Last Seen</p>
                  <p className="text-sm text-gray-900">{contact.lastSeen || 'Recently'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tags Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('tags')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Tags</span>
            {expandedSections.includes('tags') ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {expandedSections.includes('tags') && (
            <div className="px-4 pb-4 animate-fade-in">
              <div className="flex flex-wrap gap-2">
                {contact.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
                <button className="px-3 py-1 border-2 border-dashed border-gray-300 text-gray-500 rounded-full text-sm hover:border-primary-300 hover:text-primary-600 transition-colors">
                  + Add Tag
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('notes')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Notes</span>
            {expandedSections.includes('notes') ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {expandedSections.includes('notes') && (
            <div className="px-4 pb-4 animate-fade-in">
              {contact.notes ? (
                <p className="text-sm text-gray-600">{contact.notes}</p>
              ) : (
                <button className="w-full p-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm hover:border-primary-300 hover:text-primary-600 transition-colors">
                  + Add a note
                </button>
              )}
            </div>
          )}
        </div>

        {/* Shared Media Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('media')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Shared Media</span>
            {expandedSections.includes('media') ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {expandedSections.includes('media') && (
            <div className="px-4 pb-4 animate-fade-in">
              <div className="grid grid-cols-3 gap-2">
                {sharedMedia.map((item, index) => (
                  <button
                    key={index}
                    className="flex flex-col items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    {item.type === 'image' && <Image className="w-6 h-6 text-purple-500 mb-1" />}
                    {item.type === 'document' && <FileText className="w-6 h-6 text-blue-500 mb-1" />}
                    {item.type === 'link' && <Link2 className="w-6 h-6 text-green-500 mb-1" />}
                    <span className="text-xs text-gray-600">{item.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center justify-center space-x-2 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
          <Trash2 className="w-4 h-4" />
          <span className="font-medium">Delete Conversation</span>
        </button>
      </div>
    </div>
  );
};

export default ContactInfo;