// test-utils.jsx - Shared testing utilities
import { vi } from 'vitest';
import { render as rtlRender } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Creates a basic render wrapper with MemoryRouter
 */
export const renderWithRouter = (ui, options = {}) => {
  return rtlRender(ui, {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    ...options,
  });
};

/**
 * Setup navigation mocks
 */
export const setupNavigationMocks = () => {
  const mockNavigate = vi.fn();
  
  // Don't mock here, just return the mock
  return { mockNavigate };
};

/**
 * Common test assertions for form controls
 */
export const assertFormControl = (element) => {
  expect(element.className).toContain('form-control');
  expect(element.className).toContain('border-0');
  expect(element.className).toContain('bg-light');
};

/**
 * Common test assertions for buttons
 */
export const assertButton = (element, expectedClasses = []) => {
  expect(element).toBeTruthy();
  expect(element.className).toContain('btn');
  
  expectedClasses.forEach(className => {
    expect(element.className).toContain(className);
  });
};