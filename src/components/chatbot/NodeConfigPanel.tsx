import React from 'react';
import { X, Trash2, Plus } from 'lucide-react';
import type { Node } from 'reactflow';

interface Props {
    node: Node;
    onUpdate: (data: any) => void;
    onDelete: () => void;
    onClose: () => void;
}

const NodeConfigPanel: React.FC<Props> = ({ node, onUpdate, onDelete, onClose }) => {
    const renderConfig = () => {
        switch (node.type) {
            case 'message':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Message</label>
                            <textarea
                                value={node.data.message || ''}
                                onChange={(e) => onUpdate({ message: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg resize-none h-32"
                                placeholder="Enter your message..."
                            />
                        </div>
                    </div>
                );

            case 'button':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Message</label>
                            <textarea
                                value={node.data.message || ''}
                                onChange={(e) => onUpdate({ message: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg resize-none h-20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Buttons (max 3)</label>
                            <div className="space-y-2">
                                {(node.data.buttons || []).map((btn: any, i: number) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={btn.text}
                                            onChange={(e) => {
                                                const newButtons = [...(node.data.buttons || [])];
                                                newButtons[i] = { ...newButtons[i], text: e.target.value };
                                                onUpdate({ buttons: newButtons });
                                            }}
                                            className="flex-1 px-3 py-1.5 border rounded"
                                            placeholder="Button text"
                                        />
                                        <button
                                            onClick={() => {
                                                const newButtons = (node.data.buttons || []).filter((_: any, idx: number) => idx !== i);
                                                onUpdate({ buttons: newButtons });
                                            }}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {(node.data.buttons || []).length < 3 && (
                                    <button
                                        onClick={() => {
                                            const newButtons = [...(node.data.buttons || []), { id: String(Date.now()), text: '' }];
                                            onUpdate({ buttons: newButtons });
                                        }}
                                        className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
                                    >
                                        <Plus className="w-4 h-4" /> Add Button
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'condition':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Variable</label>
                            <select
                                value={node.data.condition?.variable || 'lastInput'}
                                onChange={(e) => onUpdate({ condition: { ...node.data.condition, variable: e.target.value } })}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="lastInput">Last User Input</option>
                                <option value="contactName">Contact Name</option>
                                <option value="phone">Phone Number</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Operator</label>
                            <select
                                value={node.data.condition?.operator || 'equals'}
                                onChange={(e) => onUpdate({ condition: { ...node.data.condition, operator: e.target.value } })}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="equals">Equals</option>
                                <option value="contains">Contains</option>
                                <option value="startsWith">Starts With</option>
                                <option value="exists">Has Value</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Value</label>
                            <input
                                type="text"
                                value={node.data.condition?.value || ''}
                                onChange={(e) => onUpdate({ condition: { ...node.data.condition, value: e.target.value } })}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="Enter value to compare"
                            />
                        </div>
                    </div>
                );

            case 'delay':
                return (
                    <div>
                        <label className="block text-sm font-medium mb-1">Delay (seconds)</label>
                        <input
                            type="number"
                            value={(node.data.delay || 1000) / 1000}
                            onChange={(e) => onUpdate({ delay: Number(e.target.value) * 1000 })}
                            className="w-full px-3 py-2 border rounded-lg"
                            min={1}
                            max={60}
                        />
                    </div>
                );

            case 'action':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Action Type</label>
                            <select
                                value={node.data.action?.type || 'tagContact'}
                                onChange={(e) => onUpdate({ action: { type: e.target.value, params: {} } })}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="tagContact">Add Tag to Contact</option>
                                <option value="createLead">Create CRM Lead</option>
                                <option value="webhook">Call Webhook</option>
                                <option value="setVariable">Set Variable</option>
                            </select>
                        </div>

                        {node.data.action?.type === 'tagContact' && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Tag Name</label>
                                <input
                                    type="text"
                                    value={node.data.action?.params?.tag || ''}
                                    onChange={(e) => onUpdate({ action: { ...node.data.action, params: { tag: e.target.value } } })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="e.g., interested"
                                />
                            </div>
                        )}

                        {node.data.action?.type === 'webhook' && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Webhook URL</label>
                                <input
                                    type="url"
                                    value={node.data.action?.params?.url || ''}
                                    onChange={(e) => onUpdate({ action: { ...node.data.action, params: { ...node.data.action?.params, url: e.target.value } } })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="https://..."
                                />
                            </div>
                        )}
                    </div>
                );

            default:
                return <p className="text-gray-500">No configuration available</p>;
        }
    };

    return (
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">Configure Node</h3>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {renderConfig()}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={onDelete}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete Node
                </button>
            </div>
        </div>
    );
};

export default NodeConfigPanel;