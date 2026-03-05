import React, { useState, useEffect } from 'react';
import { X, Upload, Phone, Globe, CheckCircle, AlertCircle, Loader2, Info } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface CountryCode {
    code: string;
    country: string;
    flag: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    groups?: Array<{ id: string; name: string }>;
}

export default function SimpleBulkPasteModal({ isOpen, onClose, onSuccess, groups = [] }: Props) {
    const [phoneNumbers, setPhoneNumbers] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [countryCodes, setCountryCodes] = useState<CountryCode[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchCountryCodes();
        }
    }, [isOpen]);

    const fetchCountryCodes = async () => {
        try {
            const { data } = await api.get('/contacts/country-codes');
            setCountryCodes(data.data || []);
        } catch (error) {
            console.error('Failed to fetch country codes');
        }
    };

    if (!isOpen) return null;

    const getPreviewCount = () => {
        if (!phoneNumbers.trim()) return 0;
        return phoneNumbers
            .split(/[\n,;\s]+/)
            .filter(n => n.trim().length > 0)
            .length;
    };

    const handleSubmit = async () => {
        const count = getPreviewCount();
        if (count === 0) {
            toast.error('Please enter at least one phone number');
            return;
        }

        if (count > 5000) {
            toast.error('Maximum 5,000 numbers allowed per upload');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const response = await api.post('/contacts/bulk-paste', {
                phoneNumbers,
                countryCode,
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
        setPhoneNumbers('');
        setResult(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                            <Upload className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Simple Bulk Paste
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Paste phone numbers to add contacts quickly
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">

                    {/* International Support Notice */}
                    <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <Globe className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-blue-800 dark:text-blue-300">
                                International Numbers Supported
                            </p>
                            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                You can add numbers from any country. Numbers with + prefix are auto-detected.
                                For numbers without country code, the selected default will be applied.
                            </p>
                        </div>
                    </div>

                    {/* Phone Numbers Input */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            <Phone className="w-4 h-4" />
                            Phone Numbers <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={phoneNumbers}
                            onChange={(e) => setPhoneNumbers(e.target.value)}
                            placeholder={`Paste numbers here (one per line or comma/space separated)\n\nExamples:\n9876543210\n+919123456789\n+1 234 567 8900\n+44 7911 123456\n+971501234567`}
                            className="w-full h-52 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
                        />
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                                💡 Supports: newlines, commas, spaces, semicolons
                            </p>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Max: 5,000 numbers
                            </span>
                        </div>
                    </div>

                    {/* Country Code & Group */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Default Country Code
                            </label>
                            <select
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {countryCodes.map(cc => (
                                    <option key={cc.code} value={cc.code}>
                                        {cc.flag} {cc.country} ({cc.code})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Applied to numbers without + prefix
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Add to Group (Optional)
                            </label>
                            <select
                                value={selectedGroup}
                                onChange={(e) => setSelectedGroup(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">No group</option>
                                {groups.map(group => (
                                    <option key={group.id} value={group.id}>{group.name}</option>
                                ))}
                            </select>
                        </div>
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
                            placeholder="e.g., lead, international, 2024"
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Separate multiple tags with commas
                        </p>
                    </div>

                    {/* Preview Count */}
                    {phoneNumbers.trim() && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                                <Phone className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {getPreviewCount().toLocaleString()} numbers detected
                                </p>
                                <p className="text-sm text-gray-500">
                                    Ready to upload
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Result */}
                    {result && (
                        <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                <span className="font-bold text-green-800 dark:text-green-400 text-lg">
                                    Upload Complete!
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.totalInput}</p>
                                    <p className="text-xs text-gray-500">Total Input</p>
                                </div>
                                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">{result.created}</p>
                                    <p className="text-xs text-gray-500">Created</p>
                                </div>
                                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                    <p className="text-2xl font-bold text-yellow-600">{result.duplicatesSkipped}</p>
                                    <p className="text-xs text-gray-500">Duplicates</p>
                                </div>
                                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                    <p className="text-2xl font-bold text-red-600">{result.invalidNumbers}</p>
                                    <p className="text-xs text-gray-500">Invalid</p>
                                </div>
                            </div>

                            {result.invalidDetails && result.invalidDetails.length > 0 && (
                                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                                        Invalid numbers (first 10):
                                    </p>
                                    <div className="text-xs text-red-600 dark:text-red-400 font-mono space-y-1">
                                        {result.invalidDetails.map((item: any, i: number) => (
                                            <div key={i}>{item.input}: {item.error}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <button
                        onClick={handleClose}
                        className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
                    >
                        {result ? 'Close' : 'Cancel'}
                    </button>
                    {!result && (
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !phoneNumbers.trim()}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Upload {getPreviewCount() > 0 ? `(${getPreviewCount()})` : ''}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
