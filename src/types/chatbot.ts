// ✅ CREATE: src/types/chatbot.ts

export interface Chatbot {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED';
  isDefault: boolean;
  triggerKeywords: string[];
  welcomeMessage?: string;
  fallbackMessage?: string;
  flowData: FlowData;
  createdAt: string;
  updatedAt: string;
}

export interface FlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface FlowNode {
  id: string;
  type: 'start' | 'message' | 'button' | 'condition' | 'delay' | 'action' | 'end';
  position: { x: number; y: number };
  data: NodeData;
}

export interface NodeData {
  label?: string;
  message?: string;
  buttons?: { id: string; text: string; nextNodeId?: string }[];
  condition?: { variable: string; operator: string; value: string };
  delay?: number;
  action?: { type: string; params: any };
  nextNodeId?: string;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}