import { describe, it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import AuthService from '../services/AuthService';

// 1. Mock Dependencies
const mockLoginContext = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLoginContext })
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock the real API service
vi.mock('../services/AuthService', () => ({
  default: {
    login: vi.fn()
  }
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates input values when typing', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    fireEvent.change(emailInput, { target: { value: 'typed@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('typed@test.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('handles successful login', async () => {
    // Arrange: Mock API response
    const mockUser = { id: 1, email: 'user@test.com', role: 'USER' };
    AuthService.login.mockResolvedValue(mockUser);

    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    // Act
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('login-button'));

    // Assert
    await waitFor(() => {
      expect(AuthService.login).toHaveBeenCalledWith('user@test.com', 'password123');
      expect(mockLoginContext).toHaveBeenCalledWith(mockUser);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('handles login error (Invalid Credentials)', async () => {
    // Arrange: Mock API failure
    AuthService.login.mockRejectedValue(new Error('Invalid credentials'));

    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    // Act
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'wrong@test.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByTestId('login-button'));

    // Assert
    const errorAlert = await screen.findByTestId('login-error');
    expect(errorAlert.textContent).toContain('Invalid email or password');
    expect(mockLoginContext).not.toHaveBeenCalled();
  });

  it('redirects ADMIN to owner dashboard on success', async () => {
    const mockAdmin = { id: 2, email: 'admin@test.com', role: 'ADMIN' };
    AuthService.login.mockResolvedValue(mockAdmin);

    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'adminpass' } });
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/owner-dashboard');
    });
  });
});