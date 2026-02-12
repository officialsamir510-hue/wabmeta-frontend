import React, { useState, useRef } from 'react';
import { Upload, Image, Video, File, X, CheckCircle2, AlertCircle } from 'lucide-react';
import type { HeaderType } from '../../types/template';

interface MediaUploaderProps {
  headerType: HeaderType;
  mediaUrl?: string;
  fileName?: string;
  onMediaChange: (url: string, fileName?: string) => void;
  onRemove: () => void;
}

const getIcon = (headerType: HeaderType) => {
  switch (headerType) {
    case 'image': return Image;
    case 'video': return Video;
    case 'document': return File;
    default: return Upload;
  }
};

const MediaUploader: React.FC<MediaUploaderProps> = ({
  headerType,
  mediaUrl,
  fileName,
  onMediaChange,
  onRemove
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getAcceptedTypes = () => {
    switch (headerType) {
      case 'image': return 'image/jpeg,image/png';
      case 'video': return 'video/mp4';
      case 'document': return 'application/pdf';
      default: return '';
    }
  };

  const getMaxSize = () => {
    switch (headerType) {
      case 'image': return 5 * 1024 * 1024; // 5MB
      case 'video': return 16 * 1024 * 1024; // 16MB
      case 'document': return 100 * 1024 * 1024; // 100MB
      default: return 5 * 1024 * 1024;
    }
  };

  // eslint-disable-next-line react/no-unstable-nested-components
  const Icon = getIcon(headerType);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    setError(null);

    const maxSize = getMaxSize();
    if (file.size > maxSize) {
      setError(`File too large. Max size: ${maxSize / (1024 * 1024)}MB`);
      return false;
    }

    return true;
  };

  const handleFile = async (file: File) => {
    if (!validateFile(file)) return;

    setUploading(true);

    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create object URL for preview
    const url = URL.createObjectURL(file);
    onMediaChange(url, file.name);
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  if (mediaUrl) {
    return (
      <div className="relative bg-gray-100 rounded-xl overflow-hidden">
        {headerType === 'image' && (
          <img
            src={mediaUrl}
            alt="Header preview"
            className="w-full h-48 object-cover"
          />
        )}
        {headerType === 'video' && (
          <video
            src={mediaUrl}
            className="w-full h-48 object-cover"
            controls
          />
        )}
        {headerType === 'document' && (
          <div className="flex items-center space-x-3 p-4">
            <div className="w-12 h-14 bg-red-100 rounded flex items-center justify-center">
              <File className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{fileName || 'Document'}</p>
              <p className="text-sm text-gray-500">PDF Document</p>
            </div>
          </div>
        )}

        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center space-x-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>Uploaded</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${dragActive
        ? 'border-primary-500 bg-primary-50'
        : error
          ? 'border-red-300 bg-red-50'
          : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={getAcceptedTypes()}
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={uploading}
      />

      {uploading ? (
        <div className="space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary-100 flex items-center justify-center animate-pulse">
            <Icon className="w-6 h-6 text-primary-600" />
          </div>
          <p className="text-sm text-gray-600">Uploading...</p>
          <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full animate-pulse w-2/3"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${dragActive ? 'bg-primary-100' : 'bg-gray-200'
            }`}>
            <Icon className={`w-6 h-6 ${dragActive ? 'text-primary-600' : 'text-gray-500'}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {dragActive ? 'Drop file here' : `Upload ${headerType}`}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {headerType === 'image' && 'JPG or PNG, max 5MB'}
              {headerType === 'video' && 'MP4, max 16MB'}
              {headerType === 'document' && 'PDF, max 100MB'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Choose File
          </button>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-center justify-center space-x-1 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;