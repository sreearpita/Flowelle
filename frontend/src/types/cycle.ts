export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface CycleData {
  id: string;
  startDate: string;
  periodLength: number;
  cycleLength: number;
  days: CycleDay[];
}

export interface CycleDay {
  date: string;
  symptoms: Symptom[];
  notes?: string;
}

export interface Symptom {
  id?: string;
  cycleId: string;
  type: string;
  severity: number;
  notes?: string;
  date: string;
}

export interface CyclePredictions {
  nextPeriod: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  ovulationDay: string;
  confidence?: number;
  basis?: string;
  isPredicted?: boolean;
}

export type LogSource = 'manual' | 'voice' | 'coach';

export interface DailyLog {
  id?: string;
  userId?: string;
  cycleId?: string;
  date: string;
  periodFlow?: 'spotting' | 'light' | 'medium' | 'heavy' | '';
  symptoms: Symptom[];
  mood?: string;
  energy?: number;
  notes?: string;
  source?: LogSource;
  createdAt?: string;
}

export interface CycleState {
  currentCycle: CycleData | null;
  cycleHistory: CycleData[];
  predictions: CyclePredictions | null;
  dailyLogs: DailyLog[];
  isLoading: boolean;
  error: string | null;
}

export type UserPreferences = {
  cycleLength: number;
  periodLength: number;
  birthControlUse: boolean;
  notificationsEnabled: boolean;
  reminderTime?: string;
}; 
