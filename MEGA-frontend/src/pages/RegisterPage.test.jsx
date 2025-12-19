import { describe, it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';

// 1. Setup Mocks
const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin
  })
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows error when passwords do not match', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    // Fill passwords differently
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'pass123' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'pass999' } });
    
    fireEvent.click(screen.getByTestId('register-button'));

    // Wait for error
    const errorAlert = await screen.findByTestId('register-error');
    
    // Standard assertion
    expect(errorAlert.textContent).toContain('Passwords do not match');
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('registers successfully and redirects', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    // Fill form correctly
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'New User' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'new@test.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'securePass' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'securePass' } });

    fireEvent.click(screen.getByTestId('register-button'));

    // Check Logic: Login called
    expect(mockLogin).toHaveBeenCalledWith(expect.objectContaining({ 
      name: 'New User',
      email: 'new@test.com'
    }));

    // Check Logic: Success Message appeared
    const successAlert = await screen.findByTestId('register-success');
    expect(successAlert.textContent).toContain('Registration successful');

    // Check Logic: Redirected after timeout
    // waitFor repeats the assertion until it passes or times out
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    }, { timeout: 2000 });
  });

  it('registers an ADMIN correctly', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    // Fill minimal form
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Admin User' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: '123' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: '123' } });
    
    // Select Admin Role
    fireEvent.change(screen.getByTestId('role-select'), { target: { value: 'ADMIN' } });

    fireEvent.click(screen.getByTestId('register-button'));

    // Verify role passed to login
    expect(mockLogin).toHaveBeenCalledWith(expect.objectContaining({ 
      role: 'ADMIN' 
    }));

    // Verify redirect to dashboard
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/owner-dashboard');
    });
  });
});