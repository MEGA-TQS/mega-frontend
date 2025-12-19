import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom'; // Imports matchers like toHaveTextContent
import { AuthProvider, useAuth } from './AuthContext';

// --- Test Component to Consume Context ---
const TestComponent = () => {
  const { user, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="user-display">
        {user ? `Logged in as: ${user.name} (Role: ${user.role})` : 'No user'}
      </div>
      <button 
        data-testid="login-button"
        onClick={() => login({ 
            userId: 101, 
            name: 'Test User', 
            email: 'test@example.com', 
            role: 'USER', 
            token: 'valid-jwt-token' 
        })}
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
    // 1. Save original localStorage
    originalLocalStorage = global.localStorage;
    
    // 2. Create a fresh mock store for every test
    const store = {};
    localStorageMock = {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
      removeItem: vi.fn((key) => { delete store[key]; }),
      clear: vi.fn(() => { for (const key in store) delete store[key]; }),
    };
    
    // 3. Apply the mock
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    // 4. Restore original
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
    });
    vi.clearAllMocks();
  });

  it('provides default null state when localStorage is empty', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('user-display')).toHaveTextContent('No user');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
  });

  it('initializes user from localStorage if data exists', () => {
    // Arrange: Pre-populate localStorage
    const existingUser = JSON.stringify({ id: 55, name: 'Existing User', role: 'ADMIN' });
    localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'user') return existingUser;
        return null;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-display')).toHaveTextContent('Logged in as: Existing User (Role: ADMIN)');
  });

  it('login() updates state and saves to localStorage correctly', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Act: Click Login
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-button'));
    });

    // Assert 1: UI Updated
    expect(screen.getByTestId('user-display')).toHaveTextContent('Logged in as: Test User (Role: USER)');

    // Assert 2: User Object Saved (Verifying "Standardize ID" logic)
    // The component sends `userId: 101`, context should save it as `id: 101`
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user', 
        expect.stringContaining('"id":101') 
    );

    // Assert 3: Token Saved (Crucial for Axios)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'valid-jwt-token');
  });

  it('logout() clears state and removes items from localStorage', async () => {
    // Arrange: Start logged in
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId('login-button'));
    });

    // Act: Click Logout
    await act(async () => {
      fireEvent.click(screen.getByTestId('logout-button'));
    });

    // Assert
    expect(screen.getByTestId('user-display')).toHaveTextContent('No user');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
  });
});