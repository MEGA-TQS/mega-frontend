import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';

// Mock the AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    Link: ({ children, to, className, ...props }) => (
      <a href={to} className={className} {...props}>
        {children}
      </a>
    )
  };
});

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

describe('Navbar', () => {
  let mockLogout;
  let mockNavigate;

  beforeEach(() => {
    mockLogout = vi.fn();
    mockNavigate = vi.fn();
    
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      logout: mockLogout,
      login: vi.fn()
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the navbar with logo and title images', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Check for logo images - use getAllByAltText since there are two
    const logoImages = screen.getAllByAltText('MEGA Logo');
    expect(logoImages.length).toBe(2);
    
    // Check each image
    expect(logoImages[0].src).toContain('/MEGA_completely_original_logo.png');
    expect(logoImages[1].src).toContain('/Title_image.png');
  });

  it('should show login button when user is not logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      logout: mockLogout,
      login: vi.fn()
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const loginButton = screen.getByText('Login');
    expect(loginButton).toBeTruthy();
    expect(loginButton.getAttribute('href')).toBe('/login');
    expect(loginButton.className).toContain('btn');
    expect(loginButton.className).toContain('btn-primary');
    expect(loginButton.className).toContain('btn-sm');
  });

  it('should show user info and logout button when user is logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 1,
        name: 'John Doe',
        role: 'USER'
      },
      logout: mockLogout,
      login: vi.fn()
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Check for user greeting
    const greeting = screen.getByText('Hi, John');
    expect(greeting).toBeTruthy();
    expect(greeting.className).toContain('text-muted');
    expect(greeting.className).toContain('d-none');
    expect(greeting.className).toContain('d-md-block');
    expect(greeting.className).toContain('ms-2');

    // Check for logout button
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeTruthy();
    expect(logoutButton.className).toContain('btn');
    expect(logoutButton.className).toContain('btn-outline-danger');
    expect(logoutButton.className).toContain('btn-sm');
  });

  it('should show USER role specific buttons when user role is USER', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 1,
        name: 'John Doe',
        role: 'USER'
      },
      logout: mockLogout,
      login: vi.fn()
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Check for My Listings button
    const myListingsButton = screen.getByText('My Listings');
    expect(myListingsButton).toBeTruthy();
    expect(myListingsButton.getAttribute('href')).toBe('/my-listings');
    expect(myListingsButton.className).toContain('btn');
    expect(myListingsButton.className).toContain('btn-outline-dark');
    expect(myListingsButton.className).toContain('btn-sm');

    // Check for My Bookings button
    const myBookingsButton = screen.getByText('My Bookings');
    expect(myBookingsButton).toBeTruthy();
    expect(myBookingsButton.getAttribute('href')).toBe('/my-bookings');
    expect(myBookingsButton.className).toContain('btn');
    expect(myBookingsButton.className).toContain('btn-light');
    expect(myBookingsButton.className).toContain('btn-sm');
  });

  it('should show ADMIN role specific button when user role is ADMIN', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 1,
        name: 'Admin User',
        role: 'ADMIN'
      },
      logout: mockLogout,
      login: vi.fn()
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Check for Admin Panel button
    const adminPanelButton = screen.getByText('Admin Panel');
    expect(adminPanelButton).toBeTruthy();
    expect(adminPanelButton.getAttribute('href')).toBe('/owner-dashboard');
    expect(adminPanelButton.className).toContain('btn');
    expect(adminPanelButton.className).toContain('btn-warning');
    expect(adminPanelButton.className).toContain('btn-sm');
    expect(adminPanelButton.className).toContain('text-white');

    // Should not show USER specific buttons
    expect(screen.queryByText('My Listings')).toBeNull();
    expect(screen.queryByText('My Bookings')).toBeNull();
  });

  it('should handle logout correctly', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 1,
        name: 'John Doe',
        role: 'USER'
      },
      logout: mockLogout,
      login: vi.fn()
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    // Should call logout function
    expect(mockLogout).toHaveBeenCalledTimes(1);
    
    // Should navigate to login page
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should handle user names with single word correctly', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 1,
        name: 'SingleWordName',
        role: 'USER'
      },
      logout: mockLogout,
      login: vi.fn()
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Should show the full name if there's no space
    const greeting = screen.getByText('Hi, SingleWordName');
    expect(greeting).toBeTruthy();
  });

  it('should handle user names with multiple words correctly', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 1,
        name: 'John Michael Doe',
        role: 'USER'
      },
      logout: mockLogout,
      login: vi.fn()
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Should show only first name
    const greeting = screen.getByText('Hi, John');
    expect(greeting).toBeTruthy();
  });

  it('should handle empty user name gracefully', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 1,
        name: '',
        role: 'USER'
      },
      logout: mockLogout,
      login: vi.fn()
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Should still render without crashing
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeTruthy();
  });
});