import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';
import '@testing-library/jest-dom';

vi.mock('./components/Navbar', () => ({
  default: () => <div>Mock Navigation Bar</div>
}));

describe('App Component', () => {
  it('renders the main application wrapper', () => {
    render(<App />);
    expect(screen.getByText('Mock Navigation Bar')).toBeInTheDocument();
  });
});