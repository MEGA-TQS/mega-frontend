import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';

// Test helper component
const TestComponent = () => {
  const { user, login, logout } = useAuth();

  return (
    <div>
      {user ? (
        <>
          <span data-testid="user-id">{user.id}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button
          onClick={() =>
            login({ userId: 123, name: 'Alice', token: 'jwt-token' })
          }
        >
          Login
        </button>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('provides null user by default', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginBtn = screen.queryByText('Login');
    expect(loginBtn).not.toBeNull();
  });

  it('logs in and normalizes user id', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login'));

    const userIdEl = screen.getByTestId('user-id');
    expect(userIdEl.textContent).toBe('123');

    const storedUser = JSON.parse(localStorage.getItem('user'));
    expect(storedUser.id).toBe(123);
    expect(localStorage.getItem('token')).toBe('jwt-token');
  });

  it('uses existing id if userId is missing', () => {
    const CustomTest = () => {
      const { login, user } = useAuth();
      return (
        <>
          <button onClick={() => login({ id: 55, name: 'Bob' })}>
            Login
          </button>
          {user && <span data-testid="user-id">{user.id}</span>}
        </>
      );
    };

    render(
      <AuthProvider>
        <CustomTest />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login'));

    const userIdEl = screen.getByTestId('user-id');
    expect(userIdEl.textContent).toBe('55');
  });

  it('logs out and clears user and token', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login'));
    fireEvent.click(screen.getByText('Logout'));

    const loginBtn = screen.queryByText('Login');
    expect(loginBtn).not.toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('does not store token if missing', () => {
    const NoTokenTest = () => {
      const { login } = useAuth();
      return (
        <button onClick={() => login({ userId: 7, name: 'NoTokenUser' })}>
          Login
        </button>
      );
    };

    render(
      <AuthProvider>
        <NoTokenTest />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login'));

    expect(localStorage.getItem('user')).not.toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
