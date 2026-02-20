// 📁 src/components/campaigns/CsvAudienceUploader.tsx - COMPLETE VERSION

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  Download,
  X,
  Info
} from 'lucide-react';
import { campaigns as campaignApi } from '../../services/api';
import toast from 'react-hot-toast';

// ============================================
// TYPES
// ============================================
interface UploadedContact {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface UploadResult {
  total: number;
  successful: number;
  failed: number;
  duplicates: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  contacts: UploadedContact[];
  errors?: Array<{
    row: number;
    phone: string;
    error: string;
  }>;
}

interface Props {
  onImported: (contacts: UploadedContact[]) => void;
}

// ============================================
// COMPONENT
// ============================================
const CsvAudienceUploader: React.FC<Props> = ({ onImported }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);

  const [result, setResult] = useState<UploadResult | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  // ==========================================
  // DOWNLOAD SAMPLE CSV
  // ==========================================
  const handleDownloadSample = () => {
    const csvContent = [
      'phone,firstName,lastName,email,tags',
      '+911234567890,John,Doe,john@example.com,customer',
      '+919876543210,Jane,Smith,jane@example.com,premium',
      '+919123456789,Bob,Johnson,bob@example.com,vip',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-contacts.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Sample CSV downloaded');
  };

  // ==========================================
  // FILE VALIDATION
  // ==========================================
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.name.endsWith('.csv')) {
      return 'Please upload a CSV file';
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'File size exceeds 5MB limit';
    }

    // Check if file is empty
    if (file.size === 0) {
      return 'File is empty';
    }

    return null;
  };

  // ==========================================
  // HANDLE FILE SELECTION
  // ==========================================
  const handleFileSelect = () => {
    inputRef.current?.click();
  };

  // ==========================================
  // HANDLE FILE UPLOAD
  // ==========================================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      e.target.value = ''; // Reset input
      return;
    }

    setUploading(true);
    setResult(null);
    setShowErrors(false);

    try {
      console.log('📤 Uploading CSV file:', file.name);

      const response = await campaignApi.uploadContacts(file);

      if (response.data.success) {
        const data: UploadResult = response.data.data;

        console.log('✅ CSV Upload Result:', data);

        setResult(data);

        // Show appropriate toast message
        if (data.successful > 0) {
          toast.success(
            `✅ ${data.successful} contacts uploaded successfully!`,
            { duration: 5000 }
          );

          // ✅ Pass contacts with IDs to parent
          if (data.contacts && data.contacts.length > 0) {
            onImported(data.contacts);
          }
        } else {
          toast.error('No valid contacts found in CSV');
        }

        // Show warning if there are duplicates or failures
        if (data.duplicates > 0) {
          toast(`ℹ️ ${data.duplicates} duplicate contacts skipped`, {
            icon: '⚠️',
            duration: 4000,
          });
        }

        if (data.failed > 0) {
          toast.error(`❌ ${data.failed} contacts failed to upload`);
        }
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('❌ CSV upload error:', error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to upload CSV';

      toast.error(errorMessage);
      setResult(null);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input to allow re-upload
    }
  };

  // ==========================================
  // CLEAR RESULTS
  // ==========================================
  const handleClearResults = () => {
    setResult(null);
    setShowErrors(false);
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            Upload Contacts via CSV
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Import multiple contacts at once using a CSV file
          </p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Sample CSV
        </button>
      </div>

      {/* Upload Area */}
      <div
        onClick={!uploading ? handleFileSelect : undefined}
        className={`relative flex flex-col items-center justify-center w-full h-40 px-4 transition bg-white dark:bg-gray-800 border-2 border-dashed rounded-xl ${uploading
          ? 'border-primary-400 bg-primary-50/50 dark:bg-primary-900/10'
          : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer'
          }`}
      >
        <div className="flex flex-col items-center justify-center">
          {uploading ? (
            <>
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-3" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Uploading and processing...
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This may take a few moments
              </p>
            </>
          ) : (
            <>
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
                <Upload className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Click to upload CSV file
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                or drag and drop (Max 5MB)
              </p>
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <FileText className="w-3 h-3" />
                <span>Supported: .csv</span>
              </div>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".csv,text/csv"
          onChange={handleFileUpload}
          disabled={uploading}
        />
      </div>

      {/* CSV Format Info */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="flex-1 text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">CSV Format:</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            <li><strong>phone</strong> (required): +country_code + number (e.g., +911234567890)</li>
            <li><strong>firstName</strong> (optional): Contact's first name</li>
            <li><strong>lastName</strong> (optional): Contact's last name</li>
            <li><strong>email</strong> (optional): Contact's email address</li>
            <li><strong>tags</strong> (optional): Comma-separated tags</li>
          </ul>
        </div>
      </div>

      {/* Upload Results */}
      {result && (
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Upload Complete
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {result.total} rows processed
                </p>
              </div>
            </div>
            <button
              onClick={handleClearResults}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {result.successful}
              </div>
              <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                Successful
              </div>
            </div>

            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {result.duplicates || result.duplicateRows || 0}
              </div>
              <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Duplicates
              </div>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {result.failed}
              </div>
              <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                Failed
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {result.total}
              </div>
              <div className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                Total
              </div>
            </div>
          </div>

          {/* Error Details */}
          {result.errors && result.errors.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowErrors(!showErrors)}
                className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <AlertCircle className="w-4 h-4" />
                <span>
                  {showErrors ? 'Hide' : 'Show'} {result.errors.length} errors
                </span>
              </button>

              {showErrors && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {result.errors.slice(0, 10).map((error, index) => (
                      <div
                        key={index}
                        className="text-xs text-red-700 dark:text-red-300 flex items-start gap-2"
                      >
                        <span className="font-mono bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded">
                          Row {error.row}
                        </span>
                        <span className="flex-1">
                          {error.phone && <span className="font-medium">{error.phone}:</span>}{' '}
                          {error.error}
                        </span>
                      </div>
                    ))}
                    {result.errors.length > 10 && (
                      <p className="text-xs text-red-600 dark:text-red-400 italic">
                        ... and {result.errors.length - 10} more errors
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CsvAudienceUploader;