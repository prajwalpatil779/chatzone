/**
 * Auth Context
 * Global state management for authentication
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // API base URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Register user
  const register = useCallback(async (username, email, password, confirmPassword) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setToken(data.data.token);
      setUser(data.data.user);
      localStorage.setItem('token', data.data.token);

      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  // Login user
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setToken(data.data.token);
      setUser(data.data.user);
      localStorage.setItem('token', data.data.token);

      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  // Logout user
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, token]);

  // Get current user
  const getCurrentUser = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.data);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, token]);

  // Fetch current user on mount
  useEffect(() => {
    if (token) {
      getCurrentUser();
    }
  }, [token, getCurrentUser]);

  const value = {
    user,
    token,
    isLoading,
    error,
    register,
    login,
    logout,
    getCurrentUser,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
