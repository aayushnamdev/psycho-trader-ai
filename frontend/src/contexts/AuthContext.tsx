/**
 * Authentication context and provider
 * Simple trader ID-based authentication
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AuthState } from '@/types';

interface AuthContextType extends AuthState {
  login: (userId: string) => void;
  logout: () => void;
  generateUserId: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'reflection_user_id';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    userId: null,
    isAuthenticated: false,
  });

  // Load user ID from localStorage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem(STORAGE_KEY);
    if (storedUserId) {
      setAuthState({
        userId: storedUserId,
        isAuthenticated: true,
      });
    }
  }, []);

  const generateUserId = (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `user_${timestamp}_${random}`;
  };

  const login = (userId: string) => {
    localStorage.setItem(STORAGE_KEY, userId);
    setAuthState({
      userId,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthState({
      userId: null,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        generateUserId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};