import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ems_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('ems_user');
    const storedToken = localStorage.getItem('ems_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        localStorage.removeItem('ems_user');
        localStorage.removeItem('ems_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { token: jwtToken, role, name, employeeId } = res.data;
      const userData = { email, role, name, employeeId };

      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('ems_token', jwtToken);
      localStorage.setItem('ems_user', JSON.stringify(userData));

      return { success: true, role, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await api.post('/api/auth/register', { name, email, password, role });
      const { token: jwtToken, role: userRole, employeeId } = res.data;
      const userData = { email, role: userRole, name, employeeId };

      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('ems_token', jwtToken);
      localStorage.setItem('ems_user', JSON.stringify(userData));

      return { success: true, role: userRole };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ems_token');
    localStorage.removeItem('ems_user');
  };

  const value = {
    user,
    token,
    role: user?.role || 'EMPLOYEE',
    isAuthenticated: !!token,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
