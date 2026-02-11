// src/types/meta.ts

export interface WhatsAppAccount {
  id: string;
  organizationId: string;
  wabaId: string;
  phoneNumberId: string;
  businessId?: string;
  phoneNumber: string;
  displayPhoneNumber?: string;
  verifiedName?: string;
  qualityRating?: 'GREEN' | 'YELLOW' | 'RED';
  status: WhatsAppAccountStatus;
  connectionStatus: ConnectionStatus;
  isDefault: boolean;
  lastConnectedAt?: string;
  lastSyncedAt?: string;
  hasAccessToken: boolean;
  createdAt: string;
  updatedAt: string;
}

export type WhatsAppAccountStatus =
  | 'PENDING'
  | 'VERIFYING'
  | 'FETCHING_WABA'
  | 'CONFIGURING_WEBHOOK'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'DISCONNECTED'
  | 'ERROR';

export type ConnectionStatus =
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'RECONNECTING'
  | 'ERROR';

export interface EmbeddedSignupConfig {
  appId: string;
  configId: string;
  version: string;
  features: string[];
}

export type ConnectionStep =
  | 'INIT'
  | 'TOKEN_EXCHANGE'
  | 'FETCHING_WABA'
  | 'FETCHING_PHONE'
  | 'SUBSCRIBE_WEBHOOK'
  | 'SAVING'
  | 'COMPLETED';

export interface ConnectionProgress {
  step: ConnectionStep;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  message: string;
  data?: any;
}

export interface MetaCallbackState {
  organizationId: string;
  userId: string;
  nonce: string;
}

// Facebook SDK types
declare global {
  interface Window {
    FB: {
      init: (params: {
        appId: string;
        autoLogAppEvents?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: FBLoginResponse) => void,
        options?: FBLoginOptions
      ) => void;
      getLoginStatus: (callback: (response: FBLoginResponse) => void) => void;
    };
    fbAsyncInit: () => void;
  }
}

export interface FBLoginResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
    expiresIn: number;
    signedRequest: string;
    userID: string;
    code?: string;
  };
}

export interface FBLoginOptions {
  scope: string;
  return_scopes?: boolean;
  auth_type?: string;
  response_type?: string;
  extras?: {
    setup?: any;
    featureType?: string;
    sessionInfoVersion?: number;
  };
}