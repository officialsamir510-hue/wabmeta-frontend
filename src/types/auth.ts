// src/types/auth.ts

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  avatar?: string | null;
  emailVerified: boolean;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  createdAt: string;
  updatedAt?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  planType: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  logo?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  organizationName?: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}