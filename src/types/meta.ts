// src/types/meta.ts

export interface WhatsAppAccount {
  id: string;
  phoneNumber: string;
  displayName: string;
  status: string;
  isDefault: boolean;
  wabaId?: string;
  phoneNumberId?: string;
  qualityRating?: string;
  verifiedName?: string;
}

export interface EmbeddedSignupConfig {
  appId: string;
  configId: string;
  version: string;
}

export interface ConnectionProgress {
  step: 'INIT' | 'REDIRECTING' | 'TOKEN_EXCHANGE' | 'COMPLETED' | 'CANCELLED';
  status: 'in_progress' | 'completed' | 'error';
  message: string;
}

export interface FBLoginResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
    code?: string;
    userID: string;
    expiresIn: number;
    signedRequest: string;
    graphDomain: string;
  };
}

declare global {
  interface Window {
    FB: any;
    _fbAsyncInit: () => void;
  }
}