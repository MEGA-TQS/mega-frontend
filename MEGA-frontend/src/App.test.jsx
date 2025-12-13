import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App'; 
import '@testing-library/jest-dom';

test('renders the main application wrapper', () => {
  render(<App />);
  const element = screen.getByText(/Rent Gear. Go Outside./i); 
  expect(element).toBeInTheDocument();
});