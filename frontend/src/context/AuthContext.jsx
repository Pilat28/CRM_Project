import React, { createContext, useState, useEffect } from 'react';
import { getToken, saveToken, removeToken } from '../services/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getToken());

  useEffect(() => {
    if (token) {
      saveToken(token);
    } else {
      removeToken();
    }
  }, [token]);

  const login = (newToken) => setToken(newToken);
  const logout = () => setToken(null);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
