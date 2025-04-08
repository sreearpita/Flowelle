import api from './api';
import { CycleData, CycleDay, Symptom } from '../types/cycle';

const cycleService = {
  async getCurrentCycle(): Promise<CycleData> {
    const response = await api.get<CycleData>('/cycles/current');
    return response.data;
  },

  async getCycleHistory(): Promise<CycleData[]> {
    const response = await api.get<CycleData[]>('/cycles/history');
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

  async predictNextPeriod(): Promise<{
    nextPeriod: string;
    fertileWindowStart: string;
    fertileWindowEnd: string;
    ovulationDay: string;
  }> {
    const response = await api.get<{
      nextPeriod: string;
      fertileWindowStart: string;
      fertileWindowEnd: string;
      ovulationDay: string;
    }>('/cycles/predictions');
    return response.data;
  }
};

export default cycleService; 