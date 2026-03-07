// ✅ CREATE: src/pages/CRM.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users, TrendingUp, DollarSign, Target, Plus,
    ArrowUpRight, ArrowDownRight,
    Loader2, ChevronRight
} from 'lucide-react';
import { crm as crmApi } from '../services/api';
import type { CRMStats, Pipeline, Lead } from '../types/crm';
import toast from 'react-hot-toast';

const CRM: React.FC = () => {
    const [stats, setStats] = useState<CRMStats | null>(null);
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [statsRes, pipelinesRes, leadsRes] = await Promise.all([
                crmApi.getStats(),
                crmApi.getPipelines(),
                crmApi.getLeads({ limit: 5 }),
            ]);

            if (statsRes.data.success) setStats(statsRes.data.data);
            if (pipelinesRes.data.success) setPipelines(pipelinesRes.data.data);
            if (leadsRes.data.success) setRecentLeads(leadsRes.data.data);
        } catch (err) {
            toast.error('Failed to load CRM data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CRM Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your leads and deals</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/dashboard/crm/leads"
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        View All Leads
                    </Link>
                    <Link
                        to="/dashboard/crm/leads/new"
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        New Lead
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Leads</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                {stats?.totalLeads || 0}
                            </p>
                            <p className="text-sm text-green-600 mt-1 flex items-center">
                                <ArrowUpRight className="w-4 h-4 mr-1" />
                                {stats?.newLeads || 0} new this week
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Pipeline Value</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                {formatCurrency(Number(stats?.totalValue) || 0)}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Across all stages</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Won Deals</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">
                                {stats?.wonLeads || 0}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {formatCurrency(Number(stats?.wonValue) || 0)} value
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <Target className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Win Rate</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                {stats?.winRate || 0}%
                            </p>
                            <p className="text-sm text-red-500 mt-1 flex items-center">
                                <ArrowDownRight className="w-4 h-4 mr-1" />
                                {stats?.lostLeads || 0} lost
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Pipelines & Recent Leads */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pipelines */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pipelines</h2>
                        <Link to="/dashboard/crm/pipelines" className="text-sm text-green-600 hover:text-green-700">
                            Manage
                        </Link>
                    </div>
                    <div className="p-4 space-y-4">
                        {pipelines.map((pipeline) => (
                            <Link
                                key={pipeline.id}
                                to={`/dashboard/crm/leads?pipelineId=${pipeline.id}`}
                                className="block p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-medium text-gray-900 dark:text-white">{pipeline.name}</h3>
                                    <span className="text-sm text-gray-500">{pipeline._count?.leads || 0} leads</span>
                                </div>
                                <div className="flex gap-1">
                                    {pipeline.stages.map((stage) => (
                                        <div
                                            key={stage.id}
                                            className="flex-1 h-2 rounded-full"
                                            style={{ backgroundColor: stage.color }}
                                            title={stage.name}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-gray-500">
                                    <span>{pipeline.stages[0]?.name}</span>
                                    <span>{pipeline.stages[pipeline.stages.length - 1]?.name}</span>
                                </div>
                            </Link>
                        ))}

                        {pipelines.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No pipelines created yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Leads */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Leads</h2>
                        <Link to="/dashboard/crm/leads" className="text-sm text-green-600 hover:text-green-700">
                            View All
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {recentLeads.map((lead) => (
                            <Link
                                key={lead.id}
                                to={`/dashboard/crm/leads/${lead.id}`}
                                className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{lead.title}</p>
                                        <p className="text-sm text-gray-500">
                                            {lead.contact?.firstName} {lead.contact?.lastName}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span
                                        className="px-2 py-0.5 text-xs rounded-full"
                                        style={{ backgroundColor: lead.stage?.color + '20', color: lead.stage?.color }}
                                    >
                                        {lead.stage?.name}
                                    </span>
                                    {lead.value && (
                                        <span className="text-sm text-gray-500">
                                            {formatCurrency(lead.value)}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}

                        {recentLeads.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No leads yet
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CRM;