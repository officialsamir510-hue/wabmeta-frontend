// ✅ CREATE: src/pages/CreateAutomation.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Save, Plus, Trash2, Loader2, MessageSquare, Users,
    Clock, Webhook, Tag, Send
} from 'lucide-react';
import { automations as automationsApi, templates as templatesApi } from '../services/api';
import toast from 'react-hot-toast';

interface Action {
    id: string;
    type: string;
    config: any;
}

const triggerOptions = [
    { value: 'NEW_CONTACT', label: 'New Contact Added', icon: Users, description: 'Triggers when a new contact is created' },
    { value: 'KEYWORD', label: 'Keyword Match', icon: MessageSquare, description: 'Triggers when message contains specific keyword' },
    { value: 'SCHEDULE', label: 'Scheduled Time', icon: Clock, description: 'Triggers at a specific time' },
    { value: 'WEBHOOK', label: 'Webhook Received', icon: Webhook, description: 'Triggers when webhook is called' },
    { value: 'INACTIVITY', label: 'Contact Inactivity', icon: Clock, description: 'Triggers after period of no messages' },
];

const actionOptions = [
    { value: 'send_message', label: 'Send Text Message', icon: MessageSquare },
    { value: 'send_template', label: 'Send Template', icon: Send },
    { value: 'add_tag', label: 'Add Tag', icon: Tag },
    { value: 'remove_tag', label: 'Remove Tag', icon: Tag },
    { value: 'create_lead', label: 'Create CRM Lead', icon: Users },
    { value: 'delay', label: 'Wait/Delay', icon: Clock },
    { value: 'webhook', label: 'Call Webhook', icon: Webhook },
];

