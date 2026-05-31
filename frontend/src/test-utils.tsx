import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import authReducer from './store/slices/authSlice';
import cycleReducer from './store/slices/cycleSlice';
import { RootState } from './store';

export const renderWithProviders = (
  ui: React.ReactElement,
  preloadedState?: Partial<RootState>
) => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      cycle: cycleReducer,
    },
    preloadedState: preloadedState as RootState,
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter>{ui}</MemoryRouter>
      </Provider>
    ),
  };
};
