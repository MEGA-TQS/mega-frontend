import { describe, it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

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

    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'wrong@test.com' } });
    fireEvent.click(screen.getByTestId('login-button'));

    // FIX: Use findByTestId and standard textContent check
    const errorAlert = await screen.findByTestId('login-error');
    expect(errorAlert.textContent).toContain('User not found');
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('logs in successfully as regular USER', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'user@test.com' } });
    fireEvent.click(screen.getByTestId('login-button'));

    expect(mockLogin).toHaveBeenCalledWith(expect.objectContaining({ 
      email: 'user@test.com',
      role: 'USER' 
    }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('redirects ADMIN to owner dashboard', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId('login-as-admin'));

    expect(mockLogin).toHaveBeenCalledWith(expect.objectContaining({ 
      role: 'ADMIN' 
    }));
    expect(mockNavigate).toHaveBeenCalledWith('/owner-dashboard');
  });
});