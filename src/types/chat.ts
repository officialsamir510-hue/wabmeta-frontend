export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type MessageType = 'text' | 'image' | 'video' | 'document' | 'audio' | 'location' | 'contact';
export type ConversationStatus = 'open' | 'pending' | 'resolved' | 'spam';

export interface Message {
  id: string;
  conversationId: string;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  mediaName?: string;
  isOutgoing: boolean;
  status: MessageStatus;
  timestamp: string;
  replyTo?: Message;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  tags: string[];
  notes?: string;
  lastSeen?: string;
}

export interface Conversation {
  id: string;
  contact: Contact;
  lastMessage: Message;
  unreadCount: number;
  status: ConversationStatus;
  assignedTo?: string;
  labels: string[];
  isPinned: boolean;
  isMuted: boolean;
  updatedAt: string;
  isWindowOpen?: boolean;
  windowExpiresAt?: string;
}

export interface QuickReply {
  id: string;
  title: string;
  message: string;
  shortcut?: string;
}