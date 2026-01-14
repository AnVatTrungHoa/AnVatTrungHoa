import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check token khi load app
    useEffect(() => {
        verifyToken();
    }, []);

    const verifyToken = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await authAPI.verify();
                if (response.data.success) {
                    setUser(response.data.user);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            } catch (error) {
                console.error('Verify token error:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    };

    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                setUser(response.data.user);
                return { success: true, user: response.data.user };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
            // Nếu logout API fail (token invalid), vẫn clear local storage
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};