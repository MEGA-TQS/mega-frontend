import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = (userData) => {
        // 1. Standardize ID
        const userToSave = {
            ...userData,
            id: userData.userId || userData.id 
        };

        // 2. Save User State
        setUser(userToSave);
        localStorage.setItem('user', JSON.stringify(userToSave));

        // 3. Save Token for axiosConfig
        if (userData.token) {
            localStorage.setItem('token', userData.token);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);