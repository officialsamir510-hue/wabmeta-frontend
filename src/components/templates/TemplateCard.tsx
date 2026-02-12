import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MoreHorizontal,
  Eye,
  Edit2,
  Copy,
  Trash2,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Image,
  Video,
  File,
  MessageSquare
} from 'lucide-react';
import type { Template } from '../../types/template';

interface TemplateCardProps {
  template: Template;
  onDelete: (id: string) => void;
  onDuplicate: (template: Template) => void;
  onPreview: (template: Template) => void;
}

const getStatusConfig = (status: Template['status']) => {
  switch (status) {
    case 'approved':
      return { icon: CheckCircle2, color: 'bg-green-100 text-green-700', label: 'Approved' };
    case 'pending':
      return { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: 'Pending' };
    case 'rejected':
      return { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Rejected' };
    case 'draft':
      return { icon: FileText, color: 'bg-gray-100 text-gray-700', label: 'Draft' };
    default:
      return { icon: Clock, color: 'bg-gray-100 text-gray-700', label: status };
  }
};

const getCategoryConfig = (category: Template['category']) => {
  switch (category) {
    case 'marketing':
      return { color: 'bg-purple-100 text-purple-700', label: 'Marketing' };
    case 'utility':
      return { color: 'bg-blue-100 text-blue-700', label: 'Utility' };
    case 'authentication':
      return { color: 'bg-orange-100 text-orange-700', label: 'Authentication' };
    default:
      return { color: 'bg-gray-100 text-gray-700', label: category };
  }
};

const getHeaderIcon = (type: Template['header']['type']) => {
  switch (type) {
    case 'image': return Image;
    case 'video': return Video;
    case 'document': return File;
    default: return FileText;
  }
};

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onDelete,
  onDuplicate,
  onPreview
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const statusConfig = getStatusConfig(template.status);
  const categoryConfig = getCategoryConfig(template.category);
  // eslint-disable-next-line react/no-unstable-nested-components
  const HeaderIcon = getHeaderIcon(template.header.type);

  const truncateBody = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {template.name}
            </h3>
            <p className="text-sm text-gray-500">{template.language}</p>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              ></div>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 animate-fade-in">
                <button
                  onClick={() => {
                    onPreview(template);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Preview</span>
                </button>
                <Link
                  to={`/dashboard/templates/edit/${template.id}`}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </Link>
                <button
                  onClick={() => {
                    onDuplicate(template);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Duplicate</span>
                </button>
                {template.status === 'approved' && (
                  <Link
                    to={`/dashboard/campaigns/new?template=${template.id}`}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-primary-600 hover:bg-primary-50"
                  >
                    <Send className="w-4 h-4" />
                    <span className="text-sm">Use in Campaign</span>
                  </Link>
                )}
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={() => {
                    onDelete(template.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center space-x-2 mb-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${statusConfig.color}`}>
          <statusConfig.icon className="w-3 h-3" />
          <span>{statusConfig.label}</span>
        </span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${categoryConfig.color}`}>
          {categoryConfig.label}
        </span>
        {template.header.type !== 'none' && (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 flex items-center space-x-1">
            <HeaderIcon className="w-3 h-3" />
            <span className="capitalize">{template.header.type}</span>
          </span>
        )}
      </div>

      {/* Body Preview */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        {template.header.type === 'text' && template.header.text && (
          <p className="font-semibold text-gray-900 mb-2">{template.header.text}</p>
        )}
        <p className="text-gray-600 text-sm leading-relaxed">
          {truncateBody(template.body)}
        </p>
        {template.footer && (
          <p className="text-gray-400 text-xs mt-2">{template.footer}</p>
        )}
      </div>

      {/* Buttons Preview */}
      {template.buttons.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {template.buttons.map((button, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-xs font-medium"
            >
              {button.text}
            </span>
          ))}
        </div>
      )}

      {/* Footer Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center space-x-1">
            <Send className="w-4 h-4" />
            <span>{template.usageCount.toLocaleString()} uses</span>
          </span>
        </div>
        <span className="text-xs text-gray-400">
          Updated {template.updatedAt}
        </span>
      </div>

      {/* Rejection Reason */}
      {template.status === 'rejected' && template.rejectionReason && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700">
            <strong>Rejection Reason:</strong> {template.rejectionReason}
          </p>
        </div>
      )}
    </div>
  );
};

export default TemplateCard;