// src/types/chatbot.ts

export interface ChatbotNodeData {
  label?: string;
  message?: string;
  content?: string; // Add content field as used in NodeConfigPanel
  options?: string[]; // Add options field for buttons
  buttons?: Array<{
    id: string;
    text: string;
    type: 'reply' | 'url' | 'phone';
    value?: string;
  }>;
  condition?: {
    field?: string; // Add field
    operator?: string; // Add operator
    type?: 'keyword' | 'contains' | 'exact' | 'regex';
    value: string;
  };
  delay?: number;
  action?: {
    type: 'assign' | 'tag' | 'webhook' | 'variable';
    value: string;
  };
}

export interface FlowNode {
  id: string;
  type: 'start' | 'message' | 'button' | 'condition' | 'delay' | 'action';
  position: { x: number; y: number };
  data: ChatbotNodeData;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
}

export interface FlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface Chatbot {
  id: string;
  name: string;
  description: string | null;
  flowData: FlowData;
  triggerKeywords: string[];
  isDefault: boolean;
  welcomeMessage: string | null;
  fallbackMessage: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED';
  createdAt: string;
  updatedAt: string;
}

export interface ChatbotStats {
  totalConversations: number;
  messagesHandled: number;
  fallbackTriggered: number;
  avgResponseTime: number;
}