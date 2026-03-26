// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMe = async () => {
    try {
      const response = await API.get('/login/me');
      setUser(response.data.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password) => {
    const response = await API.post('/login/', { identifier, password });
    const { token, data } = response.data;
    localStorage.setItem('token', token);
    setUser(data);
    return response.data;
  };

  const register = async (userData) => {
    const response = await API.post('/login/sign_up', userData);
    // Note: API doc doesn't show token in register response
    // If your backend returns token, uncomment:
    // const { token, data } = response.data;
    // localStorage.setItem('token', token);
    // setUser(data);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const forgotPassword = async (email) => {
    const response = await API.post(`/login/forget_password/${encodeURIComponent(email)}`);
    return response.data;
  };

  const verifyOTP = async (email, otp) => {
    const response = await API.patch('/login/otp', { email, otp });
    return response.data;
  };

  const resetPassword = async (email, newPassword) => {
    const response = await API.patch('/login/reset_password', { email, newPassword });
    return response.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        verifyOTP,
        resetPassword,
        fetchMe,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);