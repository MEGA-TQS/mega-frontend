import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

// ---- MOCKS ----

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock useNavigate from react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderNavbar = (user = null, logoutMock = vi.fn()) => {
  useAuth.mockReturnValue({
    user,
    logout: logoutMock,
  });

  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
};

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows Login button when user is not logged in', () => {
    renderNavbar(null);

    const loginButton = screen.getByText('Login');
    const logoutButton = screen.queryByText('Logout');

    expect(loginButton).not.toBeNull();
    expect(logoutButton).toBeNull();
  });

  it('shows authenticated navigation links when logged in', () => {
    renderNavbar({ id: 1, name: 'Alice Doe' });

    expect(screen.getByText('My Bookings')).not.toBeNull();
    expect(screen.getByText('List Item')).not.toBeNull();
    expect(screen.getByText('My Listings')).not.toBeNull();
    expect(screen.getByText('Requests')).not.toBeNull();
    expect(screen.getByText('Logout')).not.toBeNull();
  });

  it('displays user first name in greeting', () => {
    renderNavbar({ id: 1, name: 'Alice Doe' });

    expect(screen.getByText('Hi, Alice')).not.toBeNull();
  });

  it('falls back to "User" when name is missing', () => {
    renderNavbar({ id: 1 });

    expect(screen.getByText('Hi, User')).not.toBeNull();
  });

  it('calls logout and navigates to /login on logout click', () => {
    const logoutMock = vi.fn();
    renderNavbar({ id: 1, name: 'Alice' }, logoutMock);

    fireEvent.click(screen.getByText('Logout'));

    expect(logoutMock).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('logo links navigate to home', () => {
    renderNavbar(null);

    const logoLink = screen.getByRole('link', { name: /mega logo/i });
    expect(logoLink.getAttribute('href')).toBe('/');
  });
});
