// ✅ CREATE: src/types/crm.ts

export interface Lead {
    id: string;
    title: string;
    value?: number;
    currency: string;
    status: LeadStatus;
    priority: LeadPriority;
    source?: string;
    contactId?: string;
    contact?: {
        id: string;
        phone: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        avatar?: string;
    };
    pipelineId?: string;
    pipeline?: Pipeline;
    stageId?: string;
    stage?: PipelineStage;
    assignedToId?: string;
    expectedCloseDate?: string;
    actualCloseDate?: string;
    lastActivityAt?: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
        activities: number;
        notes: number;
        tasks: number;
    };
}

export interface Pipeline {
    id: string;
    name: string;
    description?: string;
    isDefault: boolean;
    isActive: boolean;
    stages: PipelineStage[];
    _count?: { leads: number };
}

export interface PipelineStage {
    id: string;
    name: string;
    color: string;
    order: number;
    probability: number;
    isWon: boolean;
    isLost: boolean;
}

export interface LeadNote {
    id: string;
    content: string;
    isPinned: boolean;
    userId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface LeadTask {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    isCompleted: boolean;
    completedAt?: string;
    priority: LeadPriority;
    createdAt: string;
}

export interface LeadActivity {
    id: string;
    type: string;
    title: string;
    description?: string;
    metadata?: any;
    createdAt: string;
}

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface CRMStats {
    totalLeads: number;
    newLeads: number;
    wonLeads: number;
    lostLeads: number;
    totalValue: number;
    wonValue: number;
    winRate: number;
    leadsByStage: { stageId: string; _count: number; _sum: { value: number } }[];
}