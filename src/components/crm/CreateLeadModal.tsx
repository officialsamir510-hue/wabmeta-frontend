// ✅ CREATE: src/components/crm/CreateLeadModal.tsx

import React, { useState, useEffect } from 'react';
import { X, Loader2, Search } from 'lucide-react';
import { crm as crmApi, contacts as contactsApi } from '../../services/api';
import toast from 'react-hot-toast';

interface Props {
    pipelineId?: string;
    onClose: () => void;
    onCreated: () => void;
}

const CreateLeadModal: React.FC<Props> = ({ pipelineId, onClose, onCreated }) => {
    const [loading, setLoading] = useState(false);
    const [contacts, setContacts] = useState<any[]>([]);
    const [searchContact, setSearchContact] = useState('');
    const [selectedContact, setSelectedContact] = useState<any>(null);

    const [formData, setFormData] = useState({
        title: '',
        value: '',
        priority: 'MEDIUM',
        source: '',
        expectedCloseDate: '',
    });

    useEffect(() => {
        loadContacts();
    }, [searchContact]);

    const loadContacts = async () => {
        try {
            const res = await contactsApi.getAll({ search: searchContact, limit: 10 });
            if (res.data.success) {
                setContacts(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to load contacts');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            toast.error('Lead title is required');
            return;
        }

        setLoading(true);
        try {
            const res = await crmApi.createLead({
                title: formData.title,
                value: formData.value ? parseFloat(formData.value) : undefined,
                priority: formData.priority,
                source: formData.source || undefined,
                expectedCloseDate: formData.expectedCloseDate || undefined,
                contactId: selectedContact?.id,
                pipelineId,
            });

            if (res.data.success) {
                toast.success('Lead created successfully');
                onCreated();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create lead');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Lead</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Lead Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                            placeholder="e.g., Website Development Project"
                            required
                        />
                    </div>

                    {/* Contact Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Link Contact (Optional)
                        </label>
                        {selectedContact ? (
                            <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {selectedContact.firstName} {selectedContact.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500">{selectedContact.phone}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedContact(null)}
                                    className="p-1 hover:bg-green-100 rounded"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchContact}
                                    onChange={(e) => setSearchContact(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                                    placeholder="Search contacts..."
                                />
                                {searchContact && contacts.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {contacts.map((contact) => (
                                            <button
                                                key={contact.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedContact(contact);
                                                    setSearchContact('');
                                                }}
                                                className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600"
                                            >
                                                <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                                                <p className="text-sm text-gray-500">{contact.phone}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Value & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Deal Value (₹)
                            </label>
                            <input
                                type="number"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Priority
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>
                    </div>

                    {/* Source & Expected Close Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Source
                            </label>
                            <input
                                type="text"
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                                placeholder="e.g., WhatsApp, Website"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Expected Close
                            </label>
                            <input
                                type="date"
                                value={formData.expectedCloseDate}
                                onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create Lead
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateLeadModal;