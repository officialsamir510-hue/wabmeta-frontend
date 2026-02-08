// src/types/chatbot.ts

export interface FlowNode {
  id: string;
  type: 'start' | 'message' | 'button' | 'condition' | 'delay' | 'action';
  position: { x: number; y: number };
  data: {
    label?: string;
    message?: string;
    buttons?: Array<{
      id: string;
      text: string;
      type: 'reply' | 'url' | 'phone';
      value?: string;
    }>;
    condition?: {
      type: 'keyword' | 'contains' | 'exact' | 'regex';
      value: string;
    };
    delay?: number;
    action?: {
      type: 'assign' | 'tag' | 'webhook' | 'variable';
      value: string;
    };
  };
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