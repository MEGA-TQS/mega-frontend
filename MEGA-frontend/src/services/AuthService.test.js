import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import api from '../api/axiosConfig';
import AuthService from './AuthService';

describe('AuthService', () => {
    let mock;

    beforeEach(() => {
        mock = new MockAdapter(api);
    });

    afterEach(() => {
        mock.reset();
    });

    it('login sends correct post request', async () => {
        // Arrange
        const mockResponse = { token: 'abc', role: 'USER' };
        mock.onPost('/auth/login').reply(200, mockResponse);

        // Act
        const result = await AuthService.login('test@test.com', 'pass');

        // Assert
        expect(mock.history.post[0].data).toContain('test@test.com');
        expect(result).toEqual(mockResponse);
    });

    it('register sends correct post request', async () => {
        // Arrange
        const mockUser = { name: 'New', email: 'new@test.com', password: '123', role: 'USER' };
        mock.onPost('/auth/register').reply(200, { id: 1, ...mockUser });

        // Act
        const result = await AuthService.register(mockUser);

        // Assert
        expect(result.id).toBe(1);
        expect(mock.history.post[0].url).toBe('/auth/register');
    });
});