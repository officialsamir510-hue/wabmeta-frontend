export interface WhatsAppBusinessAccount {
  id: string;
  name: string;
  phoneNumber: string;
  phoneNumberId: string;
  verificationStatus: 'verified' | 'pending' | 'not_verified';
  qualityRating: 'GREEN' | 'YELLOW' | 'RED';
  messagingLimit: string;
}

export interface MetaConnection {
  lastSync: string;
  isConnected: boolean;
  isConnecting: boolean;
  accessToken: string | null;
  businessAccount: WhatsAppBusinessAccount | null;
  connectedAt: string | null;
  error: string | null;
}