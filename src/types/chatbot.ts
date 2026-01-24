import type { Node, Edge } from 'reactflow';

export type NodeType = 'start' | 'message' | 'button' | 'condition' | 'action';

export interface ChatbotNodeData {
  label: string;
  content?: string;
  options?: string[];
  variable?: string;
  condition?: {
    field: string;
    operator: string;
    value: string;
  };
  actionType?: string;
}

export type ChatbotNode = Node<ChatbotNodeData>;

export interface Chatbot {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft';
  nodes: ChatbotNode[];
  edges: Edge[];
  triggers: string[];
  createdAt: string;
  updatedAt: string;
  analytics: {
    triggered: number;
    completed: number;
    dropped: number;
  };
}