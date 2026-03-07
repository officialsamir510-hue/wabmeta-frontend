// ✅ CREATE: src/pages/LeadsList.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Plus, Search, LayoutGrid, List, Loader2,
    MoreVertical, Calendar
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { crm as crmApi } from '../services/api';
import type { Lead, Pipeline } from '../types/crm';
import toast from 'react-hot-toast';
import { CreateLeadModal } from '../components/crm';

const LeadsList: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
    const [leadsByStage, setLeadsByStage] = useState<Record<string, Lead[]>>({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        loadPipelines();
    }, []);

    useEffect(() => {
        if (selectedPipeline) {
            loadLeads();
        }
    }, [selectedPipeline, search]);

    const loadPipelines = async () => {
        try {
            const res = await crmApi.getPipelines();
            if (res.data.success) {
                const pips = res.data.data;
                setPipelines(pips);

                const pipelineId = searchParams.get('pipelineId');
                const selected = pips.find((p: Pipeline) => p.id === pipelineId) || pips[0];
                setSelectedPipeline(selected);
            }
        } catch (err) {
            toast.error('Failed to load pipelines');
        }
    };

    const loadLeads = async () => {
        if (!selectedPipeline) return;

        setLoading(true);
        try {
            const res = await crmApi.getLeads({
                pipelineId: selectedPipeline.id,
                search: search || undefined,
                limit: 200,
            });

            if (res.data.success) {
                // Group leads by stage
                const grouped: Record<string, Lead[]> = {};
                selectedPipeline.stages.forEach(stage => {
                    grouped[stage.id] = [];
                });

                res.data.data.forEach((lead: Lead) => {
                    if (lead.stageId && grouped[lead.stageId]) {
                        grouped[lead.stageId].push(lead);
                    }
                });

                setLeadsByStage(grouped);
            }
        } catch (err) {
            toast.error('Failed to load leads');
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (result: any) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;

        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        // Optimistic update
        const lead = leadsByStage[source.droppableId].find(l => l.id === draggableId);
        if (!lead) return;

        const newLeadsByStage = { ...leadsByStage };

        // Remove from source
        newLeadsByStage[source.droppableId] = newLeadsByStage[source.droppableId].filter(
            l => l.id !== draggableId
        );

        // Add to destination
        const updatedLead = { ...lead, stageId: destination.droppableId };
        newLeadsByStage[destination.droppableId].splice(destination.index, 0, updatedLead);

        setLeadsByStage(newLeadsByStage);

        // API call
        try {
            await crmApi.updateLead(draggableId, { stageId: destination.droppableId });
            toast.success('Lead moved successfully');
        } catch (err) {
            // Revert on error
            loadLeads();
            toast.error('Failed to move lead');
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'bg-red-100 text-red-700';
            case 'HIGH': return 'bg-orange-100 text-orange-700';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
            case 'LOW': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Leads</h1>

                        {/* Pipeline Selector */}
                        <select
                            value={selectedPipeline?.id || ''}
                            onChange={(e) => {
                                const pip = pipelines.find(p => p.id === e.target.value);
                                setSelectedPipeline(pip || null);
                            }}
                            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-sm"
                        >
                            {pipelines.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search leads..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 pr-4 py-2 w-64 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-sm"
                            />
                        </div>

                        {/* View Toggle */}
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={`p-1.5 rounded ${viewMode === 'kanban' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Add Lead */}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <Plus className="w-4 h-4" />
                            Add Lead
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
            ) : viewMode === 'kanban' ? (
                <div className="flex-1 overflow-x-auto p-4">
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <div className="flex gap-4 h-full min-w-max">
                            {selectedPipeline?.stages.map((stage) => (
                                <div
                                    key={stage.id}
                                    className="w-80 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-xl flex flex-col"
                                >
                                    {/* Stage Header */}
                                    <div
                                        className="p-3 rounded-t-xl flex items-center justify-between"
                                        style={{ backgroundColor: stage.color + '20' }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: stage.color }}
                                            />
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {stage.name}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                ({leadsByStage[stage.id]?.length || 0})
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500">{stage.probability}%</span>
                                    </div>

                                    {/* Leads */}
                                    <Droppable droppableId={stage.id}>
                                        {(provided: any, snapshot: any) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`flex-1 p-2 space-y-2 overflow-y-auto ${snapshot.isDraggingOver ? 'bg-green-50 dark:bg-green-900/20' : ''
                                                    }`}
                                            >
                                                {leadsByStage[stage.id]?.map((lead, index) => (
                                                    <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                                        {(provided: any, snapshot: any) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                onClick={() => navigate(`/dashboard/crm/leads/${lead.id}`)}
                                                                className={`bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${snapshot.isDragging ? 'shadow-lg ring-2 ring-green-500' : ''
                                                                    }`}
                                                            >
                                                                <div className="flex items-start justify-between mb-2">
                                                                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                                                        {lead.title}
                                                                    </h4>
                                                                    <span className={`px-1.5 py-0.5 text-xs rounded ${getPriorityColor(lead.priority)}`}>
                                                                        {lead.priority}
                                                                    </span>
                                                                </div>

                                                                {lead.contact && (
                                                                    <p className="text-sm text-gray-500 mb-2">
                                                                        {lead.contact.firstName} {lead.contact.lastName}
                                                                    </p>
                                                                )}

                                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                                    {lead.value && (
                                                                        <span className="font-medium text-green-600">
                                                                            {formatCurrency(lead.value)}
                                                                        </span>
                                                                    )}
                                                                    {lead.expectedCloseDate && (
                                                                        <span className="flex items-center gap-1">
                                                                            <Calendar className="w-3 h-3" />
                                                                            {new Date(lead.expectedCloseDate).toLocaleDateString()}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            ))}
                        </div>
                    </DragDropContext>
                </div>
            ) : (
                /* List View */
                <div className="flex-1 overflow-auto p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {Object.values(leadsByStage).flat().map((lead) => (
                                    <tr
                                        key={lead.id}
                                        onClick={() => navigate(`/dashboard/crm/leads/${lead.id}`)}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                    >
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900 dark:text-white">{lead.title}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {lead.contact ? `${lead.contact.firstName || ''} ${lead.contact.lastName || ''}` : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className="px-2 py-1 text-xs rounded-full"
                                                style={{ backgroundColor: lead.stage?.color + '20', color: lead.stage?.color }}
                                            >
                                                {lead.stage?.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-green-600">
                                            {lead.value ? formatCurrency(lead.value) : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(lead.priority)}`}>
                                                {lead.priority}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                                                <MoreVertical className="w-4 h-4 text-gray-400" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Lead Modal */}
            {showCreateModal && (
                <CreateLeadModal
                    pipelineId={selectedPipeline?.id}
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => {
                        setShowCreateModal(false);
                        loadLeads();
                    }}
                />
            )}
        </div>
    );
};

export default LeadsList;