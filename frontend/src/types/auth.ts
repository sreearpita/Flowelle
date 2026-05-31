export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  cycleLength: number;
  periodLength: number;
  birthControlUse: boolean;
  createdAt?: string;
};

export type PrivacySettings = {
  aiCoachEnabled: boolean;
  voiceProcessingEnabled: boolean;
  analyticsOptIn: boolean;
  notificationsEnabled: boolean;
  reminderTime?: string | null;
  exportRequestedAt?: string | null;
  deleteRequestedAt?: string | null;
};

export type DataExport = {
  generatedAt: string;
  profile: User;
  privacy: PrivacySettings;
  cycleData: unknown;
  exportNotice: string;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  privacy: PrivacySettings | null;
  exportData: DataExport | null;
  isLoading: boolean;
  error: string | null;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  cycleLength: number;
  periodLength: number;
  lastPeriodDate: string;
  birthControlUse: boolean;
}; 
