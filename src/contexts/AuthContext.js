import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authAPI from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загружаем токен из localStorage при инициализации
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      setToken(savedToken);
      // Проверяем токен и загружаем пользователя
      checkAuth(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Проверка токена и загрузка пользователя
  const checkAuth = async (authToken) => {
    try {
      const response = await authAPI.getCurrentUser(authToken);
      // API возвращает user напрямую или в data.user
      const userData = response.data.user || response.data;
      setUser(userData);
      setToken(authToken);
    } catch (error) {
      // Токен невалиден, удаляем его
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Регистрация
  const register = async (name, email, password) => {
    try {
      const response = await authAPI.register({ name, email, password });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration error',
      };
    }
  };

  // Вход
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { access_token, user: userData } = response.data;
      
      // Сохраняем токен
      localStorage.setItem('auth_token', access_token);
      setToken(access_token);
      setUser(userData);
      
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Sign in error',
        requiresVerification: error.response?.status === 403,
      };
    }
  };

  // Выход
  const logout = async () => {
    try {
      if (token) {
        await authAPI.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    }
  };

  // Отправка кода подтверждения
  const sendVerificationCode = async (email) => {
    try {
      const response = await authAPI.sendVerificationCode({ email });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error sending code',
      };
    }
  };

  // Проверка кода подтверждения
  const verifyCode = async (email, code) => {
    try {
      const response = await authAPI.verifyCode({ email, code });
      
      // После подтверждения автоматически входим
      // Нужно получить пароль из состояния или запросить его снова
      // Для упрощения, пользователь должен будет войти вручную
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Invalid code',
      };
    }
  };

  // Проверка, авторизован ли пользователь
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  // Проверка, подтвержден ли email
  const isEmailVerified = () => {
    return user?.email_verified_at !== null;
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    sendVerificationCode,
    verifyCode,
    isAuthenticated,
    isEmailVerified,
    checkAuth,
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

