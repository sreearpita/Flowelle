import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login heading by default', () => {
  render(<App />);
  const headingElement = screen.getByText(/sign in to flowelle/i);
  expect(headingElement).toBeInTheDocument();
});
