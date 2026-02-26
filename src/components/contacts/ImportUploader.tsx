// src/components/contacts/ImportUploader.tsx - COMPLETE WITH GROUP SELECTION

import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  X,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  Download,
  Info,
  Users,
} from 'lucide-react';
import { parseCsvFile, downloadSampleCsv } from '../../utils/csvContacts';
import type { ParseResult } from '../../utils/csvContacts';
import api from '../../services/api';

// ============================================
// TYPES
// ============================================

interface ImportUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (contacts: any[], groupData?: { id?: string; name?: string }) => Promise<void>;
}

interface Group {
  id: string;
  name: string;
  contactCount: number;
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

  // Group State
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [newGroupName, setNewGroupName] = useState('');
  const [createNewGroup, setCreateNewGroup] = useState(false);

  // Load groups on open
  useEffect(() => {
    if (isOpen) {
      api.get('/contacts/groups/all')
        .then(res => setGroups(res.data?.data || []))
        .catch(err => console.error('Failed to load groups', err));
    }
  }, [isOpen]);

  // Set default new group name when file loaded
  useEffect(() => {
    if (file && !newGroupName) {
      const name = file.name.replace('.csv', '');
      const date = new Date().toLocaleDateString();
      setNewGroupName(`${name} - ${date}`);
    }
  }, [file]);

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

    // Prepare group data
    let groupData: { id?: string; name?: string } | undefined;

    if (createNewGroup && newGroupName.trim()) {
      groupData = { name: newGroupName.trim() };
    } else if (selectedGroupId) {
      groupData = { id: selectedGroupId };
    }

    setUploading(true);
    setError(null);

    try {
      await onImport(parseResult.contacts, groupData);
      // Success - parent will close modal
    } catch (e: any) {
      setError(e?.message || 'Failed to import contacts');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
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
        <div className="px-6 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Example Format available</span>
          <button
            onClick={downloadSampleCsv}
            className="flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            DOWNLOAD SAMPLE CSV
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
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
                  <li>Duplicate numbers will be skipped automatically</li>
                  <li>Email is optional</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          {!parseResult && (
            <div
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
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
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${dragActive ? 'bg-primary-100' : 'bg-gray-200'}`}>
                  <Upload className={`w-8 h-8 ${dragActive ? 'text-primary-600' : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {dragActive ? 'Drop your file here' : 'Drag and drop your CSV'}
                  </p>
                  <p className="text-gray-500 mt-1">
                    or <span className="text-primary-600 font-medium">browse</span> to upload
                  </p>
                </div>
                <p className="text-sm text-gray-400">CSV only • Max 10MB</p>
              </div>
            </div>
          )}

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
              <span className="font-medium text-blue-900">Parsing CSV file...</span>
            </div>
          )}

          {/* Parse Results Preview + Group Selection */}
          {parseResult && (
            <div className="space-y-6">
              {/* Group Selection */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-600" />
                  Add to Group (Optional)
                </h3>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="groupOption"
                        checked={!createNewGroup}
                        onChange={() => setCreateNewGroup(false)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Existing Group</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="groupOption"
                        checked={createNewGroup}
                        onChange={() => setCreateNewGroup(true)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Create New Group</span>
                    </label>
                  </div>

                  {createNewGroup ? (
                    <div>
                      <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Enter new group name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use this group later in "Create Campaign" to message these contacts.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <select
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">-- Select a Group (or skip) --</option>
                        {groups.map(group => (
                          <option key={group.id} value={group.id}>
                            {group.name} ({group.contactCount} contacts)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-blue-700">
                    {parseResult.summary.total}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">Total Rows</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="text-2xl font-bold text-green-700">
                      {parseResult.summary.valid}
                    </div>
                  </div>
                  <div className="text-sm text-green-600 mt-1">Valid Contacts</div>
                </div>
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
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
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
                    <span>Import Contacts</span>
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