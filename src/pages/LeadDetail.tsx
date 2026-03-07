// ✅ CREATE: src/pages/LeadDetail.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Trash2, Phone, Mail,
    MessageSquare, CheckSquare, Activity, Plus, Loader2, Send
} from 'lucide-react';
import { crm as crmApi } from '../services/api';
import type { Lead, LeadNote, LeadTask, LeadActivity } from '../types/crm';
import toast from 'react-hot-toast';

const LeadDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'notes' | 'tasks' | 'activity'>('notes');
    const [notes, setNotes] = useState<LeadNote[]>([]);
    const [tasks, setTasks] = useState<LeadTask[]>([]);
    const [activities, setActivities] = useState<LeadActivity[]>([]);
    const [newNote, setNewNote] = useState('');
    const [addingNote, setAddingNote] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', dueDate: '' });
    const [showTaskForm, setShowTaskForm] = useState(false);

    useEffect(() => {
        if (id) loadLead();
    }, [id]);

    const loadLead = async () => {
        setLoading(true);
        try {
            const res = await crmApi.getLeadById(id!);
            if (res.data.success) {
                const data = res.data.data;
                setLead(data);
                setNotes(data.notes || []);
                setTasks(data.tasks || []);
                setActivities(data.activities || []);
            }
        } catch (err) {
            toast.error('Failed to load lead');
            navigate('/dashboard/crm/leads');
        } finally {
            setLoading(false);
        }
    };

    const handleStageChange = async (stageId: string) => {
        if (!lead) return;
        try {
            await crmApi.updateLead(lead.id, { stageId });
            toast.success('Stage updated');
            loadLead();
        } catch (err) {
            toast.error('Failed to update stage');
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim() || !lead) return;
        setAddingNote(true);
        try {
            await crmApi.addLeadNote(lead.id, newNote);
            setNewNote('');
            toast.success('Note added');
            loadLead();
        } catch (err) {
            toast.error('Failed to add note');
        } finally {
            setAddingNote(false);
        }
    };

    const handleAddTask = async () => {
        if (!newTask.title.trim() || !lead) return;
        try {
            await crmApi.addLeadTask(lead.id, newTask);
            setNewTask({ title: '', dueDate: '' });
            setShowTaskForm(false);
            toast.success('Task added');
            loadLead();
        } catch (err) {
            toast.error('Failed to add task');
        }
    };

    const handleCompleteTask = async (taskId: string) => {
        try {
            await crmApi.completeTask(taskId);
            toast.success('Task completed');
            loadLead();
        } catch (err) {
            toast.error('Failed to complete task');
        }
    };

    const handleDelete = async () => {
        if (!lead || !confirm('Delete this lead?')) return;
        try {
            await crmApi.deleteLead(lead.id);
            toast.success('Lead deleted');
            navigate('/dashboard/crm/leads');
        } catch (err) {
            toast.error('Failed to delete lead');
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (!lead) {
        return <div>Lead not found</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <button
                            onClick={() => navigate('/dashboard/crm/leads')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{lead.title}</h1>
                            {lead.contact && (
                                <div className="flex items-center gap-4 mt-2 text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Phone className="w-4 h-4" />
                                        {lead.contact.phone}
                                    </span>
                                    {lead.contact.email && (
                                        <span className="flex items-center gap-1">
                                            <Mail className="w-4 h-4" />
                                            {lead.contact.email}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDelete}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Stage & Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div>
                        <label className="text-sm text-gray-500">Stage</label>
                        <select
                            value={lead.stageId || ''}
                            onChange={(e) => handleStageChange(e.target.value)}
                            className="mt-1 w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-lg font-medium"
                            style={{ color: lead.stage?.color }}
                        >
                            {lead.pipeline?.stages.map((stage) => (
                                <option key={stage.id} value={stage.id}>{stage.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-gray-500">Value</label>
                        <p className="mt-1 text-lg font-bold text-green-600">
                            {lead.value ? formatCurrency(Number(lead.value)) : '-'}
                        </p>
                    </div>

                    <div>
                        <label className="text-sm text-gray-500">Priority</label>
                        <p className="mt-1 font-medium text-gray-900 dark:text-white">{lead.priority}</p>
                    </div>

                    <div>
                        <label className="text-sm text-gray-500">Expected Close</label>
                        <p className="mt-1 font-medium text-gray-900 dark:text-white">
                            {lead.expectedCloseDate
                                ? new Date(lead.expectedCloseDate).toLocaleDateString()
                                : '-'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                {/* Tab Headers */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`flex items-center gap-2 px-4 py-3 font-medium ${activeTab === 'notes'
                                ? 'border-b-2 border-green-500 text-green-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Notes ({notes.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`flex items-center gap-2 px-4 py-3 font-medium ${activeTab === 'tasks'
                                ? 'border-b-2 border-green-500 text-green-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <CheckSquare className="w-4 h-4" />
                        Tasks ({tasks.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`flex items-center gap-2 px-4 py-3 font-medium ${activeTab === 'activity'
                                ? 'border-b-2 border-green-500 text-green-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Activity className="w-4 h-4" />
                        Activity ({activities.length})
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-4">
                    {/* Notes Tab */}
                    {activeTab === 'notes' && (
                        <div className="space-y-4">
                            {/* Add Note */}
                            <div className="flex gap-2">
                                <textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Add a note..."
                                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg resize-none"
                                    rows={2}
                                />
                                <button
                                    onClick={handleAddNote}
                                    disabled={addingNote || !newNote.trim()}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 self-end"
                                >
                                    {addingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Notes List */}
                            <div className="space-y-3">
                                {notes.map((note) => (
                                    <div key={note.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{note.content}</p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {new Date(note.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                                {notes.length === 0 && (
                                    <p className="text-center text-gray-500 py-8">No notes yet</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tasks Tab */}
                    {activeTab === 'tasks' && (
                        <div className="space-y-4">
                            {/* Add Task */}
                            {showTaskForm ? (
                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
                                    <input
                                        type="text"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        placeholder="Task title..."
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg"
                                    />
                                    <input
                                        type="date"
                                        value={newTask.dueDate}
                                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleAddTask}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg"
                                        >
                                            Add Task
                                        </button>
                                        <button
                                            onClick={() => setShowTaskForm(false)}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowTaskForm(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Task
                                </button>
                            )}

                            {/* Tasks List */}
                            <div className="space-y-2">
                                {tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg ${task.isCompleted ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700'
                                            }`}
                                    >
                                        <button
                                            onClick={() => !task.isCompleted && handleCompleteTask(task.id)}
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${task.isCompleted
                                                    ? 'bg-green-500 border-green-500 text-white'
                                                    : 'border-gray-300 hover:border-green-500'
                                                }`}
                                        >
                                            {task.isCompleted && '✓'}
                                        </button>
                                        <div className="flex-1">
                                            <p className={`${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                                {task.title}
                                            </p>
                                            {task.dueDate && (
                                                <p className="text-xs text-gray-500">
                                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {tasks.length === 0 && (
                                    <p className="text-center text-gray-500 py-8">No tasks yet</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Activity Tab */}
                    {activeTab === 'activity' && (
                        <div className="space-y-3">
                            {activities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 p-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                        <Activity className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-gray-900 dark:text-white">{activity.title}</p>
                                        {activity.description && (
                                            <p className="text-sm text-gray-500">{activity.description}</p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(activity.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {activities.length === 0 && (
                                <p className="text-center text-gray-500 py-8">No activity yet</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeadDetail;