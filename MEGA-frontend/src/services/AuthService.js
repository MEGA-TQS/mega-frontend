import api from '../api/axiosConfig';

const AuthService = {
    // Matches POST /api/auth/login
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data; // Returns { userId, name, email, role, token }
    },

    // Matches POST /api/auth/register
    register: async (userData) => {
        // userData: { name, email, password, role }
        const response = await api.post('/auth/register', userData);
        return response.data;
    }
};

export default AuthService;