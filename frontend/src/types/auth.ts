export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  cycleLength: number;
  periodLength: number;
  birthControlUse: boolean;
  createdAt: string;
};

export type AuthState = {
  user: User | null;
  token: string | null;
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