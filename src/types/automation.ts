export type TriggerType = 'keyword_match' | 'new_contact' | 'tag_added';
export type ActionType = 'send_message' | 'add_tag' | 'assign_agent' | 'remove_tag';

export interface AutomationRule {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  trigger: {
    type: TriggerType;
    value?: string; // e.g., the keyword
    matchType?: 'exact' | 'contains';
  };
  action: {
    type: ActionType;
    value?: string; // e.g., message text or tag ID
  };
  executionCount: number;
  lastExecuted?: string;
}