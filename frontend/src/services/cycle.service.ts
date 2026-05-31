import api from './api';
import { CycleData, CycleDay, CyclePredictions, DailyLog, Symptom } from '../types/cycle';
import { store } from '../store';

const cycleService = {
  async getCurrentCycle(): Promise<CycleData> {
    const state = store.getState();
    const userId = state.auth.user?.id;
    if (!userId) {
      throw new Error('User ID not found');
    }
    const response = await api.get<CycleData>(`/cycles/current?userId=${userId.toString()}`);
    return response.data;
  },

  async getCycleHistory(): Promise<CycleData[]> {
    const state = store.getState();
    const userId = state.auth.user?.id;
    if (!userId) {
      throw new Error('User ID not found');
    }
    const response = await api.get<CycleData[]>(`/cycles/history?userId=${userId.toString()}`);
    return response.data;
  },

  async createCycle(data: {
    startDate: string;
    cycleLength: number;
    periodLength: number;
    notes?: string;
  }): Promise<CycleData> {
    const state = store.getState();
    const userId = state.auth.user?.id;
    if (!userId) {
      throw new Error('User ID not found');
    }
    const response = await api.post<CycleData>('/cycles', {
      userId: userId.toString(),
      startDate: data.startDate,
      cycleLength: data.cycleLength,
      periodLength: data.periodLength,
      notes: data.notes,
    });
    return response.data;
  },

  async logSymptom(symptom: Omit<Symptom, 'id'>): Promise<Symptom> {
    const response = await api.post<Symptom>('/cycles/symptoms', symptom);
    return response.data;
  },

  async updateSymptom(symptom: Symptom): Promise<Symptom> {
    const response = await api.put<Symptom>(`/cycles/symptoms/${symptom.id}`, symptom);
    return response.data;
  },

  async deleteSymptom(symptomId: string): Promise<void> {
    await api.delete(`/cycles/symptoms/${symptomId}`);
  },

  async updateCycleDay(date: string, data: Partial<CycleDay>): Promise<CycleDay> {
    const response = await api.put<CycleDay>(`/cycles/days/${date}`, data);
    return response.data;
  },

  async predictNextPeriod(): Promise<CyclePredictions> {
    const state = store.getState();
    const userId = state.auth.user?.id;
    if (!userId) {
      throw new Error('User ID not found');
    }
    const response = await api.get<CyclePredictions>(`/cycles/predictions?userId=${userId.toString()}`);
    return response.data;
  },

  async getDailyLogs(range?: { from?: string; to?: string }): Promise<DailyLog[]> {
    const state = store.getState();
    const userId = state.auth.user?.id;
    if (!userId) {
      throw new Error('User ID not found');
    }

    const params = new URLSearchParams({ userId: userId.toString() });
    if (range?.from) {
      params.set('from', range.from);
    }
    if (range?.to) {
      params.set('to', range.to);
    }

    const response = await api.get<DailyLog[]>(`/cycles/logs?${params.toString()}`);
    return response.data || [];
  },

  async saveDailyLog(log: DailyLog): Promise<DailyLog> {
    const state = store.getState();
    const userId = state.auth.user?.id;
    if (!userId) {
      throw new Error('User ID not found');
    }

    const response = await api.post<DailyLog>('/cycles/logs', {
      ...log,
      userId: userId.toString(),
      cycleId: log.cycleId || state.cycle.currentCycle?.id,
    });
    return response.data;
  },
};

export default cycleService; 
