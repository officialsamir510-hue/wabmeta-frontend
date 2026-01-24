export interface Metric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface DailyStat {
  date: string;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
}

export interface CampaignMetric {
  id: string;
  name: string;
  sent: number;
  readRate: number;
  replyRate: number;
  cost: number;
  status: 'completed' | 'running' | 'failed';
}

export interface ConversationStat {
  type: 'user_initiated' | 'business_initiated';
  count: number;
  cost: number;
}