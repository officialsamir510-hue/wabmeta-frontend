export type PlanType = 'starter' | 'professional' | 'enterprise';
export type PaymentStatus = 'paid' | 'pending' | 'failed';

export interface Plan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  credits: number;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: PaymentStatus;
  url: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi';
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

export interface Usage {
  used: number;
  total: number;
  type: 'conversations' | 'marketing';
}