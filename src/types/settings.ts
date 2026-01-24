export interface BusinessProfile {
  name: string;
  category: string;
  description: string;
  address: string;
  email: string;
  websites: string[];
  profilePicture?: string;
}

export interface ApiConfiguration {
  wabaId: string;
  phoneNumberId: string;
  accessToken: string;
  webhookUrl: string;
  verifyToken: string;
}

export interface WebhookLog {
  id: string;
  event: string;
  status: 'success' | 'failed';
  timestamp: string;
  payload: string;
}

export interface NotificationPreferences {
  email: {
    campaigns: boolean;
    billing: boolean;
    system: boolean;
  };
  push: {
    messages: boolean;
    mentions: boolean;
  };
}