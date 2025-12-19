import { describe, it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import AuthService from '../services/AuthService';

const mockLoginContext = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLoginContext })
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../services/AuthService', () => ({
  default: {
    register: vi.fn()
  }
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows error when passwords do not match', async () => {
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);

    // Fill fields
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'pass123' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'pass999' } });
    
    fireEvent.click(screen.getByTestId('register-button'));

    // Check error
    const errorAlert = await screen.findByTestId('register-error');
    expect(errorAlert.textContent).toContain('Passwords do not match');
    expect(AuthService.register).not.toHaveBeenCalled();
  });

  it('calls AuthService and redirects on success', async () => {
    // Arrange
    const mockResponse = { id: 1, name: 'New User', email: 'new@test.com', role: 'USER' };
    AuthService.register.mockResolvedValue(mockResponse);

    render(<MemoryRouter><RegisterPage /></MemoryRouter>);

    // Fill form correctly
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'New User' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'new@test.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'securePass' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'securePass' } });

    fireEvent.click(screen.getByTestId('register-button'));

    // Assert
    await waitFor(() => {
      expect(AuthService.register).toHaveBeenCalledWith({
        name: 'New User',
        email: 'new@test.com',
        password: 'securePass',
        role: 'USER'
      });
      expect(mockLoginContext).toHaveBeenCalledWith(mockResponse);
      const successMsg = screen.getByTestId('register-success');
      expect(successMsg.textContent).toContain('Registration successful');
    });

    // Check redirect after delay
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    }, { timeout: 3000 });
  });

  it('handles "Email already exists" error (409)', async () => {
    // Arrange
    const error409 = { response: { status: 409 } };
    AuthService.register.mockRejectedValue(error409);

    render(<MemoryRouter><RegisterPage /></MemoryRouter>);

    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'User' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'exists@test.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: '123' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: '123' } });

    fireEvent.click(screen.getByTestId('register-button'));

    const errorAlert = await screen.findByTestId('register-error');
    expect(errorAlert.textContent).toContain('Email already exists');
  });
});