import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getToken, setToken, clearToken, getUser, setUser, clearUser } from '../utils/storage';
import type { User } from '../shared/types';
import { api } from '../shared/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await api.getCurrentUser();
      setUserState(currentUser);
      await setUser(currentUser);
    } catch {
      setUserState(null);
      await clearUser();
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = await getToken();
      const storedUser = await getUser();

      if (storedToken) {
        setTokenState(storedToken);
        api.setToken(storedToken);

        if (storedUser) {
          setUserState(storedUser);
        } else {
          await refreshUser();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    const newToken = response.access_token;

    setTokenState(newToken);
    api.setToken(newToken);
    await setToken(newToken);

    await refreshUser();
  };

  const register = async (email: string, password: string) => {
    await api.register(email, password);
    await login(email, password);
  };

  const logout = async () => {
    setTokenState(null);
    setUserState(null);
    api.setToken(null);
    await clearToken();
    await clearUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
