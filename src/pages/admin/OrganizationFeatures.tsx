import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Upload, FileSpreadsheet, Shield, Building2 } from 'lucide-react';
import { admin } from '../../services/api';
import toast from 'react-hot-toast';

export default function OrganizationFeatures() {
    const { organizationId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [orgName, setOrgName] = useState('');
    const [currentPlan, setCurrentPlan] = useState('');
    const [features, setFeatures] = useState({
        simpleBulkPaste: false,
        csvUpload: false,
        adminOverride: false
    });

    useEffect(() => {
        fetchFeatures();
    }, [organizationId]);

    const fetchFeatures = async () => {
        try {
            const { data } = await admin.getOrganizationFeatures(organizationId!);
            setOrgName(data.data.organizationName);
            setCurrentPlan(data.data.currentPlan);
            setFeatures(data.data.features);
        } catch (error) {
            toast.error('Failed to fetch features');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await admin.updateOrganizationFeatures(organizationId!, {
                simpleBulkPaste: features.simpleBulkPaste,
                csvUpload: features.csvUpload,
                enableOverride: features.adminOverride
            });
            toast.success('Features updated successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {orgName}
                        </h1>
                        <p className="text-gray-500">
                            Current Plan: <span className="font-semibold text-purple-600">{currentPlan}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Features Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                    Feature Access Control
                </h2>

                <div className="space-y-4">
                    {/* Admin Override Toggle */}
                    <div className={`p-5 rounded-xl border-2 transition-all ${features.adminOverride
                        ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${features.adminOverride ? 'bg-yellow-100' : 'bg-gray-200 dark:bg-gray-700'
                                    }`}>
                                    <Shield className={`w-6 h-6 ${features.adminOverride ? 'text-yellow-600' : 'text-gray-500'}`} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-lg">
                                        Admin Override
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        When enabled, plan restrictions are ignored and you control access manually
                                    </p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={features.adminOverride}
                                    onChange={(e) => setFeatures(prev => ({
                                        ...prev,
                                        adminOverride: e.target.checked,
                                        // Reset features when disabling override
                                        ...(e.target.checked ? {} : { simpleBulkPaste: false, csvUpload: false })
                                    }))}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500"></div>
                            </label>
                        </div>
                    </div>

                    {/* Feature Toggles */}
                    <div className={`space-y-4 transition-opacity ${features.adminOverride ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>

                        {/* Simple Bulk Paste */}
                        <div className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                                        <Upload className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            Simple Bulk Paste
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Paste phone numbers directly • Normally requires ₹2,500+ plan
                                        </p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={features.simpleBulkPaste}
                                        onChange={(e) => setFeatures(prev => ({
                                            ...prev,
                                            simpleBulkPaste: e.target.checked
                                        }))}
                                        disabled={!features.adminOverride}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
                                </label>
                            </div>
                        </div>

                        {/* CSV Upload */}
                        <div className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                                        <FileSpreadsheet className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            CSV Import
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Import contacts from CSV files • Normally requires ₹899+ plan
                                        </p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={features.csvUpload}
                                        onChange={(e) => setFeatures(prev => ({
                                            ...prev,
                                            csvUpload: e.target.checked
                                        }))}
                                        disabled={!features.adminOverride}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600 disabled:opacity-50"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {!features.adminOverride && (
                        <p className="text-center text-sm text-gray-500 py-4">
                            ⚠️ Enable "Admin Override" to manually control feature access
                        </p>
                    )}
                </div>

                {/* Save Button */}
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-bold transition-colors"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
