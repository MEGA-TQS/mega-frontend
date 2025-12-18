import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { assertButton } from './test-utils';

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

  const renderNavbar = () => {
    return render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
  };

  const setupUser = (userData) => {
    vi.mocked(useAuth).mockReturnValue({
      user: userData,
      logout: mockLogout,
      login: vi.fn()
    });
  };

  it('should render the navbar with logo and title images', () => {
    renderNavbar();

    const logoImages = screen.getAllByAltText('MEGA Logo');
    expect(logoImages).toHaveLength(2);
    
    expect(logoImages[0].src).toContain('/MEGA_completely_original_logo.png');
    expect(logoImages[1].src).toContain('/Title_image.png');
  });

  it('should show login button when user is not logged in', () => {
    renderNavbar();

    const loginButton = screen.getByText('Login');
    expect(loginButton).toBeTruthy();
    expect(loginButton.getAttribute('href')).toBe('/login');
    assertButton(loginButton, ['btn-primary', 'btn-sm']);
  });

  describe('When user is logged in', () => {
    const testLoggedInState = (user, expectedButtons, unexpectedButtons = []) => {
      setupUser(user);
      renderNavbar();

      // Check greeting
      const firstName = user.name.split(' ')[0];
      const greeting = screen.getByText(`Hi, ${firstName}`);
      expect(greeting).toBeTruthy();
      
      // Check logout button
      const logoutButton = screen.getByText('Logout');
      assertButton(logoutButton, ['btn-outline-danger', 'btn-sm']);

      // Check expected buttons
      expectedButtons.forEach(buttonText => {
        const button = screen.getByText(buttonText);
        expect(button).toBeTruthy();
      });

      // Check unexpected buttons
      unexpectedButtons.forEach(buttonText => {
        expect(screen.queryByText(buttonText)).toBeNull();
      });
    };

    it('should show USER role specific buttons', () => {
      testLoggedInState(
        { id: 1, name: 'John Doe', role: 'USER' },
        ['My Listings', 'My Bookings'],
        ['Admin Panel']
      );
    });

    it('should show ADMIN role specific button', () => {
      testLoggedInState(
        { id: 1, name: 'Admin User', role: 'ADMIN' },
        ['Admin Panel'],
        ['My Listings', 'My Bookings']
      );
    });
  });

  it('should handle logout correctly', () => {
    setupUser({ id: 1, name: 'John Doe', role: 'USER' });
    renderNavbar();

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  describe('User name handling', () => {
    const testUserName = (name, expectedGreeting) => {
      setupUser({ id: 1, name, role: 'USER' });
      renderNavbar();

      const greeting = screen.getByText(expectedGreeting);
      expect(greeting).toBeTruthy();
    };

    it('should handle single word names', () => {
      testUserName('SingleWordName', 'Hi, SingleWordName');
    });

    it('should handle multiple word names', () => {
      testUserName('John Michael Doe', 'Hi, John');
    });

    it('should handle empty names gracefully', () => {
      setupUser({ id: 1, name: '', role: 'USER' });
      renderNavbar();

      const logoutButton = screen.getByText('Logout');
      expect(logoutButton).toBeTruthy();
    });
  });
});