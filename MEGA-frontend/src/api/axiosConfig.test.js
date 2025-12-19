import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import api from './axiosConfig';

describe('Axios Configuration', () => {
    let mock;

    beforeEach(() => {
        mock = new MockAdapter(api);
        localStorage.clear();

        // FIX: Mock window.location with 'pathname' to prevent crashes
        Object.defineProperty(window, 'location', {
            value: { href: '', pathname: '/' }, 
            writable: true 
        });
    });

    afterEach(() => {
        mock.reset();
        vi.restoreAllMocks();
    });

    it('has the correct base URL', () => {
        expect(api.defaults.baseURL).toBe('http://localhost:8080/api');
    });

    describe('Request Interceptor', () => {
        it('adds Authorization header when token exists', async () => {
            const token = 'fake-jwt-token';
            localStorage.setItem('token', token);
            mock.onGet('/test').reply(200);

            await api.get('/test');

            expect(mock.history.get[0].headers.Authorization).toBe(`Bearer ${token}`);
        });

        it('does not add Authorization header when token is missing', async () => {
            localStorage.removeItem('token');
            mock.onGet('/test').reply(200);

            await api.get('/test');

            expect(mock.history.get[0].headers.Authorization).toBeUndefined();
        });
    });

    describe('Response Interceptor', () => {
        it('handles 401 errors by clearing token and redirecting', async () => {
            // Arrange
            localStorage.setItem('token', 'old-token');
            mock.onGet('/protected').reply(401);

            // Act & Assert
            try {
                await api.get('/protected');
            } catch (error) {
                // Check side effects
                expect(localStorage.getItem('token')).toBeNull(); 
                expect(window.location.href).toBe('/login');      
            }
        });

        it('passes through other errors (e.g., 500) without redirecting', async () => {
            localStorage.setItem('token', 'valid-token');
            mock.onGet('/error').reply(500);

            try {
                await api.get('/error');
            } catch (error) {
                expect(error.response.status).toBe(500);
                expect(localStorage.getItem('token')).toBe('valid-token');
                expect(window.location.href).toBe(''); // Should NOT have changed
            }
        });
    });
});