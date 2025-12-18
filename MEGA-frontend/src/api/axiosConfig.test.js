import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import api from './axiosConfig';

describe('Axios Configuration', () => {
    let mock;

    // Setup mocks before each test
    beforeEach(() => {
        // 1. Create a mock instance attached to our existing axios instance
        mock = new MockAdapter(api);
        
        // 2. Clear localStorage
        localStorage.clear();

        // 3. Mock window.location (since JSDOM doesn't allow changing it easily)
        Object.defineProperty(window, 'location', {
            value: { href: '' },
            writable: true // Allow us to overwrite href
        });
    });

    // Clean up after each test
    afterEach(() => {
        mock.reset();
        vi.restoreAllMocks();
    });

    it('has the correct base URL', () => {
        expect(api.defaults.baseURL).toBe('http://localhost:8080/api');
    });

    describe('Request Interceptor', () => {
        it('adds Authorization header when token exists', async () => {
            // Arrange
            const token = 'fake-jwt-token';
            localStorage.setItem('token', token);
            mock.onGet('/test').reply(200);

            // Act
            await api.get('/test');

            // Assert
            expect(mock.history.get[0].headers.Authorization).toBe(`Bearer ${token}`);
        });

        it('does not add Authorization header when token is missing', async () => {
            // Arrange
            mock.onGet('/test').reply(200);

            // Act
            await api.get('/test');

            // Assert
            expect(mock.history.get[0].headers.Authorization).toBeUndefined();
        });
    });

    describe('Response Interceptor', () => {
        it('handles 401 errors by clearing token and redirecting', async () => {
            // Arrange
            localStorage.setItem('token', 'old-token');
            // Simulate a 401 Unauthorized response from backend
            mock.onGet('/protected').reply(401);

            // Act & Assert
            try {
                await api.get('/protected');
            } catch (error) {
                // We expect it to fail, but side effects should happen
                expect(localStorage.getItem('token')).toBeNull(); // Token cleared?
                expect(window.location.href).toBe('/login');      // Redirected?
            }
        });

        it('passes through other errors (e.g., 500) without redirecting', async () => {
            // Arrange
            localStorage.setItem('token', 'valid-token');
            mock.onGet('/error').reply(500);

            // Act & Assert
            try {
                await api.get('/error');
            } catch (error) {
                expect(error.response.status).toBe(500);
                expect(localStorage.getItem('token')).toBe('valid-token'); // Token stays
                expect(window.location.href).toBe('');                     // No redirect
            }
        });
    });
});