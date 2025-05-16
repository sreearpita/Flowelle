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
}

export interface CycleState {
  currentCycle: CycleData | null;
  cycleHistory: CycleData[];
  predictions: CyclePredictions | null;
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