import { describe, it, vi, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import RegisterPage from './RegisterPage'

// Mock Setup
const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin })
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows error when passwords do not match', () => {
    render(<BrowserRouter><RegisterPage /></BrowserRouter>);

    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'pass123' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'pass456' } });
    fireEvent.click(screen.getByTestId('register-button'));

    expect(screen.getByTestId('register-error')).toHaveTextContent('Passwords do not match');
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('registers successfully and redirects', async () => {
    render(<BrowserRouter><RegisterPage /></BrowserRouter>);

    // Fill form
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'New User' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'new@test.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'password' } });
    
    fireEvent.click(screen.getByTestId('register-button'));

    // Check Logic
    expect(mockLogin).toHaveBeenCalledWith(expect.objectContaining({ 
        name: 'New User', 
        email: 'new@test.com' 
    }));
    
    // Check Success Message
    expect(screen.getByTestId('register-success')).toBeInTheDocument();

    // Check Redirection (inside setTimeout, so we wait)
    await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
    }, { timeout: 1100 });
  });
});