import { describe, it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

// 1. Setup Mocks
const mockLogin = vi.fn();
const mockNavigate = vi.fn();

// Mock the Auth Context
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin
  })
}));

// Mock the Router's hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates input values when typing', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'typed@test.com' } });

    expect(emailInput.value).toBe('typed@test.com');
  });

  it('shows error when user is not found', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    // Enter wrong email
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'wrong@test.com' } });
    fireEvent.click(screen.getByTestId('login-button'));

    // Wait for error to appear
    const errorAlert = await screen.findByTestId('login-error');
    
    // Standard assertion that doesn't need jest-dom
    expect(errorAlert.textContent).toContain('User not found');
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('logs in successfully as regular USER', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    // Enter valid user email (from your TEST_USERS array)
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'user@test.com' } });
    fireEvent.click(screen.getByTestId('login-button'));

    // Verify login was called with correct user
    expect(mockLogin).toHaveBeenCalledWith(expect.objectContaining({ 
      email: 'user@test.com',
      role: 'USER' 
    }));

    // Verify redirect
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('redirects ADMIN to owner dashboard', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    // Use the quick login button
    fireEvent.click(screen.getByTestId('login-as-admin'));

    expect(mockLogin).toHaveBeenCalledWith(expect.objectContaining({ 
      role: 'ADMIN' 
    }));
    expect(mockNavigate).toHaveBeenCalledWith('/owner-dashboard');
  });
});