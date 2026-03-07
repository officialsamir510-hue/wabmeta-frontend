// ✅ ADD TO: src/types/automation.ts

export interface Automation {
  id: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  triggerConfig: any;
  actions: AutomationAction[];
  isActive: boolean;
  executionCount: number;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AutomationTrigger = 'NEW_CONTACT' | 'KEYWORD' | 'WEBHOOK' | 'SCHEDULE' | 'INACTIVITY';

export interface AutomationAction {
  id: string;
  type: 'send_message' | 'send_template' | 'add_tag' | 'remove_tag' | 'create_lead' | 'webhook' | 'delay';
  config: any;
}