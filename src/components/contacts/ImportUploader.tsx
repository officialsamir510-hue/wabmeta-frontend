// 📁 src/components/contacts/ImportUploader.tsx - COMPLETE

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  X,
  Check,
  AlertCircle,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';
import { parseCsvFile, downloadSampleCsv } from '../../utils/csvContacts';
import type { ParseResult } from '../../utils/csvContacts';

// ============================================
// TYPES
// ============================================

interface ImportUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (contacts: any[]) => Promise<void>;
}

// ============================================
// COMPONENT
// ============================================

const ImportUploader: React.FC<ImportUploaderProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // FILE VALIDATION
  // ============================================

  const validateFile = (f: File): boolean => {
    const nameOk = f.name.toLowerCase().endsWith('.csv');
    if (!nameOk) {
      setError('Please upload a CSV file (.csv)');
      return false;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return false;
    }
    return true;
  };

  // ============================================
  // FILE HANDLERS
  // ============================================

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    const f = e.dataTransfer.files?.[0];
    if (f && validateFile(f)) {
      processFile(f);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0];
    if (f && validateFile(f)) {
      processFile(f);
    }
  };

  const processFile = async (f: File) => {
    setFile(f);
    setProcessing(true);
    setError(null);

    try {
      const result = await parseCsvFile(f);
      setParseResult(result);

      if (result.contacts.length === 0) {
        setError('No valid contacts found in CSV');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to parse CSV file');
      setParseResult(null);
    } finally {
      setProcessing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    setParseResult(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  // ============================================
  // UPLOAD HANDLER
  // ============================================

  const handleUpload = async () => {
    if (!parseResult || parseResult.contacts.length === 0) {
      setError('No valid contacts to import');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await onImport(parseResult.contacts);
      // Success - parent will close modal
    } catch (e: any) {
      setError(e?.message || 'Failed to import contacts');
    } finally {
      setUploading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Import Contacts</h2>
            <p className="text-sm text-gray-500 mt-1">
              Upload CSV file with contact information
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={uploading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-amber-900">
                  ⚠️ Important Information
                </p>
                <ul className="text-amber-800 space-y-1 list-disc list-inside">
                  <li>Only Indian phone numbers (+91) starting with 6-9 are accepted</li>
                  <li>Supported formats: 9876543210, 919876543210, +919876543210</li>
                  <li>Names will be auto-fetched from WhatsApp if not provided</li>
                  <li>Duplicate numbers will be skipped automatically</li>
                  <li>Maximum file size: 10MB</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActive(false);
            }}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${dragActive
              ? 'border-primary-500 bg-primary-50'
              : error
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={processing || uploading}
            />

            <div className="space-y-4">
              <div
                className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${dragActive ? 'bg-primary-100' : 'bg-gray-200'
                  }`}
              >
                <Upload
                  className={`w-8 h-8 ${dragActive ? 'text-primary-600' : 'text-gray-500'
                    }`}
                />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {dragActive ? 'Drop your file here' : 'Drag and drop your CSV'}
                </p>
                <p className="text-gray-500 mt-1">
                  or{' '}
                  <span className="text-primary-600 font-medium">browse</span> to
                  upload
                </p>
              </div>
              <p className="text-sm text-gray-400">CSV only • Max 10MB</p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm flex-1">{error}</p>
              <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Processing State */}
          {processing && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="font-medium text-blue-900">
                Parsing CSV file...
              </span>
            </div>
          )}

          {/* File Selected */}
          {file && !processing && !parseResult && (
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {Math.round(file.size / 1024)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          )}

          {/* Parse Results Preview */}
          {parseResult && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                {/* Total */}
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-blue-700">
                    {parseResult.summary.total}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">Total Rows</div>
                </div>

                {/* Valid */}
                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="text-2xl font-bold text-green-700">
                      {parseResult.summary.valid}
                    </div>
                  </div>
                  <div className="text-sm text-green-600 mt-1">Valid Contacts</div>
                </div>

                {/* Invalid */}
                <div className="bg-red-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div className="text-2xl font-bold text-red-700">
                      {parseResult.summary.invalid}
                    </div>
                  </div>
                  <div className="text-sm text-red-600 mt-1">Invalid Entries</div>
                </div>
              </div>

              {/* Valid Contacts Preview */}
              {parseResult.contacts.length > 0 && (
                <div className="border border-gray-200 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Valid Contacts (showing first 5)
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {parseResult.contacts.slice(0, 5).map((contact, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Check className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {contact.firstName}{' '}
                              {contact.lastName && contact.lastName}
                            </p>
                            <p className="text-sm text-gray-500 font-mono">
                              {contact.phone}
                            </p>
                          </div>
                        </div>
                        {contact.tags && contact.tags.length > 0 && (
                          <div className="flex gap-1">
                            {contact.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors Preview */}
              {parseResult.errors.length > 0 && (
                <div className="border border-red-200 rounded-xl p-4 bg-red-50">
                  <h3 className="font-semibold text-red-900 mb-3">
                    Errors (showing first 10)
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {parseResult.errors.slice(0, 10).map((error, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-2 bg-white rounded text-sm"
                      >
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-red-700">
                            Row {error.row}:
                          </span>{' '}
                          <span className="text-gray-700">{error.phone}</span>
                          <p className="text-red-600 mt-0.5">{error.error}</p>
                        </div>
                      </div>
                    ))}
                    {parseResult.errors.length > 10 && (
                      <p className="text-sm text-red-600 italic text-center pt-2">
                        ... and {parseResult.errors.length - 10} more errors
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Download Sample */}
          <div className="flex items-center justify-center pt-4 border-t border-gray-200">
            <button
              onClick={downloadSampleCsv}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download sample CSV template</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
          <div className="text-sm text-gray-600">
            {parseResult && (
              <span>
                Ready to import{' '}
                <span className="font-semibold text-gray-900">
                  {parseResult.summary.valid}
                </span>{' '}
                contacts
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={removeFile}
              className="px-5 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              disabled={uploading}
            >
              {parseResult ? 'Start Over' : 'Cancel'}
            </button>
            {parseResult && parseResult.contacts.length > 0 && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center space-x-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Import {parseResult.summary.valid} Contacts</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportUploader;