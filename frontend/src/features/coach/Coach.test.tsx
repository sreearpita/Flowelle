import React from 'react';
import { screen } from '@testing-library/react';
import Coach from './Coach';
import { renderWithProviders } from '../../test-utils';

const state = {
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
    currentCycle: null,
    cycleHistory: [],
    predictions: null,
    dailyLogs: [],
    isLoading: false,
    error: null,
  },
};

test('requires explicit consent before coach sessions', () => {
  renderWithProviders(<Coach />, state);

  expect(screen.getByRole('heading', { name: /private coach/i })).toBeInTheDocument();
  expect(screen.getByText(/AI coach is off/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /enable coach/i })).toBeInTheDocument();
  expect(screen.getByText(/not a diagnostic/i)).toBeInTheDocument();
});
