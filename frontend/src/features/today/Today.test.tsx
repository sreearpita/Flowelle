import React from 'react';
import { screen } from '@testing-library/react';
import Today from './Today';
import { renderWithProviders } from '../../test-utils';

const baseState = {
  auth: {
    user: null,
    token: null,
    privacy: {
      aiCoachEnabled: false,
      voiceProcessingEnabled: false,
      analyticsOptIn: false,
      notificationsEnabled: true,
    },
    exportData: null,
    isLoading: false,
    error: null,
  },
  cycle: {
    currentCycle: {
      id: '1',
      startDate: '2026-05-05',
      periodLength: 5,
      cycleLength: 28,
      days: [],
    },
    cycleHistory: [],
    predictions: {
      nextPeriod: '2026-06-02',
      fertileWindowStart: '2026-05-14',
      fertileWindowEnd: '2026-05-20',
      ovulationDay: '2026-05-19',
      confidence: 65,
      basis: 'Based on 2 logged cycles',
      isPredicted: true,
    },
    dailyLogs: [
      {
        id: 'log-1',
        date: '2026-05-17',
        periodFlow: 'light',
        symptoms: [],
        mood: 'calm',
        energy: 3,
        source: 'manual',
      },
    ],
    isLoading: false,
    error: null,
  },
};

test('renders today as the privacy-first default dashboard', () => {
  renderWithProviders(<Today />, baseState);

  expect(screen.getByRole('heading', { name: /today/i })).toBeInTheDocument();
  expect(screen.getAllByText(/Confidence/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Privacy center/i)).toBeInTheDocument();
  expect(screen.getByText(/AI drafts/i)).toBeInTheDocument();
});
