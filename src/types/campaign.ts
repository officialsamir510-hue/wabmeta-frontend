export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'completed' | 'paused' | 'failed';
export type AudienceType = 'all' | 'tags' | 'manual' | 'group';

export interface CampaignAudience {
  type: AudienceType;
  tags?: string[];
  segmentId?: string;
  contactIds?: string[];
  csvFile?: string;
  totalContacts: number;
}

export interface CampaignStats {
  total: number;
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  failed: number;
  pending: number;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  templateId: string;
  templateName: string;
  audience: CampaignAudience;
  status: CampaignStatus;
  stats: CampaignStats;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  createdBy: string;
  variableMapping: Record<string, string>;
}

export interface CampaignFormData {
  name: string;
  description: string;
  templateId: string;
  audienceType: AudienceType;
  selectedTags: string[];
  selectedContacts: string[];
  selectedGroup?: string;
  variableMapping: Record<string, string>;
  scheduleType: 'now' | 'later';
  scheduledDate?: string;
  scheduledTime?: string;
}