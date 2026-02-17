import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth';
import { userService } from '@/services/users';
import type { UserProfile, LoginRequest, RegisterRequest, AuthResponse } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await userService.getCurrentUser();
        setUser(userData);
        if (userData.language) {
          localStorage.setItem('userLanguage', userData.language);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      authService.logout();
      setUser(null);
      localStorage.removeItem('userLanguage');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (data: LoginRequest) => {
    const response: AuthResponse = await authService.login(data);
    authService.setTokens(response);
    await fetchUser();
  };

  const register = async (data: RegisterRequest) => {
    const response: AuthResponse = await authService.register(data);
    authService.setTokens(response);
    await fetchUser();
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem('userLanguage');
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
