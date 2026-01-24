export type TemplateCategory = 'marketing' | 'utility' | 'authentication';
export type TemplateStatus = 'pending' | 'approved' | 'rejected' | 'draft';
export type HeaderType = 'none' | 'text' | 'image' | 'video' | 'document';
export type ButtonType = 'quick_reply' | 'url' | 'phone';

export interface TemplateButton {
  id: string;
  type: ButtonType;
  text: string;
  url?: string;
  phoneNumber?: string;
}

export interface TemplateHeader {
  type: HeaderType;
  text?: string;
  mediaUrl?: string;
  fileName?: string;
}

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  language: string;
  status: TemplateStatus;
  header: TemplateHeader;
  body: string;
  footer?: string;
  buttons: TemplateButton[];
  variables: string[];
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  rejectionReason?: string;
}

export interface TemplateFormData {
  name: string;
  category: TemplateCategory;
  language: string;
  header: TemplateHeader;
  body: string;
  footer: string;
  buttons: TemplateButton[];
}