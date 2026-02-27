// src/components/inbox/SendTemplateModal.tsx

import React, { useState, useEffect } from 'react';
import {
    X,
    FileText,
    Send,
    Loader2,
    Search,
    AlertCircle,
    MessageSquare,
} from 'lucide-react';
import { templates, whatsapp } from '../../services/api';
import toast from 'react-hot-toast';

interface Template {
    id: string;
    name: string;
    language: string;
    category: string;
    bodyText: string;
    headerType?: string;
    headerContent?: string;
    footerText?: string;
    status: string;
    variables?: any[];
}

interface SendTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    conversationId: string;
    contactPhone: string;
    contactName?: string;
}

const SendTemplateModal: React.FC<SendTemplateModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    conversationId,
    contactPhone,
    contactName,
}) => {
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [templateList, setTemplateList] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [search, setSearch] = useState('');
    const [variableValues, setVariableValues] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
            setSelectedTemplate(null);
            setVariableValues({});
            setSearch('');
        }
    }, [isOpen]);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await templates.getAll({ status: 'APPROVED', limit: 100 });

            if (response.data.success) {
                const approved = (response.data.data?.templates || response.data.data || [])
                    .filter((t: Template) => t.status === 'APPROVED');
                setTemplateList(approved);
            }
        } catch (error) {
            console.error('Fetch templates error:', error);
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const extractVariables = (text: string): string[] => {
        const matches = text.match(/\{\{(\d+)\}\}/g) || [];
        return [...new Set(matches)];
    };

    const handleSelectTemplate = (template: Template) => {
        setSelectedTemplate(template);

        // Initialize variable values
        const vars = extractVariables(template.bodyText);
        const initialValues: Record<string, string> = {};

        vars.forEach((v, index) => {
            // Pre-fill with contact info if available
            if (index === 0 && contactName) {
                initialValues[v] = contactName;
            } else {
                initialValues[v] = '';
            }
        });

        setVariableValues(initialValues);
    };

    const getPreviewText = () => {
        if (!selectedTemplate) return '';

        let text = selectedTemplate.bodyText;
        Object.entries(variableValues).forEach(([key, value]) => {
            text = text.replace(key, value || key);
        });

        return text;
    };

    const handleSend = async () => {
        if (!selectedTemplate) {
            toast.error('Please select a template');
            return;
        }

        // Check if all variables are filled
        const vars = extractVariables(selectedTemplate.bodyText);
        const emptyVars = vars.filter(v => !variableValues[v]?.trim());

        if (emptyVars.length > 0) {
            toast.error('Please fill all template variables');
            return;
        }

        try {
            setSending(true);

            // Get WhatsApp account
            const accountsRes = await whatsapp.accounts();
            const accountsData = accountsRes.data?.data;
            const accounts = (accountsData?.accounts || (Array.isArray(accountsData) ? accountsData : [])) as any[];
            const defaultAccount = accounts.find((a: any) => a.isDefault) || accounts[0];

            if (!defaultAccount) {
                toast.error('No WhatsApp account connected');
                return;
            }

            // Prepare params array
            const params = vars.map(v => variableValues[v]);

            // Send template message
            const response = await whatsapp.sendTemplate({
                whatsappAccountId: defaultAccount.id,
                to: contactPhone,
                templateName: selectedTemplate.name,
                language: selectedTemplate.language,
                parameters: params,
                conversationId,
            });

            if (response.data.success) {
                toast.success('Template message sent! 24h window reopened.');
                onSuccess();
                onClose();
            } else {
                throw new Error(response.data.message);
            }
        } catch (error: any) {
            console.error('Send template error:', error);
            toast.error(error.message || 'Failed to send template');
        } finally {
            setSending(false);
        }
    };

    const filteredTemplates = templateList.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.bodyText.toLowerCase().includes(search.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                            <FileText className="w-6 h-6 mr-2 text-green-600" />
                            Send Template Message
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            To: {contactName || contactPhone}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {!selectedTemplate ? (
                        /* Template Selection */
                        <div className="space-y-4">
                            {/* Info Banner */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="flex items-start">
                                    <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                                            24-Hour Window Expired
                                        </p>
                                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                            As per Meta's policy, you can only send pre-approved template messages
                                            outside the 24-hour conversation window. Once the customer replies,
                                            the window will reopen.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search templates..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            {/* Template List */}
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                                </div>
                            ) : filteredTemplates.length > 0 ? (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {filteredTemplates.map((template) => (
                                        <button
                                            key={template.id}
                                            onClick={() => handleSelectTemplate(template)}
                                            className="w-full p-4 text-left border border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-gray-900 dark:text-white truncate">
                                                            {template.name}
                                                        </p>
                                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                                                            {template.language}
                                                        </span>
                                                        <span className={`px-2 py-0.5 text-xs rounded ${template.category === 'MARKETING'
                                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                            }`}>
                                                            {template.category}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                        {template.bodyText}
                                                    </p>
                                                </div>
                                                <MessageSquare className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {search ? 'No templates found' : 'No approved templates available'}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Template Preview & Variables */
                        <div className="space-y-6">
                            {/* Selected Template */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Selected Template</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{selectedTemplate.name}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedTemplate(null)}
                                    className="text-sm text-green-600 hover:text-green-700"
                                >
                                    Change Template
                                </button>
                            </div>

                            {/* Variables Input */}
                            {extractVariables(selectedTemplate.bodyText).length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Fill Template Variables
                                    </p>
                                    {extractVariables(selectedTemplate.bodyText).map((variable, index) => (
                                        <div key={variable}>
                                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                Variable {index + 1} ({variable})
                                            </label>
                                            <input
                                                type="text"
                                                value={variableValues[variable] || ''}
                                                onChange={(e) => setVariableValues({
                                                    ...variableValues,
                                                    [variable]: e.target.value,
                                                })}
                                                placeholder={`Enter value for ${variable}`}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Preview */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Message Preview
                                </p>
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                                    {selectedTemplate.headerContent && (
                                        <p className="font-semibold text-gray-900 dark:text-white mb-2">
                                            {selectedTemplate.headerContent}
                                        </p>
                                    )}
                                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                        {getPreviewText()}
                                    </p>
                                    {selectedTemplate.footerText && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                            {selectedTemplate.footerText}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                        Cancel
                    </button>

                    {selectedTemplate && (
                        <button
                            onClick={handleSend}
                            disabled={sending}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {sending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Template
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SendTemplateModal;