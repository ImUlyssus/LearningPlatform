// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
// Assuming your constants are here or correctly imported

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Example user object: { id: '123', role: 'admin', name: 'Admin User' }

  // Simulate loading user from localStorage or an API call on app load
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      localStorage.removeItem('user'); // Clear corrupted data
    }
  }, []);

  const login = (userData) => {
    // In a real application, this would involve an API call to authenticate
    // and then storing the returned user data (including their role).
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!user;
  const userRole = user ? user.user_role : null;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, userRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
