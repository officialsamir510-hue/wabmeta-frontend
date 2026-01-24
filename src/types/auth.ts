export type PlanType = 'free' | 'monthly' | '3month' | '6month' | 'yearly';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  plan: PlanType;
  planExpiry?: string;
  avatar?: string;
  metaConnected: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
}