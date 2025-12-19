import { describe, it, vi, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from './LoginPage'

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

describe('LoginPage', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates input values when typing', () => {
    render(<BrowserRouter><LoginPage /></BrowserRouter>);
    
    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'test@input.com' } });
    
    expect(emailInput.value).toBe('test@input.com');
  });

  it('shows error when user is not found', () => {
    render(<BrowserRouter><LoginPage /></BrowserRouter>);
    
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'wrong@test.com' } });
    fireEvent.click(screen.getByTestId('login-button'));

    expect(screen.getByTestId('login-error')).toHaveTextContent('User not found');
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('logs in successfully as regular USER', () => {
    render(<BrowserRouter><LoginPage /></BrowserRouter>);
    
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'user@test.com' } });
    fireEvent.click(screen.getByTestId('login-button'));

    expect(mockLogin).toHaveBeenCalledWith(expect.objectContaining({ email: 'user@test.com' }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('redirects ADMIN to owner dashboard', () => {
    render(<BrowserRouter><LoginPage /></BrowserRouter>);
    
    // Using the quick login button for efficiency
    fireEvent.click(screen.getByTestId('login-as-admin'));

    expect(mockLogin).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/owner-dashboard');
  });
});