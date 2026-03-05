import React, { useState, useEffect } from 'react';
import {
    X,
    FileSpreadsheet,
    Upload,
    Download,
    CheckCircle,
    Loader2,
    Phone,
    Plus,
    FolderPlus
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    groups?: Array<{ id: string; name: string }>;
}

export default function CsvUploadModal({ isOpen, onClose, onSuccess, groups = [] }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    // ✅ Create Group States
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [creatingGroup, setCreatingGroup] = useState(false);
    const [localGroups, setLocalGroups] = useState(groups);

    useEffect(() => {
        setLocalGroups(groups);
    }, [groups]);

    if (!isOpen) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith('.csv')) {
            toast.error('Please upload a CSV file');
            return;
        }

        setFile(selectedFile);
        parseCSV(selectedFile);
    };

    const parseCSV = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim());

            if (lines.length < 2) {
                toast.error('CSV file is empty or has no data rows');
                return;
            }

            // Parse header
            const header = lines[0].split(',').map(h => h.trim().toLowerCase());

            // Parse data rows
            const data = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
                const obj: any = {};

                header.forEach((h, i) => {
                    obj[h] = values[i] || '';
                });

                return obj;
            }).filter(row => {
                const phone = row.phone || row.phonenumber || row.mobile || row.number;
                return phone && phone.length > 0;
            });

            setParsedData(data);
            toast.success(`${data.length} contacts found in CSV`);
        };
        reader.readAsText(file);
    };

    // ✅ CREATE NEW GROUP
    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) {
            toast.error('Please enter group name');
            return;
        }

        setCreatingGroup(true);
        try {
            const response = await api.post('/contacts/groups', {
                name: newGroupName.trim()
            });

            const newGroup = response.data.data;

            setLocalGroups(prev => [...prev, newGroup]);
            setSelectedGroup(newGroup.id);
            setNewGroupName('');
            setShowCreateGroup(false);

            toast.success(`Group "${newGroupName}" created`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create group');
        } finally {
            setCreatingGroup(false);
        }
    };

    const handleSubmit = async () => {
        if (parsedData.length === 0) {
            toast.error('No valid contacts to upload');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const response = await api.post('/contacts/csv-upload', {
                contacts: parsedData,
                // ❌ No defaultCountryCode - auto detect
                groupId: selectedGroup || undefined,
                tags: tags.split(',').map(t => t.trim()).filter(t => t)
            });

            setResult(response.data.data);
            toast.success(response.data.message);

            if (response.data.data.created > 0) {
                onSuccess();
            }

        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setParsedData([]);
        setResult(null);
        setShowCreateGroup(false);
        setNewGroupName('');
        onClose();
    };

    const downloadTemplate = () => {
        const template = 'phone,firstName,lastName,email\n+919876543210,John,Doe,john@example.com\n+14155551234,Jane,Smith,jane@example.com\n+447911123456,Bob,Wilson,bob@example.com';
        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contacts_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                            <FileSpreadsheet className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Import CSV
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Upload contacts from CSV file
                            </p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">

                    {/* ✅ Auto Detect Notice */}
                    <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                        <Phone className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-purple-800 dark:text-purple-300">
                                Auto Country Detection
                            </p>
                            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                                Include country code in phone column (e.g., +91, +1, +44).
                                Numbers will be automatically validated.
                            </p>
                        </div>
                    </div>

                    {/* Download Template */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Need a template?</p>
                            <p className="text-sm text-gray-500">Download sample CSV with correct format</p>
                        </div>
                        <button
                            onClick={downloadTemplate}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </button>
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            CSV File <span className="text-red-500">*</span>
                        </label>
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${file
                                    ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'
                                }`}
                            onClick={() => document.getElementById('csv-input')?.click()}
                        >
                            <input
                                id="csv-input"
                                type="file"
                                accept=".csv"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            {file ? (
                                <div>
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                    <p className="font-semibold text-green-700 dark:text-green-400">{file.name}</p>
                                    <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                                        {parsedData.length} contacts ready to import
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="font-medium text-gray-700 dark:text-gray-300">
                                        Click to upload or drag & drop
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        CSV files only (max 10,000 rows)
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preview */}
                    {parsedData.length > 0 && (
                        <div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Preview (first 5 rows):
                            </p>
                            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                                        <tr>
                                            {Object.keys(parsedData[0] || {}).slice(0, 4).map(key => (
                                                <th key={key} className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                                                    {key}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {parsedData.slice(0, 5).map((row, i) => (
                                            <tr key={i}>
                                                {Object.values(row).slice(0, 4).map((val: any, j) => (
                                                    <td key={j} className="px-3 py-2 text-gray-900 dark:text-gray-100">
                                                        {val || '-'}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ✅ Group Selection with Create Option */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Add to Group (Optional)
                        </label>

                        {!showCreateGroup ? (
                            <div className="flex gap-2">
                                <select
                                    value={selectedGroup}
                                    onChange={(e) => setSelectedGroup(e.target.value)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">No group</option>
                                    {localGroups.map(group => (
                                        <option key={group.id} value={group.id}>{group.name}</option>
                                    ))}
                                </select>

                                {/* ✅ Create Group Button */}
                                <button
                                    type="button"
                                    onClick={() => setShowCreateGroup(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 border border-purple-200 dark:border-purple-800 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                                >
                                    <FolderPlus className="w-4 h-4" />
                                    <span className="hidden sm:inline">New Group</span>
                                </button>
                            </div>
                        ) : (
                            // ✅ Create Group Form
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="Enter group name..."
                                    className="flex-1 px-4 py-2.5 border border-purple-300 dark:border-purple-700 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreateGroup();
                                        if (e.key === 'Escape') setShowCreateGroup(false);
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleCreateGroup}
                                    disabled={creatingGroup || !newGroupName.trim()}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                >
                                    {creatingGroup ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Plus className="w-4 h-4" />
                                    )}
                                    Create
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateGroup(false);
                                        setNewGroupName('');
                                    }}
                                    className="px-3 py-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Tags (Optional)
                        </label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g., csv-import, leads"
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Result */}
                    {result && (
                        <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                <span className="font-bold text-green-800 dark:text-green-400 text-lg">
                                    Import Complete!
                                </span>
                            </div>

                            <div className="grid grid-cols-4 gap-3">
                                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.totalProcessed || 0}</p>
                                    <p className="text-xs text-gray-500">Processed</p>
                                </div>
                                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">{result.created || 0}</p>
                                    <p className="text-xs text-gray-500">Created</p>
                                </div>
                                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">{result.updated || 0}</p>
                                    <p className="text-xs text-gray-500">Updated</p>
                                </div>
                                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                    <p className="text-2xl font-bold text-yellow-600">{result.skipped || 0}</p>
                                    <p className="text-xs text-gray-500">Skipped</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <button onClick={handleClose} className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium">
                        {result ? 'Close' : 'Cancel'}
                    </button>
                    {!result && (
                        <button
                            onClick={handleSubmit}
                            disabled={loading || parsedData.length === 0}
                            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Import {parsedData.length > 0 ? `(${parsedData.length})` : ''}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}