const CreateAutomation: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        trigger: 'NEW_CONTACT',
        triggerConfig: {} as any,
        isActive: false,
    });

    const [actions, setActions] = useState<Action[]>([]);

    useEffect(() => {
        loadTemplates();
        if (!isNew && id) {
            loadAutomation();
        }
    }, [id]);

    const loadTemplates = async () => {
        try {
            const res = await templatesApi.getAll({});
            if (res.data.success) {
                setTemplates(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to load templates');
        }
    };

    const loadAutomation = async () => {
        try {
            const res = await automationsApi.getById(id!);
            if (res.data.success) {
                const data = res.data.data;
                setFormData({
                    name: data.name,
                    description: data.description || '',
                    trigger: data.trigger,
                    triggerConfig: data.triggerConfig || {},
                    isActive: data.isActive,
                });
                setActions(data.actions || []);
            }
        } catch (err) {
            toast.error('Failed to load automation');
            navigate('/dashboard/automations');
        } finally {
            setLoading(false);
        }
    };

    const addAction = (type: string) => {
        const newAction: Action = {
            id: `action-${Date.now()}`,
            type,
            config: {},
        };
        setActions([...actions, newAction]);
    };

    const updateAction = (actionId: string, config: any) => {
        setActions(actions.map((a) => (a.id === actionId ? { ...a, config } : a)));
    };

    const removeAction = (actionId: string) => {
        setActions(actions.filter((a) => a.id !== actionId));
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('Automation name is required');
            return;
        }

        if (actions.length === 0) {
            toast.error('Add at least one action');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...formData,
                actions,
            };

            if (isNew) {
                await automationsApi.create(payload);
                toast.success('Automation created');
            } else {
                await automationsApi.update(id!, payload);
                toast.success('Automation updated');
            }
            navigate('/dashboard/automations');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const renderTriggerConfig = () => {
        switch (formData.trigger) {
            case 'KEYWORD':
                return (
                    <div className="mt-4 space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Keywords (comma separated)</label>
                            <input
                                type="text"
                                value={formData.triggerConfig.keywords?.join(', ') || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    triggerConfig: { ...formData.triggerConfig, keywords: e.target.value.split(',').map(k => k.trim()) }
                                })}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="e.g., hello, hi, start"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="exactMatch"
                                checked={formData.triggerConfig.exactMatch || false}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    triggerConfig: { ...formData.triggerConfig, exactMatch: e.target.checked }
                                })}
                                className="rounded"
                            />
                            <label htmlFor="exactMatch" className="text-sm">Exact match only</label>
                        </div>
                    </div>
                );

            case 'SCHEDULE':
                return (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Time</label>
                            <input
                                type="time"
                                value={formData.triggerConfig.time || '09:00'}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    triggerConfig: { ...formData.triggerConfig, time: e.target.value }
                                })}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Days</label>
                            <select
                                value={formData.triggerConfig.days || 'daily'}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    triggerConfig: { ...formData.triggerConfig, days: e.target.value }
                                })}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="daily">Every Day</option>
                                <option value="weekdays">Weekdays Only</option>
                                <option value="weekends">Weekends Only</option>
                            </select>
                        </div>
                    </div>
                );

            case 'INACTIVITY':
                return (
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Inactive for (hours)</label>
                        <input
                            type="number"
                            value={formData.triggerConfig.hours || 24}
                            onChange={(e) => setFormData({
                                ...formData,
                                triggerConfig: { ...formData.triggerConfig, hours: Number(e.target.value) }
                            })}
                            className="w-full px-3 py-2 border rounded-lg"
                            min={1}
                            max={168}
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    const renderActionConfig = (action: Action) => {
        switch (action.type) {
            case 'send_message':
                return (
                    <textarea
                        value={action.config.message || ''}
                        onChange={(e) => updateAction(action.id, { message: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg mt-2"
                        rows={3}
                        placeholder="Enter message text..."
                    />
                );

            case 'send_template':
                return (
                    <select
                        value={action.config.templateId || ''}
                        onChange={(e) => updateAction(action.id, { templateId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg mt-2"
                    >
                        <option value="">Select template...</option>
                        {templates.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                );

            case 'add_tag':
            case 'remove_tag':
                return (
                    <input
                        type="text"
                        value={action.config.tag || ''}
                        onChange={(e) => updateAction(action.id, { tag: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg mt-2"
                        placeholder="Enter tag name..."
                    />
                );

            case 'delay':
                return (
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="number"
                            value={action.config.duration || 1}
                            onChange={(e) => updateAction(action.id, { ...action.config, duration: Number(e.target.value) })}
                            className="w-24 px-3 py-2 border rounded-lg"
                            min={1}
                        />
                        <select
                            value={action.config.unit || 'minutes'}
                            onChange={(e) => updateAction(action.id, { ...action.config, unit: e.target.value })}
                            className="px-3 py-2 border rounded-lg"
                        >
                            <option value="seconds">Seconds</option>
                            <option value="minutes">Minutes</option>
                            <option value="hours">Hours</option>
                        </select>
                    </div>
                );

            case 'webhook':
                return (
                    <input
                        type="url"
                        value={action.config.url || ''}
                        onChange={(e) => updateAction(action.id, { url: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg mt-2"
                        placeholder="https://..."
                    />
                );

            case 'create_lead':
                return (
                    <input
                        type="text"
                        value={action.config.title || ''}
                        onChange={(e) => updateAction(action.id, { title: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg mt-2"
                        placeholder="Lead title (optional)"
                    />
                );

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/automations')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isNew ? 'Create Automation' : 'Edit Automation'}
                        </h1>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                </button>
            </div>

            {/* Form */}
            <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                                placeholder="e.g., Welcome New Contacts"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                                rows={2}
                                placeholder="What does this automation do?"
                            />
                        </div>
                    </div>
                </div>

                {/* Trigger */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold mb-4">When to Trigger</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {triggerOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setFormData({ ...formData, trigger: option.value, triggerConfig: {} })}
                                className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-colors ${formData.trigger === option.value
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${formData.trigger === option.value ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    <option.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                                    <p className="text-sm text-gray-500">{option.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                    {renderTriggerConfig()}
                </div>

                {/* Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold mb-4">Actions</h2>

                    <div className="space-y-3 mb-4">
                        {actions.map((action, index) => {
                            const actionOption = actionOptions.find((o) => o.value === action.type);
                            return (
                                <div
                                    key={action.id}
                                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                                                {index + 1}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {actionOption && <actionOption.icon className="w-4 h-4 text-gray-500" />}
                                                <span className="font-medium">{actionOption?.label || action.type}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeAction(action.id)}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {renderActionConfig(action)}
                                </div>
                            );
                        })}
                    </div>

                    {/* Add Action Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                const menu = document.getElementById('action-menu');
                                menu?.classList.toggle('hidden');
                            }}
                            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-green-500 hover:text-green-600 w-full justify-center"
                        >
                            <Plus className="w-4 h-4" />
                            Add Action
                        </button>
                        <div id="action-menu" className="hidden absolute z-10 w-full mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-2">
                            {actionOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        addAction(option.value);
                                        document.getElementById('action-menu')?.classList.add('hidden');
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-600"
                                >
                                    <option.icon className="w-4 h-4 text-gray-500" />
                                    <span>{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateAutomation;