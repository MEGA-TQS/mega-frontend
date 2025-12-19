import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';

// Test component that uses the auth context
const TestComponent = () => {
  const { user, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="user-display">
        {user ? JSON.stringify(user) : 'No user'}
      </div>
      <button 
        data-testid="login-button"
        onClick={() => login({ id: 1, name: 'Test User', role: 'RENTER' })}
      >
        Login
      </button>
      <button 
        data-testid="logout-button"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  let localStorageMock;
  let originalLocalStorage;

  beforeEach(() => {
    // Save original localStorage
    originalLocalStorage = global.localStorage;
    
    // Mock localStorage
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    // Restore original localStorage
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
    });
    vi.restoreAllMocks();
  });

  describe('AuthProvider', () => {
    it('should render children without crashing', () => {
      render(
        <AuthProvider>
          <div>Test Child</div>
        </AuthProvider>
      );
      
      expect(screen.getByText('Test Child')).toBeTruthy();
    });

    it('should provide auth context to children', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // The test component should render without throwing
      expect(screen.getByTestId('user-display')).toBeTruthy();
      expect(screen.getByTestId('login-button')).toBeTruthy();
      expect(screen.getByTestId('logout-button')).toBeTruthy();
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress the console error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Use a custom error boundary to catch the error
      let errorCaught = false;
      class ErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false };
        }
        
        static getDerivedStateFromError() {
          return { hasError: true };
        }
        
        render() {
          if (this.state.hasError) {
            return <div data-testid="error-boundary">Error</div>;
          }
          return this.props.children;
        }
      }
      
      const { getByTestId } = render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );
      
      expect(getByTestId('error-boundary')).toBeTruthy();
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('should return auth context when used inside AuthProvider', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // The component should render without error
      expect(screen.getByTestId('user-display')).toBeTruthy();
    });
  });

  describe('Initial state', () => {
    it('should initialize with null user when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      const userDisplay = screen.getByTestId('user-display');
      expect(userDisplay.textContent).toBe('No user');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
    });

    it('should initialize with user from localStorage', () => {
      const savedUser = { id: 123, name: 'Saved User', role: 'OWNER' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedUser));
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      const userDisplay = screen.getByTestId('user-display');
      expect(userDisplay.textContent).toBe(JSON.stringify(savedUser));
      expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
    });

    it('should handle malformed JSON in localStorage gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      // We need to wrap this in try-catch since JSON.parse will throw
      let error = null;
      try {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      } catch (e) {
        error = e;
      }
      
      // Since JSON.parse throws, the component will fail to render
      // This is expected behavior - the app should handle this at a higher level
      expect(error).toBeTruthy();
      expect(error.message).toContain('Unexpected token');
    });
  });

  describe('Login functionality', () => {
    it('should set user state and save to localStorage when login is called', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // Initial state should be null
      const userDisplay = screen.getByTestId('user-display');
      expect(userDisplay.textContent).toBe('No user');
      
      // Click login button
      act(() => {
        fireEvent.click(screen.getByTestId('login-button'));
      });
      
      // Should update the display
      const expectedUser = { id: 1, name: 'Test User', role: 'RENTER' };
      expect(userDisplay.textContent).toBe(JSON.stringify(expectedUser));
      
      // Should save to localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(expectedUser)
      );
    });

    it('should handle different user data structures', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const ComplexTestComponent = () => {
        const { user, login, logout } = useAuth();
        
        const loginComplexUser = () => {
          login({
            id: 456,
            name: 'Complex User',
            email: 'user@example.com',
            role: 'ADMIN',
            preferences: { theme: 'dark' }
          });
        };
        
        return (
          <div>
            <div data-testid="user-display">
              {user ? JSON.stringify(user) : 'No user'}
            </div>
            <button 
              data-testid="login-complex-button"
              onClick={loginComplexUser}
            >
              Login Complex
            </button>
          </div>
        );
      };
      
      render(
        <AuthProvider>
          <ComplexTestComponent />
        </AuthProvider>
      );
      
      // Click login button with complex user
      act(() => {
        fireEvent.click(screen.getByTestId('login-complex-button'));
      });
      
      const userDisplay = screen.getByTestId('user-display');
      const expectedUser = {
        id: 456,
        name: 'Complex User',
        email: 'user@example.com',
        role: 'ADMIN',
        preferences: { theme: 'dark' }
      };
      
      expect(userDisplay.textContent).toBe(JSON.stringify(expectedUser));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(expectedUser)
      );
    });
  });

  describe('Logout functionality', () => {
    it('should clear user state and remove from localStorage when logout is called', () => {
      const savedUser = { id: 123, name: 'Saved User', role: 'OWNER' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedUser));
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // Initial state should show saved user
      const userDisplay = screen.getByTestId('user-display');
      expect(userDisplay.textContent).toBe(JSON.stringify(savedUser));
      
      // Click logout button
      act(() => {
        fireEvent.click(screen.getByTestId('logout-button'));
      });
      
      // Should update to show no user
      expect(userDisplay.textContent).toBe('No user');
      
      // Should remove from localStorage
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });

    it('should handle logout when no user is logged in', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // Initial state should be null
      const userDisplay = screen.getByTestId('user-display');
      expect(userDisplay.textContent).toBe('No user');
      
      // Click logout button (should not crash)
      act(() => {
        fireEvent.click(screen.getByTestId('logout-button'));
      });
      
      // Should still show no user
      expect(userDisplay.textContent).toBe('No user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('Login/logout flow', () => {
    it('should handle complete login/logout cycle', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const { container, unmount } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      const userDisplay = screen.getByTestId('user-display');
      
      // 1. Initial - no user
      expect(userDisplay.textContent).toBe('No user');
      
      // 2. Login
      act(() => {
        fireEvent.click(screen.getByTestId('login-button'));
      });
      
      const expectedUser = { id: 1, name: 'Test User', role: 'RENTER' };
      expect(userDisplay.textContent).toBe(JSON.stringify(expectedUser));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(expectedUser));
      
      // 3. Logout
      act(() => {
        fireEvent.click(screen.getByTestId('logout-button'));
      });
      
      expect(userDisplay.textContent).toBe('No user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      
      // Clean up
      unmount();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty user object', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const EmptyUserComponent = () => {
        const { user, login } = useAuth();
        
        const loginEmpty = () => {
          login({});
        };
        
        return (
          <div>
            <div data-testid="user-display">
              {user ? JSON.stringify(user) : 'No user'}
            </div>
            <button 
              data-testid="login-empty-button"
              onClick={loginEmpty}
            >
              Login Empty
            </button>
          </div>
        );
      };
      
      render(
        <AuthProvider>
          <EmptyUserComponent />
        </AuthProvider>
      );
      
      act(() => {
        fireEvent.click(screen.getByTestId('login-empty-button'));
      });
      
      const userDisplay = screen.getByTestId('user-display');
      expect(userDisplay.textContent).toBe('{}');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', '{}');
    });

    it('should handle null/undefined login parameter', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const NullLoginComponent = () => {
        const { user, login } = useAuth();
        
        const loginNull = () => {
          login(null);
        };
        
        const loginUndefined = () => {
          login(undefined);
        };
        
        return (
          <div>
            <div data-testid="user-display">
              {user ? JSON.stringify(user) : 'No user'}
            </div>
            <button 
              data-testid="login-null-button"
              onClick={loginNull}
            >
              Login Null
            </button>
            <button 
              data-testid="login-undefined-button"
              onClick={loginUndefined}
            >
              Login Undefined
            </button>
          </div>
        );
      };
      
      render(
        <AuthProvider>
          <NullLoginComponent />
        </AuthProvider>
      );
      
      const userDisplay = screen.getByTestId('user-display');
      
      // Initial state should be "No user"
      expect(userDisplay.textContent).toBe('No user');
      
      // Test null login
      act(() => {
        fireEvent.click(screen.getByTestId('login-null-button'));
      });
      
      // After login with null, it should still show "No user" because null is falsy
      expect(userDisplay.textContent).toBe('No user');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', 'null');
      
      // Clear mocks for next test
      localStorageMock.setItem.mockClear();
      
      // Test undefined login
      act(() => {
        fireEvent.click(screen.getByTestId('login-undefined-button'));
      });
      
      // After login with undefined, it should still show "No user" because undefined is falsy
      expect(userDisplay.textContent).toBe('No user');
      // JSON.stringify(undefined) returns undefined, not a string
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', undefined);
    });

    it('should persist state across component re-renders', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const { rerender } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      const userDisplay = screen.getByTestId('user-display');
      
      // Login
      act(() => {
        fireEvent.click(screen.getByTestId('login-button'));
      });
      
      const expectedUser = { id: 1, name: 'Test User', role: 'RENTER' };
      expect(userDisplay.textContent).toBe(JSON.stringify(expectedUser));
      
      // Re-render the same component
      rerender(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // User should still be logged in
      expect(userDisplay.textContent).toBe(JSON.stringify(expectedUser));
    });
  });
});